# OrderDesk

**Your code works. Your system is still broken.** A DevFest Ibadan 2026 workshop.

OrderDesk is a small orders API: Node.js, Express and PostgreSQL behind Nginx. Every unit test passes. It is also
deliberately insecure and fragile. Your job is to break it, then fix it.

> ⚠️ This app is vulnerable on purpose. Run it only on your own machine and never expose it to the internet. Only
> attack your own copy.

## Before the session (10 minutes, do this at home: venue Wi-Fi is slow)

You need [Docker Desktop](https://www.docker.com/products/docker-desktop/), [Node.js 22+](https://nodejs.org) and git.
On Windows, use **Git Bash** for the scripts.

```bash
git clone <repo-url> orderdesk && cd orderdesk
npm install
docker compose up -d --build        # API on :3000, Nginx on :8080, Postgres on :5432
docker pull grafana/k6:0.57.0       # used by the load test
npm test                            # 4 passed, 0 failed
```

Check it: `curl http://localhost:8080/health` → `{"status":"ok"}`

## The API

| Method | Endpoint            | Does            | Auth |
| ------ | ------------------- | --------------- | ---- |
| POST   | `/api/login`        | Issue a JWT     | –    |
| GET    | `/api/orders/:id`   | Fetch an order  | JWT  |
| POST   | `/api/orders`       | Create an order | JWT  |
| GET    | `/api/search?q=`    | Search products | –    |
| GET    | `/health`           | Liveness probe  | –    |

Test accounts: `ada@orderdesk.test` / `ada-password` (user 7, owns orders 1041 and 1042) and
`admin@orderdesk.test` / `admin-password`.

## Break it

Each script in `attacks/` reproduces one slide from the talk. Run them from the repo root:

| Script                       | Attack                               |
| ---------------------------- | ------------------------------------ |
| `attacks/01-idor.sh`         | Read another customer's order        |
| `attacks/02-secrets.sh`      | Find the database password           |
| `attacks/03-sqli.sh`         | Log in as admin with no password     |
| `attacks/04-login-flood.sh`  | Guess passwords with no limit        |
| `attacks/05-kill.sh`         | Crash the API and see if it recovers |
| `attacks/06-db-ramp.sh`      | Ramp to 200 users and starve the DB  |

## Fix it: six missions

```bash
npm run test:missions
```

Every mission starts red. A mission is done when its tests are green **and** its attack script stops working.
Start with 01 and 02 if time is short.

| #  | Mission              | Done when                                                          |
| -- | -------------------- | ------------------------------------------------------------------ |
| 01 | Fix authorization    | Ada gets **403** for order 1043                                    |
| 02 | Remove secrets       | No secret in git, the Dockerfile, compose or the image             |
| 03 | Stop injection       | Every query is parameterized; input is validated; no stack traces  |
| 04 | Add rate limits      | The 6th login attempt in a minute gets **429**                     |
| 05 | Survive a kill       | `/health/ready` checks the DB, SIGTERM closes cleanly, compose restarts the API |
| 06 | Wire the pipeline    | CI runs tests, Semgrep, `npm audit` and Trivy                      |

Stretch goals: run the API as a non-root user, pin the base image, add a connection pool and make
`attacks/06-db-ramp.sh` pass, and emit structured JSON logs with a request id.

Stuck? Hints are in the slides. The reference solution is published on the `solution` branch after the session.

## Production-readiness checklist

- **Security:** authorization on every object · no secrets in code or images · validated input, rate limits
- **Reliability:** restart policy and health checks · graceful shutdown · pooling, caching, tested backups
- **Observability:** structured logs with request ids · error-rate and latency metrics · alerts that reach a human
- **DevSecOps:** tests and SAST on every push · dependency and image scans · post-deploy health check

## Reset

```bash
docker compose down -v && docker compose up -d --build
```
