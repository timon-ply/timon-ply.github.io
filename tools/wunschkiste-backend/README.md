# Wunschkiste test backend

Independent shared lists for `/appidee/` and a native Android client, backed by a
Cloudflare Worker and D1. Accounts are optional for guests. No payment, analytics,
scheduled scraping, cron, queues or paid services. Shopping links
open the exact entered destination; purchases are made independently in the shop.

## Zero-cost boundary

The account dashboard was checked on 2026-10-01: **Workers Free, Current plan,
$0**. D1 was created in WEUR only after that check. Do not activate Workers Paid,
add payment information, enable paid extras or automatically upgrade. Verify the
Free plan before every future deployment. Free limits reject requests/queries;
exhaustion is an unavailable-service condition, not permission to pay.

Workers Free / Current plan / $0 was reconfirmed in the dashboard on2026-10-02
before publishing V5; only the existing Free Workers/D1 resources are used.
It was reconfirmed again before the Android account migration/deployment that day.

Official limits: https://developers.cloudflare.com/workers/platform/pricing/ and
https://developers.cloudflare.com/d1/platform/pricing/ . Visible pages refresh at
most every 20 seconds; hidden pages stop polling. The public test is bounded to
500 lists, five new lists per connecting IP per rolling hour, max30 active wishes
and max100 retained wish rows per list. Exceeding creation bounds returns429;
idempotent recovery of an existing list still works. D1 stores bounded text/URLs,
cents, revisions, hashed capabilities and an internal IP hash salted with the
pre-existing secret. Raw IP addresses and creation hashes are never returned.
Thumbnails load directly from entered or imported HTTPS URLs. Public product
metadata is fetched only when an owner adds a supported shop link; it is never
polled or tracked. No new external API, account, credential or package is used.

## Product link import

`POST /api/lists/:id/product-preview` requires an owning account session or an
enabled legacy bearer owner key and
a bounded JSON body `{ "url": "https://…" }`. It returns
`{ title, imageUrl, priceCents, message }`: empty strings/null for unavailable
values, a short manual-entry hint for partial/blocked pages, and no persistence
of the result until the owner saves the wish through the existing item API.
An imported price is a snapshot that the owner should check, not a live-price
promise. Unsupported/invalid URLs return400; unauthenticated requests403;
exhausted per-list limits429. Shop/network failures return an empty preview with
an honest hint and do not prevent manual entry.

Only HTTPS on exact approved hosts is fetched: amazon.de/.com (including www),
amzn.eu/amzn.to, www.lego.com, www.ikea.com, www.otto.de, www.dm.de,
www.thalia.de, www.lidl.de, www.decathlon.de, www.mediamarkt.de, www.saturn.de
and www.zalando.de. Amazon short links must resolve to approved Amazon hosts.
Other manually entered product links remain supported by the wish API. No IP,
localhost, arbitrary port, URL credentials, or unapproved redirect destination
is fetched. Each manual redirect is checked before fetching, with at most three
redirects, an eight-second overall abort and at most1,250,000 decoded body bytes
retained for metadata extraction. Larger responses are cancelled; only complete
metadata within that prefix may be used. Shop requests send an honest app user
agent and accept header; they never forward user bearer keys, claim keys,
cookies, Origin, or other incoming headers. No login/CAPTCHA/access restriction
is bypassed.

Extraction uses bounded public Open Graph, Twitter and JSON-LD Product metadata,
including full Schema.org type URLs. Supported shops also accept their bare
domains. Accessible Amazon product pages can fall back to fixed public product
title, main-image and explicit current-EUR-price elements. These selectors never
use page-wide price text, installment prices or inferred values. Output has
plain text, a maximum90-character title and approved shop/CDN HTTPS image
domains. At most eight JSON-LD blocks of128KB and128 visited nodes are parsed.
Only a single unambiguous EUR Offer value is accepted; AggregateOffer ranges,
conflicting offers, other currencies and "from" prices remain blank. Product
identity is required; a generic homepage, login, challenge or error document
cannot populate a wish. No product/title/price is invented from a URL.

An atomic conditional SQL update permits at most60 fetches per owned list per
UTC day, with at least two seconds between starts. The additive0003 migration
stores only three counters on the existing bounded list row; no HTML cache or
unbounded request log is retained. Failed shop fetches consume the budget.
Creation's existing500-list bound also bounds the import counter storage.

