# Wunschkiste v4: one primary action

2026-10-02 refinement of v3 under the user's continuing autonomous design and deployment instruction. Status: selected autonomous candidate; no personal approval of an exact generated image is claimed. v3 is superseded for the changes below.

## Reference before implementation

- Actual baseline: task outputs/wunschkiste-v3/local-owner-390.jpg, inspected at 390 x 844. The currently published and user-visible site still showed v1 when this refinement began.
- v4-list-detail.webp: generated and inspected before implementation using built-in ImageGen (tool-managed, model version not exposed). Original retained in generated_images/01a0eb76-e27d-7a52-9d55-398de59fc72e/exec-82857579-f624-4601-aefa-92746ec60ae1.png.
- Prompt: preserve the restrained native list, actual title/date, real optional thumbnails, compact metadata and one bottom Add action. Add a subtle chevron to each row; keep all names aligned left and images right. Owner detail has only Bearbeiten as filled primary, one linked shop domain, and small destructive Remove text. One close control. No cover, pills, counters, duplicate headings, tutorial, panels or decorative motion.
- Initial image exploration with left thumbnails was rejected after advisor review because mixed image/text rows need a consistent left text axis. The final image above reflects that correction.
- Primary references: https://culturedcode.com/things/features/ and https://developer.apple.com/design/human-interface-guidelines/buttons . Advisor /root/ux_advisor recommended the chevron, persistent Add location and single owner primary action.
- Generated product pictures and prices are illustrative; only user-supplied links/images/prices appear in the working app. No catalog or automatic product scraping is claimed.

## UI and workflow

- Preserve v3 tokens, typography, 16px phone margins, max720px desktop content and optional 80px images. Never allocate a blank image slot.
- All rows open details and expose a quiet trailing chevron. No per-row menus. Owner list hides guest assignment labels; owner detail retains reservation state and release controls.
- Owner Add remains at the same bottom position for empty and filled lists, with exactly one Add button. Empty state contains only Noch keine Wünsche.
- Owner detail: Bearbeiten primary; domain is the single secondary shop link, at least44px tall. Remove is text. No competing shop primary or redundant navigation.
- Guest detail: Reservieren primary while open, Shop secondary. After own reservation Shop becomes primary; bought/release controls secondary. Another guest's claimed wish cannot be reserved and exposes no shopping action.
- Forms retain necessary accessible field labels; optional fields stay collapsed. Share/menu controls are secondary, 44px targets. The menu contains only edit-list and guest-view actions; management link remains in sharing.
- Functional busy, conflict, inline errors, toast and Undo only;160ms toast transition with reduced-motion alternative. Native dialogs provide modal containment and escape dismissal.
- Backend and Free-only limits remain those documented in v3 and tools/wunschkiste-backend/README.md. Final acceptance requires actual mobile/desktop screenshots, functional guest/owner checks and verified Pages deployment.
