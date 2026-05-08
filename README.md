# Timon Polley App Portfolio And Legal Documents

This repository powers the public legal-document and app-information site for applications developed by Timon Polley. It is hosted through GitHub Pages and served from the custom domain configured in `CNAME`.

The site provides a central, version-controlled place for legal notices, privacy policies, terms of service, accessibility statements, app ads declarations, child-safety standards, and account-deletion instructions.

## Live Site

```text
https://timonply.com
```

GitHub Pages serves the repository from the `main` branch.

## Purpose

Mobile app stores and ad networks require stable public URLs for:

- Privacy policies.
- Terms of service.
- Accessibility statements.
- Legal notice / Impressum.
- Account deletion instructions.
- Child safety and CSAE standards where applicable.
- `app-ads.txt` for ad inventory verification.

This repository keeps those documents in one public place so app metadata, store listings, and SDK dashboards can reference durable URLs.

## Applications Covered

### NeonRoutine

NeonRoutine is a gamified cyberpunk habit and routine tracker. This site hosts its multilingual legal and accessibility documents.

Documents:

```text
neonroutine/privacy.de.md
neonroutine/privacy.en.md
neonroutine/privacy.es.md
neonroutine/privacy.ja.md
neonroutine/terms.de.md
neonroutine/terms.en.md
neonroutine/terms.es.md
neonroutine/terms.ja.md
neonroutine/accessibility.de.md
neonroutine/accessibility.en.md
neonroutine/accessibility.es.md
neonroutine/accessibility.ja.md
```

### Kalvenda

Kalvenda is a group activity and event management application. This site hosts its legal, accessibility, account-deletion, and child-safety documents.

Documents:

```text
kalvenda/privacy.de.md
kalvenda/privacy.en.md
kalvenda/terms.de.md
kalvenda/terms.en.md
kalvenda/accessibility.de.md
kalvenda/accessibility.en.md
kalvenda/csae.de.md
kalvenda/csae.en.md
kalvenda/deletion.de.md
kalvenda/deletion.en.md
```

## Repository Structure

```text
_config.yml                     GitHub Pages / Jekyll configuration
CNAME                           Custom domain
README.md                       Site index and repository guide
app-ads.txt                     Advertising-system verification file
googleba074b808e0bf51a.html     Google site verification file
assets/icons/                   App icons used in the README/site index
impressum.*.md                  General legal notice in multiple languages
neonroutine/                    NeonRoutine legal and accessibility documents
kalvenda/                       Kalvenda legal, safety, deletion, and accessibility documents
```

## General Legal Notice

The legal notice is available in:

```text
impressum.de.md
impressum.en.md
impressum.es.md
impressum.ja.md
```

These files are shared across the app portfolio and should be updated together when legal identity, contact, or jurisdiction information changes.

## Jekyll Configuration

The site uses GitHub Pages with the minimal Jekyll theme:

```yaml
title: Timon Polley - Legal Documents
description: Central repository for legal documents ...
theme: jekyll-theme-minimal
```

The custom domain is configured through:

```text
CNAME
```

## Editing Documents

When updating a document:

1. Edit the relevant language file.
2. Update all supported language variants for the same legal topic.
3. Keep wording consistent across app store metadata and this repository.
4. Commit with a specific message.
5. Push to `main`.
6. Verify the public URL after GitHub Pages rebuilds.

Example:

```powershell
git add kalvenda/privacy.en.md kalvenda/privacy.de.md
git commit -m "Update Kalvenda privacy policy"
git push
```

## Adding A New App

Create a new folder:

```text
newapp/
```

Add the required documents:

```text
newapp/privacy.en.md
newapp/privacy.de.md
newapp/terms.en.md
newapp/terms.de.md
newapp/accessibility.en.md
newapp/accessibility.de.md
```

Add optional documents as needed:

```text
newapp/deletion.en.md
newapp/deletion.de.md
newapp/csae.en.md
newapp/csae.de.md
```

Add an icon under:

```text
assets/icons/newapp.png
```

Update this README with links to the new documents.

## Useful URL Patterns

GitHub Pages converts markdown files into stable pages.

Examples:

```text
https://timonply.com/kalvenda/privacy.en
https://timonply.com/kalvenda/terms.en
https://timonply.com/kalvenda/deletion.en
https://timonply.com/neonroutine/privacy.en
https://timonply.com/neonroutine/terms.en
https://timonply.com/impressum.en
```

Always verify the exact URL before submitting it to an app store or third-party dashboard.

## App Store And Service Usage

Typical destinations for these URLs:

- Apple App Store privacy policy URL.
- Google Play privacy policy URL.
- Google Play account deletion URL.
- App Store Connect support/legal metadata.
- RevenueCat app/legal metadata.
- AdMob app verification.
- Firebase or Google verification flows.

## Validation Checklist

Before relying on a document publicly:

- The document exists in every required language.
- The public URL loads without authentication.
- The content names the correct app.
- Contact and legal identity information are current.
- Links between privacy, terms, deletion, and accessibility pages are consistent.
- App store metadata points to the public URL, not the GitHub source URL.
- `app-ads.txt` is reachable from the root domain if ads are enabled.

## Deployment

Deployment is automatic through GitHub Pages after pushing to `main`.

Check local git state:

```powershell
git status --short
```

Commit and push:

```powershell
git add README.md kalvenda neonroutine impressum.*.md app-ads.txt
git commit -m "Update legal document portal"
git push
```

Then verify:

```text
https://timonply.com
```

## Maintenance Notes

- Keep this repository public because app stores and users need unauthenticated access.
- Do not commit private keys, credentials, internal notes, or unpublished account data.
- Treat legal document changes as release-impacting.
- Keep language variants semantically aligned.
- Review documents before every major app release and before store submission.
