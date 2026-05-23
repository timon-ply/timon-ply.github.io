# Portfolio Design Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, professional, minimal portfolio redesign with stronger visual impact while preserving legal and support routes.

**Architecture:** Keep hand-written static HTML pages, Jekyll markdown legal documents, and one shared stylesheet. Add a public non-sensitive debug entrypoint and a Node built-in structural test suite.

**Tech Stack:** GitHub Pages, Jekyll, HTML, CSS, Node built-in test runner.

---

### Task 1: Redesign Structure Tests

**Files:**
- Create: `tests/site-structure.test.mjs`

- [x] Write tests for home page redesign markers, support dashboard, debug route, feature registry, CSS accessibility rules, and local href validity.
- [x] Run `node --test tests/site-structure.test.mjs` and verify the tests fail because the redesign does not exist.

### Task 2: Static Site Redesign

**Files:**
- Modify: `index.html`
- Modify: `support.html`
- Modify: `_layouts/legal.html`
- Modify: `assets/site.css`
- Create: `debug.html`
- Create: `assets/icons/neonroutine-192.png`
- Create: `assets/icons/kalvenda-192.png`

- [x] Replace the home page with the portfolio hero, app showcase, legal command directory, about section, and support strip.
- [x] Replace the support page body with a support dashboard while preserving `mailto:dev@timonply.com`.
- [x] Update the legal layout font import and page class.
- [x] Rewrite shared CSS for responsive, accessible, minimal editorial styling.
- [x] Create the debug QA entrypoint.
- [x] Add optimized 192px app icons for rendered UI.

### Task 3: Documentation and Verification

**Files:**
- Create: `feature_registry.md`
- Create: `docs/superpowers/specs/2026-05-23-portfolio-design-overhaul-design.md`
- Create: `docs/superpowers/plans/2026-05-23-portfolio-design-overhaul.md`

- [x] Document the design abstraction, connected features, conflicts, validation, and debug entrypoint.
- [x] Run `node --test tests/site-structure.test.mjs`.
- [x] Serve the site locally and inspect the home, support, debug, and legal pages.
- [x] Commit and push to GitHub Pages.
