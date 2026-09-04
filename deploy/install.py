#!/usr/bin/env python3
"""Install the portfolio-only systemd deployment service. Run once with sudo on Ubuntu."""
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

SERVICE = "eesher-portfolio-deploy"


def unit_text(user, repo):
    if not re.fullmatch(r"[a-z_][a-z0-9_-]*", user):
        raise ValueError("Unsupported Linux username")
    if not re.fullmatch(r"/[A-Za-z0-9_./-]+", str(repo)):
        raise ValueError("Use an absolute repository path without spaces or special characters")
    service = f"""[Unit]
Description=Deploy Eesher portfolio from GitHub main
Wants=network-online.target
After=network-online.target docker.service
Requires=docker.service

[Service]
Type=oneshot
User={user}
WorkingDirectory={repo}
Environment=GIT_TERMINAL_PROMPT=0
Environment=PATH=/usr/local/bin:/usr/bin:/bin
ExecStart=/usr/bin/python3 -B /usr/local/lib/eesher-portfolio/auto_deploy.py --repo {repo}
StateDirectory=eesher-portfolio-deploy
StateDirectoryMode=0700
UMask=0077
NoNewPrivileges=true
PrivateTmp=true
TimeoutStartSec=30min
"""
    timer = f"""[Unit]
Description=Check GitHub for portfolio updates every minute

[Timer]
OnBootSec=30s
OnUnitInactiveSec=60s
AccuracySec=5s
RandomizedDelaySec=5s
Unit={SERVICE}.service

[Install]
WantedBy=timers.target
"""
    return service, timer


def run(args, check=True):
    return subprocess.run(args, check=check, text=True, capture_output=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--user", required=True)
    parser.add_argument("--repo", type=Path, required=True)
    args = parser.parse_args()
    if sys.platform != "linux" or os.geteuid() != 0:
        parser.error("Run this installer with sudo on Ubuntu")
    import pwd
    account = pwd.getpwnam(args.user)
    if account.pw_uid == 0:
        parser.error("The deployment user must not be root")
    repo = args.repo.resolve(strict=True)
    service, timer = unit_text(args.user, repo)
    if repo.stat().st_uid != account.pw_uid:
        parser.error("The repository must be owned by the deployment user")
    if Path(__file__).resolve().parent != repo / "deploy":
        parser.error("Run the installer from the target repository's deploy directory")
    for binary in ("git", "docker", "systemctl", "runuser"):
        if not shutil.which(binary):
            parser.error(f"Missing dependency: {binary}")
    as_user = ["runuser", "-u", args.user, "--"]
    branch = run(as_user + ["git", "-C", str(repo), "branch", "--show-current"]).stdout.strip()
    clean = run(as_user + ["git", "-C", str(repo), "status", "--porcelain"]).stdout.strip()
    if branch != "main" or clean:
        parser.error("Server checkout must be on main with no local changes")
    run(as_user + ["docker", "info"])
    help_text = run(as_user + ["docker", "compose", "up", "--help"]).stdout
    if "--wait-timeout" not in help_text:
        parser.error("Docker Compose v2 with --wait and --wait-timeout is required")
    active = run(["systemctl", "show", f"{SERVICE}.service", "--property=ActiveState", "--value"], check=False).stdout.strip()
    if active in ("active", "activating", "deactivating"):
        parser.error("A deployment is currently running; wait for it to finish before reinstalling")

    run(["systemctl", "stop", f"{SERVICE}.timer"], check=False)
    install_dir = Path("/usr/local/lib/eesher-portfolio")
    install_dir.mkdir(mode=0o755, parents=True, exist_ok=True)
    source = repo / "deploy/auto_deploy.py"
    staged = install_dir / "auto_deploy.py.new"
    shutil.copyfile(source, staged)
    staged.chmod(0o755)
    os.replace(staged, install_dir / "auto_deploy.py")
    for suffix, content in (("service", service), ("timer", timer)):
        destination = Path("/etc/systemd/system") / f"{SERVICE}.{suffix}"
        destination.write_text(content, encoding="utf-8")
        destination.chmod(0o644)
    run(["systemctl", "daemon-reload"])
    print("Running the first build and health-checked deployment. This may take several minutes...", flush=True)
    first = run(["systemctl", "start", f"{SERVICE}.service"], check=False)
    state_path = Path("/var/lib/eesher-portfolio-deploy/deployed.json")
    expected = run(as_user + ["git", "-C", str(repo), "rev-parse", "origin/main"]).stdout.strip()
    recorded = json.loads(state_path.read_text()) if state_path.exists() else {}
    if first.returncode or recorded.get("commit") != expected:
        print(first.stderr, file=sys.stderr)
        print(f"Initial deployment failed. Timer was NOT started. Inspect: sudo journalctl -u {SERVICE} -n 100 --no-pager")
        print("If this commit previously failed, fix the cause and explicitly retry it using the deploy/README.md instructions.")
        return 1
    run(["systemctl", "enable", "--now", f"{SERVICE}.timer"])
    print("Automatic deployment enabled: GitHub main is checked approximately every minute.")
    print(run(["systemctl", "list-timers", f"{SERVICE}.timer", "--no-pager"]).stdout)
    print(run(["journalctl", "-u", f"{SERVICE}.service", "-n", "15", "--no-pager"]).stdout)
    return 0


if __name__ == "__main__":
    sys.exit(main())
