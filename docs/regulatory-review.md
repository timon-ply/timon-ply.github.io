---
layout: legal
title: "Regulatory Review Notes"
doc_id: regulatory-review
doc_type: "Review Notes"
app_name: "Portfolio"
language: "English"
language_code: en
language_order: 2
permalink: /docs/regulatory-review/
---
# Regulatory Review Notes

Last updated: August 30, 2026

This is an engineering compliance checklist, not legal advice or a certification. It records the public sources and repository changes used for the current legal-document update.

## Sources checked

- GDPR Articles 12 and 13 transparency requirements: https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng
- German DDG provider information, Section 5: https://www.gesetze-im-internet.de/ddg/__5.html
- German TDDDG terminal-device consent, Section 25: https://www.gesetze-im-internet.de/ttdsg/__25.html
- GitHub Pages visitor IP logging: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection
- GitHub General Privacy Statement: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
- Google Play app account deletion requirements: https://support.google.com/googleplay/android-developer/answer/13327111?hl=en
- Google Play child safety standards policy: https://support.google.com/googleplay/android-developer/answer/9878809?hl=en
- Google EU User Consent Policy: https://www.google.com/about/company/user-consent-policy/
- Apple App Privacy Details and privacy links: https://developer.apple.com/app-store/app-privacy-details/
- Apple App Review broken-link/support/privacy expectation: https://developer.apple.com/distribute/app-review/
- EU Digital Services Act baseline terms/contact and moderation transparency: https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng
- German BFSG accessibility requirements and microenterprise exception, Section 3: https://www.gesetze-im-internet.de/bfsg/__3.html
- WCAG 2.2 reflow, bypass-block, focus, and navigation criteria: https://www.w3.org/WAI/WCAG22/quickref/
- European Accessibility Act: https://eur-lex.europa.eu/eli/dir/2019/882/oj/eng
- EU ODR platform discontinuation as of 20 July 2025: https://consumer-redress.ec.europa.eu/site-relocation_en

## Changes made from this review

- Removed live references to the discontinued EU ODR platform from generated terms and legal notices.
- Added app-scoped legal notices so app-specific Impressum links resolve.
- Added web deletion/data-control pages for every app, including no-account local-first apps.
- Added CSAE standards for apps with social or user-generated-content surfaces: Kalvenda and Flatnest.
- Added redirect aliases for legacy `.html` and `.md` app legal links used by current app code.
- Added English and German website privacy notices covering GitHub Pages access logs and support email.
- Removed third-party web-font requests; the public interface now loads only same-origin styles, scripts, and app icons.
- Added skip navigation, legal-page contents navigation, localized document chrome, visible focus, and long-URL reflow.
- Reduced the homepage route matrix to one language selector and one document list per app.
- Added route matrix paths for the four portfolio languages (German, English, Spanish, and Japanese) plus the NeonRoutine-only French routes.

## Remaining legal review points

- Have qualified counsel review the website privacy notice, controller/provider roles, legal bases, transfer wording, and retention language before treating it as legally complete.
- Re-check GitHub Pages hosting behavior, HTTPS enforcement, and privacy terms after publication.
- Confirm each app-store privacy/data-safety form matches the shipped SDK and feature flags immediately before submission.
- Confirm production ads and personalized ads remain behind valid consent where required.
- Confirm Flatnest legal text again before external launch because the app is pre-release and live production services are approval-gated.
- Confirm any future accounts, cloud sync, remote telemetry, support uploads, paid features, or moderation automation before release.
