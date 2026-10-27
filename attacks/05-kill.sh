#!/usr/bin/env bash
# Failure 01 · Kill the application (slide 17)
source "$(dirname "$0")/_lib.sh"

say "Healthy?"
curl -s -o /dev/null -w '%{http_code}\n' "$BASE/health"

say "Crash the Node process (simulates an uncaught error or OOM)"
docker exec orderdesk pkill -9 node

for i in 1 2 3 4 5 6; do
  sleep 5
  printf '+%2ss  ' "$((i * 5))"
  curl -s -o /dev/null -w '%{http_code}\n' "$BASE/health"
done

say "Container state"
docker ps -a --filter name=orderdesk --format '{{.Names}}  {{.Status}}'
