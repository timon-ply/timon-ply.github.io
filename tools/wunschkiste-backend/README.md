# Wunschkiste test backend

One shared list for `/appidee/`, backed by a Cloudflare Worker and D1. No accounts,
payment, analytics, product scraping, cron, queues or paid services. Shopping links
open the exact entered destination; purchases are made independently in the shop.

## Zero-cost boundary

The account dashboard was checked on 2026-10-01: **Workers Free, Current plan,
$0**. D1 was created in WEUR only after that check. Do not activate Workers Paid,
add payment information, enable paid extras or automatically upgrade. Verify the
Free plan before every future deployment. Free limits reject requests/queries;
exhaustion is an unavailable-service condition, not permission to pay.

Official limits: https://developers.cloudflare.com/workers/platform/pricing/ and
https://developers.cloudflare.com/d1/platform/pricing/ . Visible pages refresh at
most every 20 seconds; hidden pages stop polling. One list, max30 active wishes,
max100 retained wish rows. D1 stores only bounded text/URLs, cents, revisions and
hashed capabilities. Thumbnails load directly from entered HTTPS URLs.

## Authorization and recovery

- A private setup secret gates creation; a database singleton enforces one list.
- The browser saves its cryptographically random management key **before**
  creation. Replaying creation with that key recovers the same list if the first
  response was lost. Only its hash is stored in D1.
- The management key is a URL fragment and separate local storage value. Keep
  it private. Guest invitation URLs never contain it.
- Guests hold their own random claim key in their browser. D1 stores only its
  hash. Concurrent claims use a conditional SQL update; only one wins.
- Guest reads return availability and whether a claim belongs to that browser.
  They never return identities or another guest's claim secret.
- Clearing guest browser storage loses its ability to release a reservation;
  the owner can release it from the wish's details. Clearing owner storage
  requires the saved management link.
- Wish removal is soft deletion. The UI offers Undo for ten seconds; the owner
  capability also authorizes the `/restore` API. No hard-delete route exists.

## Local checks

From the repository root, Node22:

```powershell
node tools/wunschkiste-backend/local.mjs
node --check appidee/app.js
node --test appidee/domain.test.mjs appidee/ui-contract.test.mjs tools/wunschkiste-backend/worker.test.mjs tests/site-structure.test.mjs
```

The local server uses Node's experimental SQLite module and exactly the Worker
router/SQL, with creation enabled only for localhost. Disposable state is in
ignored `.local/`. Open http://127.0.0.1:8765/appidee/ . This is not proof of a
remote deployment. `config.js` is replaced with the local API only by this server.

## Deployment

Worker URL: https://wunschkiste-test-api.timon-polley1.workers.dev . CORS permits
only https://timonply.com . Production does not set `DEV_MODE`.

Use Wrangler from the official npm package. OAuth needs `account:read`,
`user:read`, `workers_scripts:write`, `d1:write`; the separate newer `workers:write`
scope does not authorize this deployment path. User completes OAuth themselves.
No credentials, setup key or management link belong in this repository.

1. Check the account's Workers Free plan.
2. Copy `wrangler.example.json` to ignored `wrangler.local.json`, supply the
   account/D1 identifiers, and retain only the DB and allowed-origin bindings.
3. Create D1 once, apply `schema.sql` to it, deploy the Worker, then provision a
   cryptographically random `SETUP_KEY` with `wrangler secret bulk` or `secret put`.
4. Create the one list with a persisted random management key and setup secret;
   save the private management link outside the repository.
5. Set only the public API endpoint in `appidee/config.js`, publish Pages, and
   exercise owner and independent guest operations on the live endpoint.

API: `GET /api/list` checks whether setup exists; `POST /api/lists` creates/replays
setup. List GET/PATCH, item POST/PATCH/DELETE, item `/restore`, and item
`/reservation` POST are under `/api/lists/:id`. Owner uses bearer capability;
guest uses `X-Claim-Key`; setup uses `X-Setup-Key`. Mutations require JSON with
max16KB body. Invalid input/auth/conflict errors are explicit; no failed request
is rendered as a successful write.
