#!/usr/bin/env bash
# Attack 02 · Exposed secrets (slide 14)
source "$(dirname "$0")/_lib.sh"

say "The password is in git history"
git log -p --all | grep -n -i -m 5 'password'

say "…and in every image layer"
docker history --no-trunc orderdesk-api | grep -i -o 'DB_PASSWORD=[^ ]*' | head -1

say "…and anyone with the image can read it"
docker exec orderdesk printenv DB_PASSWORD

say "The whole build context went into the image too"
docker exec orderdesk ls -a /app
