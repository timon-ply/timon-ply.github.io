# Feature Registry

## App Documents And Support Experience

Abstraction: Static GitHub Pages app-document site made from `index.html`, `support.html`, `_layouts/legal.html`, `debug.html`, shared behavior in `assets/site.js`, and shared styling in `assets/site.css`.

Purpose: Let a visitor choose a current app, visit its verified store listing when available, choose one document language, open the needed legal document, or reach the correct contact route.

Connected features:
- Public app and document entries for NeonRoutine, Kalvenda, and Exactake.
- Verified Apple App Store links for NeonRoutine and Kalvenda; no unverified placeholder destination for Exactake.
- Legal document routes generated from markdown files through the shared Jekyll legal layout.
- App-scoped language selectors that update document links without cookies or browser storage.
- Support, privacy-request, accessibility-feedback, and safety-report contact routes through `support.html`.
- English and German website privacy notices covering hosting access data and email contact.
- Localized legal-page navigation, on-page contents links, skip navigation, mobile reflow, and print styling.
- App-store and ad-network verification files, including `app-ads.txt` and Google verification.

Possible conflicts:
- App store metadata depends on existing legal document URLs. The redesign keeps the current permalink paths stable.
- Public pages must not expose credentials or private operational details. The debug entrypoint is public and limited to non-sensitive QA links.
- Large original app icons can increase page weight. The site uses 192px derivatives for rendered cards while preserving the originals.
- Legal wording and the allocation of controller, hosting-provider, transfer, legal-basis, and retention responsibilities require qualified human review.

Validation:
- Run `node --test tests/site-structure.test.mjs`.
- Open `/index.html`, `/support.html`, `/debug.html`, and representative legal document routes.
- Confirm the home page has one app-document section, all three language pickers update their card links, and there is no horizontal overflow at 320 CSS pixels.
- Confirm legal pages provide a single visible title, localized navigation, language switching, on-page contents, and printable content.

## Debug Functionality Register

Single entrypoint: `/debug.html`.

Debug features:
- App-scoped route checks for NeonRoutine, Kalvenda, and Exactake legal documents.
- Shared app support, provider notice, and app ads verification links.
- Representative legal document routes for quick manual verification.

Connected features:
- `/debug.html` links to legal document routes without modifying those documents.
- `tests/site-structure.test.mjs` verifies the debug page exists and remains connected to app-scoped route checks and legal document routes.