Local network probes on2026-10-02: the Lidl LEGO10328 page supplied a real title,
Lidl image and EUR37.49 offer. Direct LEGO returned403 with a challenge page;
the sampled Amazon ASIN returned404. Those failures correctly yield manual
entry; local probes are not proof of Cloudflare's shop reachability. Amazon's
official Creators API requires affiliate eligibility/credentials that this
prototype does not have; there is no claim that every Amazon link auto-fills.
The deployed V5 Worker also returned the real Lidl title, image and37.49EUR on
2026-10-02. This is one successful live shop probe, not universal shop support.
After the Android update, the deployed Worker successfully imported
https://www.amazon.de/dp/B09BTVP2GQ on2026-10-02: LEGO Halloween40493, a real
media-amazon image and39.99EUR. A blocked LEGO page still correctly requires
manual entry. This proves these sampled pages, not every Amazon or shop link.

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
- The root page offers creation, invitations and a simple "Meine Wunschkisten"
  switcher. The browser keeps confirmed owner capabilities locally in
  `wk.v3.owners`; the former `wk.v2.owner` capability is preserved and recovered.
  Titles/dates update after confirmed owner reads/saves. Guest invitation links
  remain guest views even for lists stored on the same browser. Clearing browser
  storage requires the separately saved private management links.
- Pasting a supported product link starts a debounced preview. Only unchanged
  empty fields are filled; edits stay intact and changing the URL clears only
  unchanged imported values. Closing/saving/navigation cancels stale previews.
  One editable form remains; manual saving works when a shop cannot be imported.
- Sheets open/close with short native-modal transitions, new saved rows animate
  once and only the changed reservation status fades. Reduced-motion settings
  disable movement/spin. Pending saves cannot close a later draft or replace a
  newer route; successful creation capabilities are retained after navigation.
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
  capability or owning account session also authorizes the `/restore` API.
  Account deletion is separately authenticated and permanently deletes its lists.

## Android accounts (migration 0004)

Android uses the same API and guest URLs as the browser. Guests need no install
or account. Native account login uses a client-generated random256-bit account
key, not a human password; the server stores SHA-256 hashes only. The Android
client encrypts credentials with Android Keystore and excludes them from backup.
There is no email recovery service: save the key before relying on the account.

Send a fresh random64-hex `sessionToken` and `deviceName` with `POST /accounts`
(`name`, `accountKey`) or `POST /sessions` (`accountKey`). Persist the key and
token before sending, and reuse that token only when retrying the same attempt.
Successful responses include `account`, `sessionToken`, `expiresAt` (30days).
Authenticated requests use `X-Session-Token`; secrets never appear in guest URLs.

- `GET/PATCH /account`: profile; PATCH accepts `name`.
- `GET /account/lists`: server-owned lists; POST `/lists` with the session creates
  an account-owned list. Its persisted `ownerKey` is only an idempotency key:
  retry requires the matching account session. It cannot authorize edits.
- `POST /account/lists/attach` with `listId`, `ownerKey`: explicitly attach an old
  web list using its private management capability. Existing legacy links remain
  valid for these old lists; the UI explains this before attachment.
- `POST /account/join` with `listId`: save an invitation.
- `GET /account/gifts`: saved invitations and the account's own reservations.
  `GET /lists/:id?guest=1` forces guest presentation, even for the owning account.
- `GET /account/sessions`, `DELETE /account/sessions/:id`, `POST /account/logout`:
  list devices and revoke access. New account-owned lists have no legacy bypass.
- `POST /account/rotate-key` with `currentKey`, `newKey`, `sessionToken`,
  `deviceName`: persist the new values first. Rotation atomically invalidates old
  session versions. Retrying the same rotation recovers its same usable session.
- `DELETE /account` with `currentKey`: one SQLite trigger/statement removes owned
  data, dependent invitations and sessions, and releases claims in other lists.
  The client must request explicit irreversible-deletion confirmation.

Native clients may omit Origin; browser CORS remains limited to the configured
site. Limits are500 accounts,20 owned lists/account,10 active sessions/account,
50 joined lists/account and50 active reservations/account (including restore).
Auth abuse counters occupy at most256 fixed rows. Gifts are grouped in one pass.
No cron, paid auth provider, additional database or billing plan is introduced.

The independent review on2026-10-02 approved this security slice after21/21 local
SQLite/Worker tests passed, including lost responses, concurrent rotations,
revocation, legacy attachment, deletion and capacity limits. This evidence does
not substitute for the separate deployed-Worker and native flow checks.

## Covers and invitation codes

