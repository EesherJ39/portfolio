# Ubuntu automatic deployment

This is the deployment path for **eesherj.com** on the existing Ubuntu Docker host.
It does not change the site's content, DNS, reverse proxy, or `.openai/hosting.json`.

## Install once in the existing Ubuntu SSH session

```bash
cd ~/portfolio &&
git pull --ff-only origin main &&
sudo python3 deploy/install.py --user jackal --repo "$PWD"
```

The installer checks that the checkout is clean and on `main`, verifies that
`jackal` can access Docker, installs a root-owned deployment script and systemd
units, and runs the first deployment. Only after that succeeds does it enable the
timer. Python 3.9+, Git, Docker Compose v2 with `--wait-timeout`, and systemd are
required. No GitHub token, new SSH credential, inbound port, or GitHub runner is
needed because this repository is public. If it becomes private, polling fails
closed until the authentication design is explicitly updated.

## Normal editing workflow

1. Edit and test on Windows on a feature branch, such as `website-updates`.
2. Push and merge the reviewed changes into GitHub `main`.
3. Ubuntu checks `main` approximately every minute (plus build time).
4. The new image builds while the old container stays running. A temporary
   candidate is checked with no published host ports.
5. Only a healthy candidate replaces the live container. Compose health and
   HTTP 200 at `http://127.0.0.1:23601/` are both checked. A failed replacement
   attempts to restore the previously running image and configuration.

There may be a brief interruption during the single-container replacement. This
is not zero-downtime blue/green hosting. This checks the local application, not
the public DNS/TLS/proxy path or every application feature. It does not wait for
GitHub Actions: build and health gates run on the server. Test changes before
merging, and restrict who can write to `main` because its Docker build code runs
on your host. The service runs as `jackal`, using his existing Docker access;
Docker access itself is powerful and is not a security sandbox.

Dirty server files, local-only commits, rewritten history, non-main checkouts,
unexpected repositories, additional services, privileged mounts, and non-loopback
port mappings block deployment. The server repository is only fast-forwarded,
never reset. After a failed build, its checkout may be newer than the running
image: `/var/lib/eesher-portfolio-deploy/deployed.json` records the last success.

Failed commits are not rebuilt every minute. A new commit triggers another
attempt. Reverting a bad change should be done with a **new revert commit** on
`main`, not a force-push. A hard reboot/forced kill can interrupt rollback;
inspect the service and application health after such an interruption.

## Status and logs

```bash
systemctl list-timers eesher-portfolio-deploy.timer --no-pager
sudo journalctl -u eesher-portfolio-deploy.service -n 80 --no-pager
docker compose ps
curl --fail --head http://127.0.0.1:23601/
```

The service is `oneshot`; **inactive (dead)** between checks is normal. The timer
should remain active. Look for `DEPLOYED <commit>` in the journal.

Pause automatic updates without stopping the website:

```bash
sudo systemctl stop eesher-portfolio-deploy.timer
```

Resume:

```bash
sudo systemctl start eesher-portfolio-deploy.timer
```

Retry the current commit after fixing a transient problem:

```bash
python3 /usr/local/lib/eesher-portfolio/auto_deploy.py --repo "$HOME/portfolio" --retry
```

Disable future automatic updates (website remains running):

```bash
sudo systemctl disable --now eesher-portfolio-deploy.timer
```

The script is copied outside the Git checkout so a routine application commit
cannot silently replace the deployment controller. After intentionally changing
the deployment scripts, review them and rerun the installer. Images are retained
for recovery; inspect `docker system df` periodically and review unused images
before reclaiming disk space. No broad Docker prune is performed automatically.

## Local validation

```bash
python3 -B -m unittest discover -s deploy -p 'test_*.py' -v
```

These tests mock Docker and network calls to cover ordering, port restrictions,
history preservation, rollback, and failed-commit suppression. They do not replace
the initial real deployment and health checks performed by the Ubuntu installer.
