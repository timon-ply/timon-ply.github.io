# Portfolio Design Overhaul Design

## Context

The repository is a static GitHub Pages site for application portfolio, support, and legal document routes. The current design is minimal and professional but uses a simple list structure with limited visual identity.

## Design

Keep the static hosting model and existing URLs. Replace the home page with an editorial portfolio surface: a strong hero, a document-status panel, visually identifiable app cards, and a legal directory that keeps review-critical links visible. Use the existing app icons as the primary assets and add optimized 192px derivatives for faster rendered images.

The support page keeps the existing mailto workflow and becomes a clearer intake dashboard. Legal pages keep the shared Jekyll layout and gain the same typography and surface treatment through the shared stylesheet.

## Constraints

- No paid runtime services or new hosting dependencies.
- No changes to existing legal document permalinks.
- Public debug information must contain no secrets.
- Typography must not scale via viewport-width font-size rules.
- Motion must respect `prefers-reduced-motion`.

## Testing

Add a Node built-in test suite that checks the redesigned structure, public route references, debug entrypoint, feature registry coverage, focus/reduced-motion CSS, and the absence of viewport-scaled type.
