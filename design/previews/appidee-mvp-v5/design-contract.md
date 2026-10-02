# Wunschkiste MVP V5

Status: V1 approved for implementation on 2026-10-02 by the independent
gpt-6-astra advisor, after opening v1-import-and-lists.png and reviewing this
contract. Verdict: APPROVE V1 for implementation. Actual responsive behavior,
motion and asynchronous recovery remain implementation review requirements.
The user explicitly delegated design review and iteration to another model, then
authorized autonomous implementation and publication after its approval. This
overrides a human confirmation pause in visual-design-preview for this scope;
it does not constitute human approval of the generated image.

## References and scope

Baseline: baseline-add-390.png, actual live add form captured2026-10-02 at390x844,
source75fd95c. Approved V4 list/detail geometry, colors and hierarchy remain.
Generated: v1-import-and-lists.png, built-in ImageGen, tool-managed model identity
not exposed. Full prompt: prompt-v1.txt. Three states: import/loading, editable
result, saved-list switcher. Generated product art/59,99 values are illustrative;
working UI uses only actual metadata or user input. No generated product art ships.
Motion storyboard: motion-v1.png. Its exaggerated displacement illustrates the
sequence only; the exact24px/220ms motion specification below governs code.
The advisor also inspected actual implemented-import-320.png,
implemented-import-390.png, implemented-lists-390.png and
implemented-import-desktop.png, then approved publication after source corrections.
The actual screenshot products/prices came from public Lidl metadata; local
fixture list names are not evidence of remote deployment.

Minimal feature scope: safe bounded public product metadata import, a local saved
owner-list registry/switcher, functional motion and asynchronous recovery. No
accounts, search/catalog, scheduled price tracking, dashboards or paid API.

## Composition and exact copy

Cream#fbfaf7, forest#183f32, existing system font; phone16px outer/22px sheet
padding. One modal at a time. Form one primary Hinzufügen, close control, labels
Produktlink/Name/Preis (€); editable imported values. Existing additional note
and image-URL fields stay under Weitere Angaben. Modest88px image preview with
Bild ändern text action, no result card. Loading: Angaben werden geladen …
with14px spinner, not the exaggerated generated spinner. Imported price has
the practical hint Preis bitte prüfen. Price field is visible after import or
when editing an existing priced wish; the blank/manual field remains available.
Unavailable import: short inline explanation, no saving block or invented values.

Meine Wunschkisten opens a simple sheet: saved names, optional actual date,
current-owner checkmark, thin row dividers; Neue Wunschkiste as text. Accessible
44px controls/56px rows, no counts, previews or extra labels. Root still has one
filled create action; secondary saved-lists and invitation actions. Invitation
always opens guest mode even if its list is locally owned.

At320px, content wraps/scrolls inside the sheet; never shrink16px input text.
At desktop, reuse480px modal and720px list maximum. Keyboard must leave the
focused input and submit reachable through sheet scrolling. Do not replay motion
on periodic refresh. Product import fills only unchanged empty fields; cancel,
URL changes, route changes, save and close invalidate the old request.

## Motion contract

- Sheet open: native modal/inert first, translateY24px→0 and opacity0→1 over
  220ms cubic-bezier(.2,.8,.2,1); backdrop opacity rises simultaneously160ms.
- Sheet close: translateY0→16px/opacity1→0 over160ms; keep modal containment
  until animation completes, then close and restore the triggering focus.
- Import loading:14px spinner; controls usable, save cancels pending import.
- New row after confirmed save: translateY8px→0/opacity0→1 over180ms; the
  containing list is not replayed. Reservation status changes crossfade120ms.
- Press feedback: background response, optionally button scale.99 for100ms;
  no bounce/confetti/cover movement; preserve focus and reachable targets.
- Reduced motion: no translations/spin/scale; immediate modal and state changes
  with static loading status. Escape/back/interruption must cancel close/open
  cleanly and discard stale fetch completions; no hidden focused controls.

## Technical truth and sources

Imported values are a snapshot, not a live-price promise. Accept unambiguous EUR
offers only. Amazon availability must be established honestly; its official API
needs affiliate eligibility and credentials, which are not provisioned here.
No CAPTCHA, login or access restriction bypass; manual entry remains supported.
Strict supported-shop host allowlist and checked redirects, no credentials sent
to stores, bounded requests/body/time and authenticated per-list import.

References: https://help.giftster.com/article/57-add-web-link
https://help.giftster.com/article/39-tips-when-using-my-lists
https://www.wishbob.com/faq_en
https://developer.apple.com/design/human-interface-guidelines/sheets
https://developer.apple.com/design/human-interface-guidelines/motion
https://schema.org/Product
https://affiliate-program.amazon.com/creatorsapi/docs/
