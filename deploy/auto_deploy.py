#!/usr/bin/env python3
"""Pull-only deployment for EesherJ39/portfolio. Requires Python 3.9+, Git and Compose v2."""
import argparse
import copy
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import tempfile
import time
import urllib.request
import uuid

REMOTE = "https://github.com/EesherJ39/portfolio.git"
PROJECT = "eesher-portfolio"
HEALTH_URL = "http://127.0.0.1:23601/"
ROLLBACK_IMAGE = "eesher-portfolio:rollback"


def log(message):
    print(message, flush=True)


def command(args, *, check=True, quiet=False, timeout=900):
    env = dict(os.environ, GIT_TERMINAL_PROMPT="0", GCM_INTERACTIVE="never")
    result = subprocess.run([str(x) for x in args], capture_output=True, text=True,
                            timeout=timeout, env=env)
    if not quiet and result.stderr.strip():
        log(result.stderr.strip())
    if check and result.returncode:
        raise RuntimeError(f"Command failed ({result.returncode}): {args[0]} {' '.join(map(str, args[1:4]))}")
    return result


def atomic_json(path, data):
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    os.replace(temporary, path)


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def validate_compose(config):
    """Fail closed if the deployment stops being this single, localhost-only web app."""
    services = config.get("services", {})
    if set(services) != {"web"}:
        raise ValueError("Expected exactly one service named web; review deployment before adding services")
    web = services["web"]
    ports = web.get("ports", [])
    if len(ports) != 1 or not isinstance(ports[0], dict):
        raise ValueError("Expected exactly one resolved localhost port mapping")
    port = ports[0]
    if (port.get("host_ip"), str(port.get("published")), str(port.get("target")),
            port.get("protocol", "tcp")) != ("127.0.0.1", "23601", "3000", "tcp"):
        raise ValueError("Refusing deployment: port must remain 127.0.0.1:23601:3000/tcp")
    if web.get("container_name") != PROJECT:
        raise ValueError("Unexpected container name")
    if web.get("privileged") or web.get("network_mode") or web.get("pid") or web.get("ipc"):
        raise ValueError("Host namespaces or privileged containers require manual review")
    if any(web.get(key) for key in ("volumes", "devices", "cap_add", "volumes_from", "configs", "secrets")):
        raise ValueError("Persistent mounts, devices or added privileges require manual review")
    if web.get("healthcheck", {}).get("disable") or not web.get("healthcheck", {}).get("test"):
        raise ValueError("A container health check is required")


def http_healthy():
    # Ignore proxy environment variables for the local health probe.
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with opener.open(HEALTH_URL, timeout=10) as response:
        if response.status != 200:
            raise RuntimeError(f"Local HTTP health check returned {response.status}")


