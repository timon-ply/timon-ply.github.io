# Wunschkiste test backend

Independent shared lists for `/appidee/`, backed by a Cloudflare Worker and D1. No accounts,
payment, analytics, product scraping, cron, queues or paid services. Shopping links
open the exact entered destination; purchases are made independently in the shop.

## Zero-cost boundary

The account dashboard was checked on 2026-10-01: **Workers Free, Current plan,
$0**. D1 was created in WEUR only after that check. Do not activate Workers Paid,
add payment information, enable paid extras or automatically upgrade. Verify the
Free plan before every future deployment. Free limits reject requests/queries;
exhaustion is an unavailable-service condition, not permission to pay.

Workers Free / Current plan / $0 was reconfirmed in the dashboard on2026-10-02
before applying the additive description migration and publishing its Worker.

Official limits: https://developers.cloudflare.com/workers/platform/pricing/ and
https://developers.cloudflare.com/d1/platform/pricing/ . Visible pages refresh at
most every 20 seconds; hidden pages stop polling. The public test is bounded to
500 lists, five new lists per connecting IP per rolling hour, max30 active wishes
and max100 retained wish rows per list. Exceeding creation bounds returns429;
idempotent recovery of an existing list still works. D1 stores bounded text/URLs,
cents, revisions, hashed capabilities and an internal IP hash salted with the
pre-existing secret. Raw IP addresses and creation hashes are never returned.
Thumbnails load directly from entered HTTPS URLs.

## Authorization and recovery

List descriptions are optional, bounded to240 characters, and visible to invited
guests under the list title/date. Item descriptions remain in the wish details;
rows show only name, price/shop and availability. Missing metadata adds no labels
or empty space. Earlier clients can omit the list description on PATCH without
clearing it.

- Everyone can create a list from the root page without a setup link. The old
  SETUP_KEY secret now only salts the internal creation limit; it is never
  sent by visitors or exposed in public links. No extra service is used.
- Each list has its own ID and private owner capability; queries and mutations
  remain scoped to that ID. The menu offers a new list to owners and guests.
- The root page always offers creation and invitations; the last management
  link saved on that browser is a secondary shortcut. Creating another list
  keeps earlier lists accessible through their saved management links.
- The browser saves its cryptographically random management key **before**
  creation. Replaying creation with that key recovers the same list if the first
  response was lost. Only its hash is stored in D1.
- Pending drafts are keyed by their individual creation capability, also kept in
  the tab's private `#erstellen` fragment. Reload/retry recovers that operation;
  separate tabs/new-list actions receive distinct keys and cannot remove another
  tab's pending draft. No automatic creation request runs on the start page.
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
router/SQL. Disposable state is in
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
3. Create D1 once, apply `schema.sql` and then `wrangler d1 migrations apply
   wunschkiste-test --remote` to it, provision a
   cryptographically random `SETUP_KEY` with `wrangler secret bulk` or `secret put`.
4. Deploy the Worker. Visitors create lists with their persisted random management
   keys. Save private management links outside the repository.
5. Set only the public API endpoint in `appidee/config.js`, publish Pages, and
   exercise owner and independent guest operations on the live endpoint.

Existing databases use the same migration command before deploying the Worker.
0001 adds descriptions; 0002 rebuilds the list table without its singleton check,
preserving existing IDs, hashes, metadata, wishes and claims. Foreign keys are
deferred within the migration transaction and restored before completion.
The local SQLite adapter applies the same migrations only if their marker columns
are missing. No data reset.

API: legacy `GET /api/list` returns exists:false to permit older clients to create;
`POST /api/lists` publicly creates/replays one owner's list. List GET/PATCH,
item POST/PATCH/DELETE, item `/restore`, and item
`/reservation` POST are under `/api/lists/:id`. Owner uses bearer capability;
guest uses `X-Claim-Key`. Mutations require JSON with
max16KB body. Invalid input/auth/conflict errors are explicit; no failed request
is rendered as a successful write.
