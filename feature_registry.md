# Feature Registry

## Portfolio Design Overhaul

Abstraction: Static GitHub Pages app-document site made from `index.html`, `support.html`, `_layouts/legal.html`, `debug.html`, and shared styling in `assets/site.css`.

Purpose: Present current and future app projects by Timon Polley, support contact, and legal document routes with a professional minimal interface that keeps the public page focused on app-scoped actions without duplicate document directories.

Connected features:
- App portfolio entries for NeonRoutine and Kalvenda.
- Legal document routes generated from markdown files through the shared Jekyll legal layout.
- Support contact flow through `support.html` and the `mailto:dev@timonply.com` action.
- App-store and ad-network verification files, including `app-ads.txt` and Google verification.

Possible conflicts:
- App store metadata depends on existing legal document URLs. The redesign keeps the current permalink paths stable.
- Public pages must not expose credentials or private operational details. The debug entrypoint is public and limited to non-sensitive QA links.
- Large original app icons can increase page weight. The site uses 192px derivatives for rendered cards while preserving the originals.

Validation:
- Run `node --test tests/site-structure.test.mjs`.
- Open `/index.html`, `/support.html`, `/debug.html`, and representative legal document routes.
- Confirm the home page has one app-document section and no separate `Documents by app` directory.

## Debug Functionality Register

Single entrypoint: `/debug.html`.

Debug features:
- App-scoped route checks for NeonRoutine and Kalvenda legal documents.
- Shared app support, provider notice, and app ads verification links.
- Representative legal document routes for quick manual verification.

Connected features:
- `/debug.html` links to legal document routes without modifying those documents.
- `tests/site-structure.test.mjs` verifies the debug page exists and remains connected to app-scoped route checks and legal document routes.