class Deployer:
    def __init__(self, repo, state, run=command, probe_seconds=90):
        self.repo, self.state, self.run = Path(repo), Path(state), run
        self.probe_seconds = probe_seconds

    def git(self, *args, **kwargs):
        return self.run(["git", "-c", "core.hooksPath=/dev/null", "-C", self.repo, *args], **kwargs)

    def compose(self, path, *args, **kwargs):
        return self.run(["docker", "compose", "--project-directory", self.repo,
                         "-p", PROJECT, "-f", path, *args], **kwargs)

    def resolved(self):
        config = json.loads(self.compose(self.repo / "compose.yaml", "config", "--format", "json").stdout)
        validate_compose(config)
        return config

    def wait_candidate(self, name):
        deadline = time.monotonic() + self.probe_seconds
        while time.monotonic() < deadline:
            result = self.run(["docker", "exec", name, "node", "-e",
                               "fetch('http://127.0.0.1:3000').then(r=>process.exit(r.status===200?0:1)).catch(()=>process.exit(1))"],
                              check=False, quiet=True, timeout=10)
            if result.returncode == 0:
                return
            time.sleep(2)
        raise RuntimeError("Candidate failed its HTTP health check; live container was not replaced")

    def deploy(self, retry=False):
        if self.git("branch", "--show-current").stdout.strip() != "main":
            raise RuntimeError("Server checkout must stay on main")
        if self.git("status", "--porcelain").stdout.strip():
            raise RuntimeError("Server checkout has local changes; refusing to overwrite them")
        if self.git("remote", "get-url", "origin").stdout.strip().rstrip("/") != REMOTE:
            raise RuntimeError("Unexpected Git remote; refusing deployment")
        # The repository is public: do not use or store any GitHub credential for polling.
        self.git("-c", "credential.helper=", "-c", "core.askPass=", "-c", "http.lowSpeedLimit=1024",
                 "-c", "http.lowSpeedTime=60", "fetch", "--no-tags", "--no-recurse-submodules", "origin",
                 "refs/heads/main:refs/remotes/origin/main", timeout=120)
        target = self.git("rev-parse", "origin/main").stdout.strip()
        if not re.fullmatch(r"[a-f0-9]{40}", target):
            raise RuntimeError("Unexpected commit identifier")
        if self.git("merge-base", "--is-ancestor", "HEAD", target, check=False).returncode:
            raise RuntimeError("Server history has diverged; refusing reset or overwrite")
        deployed = read_json(self.state / "deployed.json")
        if target == deployed.get("commit"):
            return
        if target == read_json(self.state / "failed.json").get("commit") and not retry:
            return  # A bad commit is attempted once, not rebuilt every minute.

        candidate = None
        live_changed = False
        rollback_path = None
        with tempfile.TemporaryDirectory(prefix="run-", dir=self.state) as scratch:
            scratch = Path(scratch)
            try:
                previous = deployed.get("compose") or self.resolved()
                validate_compose(previous)
                old = self.run(["docker", "inspect", "--format", "{{.Image}}", PROJECT], check=False, quiet=True)
                if old.returncode == 0:
                    old_image = old.stdout.strip()
                    if not re.fullmatch(r"sha256:[a-f0-9]{64}", old_image):
                        raise RuntimeError("Unexpected running image ID")
                    self.run(["docker", "image", "tag", old_image, ROLLBACK_IMAGE])
                    rollback = copy.deepcopy(previous)
                    rollback["services"]["web"]["image"] = ROLLBACK_IMAGE
                    rollback_path = scratch / "rollback.json"
                    atomic_json(rollback_path, rollback)

                self.git("merge", "--ff-only", target)
                config = self.resolved()
                image = f"eesher-portfolio:git-{target}"
                config["services"]["web"]["image"] = image
                config["services"]["web"].setdefault("labels", {})["io.eesher.portfolio.commit"] = target
                config_path = scratch / "compose.json"
                atomic_json(config_path, config)
                log(f"Building portfolio commit {target[:12]}; existing container remains running")
                self.compose(config_path, "build", "web")

                candidate = f"eesher-portfolio-check-{uuid.uuid4().hex[:12]}"
                # Compose run deliberately omits --service-ports: the probe has no published host ports.
                self.compose(config_path, "run", "--detach", "--no-deps", "--pull", "never",
                             "--name", candidate, "web")
                self.wait_candidate(candidate)
                self.run(["docker", "rm", "--force", candidate])
                candidate = None

                live_changed = True
                self.compose(config_path, "up", "--detach", "--no-build", "--pull", "never", "--no-deps",
                             "--force-recreate", "--wait", "--wait-timeout", "120", "web", timeout=180)
                http_healthy()
                atomic_json(self.state / "deployed.json", {"commit": target, "image": image, "compose": config})
                live_changed = False  # The successful deployment is now durably recorded.
                log(f"DEPLOYED {target}: container healthy and {HEALTH_URL} returned HTTP 200")
            except Exception as exc:
                log(f"DEPLOYMENT FAILED for {target[:12]}: {exc}")
                if live_changed and rollback_path:
                    log("Restoring the previously running image")
                    try:
                        self.compose(rollback_path, "up", "--detach", "--no-build", "--pull", "never", "--no-deps",
                                     "--force-recreate", "--wait", "--wait-timeout", "120", "web", timeout=180)
                        http_healthy()
                        log("ROLLBACK SUCCEEDED: previous image is healthy")
                    except Exception as rollback_error:
                        log(f"ROLLBACK FAILED: manual attention required: {rollback_error}")
                atomic_json(self.state / "failed.json", {"commit": target, "error": str(exc)})
                raise
            finally:
                if candidate:
                    self.run(["docker", "rm", "--force", candidate], check=False, quiet=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--state", type=Path, default=Path("/var/lib/eesher-portfolio-deploy"))
    parser.add_argument("--retry", action="store_true", help="Explicitly retry a failed commit")
    args = parser.parse_args()
    if sys.platform != "linux" or os.geteuid() == 0:
        parser.error("Run on Ubuntu as the non-root deployment user, not as root")
    import fcntl
    def interrupted(signum, frame):
        raise RuntimeError(f"Deployment interrupted by signal {signum}")
    signal.signal(signal.SIGTERM, interrupted)
    signal.signal(signal.SIGINT, interrupted)
    os.umask(0o077)
    repo = args.repo.resolve(strict=True)
    args.state.mkdir(mode=0o700, parents=True, exist_ok=True)
    with (args.state / "deploy.lock").open("a") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return 0
        try:
            Deployer(repo, args.state).deploy(retry=args.retry)
        except Exception as exc:
            log(f"ERROR: {exc}")
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
