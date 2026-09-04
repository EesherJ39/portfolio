"""Local safety tests; all Docker and network calls are mocked, never production calls."""
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent


def load(name):
    spec = importlib.util.spec_from_file_location(name, HERE / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


app = load("auto_deploy")
installer = load("install")
SHA = "a" * 40
OLD_IMAGE = "sha256:" + "b" * 64


def config():
    return {"name": "eesher-portfolio", "services": {"web": {
        "container_name": "eesher-portfolio", "image": "eesher-portfolio:local",
        "build": {"context": "/home/jackal/portfolio", "target": "runtime"},
        "ports": [{"host_ip": "127.0.0.1", "published": "23601", "target": 3000, "protocol": "tcp"}],
        "healthcheck": {"test": ["CMD", "node", "-e", "fetch('http://127.0.0.1:3000')"]},
    }}}


class FakeRunner:
    def __init__(self):
        self.calls = []
        self.branch = "main"
        self.dirty = False
        self.remote = app.REMOTE
        self.diverged = False
        self.build_fails = False
        self.up_failures = 0
        self.ups = 0
        self.configs = [config(), config()]
        self.seen_configs = []

    def __call__(self, args, check=True, **kwargs):
        args = list(map(str, args))
        self.calls.append(args)
        output, code = "", 0
        if args[0] == "git":
            if "branch" in args:
                output = self.branch
            elif "status" in args:
                output = " M app/page.tsx" if self.dirty else ""
            elif "get-url" in args:
                output = self.remote
            elif "rev-parse" in args:
                output = SHA
            elif "merge-base" in args:
                code = int(self.diverged)
        elif args[:2] == ["docker", "inspect"]:
            output = OLD_IMAGE
        elif args[:2] == ["docker", "compose"]:
            if "config" in args:
                output = json.dumps(self.configs.pop(0))
            elif "build" in args and self.build_fails:
                code = 1
            elif "up" in args:
                self.ups += 1
                compose_path = Path(args[args.index("-f") + 1])
                self.seen_configs.append(json.loads(compose_path.read_text()))
                if self.ups <= self.up_failures:
                    code = 1
        result = subprocess.CompletedProcess(args, code, output, "")
        if code and check:
            raise RuntimeError("simulated command failure")
        return result


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.state = Path(self.temp.name)
        self.runner = FakeRunner()
        self.deployer = app.Deployer(self.state / "repo", self.state, self.runner)
        self.health = patch.object(app, "http_healthy")
        self.mock_health = self.health.start()
        self.addCleanup(self.health.stop)

    def fail_marker(self):
        return app.read_json(self.state / "failed.json")

    def test_success_is_recorded_after_candidate_and_live_health(self):
        self.deployer.deploy()
        deployed = app.read_json(self.state / "deployed.json")
        self.assertEqual(deployed["commit"], SHA)
        self.assertEqual(deployed["image"], f"eesher-portfolio:git-{SHA}")
        self.assertEqual(deployed["compose"]["services"]["web"]["labels"]["io.eesher.portfolio.commit"], SHA)
        self.mock_health.assert_called_once()
        calls = self.runner.calls
        build = next(i for i, c in enumerate(calls) if c[:2] == ["docker", "compose"] and "build" in c)
        probe = next(i for i, c in enumerate(calls) if c[:2] == ["docker", "compose"] and "run" in c)
        live = next(i for i, c in enumerate(calls) if c[:2] == ["docker", "compose"] and "up" in c)
        self.assertLess(build, probe)
        self.assertLess(probe, live)
        self.assertNotIn("--service-ports", calls[probe])
        self.assertNotIn("--publish", calls[probe])

    def test_dirty_checkout_is_preserved(self):
        self.runner.dirty = True
        with self.assertRaisesRegex(RuntimeError, "local changes"):
            self.deployer.deploy()
        self.assertFalse(any(c[0] == "docker" for c in self.runner.calls))

    def test_feature_branch_is_not_deployed(self):
        self.runner.branch = "website-updates"
        with self.assertRaisesRegex(RuntimeError, "main"):
            self.deployer.deploy()

    def test_unexpected_remote_is_rejected(self):
        self.runner.remote = "https://github.com/someone/another.git"
        with self.assertRaisesRegex(RuntimeError, "remote"):
            self.deployer.deploy()

    def test_diverged_history_is_never_reset(self):
        self.runner.diverged = True
        with self.assertRaisesRegex(RuntimeError, "diverged"):
            self.deployer.deploy()
        self.assertFalse(any("reset" in c for c in self.runner.calls))

    def test_public_fetch_disables_credentials(self):
        self.deployer.deploy()
        fetch = next(c for c in self.runner.calls if "fetch" in c)
        self.assertIn("credential.helper=", fetch)
        self.assertIn("refs/heads/main:refs/remotes/origin/main", fetch)

    def test_already_deployed_commit_is_not_rebuilt(self):
        app.atomic_json(self.state / "deployed.json", {"commit": SHA})
        self.deployer.deploy()
        self.assertFalse(any(c[0] == "docker" for c in self.runner.calls))

    def test_failed_commit_is_not_retried_every_minute(self):
        app.atomic_json(self.state / "failed.json", {"commit": SHA})
        self.deployer.deploy()
        self.assertFalse(any(c[0] == "docker" for c in self.runner.calls))

    def test_explicit_retry_can_recover_failed_commit(self):
        app.atomic_json(self.state / "failed.json", {"commit": SHA})
        self.deployer.deploy(retry=True)
        self.assertEqual(app.read_json(self.state / "deployed.json")["commit"], SHA)

    def test_build_failure_keeps_old_container(self):
        self.runner.build_fails = True
        with self.assertRaises(RuntimeError):
            self.deployer.deploy()
        self.assertEqual(self.runner.ups, 0)
        self.assertEqual(self.fail_marker()["commit"], SHA)
        self.assertFalse((self.state / "deployed.json").exists())

    def test_candidate_failure_keeps_old_container_and_removes_probe(self):
        with patch.object(self.deployer, "wait_candidate", side_effect=RuntimeError("unhealthy")):
            with self.assertRaises(RuntimeError):
                self.deployer.deploy()
        self.assertEqual(self.runner.ups, 0)
        self.assertTrue(any(c[:3] == ["docker", "rm", "--force"] for c in self.runner.calls))
        self.assertEqual(self.fail_marker()["commit"], SHA)

    def test_failed_replacement_restores_old_image(self):
        self.runner.up_failures = 1
        with self.assertRaises(RuntimeError):
            self.deployer.deploy()
        self.assertEqual(self.runner.ups, 2)
        self.assertEqual(self.runner.seen_configs[-1]["services"]["web"]["image"], app.ROLLBACK_IMAGE)
        self.assertFalse((self.state / "deployed.json").exists())

    def test_failed_host_http_check_triggers_rollback(self):
        self.mock_health.side_effect = [RuntimeError("HTTP failed"), None]
        with self.assertRaises(RuntimeError):
            self.deployer.deploy()
        self.assertEqual(self.runner.ups, 2)
        self.assertEqual(self.mock_health.call_count, 2)

    def test_rollback_failure_never_marks_deployment_successful(self):
        self.runner.up_failures = 2
        with self.assertRaises(RuntimeError):
            self.deployer.deploy()
        self.assertFalse((self.state / "deployed.json").exists())
        self.assertEqual(self.fail_marker()["commit"], SHA)

    def test_unsafe_new_compose_is_rejected_before_build(self):
        self.runner.configs[1]["services"]["web"]["ports"][0]["host_ip"] = "0.0.0.0"
        with self.assertRaisesRegex(ValueError, "127.0.0.1"):
            self.deployer.deploy()
        self.assertFalse(any("build" in c for c in self.runner.calls if c[0] == "docker"))
        self.assertEqual(self.runner.ups, 0)

    def test_last_good_state_survives_failed_update(self):
        old = {"commit": "c" * 40, "compose": config(), "image": "old"}
        app.atomic_json(self.state / "deployed.json", old)
        self.runner.up_failures = 1
        with self.assertRaises(RuntimeError):
            self.deployer.deploy()
        self.assertEqual(app.read_json(self.state / "deployed.json"), old)


class ConfigurationTests(unittest.TestCase):
    def test_existing_compose_shape_is_accepted(self):
        app.validate_compose(config())

    def test_unsafe_config_variants_are_rejected(self):
        variants = []
        for field, value in (("privileged", True), ("network_mode", "host"), ("volumes", ["/:/host"]),
                             ("devices", ["/dev/sda"]), ("cap_add", ["SYS_ADMIN"]), ("healthcheck", {"disable": True})):
            variant = config()
            variant["services"]["web"][field] = value
            variants.append(variant)
        for host in ("0.0.0.0", "::", "", None):
            variant = config()
            variant["services"]["web"]["ports"][0]["host_ip"] = host
            variants.append(variant)
        variant = config()
        variant["services"]["db"] = {}
        variants.append(variant)
        for variant in variants:
            with self.subTest(variant=variant), self.assertRaises(ValueError):
                app.validate_compose(variant)

    def test_unit_is_non_root_and_poll_only(self):
        service, timer = installer.unit_text("jackal", "/home/jackal/portfolio")
        self.assertIn("User=jackal", service)
        self.assertIn("NoNewPrivileges=true", service)
        self.assertNotIn("ssh", service)
        self.assertIn("OnUnitInactiveSec=60s", timer)
        self.assertNotIn("RemainAfterExit", service)

    def test_unit_rejects_newlines_and_unsafe_paths(self):
        for user, repo in (("root\nOther=bad", "/home/jackal/portfolio"), ("jackal", "/tmp/my repo"),
                           ("jackal", "/tmp/%n")):
            with self.subTest(user=user, repo=repo), self.assertRaises(ValueError):
                installer.unit_text(user, repo)


if __name__ == "__main__":
    unittest.main()
