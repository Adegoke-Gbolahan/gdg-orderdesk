#!/usr/bin/env bash
# Failure 02 · Database bottleneck (slide 18). Runs k6 in Docker, no install needed.
source "$(dirname "$0")/_lib.sh"

say "Ramp to 200 users on /api/search"
docker run --rm -i --network orderdesk_default -e BASE_URL=http://nginx \
  grafana/k6:0.57.0 run - < "$(dirname "$0")/../load/search-ramp.js"

say "What the database saw"
docker logs orderdesk 2>&1 | grep -m 3 'too many clients'
