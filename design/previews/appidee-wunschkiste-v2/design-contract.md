# Wunschkiste v2: one-list app

## Scope and authority

- Request, 2026-10-01: remove the landingpage composition, unnecessary labels and explanations; make a normal, intuitive app with working product links and one test list.
- This supersedes the v1 layout. v1 assets and references remain as historical evidence.
- Candidate v2: draft, implemented under the user's continuing explicit instruction to work autonomously with ImageGen and an advisor. No exact image was personally approved. This is an approval waiver, not evidence of visual acceptance.
- Backend authority: user explicitly approved Cloudflare Workers/D1 Free and forbade all costs. Free status must be verified before remote provisioning. No paid plan, paid quota, auto-upgrade or scheduled compute is authorized.

## Evidence and reference images

- Actual baseline: baseline-v1.jpg, 1296px desktop screenshot of the live v1 guest list on 2026-10-01, source c2e34db. The old header repeats five explanations before the first product.
- v2-list.webp: ImageGen list concept, 1024 x 1536.
- v2-add.webp: ImageGen add-sheet concept, 1024 x 1536.
- Both concepts were generated and visually inspected before dependent implementation.
- Primary app references: https://gowish.com/assets/howto1-en.png (visually inspected), https://gowish.com/assets/bannerPhones-en.png, https://www.giftster.com/iphone/, https://apps.apple.com/us/app/wishupon-shopping-wishlist/id1045928392.
- Standards: Apple HIG Layout and Material 3 canonical feed layouts. These inform predictable actions, content hierarchy, adaptable grids, safe areas and accessible controls; this is not a claim of native certification.
- Advisor /root/ux_advisor inspected v1 and specified a list-first entry point, two mobile columns, concise sheets, explicit guest roles and no fake product images.

## Layout contract

- Root entry: one list, with an empty state and Liste erstellen when none exists. A saved owner reopens the list. An invited guest opens the list directly.
- 64px mobile app bar: gift mark, Wunschkiste, share action, owner-only list menu. No tabs for a one-screen app.
- Compact apricot cover, approximately 110px high: title at 27px, optional date, item count. No subtitle, slogan, tutorial, confetti or progress bar.
- Two columns at 320–650px, three above 650px, maximum content width 960px. Gutters 10–18px.
- Product cards: true optional product image, name (two lines), price, domain. A neutral gift placeholder if no valid image is provided. Never show a generated train for an unrelated product.
- Owner: card edit icon; persistent Wunsch hinzufügen button. Guest: Reservieren on an open wish, Für dich on their choice, Vergeben on another guest's choice.
- Sheet: Wunsch hinzufügen; Produktlink, Name, collapsed Weitere Angaben (Preis, Notiz, Bildlink); Hinzufügen. No artificial metadata extraction is promised.
- Details: full name, exact saved shop link, optional note and price; reservation/release/purchase actions where valid.
- Share: Gästelink and copy. Owner link only in an expandable section, explicitly private. A local-only fallback must disclose its limitation here and identify local mode concisely.

## Tokens and accessibility

- Paper #FBFAF7; ink/primary #183F32; muted #68716D; cover #F7EDDA; green status #E4F2E8; line #E4E5DF.
- Native sans-serif stack; no external font download. Title 27–30px, body 15–16px, meaningful metadata 12–14px.
- Buttons and icon actions at least 44px, associated form labels, visible focus, semantic headings, dialog focus containment, Escape/backdrop close.
- Validation stays next to the form and focuses the failed field. No success message after failed saving.
- Reserve controls remain disabled during the request. A conflict refreshes the list and reports that the wish was already selected.
- Motion: toast opacity/translate 160ms; no decorative motion. Reduced motion disables transitions. Native modal open/close manages focus; editing never changes unrelated items.

## ImageGen prompts and artifacts

Built-in ImageGen, tool-managed model; model version not exposed. The list prompt edited the actual baseline into a mobile app using the above constraints: compact bar/cover, four sample cards, accessible actions, no landingpage text or fake tabs. The second prompt used that result as reference and showed the add-link sheet with the same tokens.

The raster product pictures, shop domains, dates and counts are illustrative. They are not live product data and must not be shipped as a fake catalog. Text and interactive controls are native DOM. The final app starts empty. Actual product pictures only come from an explicitly entered image link; direct shopping links are retained exactly after URL validation.

## Backend contract

- One shared test list, max 30 active wishes, max 100 stored rows including reversible removals.
- Separate cryptographically random setup, management and guest reservation keys. Only hashes of management/claim keys stored remotely; never return them in guest reads.
- Atomic conditional reservation update prevents two guests from claiming the same item.
- No names, email, accounts, payment, analytics or third-party product scraping.
- Cloudflare Free exhaustion must fail with an error rather than incur cost. Poll only visible list pages, at most every 20 seconds. No cron.
- Local Node/SQLite uses the same Worker routing and SQL semantics for contract checks; it is not proof of Cloudflare deployment.