`POST /api/lists` accepts optional `coverId`; the default is `cover_01`.
`PATCH /api/lists/:id` accepts any supplied subset of title, date, description,
and coverId. Omitted fields remain unchanged, including during concurrent
edits of other fields. The only accepted cover IDs are `cover_01` through
`cover_40`; unknown IDs, URLs, null, and non-string values receive400.
The cover selects a bundled client asset; the backend stores no cover image.

All list responses include `coverId`, including guest lists, account summaries,
and gifts. Owner list responses and `/api/account/lists` also include `inviteCode`:
ten lowercase hexadecimal characters from a cryptographic random generator.
Creation replay retains the original cover/code; editing metadata never changes
the code. The database enforces code uniqueness. Codes grant public guest access,
never ownership. Guest-mode responses do not disclose the stored invitation code.

`GET /api/invites/:code` returns only:

```json
{"id":"24-character-list-id","title":"Geburtstag","date":"2026-12-12","description":"Zusammen feiern","coverId":"cover_12","itemCount":3}
```

The URL segment accepts uppercase/lowercase and optional spaces/hyphens
(percent-encode spaces). It returns400 for malformed input and404 for unknown
codes. No item details, account identity, claim identity, or private capability
is returned. Lookup is public even with an expired session header, never joins
a list, and never modifies reservations. After the user confirms the preview,
the native client may call the existing authenticated `POST /api/account/join`
with its listId, then open `/api/lists/:id?guest=1`.

Code lookup has its own256 fixed abuse buckets, salted with the existing setup
secret and keyed by source IP. Each bucket permits30 attempts/hour, including
invalid/unknown codes. Collisions can share a budget; counters are separate from
login counters and do not grow with IP count. Exhaustion returns429; there are
no scheduled jobs, additional services, paid APIs, or billing changes.

### Existing-database migration and backfill

0005 adds checked cover/code columns, their unique index, and the bounded lookup
counter table. Existing rows receive `cover_01`; existing IDs, ownership,
reservations, and metadata remain intact. Apply0005 before deploying the updated
Worker. From this backend directory, using the previously configured Wrangler
environment and verified Free plan:

```powershell
wrangler d1 migrations apply wunschkiste-test --remote --config wrangler.local.json
$inviteWork = Join-Path $env:TEMP ('wunschkiste-invites-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $inviteWork | Out-Null
wrangler d1 execute wunschkiste-test --remote --config wrangler.local.json --command "SELECT id, invite_code FROM lists ORDER BY id" --json | Set-Content -LiteralPath (Join-Path $inviteWork 'lists.json') -Encoding utf8
node backfill-invites.mjs (Join-Path $inviteWork 'lists.json') (Join-Path $inviteWork 'backfill.sql')
wrangler d1 execute wunschkiste-test --remote --config wrangler.local.json --file (Join-Path $inviteWork 'backfill.sql')
wrangler d1 execute wunschkiste-test --remote --config wrangler.local.json --command "SELECT COUNT(*) AS missing_codes FROM lists WHERE invite_code IS NULL"
```

Stop if any command fails. The backfill script uses Node `crypto.randomBytes(5)`,
validates the bounded exported IDs/codes, resolves collisions, and emits only
conditional UPDATEs. It never connects to a database, overwrites an existing
code, or replaces an existing output file. Retrying its SQL is safe. If an older
Worker creates a list during the deployment window, rerun with fresh export/output
paths after deployment until missing_codes is zero. Owner reads also assign any
missing code atomically using Workers `crypto.getRandomValues`, with bounded
collision retries. Local SQLite uses the same additive migration.

Targeted checks:

```powershell
node --test tools/wunschkiste-backend/invitations.test.mjs tools/wunschkiste-backend/accounts.test.mjs tools/wunschkiste-backend/worker.test.mjs
```

Run the test command from the repository root. Tests cover all40 presets,
backward-compatible and concurrent PATCH behavior, unique/replay-stable codes,
public preview without joining, disclosure boundaries, rate limits, backfill
collisions, and preservation of legacy data.

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
0003 adds the bounded product-preview day/count/start-time columns without
changing any existing metadata, wishes, capabilities or claims.
The local SQLite adapter applies the same migrations only if their marker columns
are missing. No data reset.

API: legacy `GET /api/list` returns exists:false to permit older clients to create;
`POST /api/lists` publicly creates/replays one owner's list. List GET/PATCH,
item POST/PATCH/DELETE, item `/restore`, and item
`/reservation` POST are under `/api/lists/:id`. Owner uses bearer capability;
guest uses `X-Claim-Key`. Mutations require JSON with
max16KB body. Invalid input/auth/conflict errors are explicit; no failed request
is rendered as a successful write.
