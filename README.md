# Timon Polley App Legal Repository

This repository powers the public legal-document and support site for applications
developed by Timon Polley.

Live site:

```text
https://timonply.com
```

GitHub Pages serves this repository from `main` using the custom domain in
`CNAME`.

## Purpose

The site provides stable public URLs for app stores, SDK dashboards, reviewers,
and users:

- Privacy policies.
- Terms of service.
- Accessibility statements.
- Deletion and data-control instructions.
- Legal notice / Impressum pages.
- Child-safety / CSAE standards for social or user-content apps.
- `app-ads.txt` ad inventory verification.
- Support, privacy request, accessibility feedback, and safety report intake.

## Applications Covered

Each canonical document is published in four languages:

```text
de  German
en  English
es  Spanish
ja  Japanese
```

### NeonRoutine

Local-first habit and routine tracking with local data, reminders, export/import,
RevenueCat purchases, Google Mobile Ads rewarded ads, and consent handling.

Documents:

```text
neonroutine/privacy.{de,en,es,ja}.md
neonroutine/terms.{de,en,es,ja}.md
neonroutine/accessibility.{de,en,es,ja}.md
neonroutine/deletion.{de,en,es,ja}.md
neonroutine/impressum.{de,en,es,ja}.md
```

### Kalvenda

Group activity and event planning with accounts, groups, invitations,
notifications, reporting, blocking, moderation, ads, and purchases.

Documents:

```text
kalvenda/privacy.{de,en,es,ja}.md
kalvenda/terms.{de,en,es,ja}.md
kalvenda/accessibility.{de,en,es,ja}.md
kalvenda/deletion.{de,en,es,ja}.md
kalvenda/csae.{de,en,es,ja}.md
kalvenda/impressum.{de,en,es,ja}.md
```

### Exactake

Local-first nutrition tracking with sensitive local nutrition/body data,
export/import/delete controls, and user-triggered Open Food Facts lookup.

Documents:

```text
exactake/privacy.{de,en,es,ja}.md
exactake/terms.{de,en,es,ja}.md
exactake/accessibility.{de,en,es,ja}.md
exactake/deletion.{de,en,es,ja}.md
exactake/impressum.{de,en,es,ja}.md
```

Icons:

```text
assets/icons/exactake.png
assets/icons/exactake-192.png
```

### Flatnest

Pre-release shared-living app with flat membership, chores, shared money, chat,
invites, notifications, and Firebase-backed collaboration surfaces.

Documents:

```text
flatnest/privacy.{de,en,es,ja}.md
flatnest/terms.{de,en,es,ja}.md
flatnest/accessibility.{de,en,es,ja}.md
flatnest/deletion.{de,en,es,ja}.md
flatnest/csae.{de,en,es,ja}.md
flatnest/impressum.{de,en,es,ja}.md
flatnest/LEGAL_REVIEW_REQUIRED.md
```

Flatnest is pre-release. Re-review the documents before external launch, store
submission, live Firebase activation, paid features, advertising, analytics,
support uploads, or production legal publication.

## Shared Pages

```text
index.html                     Public app/document index
support.html                   Support and request intake
debug.html                     Public route QA page
docs/legal-route-matrix.md     Canonical route matrix for all languages
docs/regulatory-review.md      Engineering compliance review notes
impressum.{de,en,es,ja}.md     General legal notice pages
app-ads.txt                    Ad network seller declaration
```

## Generated Documents

Most legal-document files are generated from:

```text
tools/generate_legal_docs.mjs
```

Regenerate after changing app legal facts, document wording, language variants,
route aliases, or the route matrix:

```powershell
node tools\generate_legal_docs.mjs
```

The generator adds redirect aliases for current and legacy app routes:

```text
/app/document.lang/
/app/document.lang
/app/document.lang.html
/app/document.lang.md
```

GitHub Pages needs `jekyll-redirect-from`, configured in `_config.yml`, for those
aliases to work after deployment.

## URL Patterns

Canonical public URLs:

```text
https://timonply.com/{app}/privacy.en/
https://timonply.com/{app}/terms.en/
https://timonply.com/{app}/accessibility.en/
https://timonply.com/{app}/deletion.en/
https://timonply.com/{app}/impressum.en/
https://timonply.com/{app}/csae.en/
https://timonply.com/impressum.en/
https://timonply.com/docs/legal-route-matrix/
https://timonply.com/support.html
```

Only apps with social or user-generated-content surfaces currently publish CSAE
pages: Kalvenda and Flatnest.

## App Workspaces Referenced

The current document set was reviewed against these local workspaces:

```text
C:\coding\Flutter-Learning\neon_routine
C:\coding\Flutter-Learning\Kalvenda
C:\coding\applications\exactake
C:\coding\Flutter-Learning\flatnest
```

Do not assume this repository alone reflects a final app-store privacy/data-safety
form. Re-check the shipped app features, SDKs, feature flags, and store metadata
immediately before submission.

## Validation

Before relying on changed pages publicly:

```powershell
node --test tests\site-structure.test.mjs
```

For website presentation changes, run a local static server and inspect the actual
rendered pages at desktop and mobile widths.

## Adding Or Updating An App

1. Update `tools/generate_legal_docs.mjs` with the app facts.
2. Regenerate documents.
3. Add icons under `assets/icons/` if the app has canonical icons.
4. Update `index.html`, `support.html`, and `debug.html` if routes or app coverage change.
5. Run `node --test tests\site-structure.test.mjs`.
6. Verify public URLs after GitHub Pages rebuilds.
