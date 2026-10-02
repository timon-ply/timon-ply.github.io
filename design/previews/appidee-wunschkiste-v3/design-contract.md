# Wunschkiste v3: direct native list

The user's 2026-10-01 correction supersedes v2: remove every unnecessary label, title, subtitle and box. This candidate is implemented under the continuing explicit autonomous ImageGen/advisor instruction; no personal approval of an exact image is claimed.

## Reference before code

- v3-list.webp was generated and inspected before implementation, then lossily encoded for storage without changing the layout. Model-managed ImageGen, exact model not exposed. Original retained: generated_images/01a0eb76-e27d-7a52-9d55-398de59fc72e/exec-3842eb65-14e3-4fe6-bd97-1705dde0d786.png.
- ImageGen prompt: transform the real v2 screenshot into an App Store-like flat one-list app, using Things, Apple lists and GoWish patterns; remove brand repetition, apricot cover, count, individual menus and placeholder areas. Retain actual list title/date, share/menu, true optional thumbnails, compact metadata and one add action.
- Primary references: https://culturedcode.com/things/features/ ; https://apps.apple.com/us/mac/story/id1709005119 ; https://developer.apple.com/design/human-interface-guidelines/layout-and-organization ; https://gowish.com/assets/howto1-en.png.
- Advisor /root/ux_advisor: use one flat list for mixed image/text wishes; 80px optional thumbnail, no placeholder, no per-row ellipsis, no mixed grid/full-width order.
- Product imagery in the generated mockup is illustrative and will not ship as a fabricated catalog. Live products come only from user input. Empty initial list; no sample wishes seeded in production.

## Exact UI contract

- One actual list title in the header. Date only when entered. Share and owner menu trailing, 44px targets. No extra brand, cover, gift illustration, item count or tutorial.
- Flat single column, 16px mobile margins, max720px desktop. Names left, optional real 80px thumbnail right. Image rows104px; text-only rows76px. Fine separators only; no bordered cards or colored placeholder boxes.
- Name max2 lines, price and domain in one metadata line. Only assigned items show plain Für dich / Vergeben text. Whole row opens details; owner edit/remove there.
- Owner: one persistent Wunsch hinzufügen action. Guest: no add action. Reserve is the primary detail action before visiting a shop; unavailable items cannot be reserved again.
- Add sheet: Productlink and Name; optional extra fields collapsed; one submit. Share sheet: guest link and copy; private management capability expandable. No explanations unless needed for private capability or a concrete error.
- Functional busy/validation/status/undo transitions only. No decorative animation. Reduced-motion supported.
- Paper #FBFAF7, ink #183F32, muted #68716D, fine line #E4E5DF. Native sans; title26px, wish16px, metadata13px; line-height1.4. True accessible focus and modal containment.

## Behavior and release

- Same tested one-list Worker/D1 contract as v2; max30 active wishes, atomic anonymous claims, owner hashes, no identity collection, payments, tracking, scraping or cron.
- Creation uses a persisted client-generated owner key and idempotent server replay after a lost response.
- Automatic refresh skips identical data and restores keyboard focus after changed data.
- Cloudflare Workers Free was confirmed as Current plan $0 in the account dashboard before D1 creation. No paid service or upgrade authorized. Free quota exhaustion must reject, never trigger an upgrade.
- Local screenshots/flows and a production deployment are separate evidence. Capture final v3 screenshots and validate live behavior before claiming delivery.
