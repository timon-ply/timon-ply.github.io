# Feature Registry

## Portfolio Design Overhaul

Abstraction: Static GitHub Pages portfolio made from `index.html`, `support.html`, `_layouts/legal.html`, `debug.html`, and shared styling in `assets/site.css`.

Purpose: Present current app projects, support contact, and legal document routes with a professional minimal interface that carries stronger product identity through app visuals, editorial typography, and structured document navigation.

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
- Verify mobile widths at 375px and 640px, tablet width at 768px, and desktop widths at 1024px and 1440px.

## Debug Functionality Register

Single entrypoint: `/debug.html`.

Debug features:
- Visual regression checkpoints for the home, support, and legal page layouts.
- Critical public route links for portfolio, support, app ads verification, and representative legal document routes.
- Accessibility-oriented checks for keyboard focus visibility and readable document layout.

Connected features:
- `/debug.html` links to legal document routes without modifying those documents.
- `tests/site-structure.test.mjs` verifies the debug page exists and remains connected to the design and legal document routes.
