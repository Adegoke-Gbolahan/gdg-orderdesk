#!/usr/bin/env bash
# Failure 03 · "The health check says 200 OK, but customers can't place orders."
source "$(dirname "$0")/_lib.sh"

TOKEN=$(login ada@orderdesk.test ada-password)

say "The database goes away (disk full, failover, bad migration…)"
docker compose stop db

say "What the health checks say"
printf '/health        → '; curl -s -o /dev/null -w '%{http_code}\n' "$BASE/health"
printf '/health/ready  → '; curl -s -o /dev/null -w '%{http_code}\n' "$BASE/health/ready"

say "What Ada sees when she places an order"
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$BASE/api/orders" \
  -H 'content-type: application/json' -H "authorization: Bearer $TOKEN" \
  -d '{"productId":1,"quantity":1,"deliveryAddress":"4 Bodija Market Street, Ibadan"}'

say "Where would you look first? The API's logs:"
docker logs --tail 4 orderdesk 2>&1 | cut -c1-160

say "Bring the database back"
docker compose start db
