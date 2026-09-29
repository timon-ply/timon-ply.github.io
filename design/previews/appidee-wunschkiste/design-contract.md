# Wunschkiste — visual contract

## Request and scope

Create a small German-language web version for birthday gift lists: a host can
name a list, add wishes or product links, share it, and guests can anonymously
mark an item as chosen. The target route is `/appidee/` on the existing personal
website.

The static site can demonstrate the complete interaction in one browser, but
it cannot synchronize reservations among guests on different devices. The UI
must say this plainly and must not imply that a live shared reservation service
is active.

## Design intent

Working name: **Wunschkiste**. The product should feel like a thoughtful
birthday invitation made from premium stationery: warm, playful, and distinct,
while keeping product choices and actions easy to scan. Inspiration is a
contemporary children's book, not a generic shopping dashboard.

Competitor research (official product pages, read 2026-09-29):

- [Wishliste](https://www.wishliste.de/): browser-created lists, arbitrary
  shop links or text wishes, account-free anonymous guest reservations.
- [Wishbob](https://www.wishbob.com/faq): cross-shop items and guest
  reservations without guest registration; sharing via link/messenger.
- [KidsList](https://www.kidslist.app/): family-oriented lists, guest
  reservation without an account, and child-data minimization on the public
  view.
- [Giftster: marking a gift purchased](https://help.giftster.com/article/69-mark-gift-purchased):
  reservation and purchase are separate steps; this is clearer than implying
  the list itself processes orders.

Advisor recommendation: keep the entry flow short, separate guest and owner
links, never expose a giver's identity, and preserve a visible way for a guest
to undo their own selection. Do not collect child surname, birth year, photo,
address, or guest identity.

## Reference package and status

- Candidate: `v1`, status `draft` (implemented under the user's explicit
  instruction to proceed autonomously without an approval round).
- Active user-approved version: none. The user asked for generated mockups and
  autonomous implementation without consultation; this explicitly waives the
  normal pause for preview approval for this task. It is not recorded as visual
  approval of the exact images.
- Desktop reference: `wunschkiste-v1-desktop.webp`, 1536 x 1024.
- Mobile reference: `wunschkiste-v1-mobile.webp`, 853 x 1792.
- Source screenshots: none; this is a new product, so the concepts derive from
  the brief and product research rather than an existing app screen.
- Image model/tool: built-in ImageGen; tool-managed model, version not exposed.

## Copy and viewports

Primary landing headline: “Kleine Wünsche. Große Vorfreude.”

Supporting copy: “Sammle Geburtstagswünsche in einer Kiste. Teile den Link.
Deine Gäste suchen sich anonym ein Geschenk aus.”

Primary action: “Wunschkiste erstellen”; secondary action: “Beispiel ansehen”.

Guest page title example: “Mias 7. Geburtstag”. Primary gift action:
“Das schenke ich”. Reserved state: “Schon ausgesucht”.

Target widths: 1440 px desktop design reference, 390 px mobile interaction
reference; implementation should reflow at 320 px and wider without horizontal
scrolling. Desktop list grid uses up to three columns; mobile uses compact
single-column wish cards with the action easy to reach.

## Visual tokens and implementation mapping

- Canvas: warm ivory `#F8F3EA`.
- Text: deep ink `#25382D`.
- Primary action: forest `#285743`, with a high-contrast ivory label.
- Accents: apricot `#EFC09A` and butter `#F4D67E`; muted sage for completed
  states.
- Typography: system serif for expressive headings and system sans-serif for
  forms, labels, and product details; no remote font dependency.
- Shapes: soft 16–20 px wish panels, modest 10–12 px buttons, fine warm borders.
- Illustration: local transparent open gift-box art at
  `../../../appidee/assets/wunschkiste-box.webp`; product card art uses the
  four-quadrant sprite at `../../../appidee/assets/wunschkiste-products-v1.webp`.
- The generated images are visual references only; implement semantic HTML and
  real responsive controls, never a flattened screen image.

## Interaction, motion, and accessibility

- New list: short form for a list title; date and a brief greeting are optional.
- Add wish: title is required; shop link, approximate price, and note are
  optional. Free-text wishes are equal to product links.
- Separate guest URL from the private local management URL. Guest pages never
  expose a management token or giver identity.
- A guest selection stays visibly selected and can be released. External shop
  links open separately with `noopener noreferrer`; the app does not imply that
  it handled a purchase.
- Local preview status is always visible: data is stored only in this browser;
  claims do not synchronize to other devices.
- Prefer immediate state updates, with a short 150–220 ms opacity/translate
  transition. Honor `prefers-reduced-motion`; no animation blocks an action.
- Use semantic landmarks/headings, associated form labels, inline validation,
  visible keyboard focus, minimum 44 px touch actions, and status text/icon in
  addition to color. Keep text comfortable at mobile widths.
- Empty list, successful claim, already-claimed, unknown local list, invalid
  link, and storage failure states must have understandable recovery copy.

## Generation constraints and artifacts

The mockups are concepts, not verified screenshots. The desktop image contains
decorative side lettering and a count that does not match the six visible
example products; these are image-generation artifacts and must not be copied
as product behavior. The mobile image's “3 von 5” count is illustrative as
well. The implementation uses consistent sample state and exact readable DOM
text instead.

Generation prompts requested a refined stationery / children's-book direction,
the stated palette, legible German, useful density, guest-facing reservation
actions, anonymous claimed states, and desktop/mobile layouts without a device
frame. Tool-managed ImageGen; model version unavailable. The separate local
illustration is a transparent watercolor/gouache-style gift box without text.
Four original still-life images of a train, magnetic tiles, colored pencils,
and a picture book provide the sample wish imagery.

## Backend and release boundary

The current site is static GitHub Pages. The preview uses browser-local storage
and is not a real multi-device service. A production-equivalent public claim
flow requires a trusted shared backend with atomic reservation, controlled
management access, and a reviewed privacy/data-retention contract. No backend,
new external API, or paid service is included in this reference scope.
