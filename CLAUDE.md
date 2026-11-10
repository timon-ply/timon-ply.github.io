# Legal docs site (timonply.com)

Public legal-document and support site for the owner's apps (NeonRoutine, Kalvenda, Exactake, Flatnest,
Wunschkiste). Static site on GitHub Pages with Jekyll. **This repository is public and `main` is the live
site: every push to `main` publishes.** Nothing private belongs in any tracked file, including this one.

## Where things are

- Branch `main` = `origin/main` = live. Remote `origin` is the public Pages repository; the domain is in `CNAME`.
- `tools/generate_legal_docs.mjs` generates most legal documents (all apps, all languages, route aliases).
  Change wording there, not in the generated `*.md`, then regenerate.
- `impressum.*.md`, `privacy.*.md` at the root; per app `neonroutine/`, `kalvenda/`, `exactake/`, `flatnest/`,
  `wunschkiste/` (Wunschkiste also keeps hand-maintained `.html` routes). Languages: de, en, es, ja; NeonRoutine also fr.
- `index.html`, `support.html`, `debug.html` (route QA page), `assets/`, `_layouts/`, `_config.yml`, `app-ads.txt`.
- `tests/site-structure.test.mjs` (route and structure contract), `tests/wunschkiste-terms.test.mjs`.
- `README.md` describes content and URL scheme; `docs/regulatory-review.md` holds engineering review notes.
- `_config.yml` excludes the agent guides from the built site.

## Commands

- `node tools/generate_legal_docs.mjs` (Node 22+). Run it twice; the second run must change nothing.
- `node --test tests/site-structure.test.mjs` and `node --test tests/wunschkiste-terms.test.mjs`.
- Local look at static pages: `python -m http.server 4173 --bind 127.0.0.1` (Jekyll routes are not rendered that way).
- After a push: wait for the Pages run (`gh run list -L 1`), then load the changed live URL and check the text.
  Canonical URLs look like `https://timonply.com/<app>/<document>.<language>/`.

## Rules

- Publication is the owner's decision each time: prepare the change, show the diff of the legal text, and
  push only after he said so for that change. A pushed commit is live within minutes.
- Legal wording needs human legal review. Never invent legal claims, addresses, numbers or provider names;
  take facts from the owner or from the app's own repository. Structural tests prove routes, not correctness.
- Keep existing store-linked URLs stable. Do not add a redirect alias that collides with a canonical path.
- The tax number in every impressum is a **Umsatzsteuer-Identifikationsnummer under § 27a UStG** (owner's
  statement, 2026-11-10). It is not a Wirtschafts-Identifikationsnummer.
- App hosting, previews and Android downloads do not live here (removed 2026-10-03); the structure test enforces it.
- The working tree is dirty on purpose, see Git. Do risky merges or bulk edits in a temporary clean worktree
  (`git worktree add ..\legal-docs-tmp origin/main`), test there, push from there, then fast-forward this folder.

## Git

- Safety snapshots are automatic. Commit by explicit path only; never `git add -A` here.
- Deliberately uncommitted in this folder: the NeonRoutine legal draft (20 files under `neonroutine/`, marked
  as a local release-candidate draft) with its tooling (`tools/neonroutine_legal_copy.mjs`, further hunks in
  `tools/generate_legal_docs.mjs`, `tests/site-structure.test.mjs`). It must not be published before the
  owner approves it. Also untracked: pipeline dry-run output (`sample/`, `test-*/`, planning files), logs.
- Other worktrees (`.worktrees\neonroutine-health-privacy`, `..\legal-docs-v5-legal`, one under the Codex
  documents folder) are older branches; leave them alone.

## Open work (as of 2026-11-10)

1. NeonRoutine legal draft: review with the owner, then generate, test and publish, or discard.
2. Flatnest documents describe the old app; review against the rebuild before any Flatnest launch.
3. The fr/es/ja wording of the tax-number line was written without legal review.
