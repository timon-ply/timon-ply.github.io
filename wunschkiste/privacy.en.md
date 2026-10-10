---
layout: legal
title: "Privacy · Wunschkiste"
doc_id: wunschkiste-privacy
doc_type: "Privacy"
app_name: "Wunschkiste"
language: "English"
language_code: en
language_order: 2
permalink: /wunschkiste/privacy.en/
---
# Privacy at Wunschkiste

Last updated: 10 October 2026

## Controller

Timon Polley, Gutenbergstraße 5, 51469 Bergisch Gladbach, Germany. Email: [dev@timonply.com](mailto:dev@timonply.com). Further provider information is available in the [legal notice](/wunschkiste/impressum.en.html).

## Why Wunschkiste processes data

Wunschkiste helps collect and share gift ideas. Lists, wishes and reservations are stored on a server so invited people can view them in the app or browser. Using it without an account is therefore not exclusively local either.

For these features, Wunschkiste processes list titles, dates, descriptions, selected cover images, archive status, wishes with product addresses, image addresses, prices and notes, optional size and colour, reservations and their status. An optionally uploaded cover image is also stored. Only use images you are permitted to share; avoid confidential information, children's portraits or other unnecessary personal content.

An optional account adds a display name, internal account identifier and technical device sessions to this data. New accounts use an email address and password through Google's Firebase Authentication. The app sends these details to Google over an encrypted connection; your password is not sent to the Wunschkiste backend. The backend receives and verifies authentication tokens and stores the account association, email address and verification status. Google also processes technical connection data such as IP addresses and information about the client used for authentication and abuse prevention. Further information is available in the [Firebase privacy notice](https://firebase.google.com/support/privacy).

If Google sign-in is offered, you can alternatively use your Google access. Google and Firebase Authentication process the account and authentication data needed for this; Wunschkiste receives verified proof of authentication, the account identifier, email address and, where available, display name. Your Google password is not sent to Wunschkiste. Signing in does not grant access to your inbox, contacts or files. Google's further processing is described in its [privacy policy](https://policies.google.com/privacy).

If Apple sign-in is configured and enabled in your app version, you can use your Apple access. Apple and Firebase Authentication process authentication; Wunschkiste receives the provider account identifier, email address or Apple's private relay address and, where provided, your shared name. Your Apple password is not sent to Wunschkiste. “Hide My Email” supplies a relay address, not your underlying real email address. Delivery and forwarding depend on Apple, Google and your settings; Wunschkiste does not guarantee delivery. Further information appears in [Apple's sign-in privacy notice](https://www.apple.com/legal/privacy/data/en/sign-in-with-apple/).

The new Apple/Google sign-in flow requires explicit, initially unchecked consent before each sign-in or renewed confirmation. With the same verified email address, Firebase may use existing email/Google access, associate trusted providers or replace a previously untrusted credential under its provider rules. This consent does not prevent such Firebase associations. Without consent, this new provider operation is not started; email sign-in and guest mode remain available alternatives where offered. [Google describes the provider rules](https://docs.cloud.google.com/identity-platform/docs/concepts-manage-users).

The prepared Apple browser-to-app return processes technical operation identifiers, verification proofs and necessary authentication/revocation tokens temporarily in the Cloudflare backend; sensitive handoff data is encrypted there. Email, name and provider identifiers may form part of the sign-in result. The public return address contains only a random operation identifier, never authentication tokens. The backend holds at most 128 Apple operations and 128 Google consent receipts, each valid for ten minutes. Google consent receipts contain technical verification hashes and account/provider associations, never provider or session tokens. Confirmed acknowledgment or cancellation removes held Apple token payloads. Expired technical records are cleaned up when subsequent operations start, so they are not necessarily physically deleted at the instant they expire. A limited provider-consent record is stored for a successfully associated account; further retention details appear below.

You can upload, replace or remove your own profile photo. It is stored as a private account image and retrieved only through authenticated account access. It does not automatically appear on public invitations or reservations. When removed, the selected photo can no longer be retrieved. A limited number of unused upload fragments may remain stored until a later upload after the technical protection period or until account deletion; they cannot be retrieved through the profile. Language and notification preferences are stored to implement your choices. Product names and other content you enter yourself are not sent to a translation service.

You can request a verification link or a link to reset your password. These messages are sent to your email address through Firebase Authentication. Successful email verification is required before the new access is associated with your Wunschkiste account. A stored device session and local authentication tokens enable continued use without entering your password every time you open the app. These credentials are confidential and are not displayed to other guests.

Older accounts initially retain their username and password sign-in. The Android app derives proof of authentication from the password on the device, and the backend processes it as a verifier with its own salt. Such proof remains confidential despite this processing. From your signed-in older account, you can set up verified email access; this additionally requires your previous password or, for accounts without a password, your previous account key to be checked. Lists and reservations remain associated with the same account. Older Wunschkiste accounts using usernames or account keys are not merged solely because names or email addresses match. The Firebase provider association described above is separate from this. After linking, email access replaces the previous authentication and recovery methods.

Older accounts may also have a private account key. This is an optional existing access method and is not required for new registration. Account keys, session permissions and guest permissions are credentials and do not belong in public messages.

Optional passkeys remain available for older accounts without an email link. Wunschkiste stores the public key, technical identifier, creation time and information used to securely verify authentication. Private keys and any biometric verification remain with the device or passkey provider; Wunschkiste receives no fingerprint or facial data. A synchronised passkey is also subject to your chosen provider's terms. If you configured a recovery code in an earlier version, the server stores it as a verifier. The Android app may keep a code encrypted until you confirm that it has been saved. Resetting an older account consumes the code and invalidates existing sessions, passkeys and old access credentials. This version does not offer passkey sign-in for email accounts.

Providing the requested list, account and gift features is based on Article 6(1)(b) GDPR. Technical measures against abuse and unauthorised access serve the legitimate interest in a secure service under Article 6(1)(f) GDPR. Required details are identified in the relevant form; the corresponding feature cannot be provided without required authentication or list data.

## Guest mode and data on your device

Without an account, permission to edit your own lists or reservations is kept locally on your device or in your browser. This permission is separate from the public invitation link. Android protects local credentials with the Android Keystore; they are excluded from normal device backups. The web version uses local browser storage for necessary management and reservation permissions.

Storage serves the feature you requested and recognises your permission; it is not used for advertising or tracking across devices. If you clear app data or browser storage, lose your device or uninstall the app, guest access may be lost. Previously uploaded lists are not automatically deleted from the server as a result. Save any management access you need, or link your lists beforehand through the available account feature.

Whether you have seen or skipped the optional introduction is stored locally, separately from your credentials. This setting remains after you sign out. The introduction can be reopened in Help; your learning progress is not analysed.

## Invitations, reservations and product images

Anyone who knows a valid invitation link or code can view the corresponding list and its contents, including its cover image, description and date. Share this access information only with the intended people. Gifts are anonymous by default. If a list permits name sharing, signed-in guests can explicitly agree to display their name on their reservation and related in-app notifications. No name is displayed without their own agreement; a later change to the list setting does not give consent for existing reservations. Email addresses and profile photos are not published as part of this. Technical associations still allow you to change your own reservations; this is not complete anonymity towards the service provider.

The “Hide reservations from me” setting hides details about reserved or purchased wishes from the creator in the signed-in app and related notifications. It is a display preference and does not provide secrecy from people who can open the public guest view. Guests still see wish availability.

For supported product links, the backend retrieves public product information. Suitable public product previews may be reused for up to five minutes in a limited memory cache. Links with URL query parameters and short links are not stored as shared cache entries; the purchase link you entered is retained. External product images are loaded from their respective addresses; the image provider receives technically necessary connection data, particularly your IP address. Opening a shop is subject to that shop's own privacy rules. A click or reservation does not trigger a purchase in Wunschkiste.

## Notifications

Push notifications about new guests or purchased wishes are off by default. You can enable and disable them individually. Independently of these switches, a limited activity overview of the latest, up to 20 events is stored in the account. It comes from actual actions in your lists, remains available with push switched off and is not used for analytics or advertising.

Push messages are only offered if delivery is configured. After you enable them, the app may additionally request your device's notification permission. To send through Firebase Cloud Messaging, technical device identifiers and delivery tokens are associated with your signed-in device; at most ten device sessions are considered. Messages contain no gift-givers' names or profile images and no private credentials. Google processes the data required for delivery. The connection is encrypted; Firebase Cloud Messaging itself does not provide end-to-end encryption. See the [Firebase privacy notice](https://firebase.google.com/support/privacy) and [FCM message security guidance](https://firebase.google.com/docs/cloud-messaging/encryption).

Turning off push messages or device permission does not automatically remove notifications already stored in the account. After signing out or revoking a device session, that session is no longer used for delivery; deleting the account removes stored notifications, settings and device associations. Voluntary name sharing and push activation are based on your consent under Article 6(1)(a) GDPR; you can withdraw it for the future.

## Hosting and recipients

These documents are provided through GitHub Pages. GitHub processes technical connection data when you open a page; further information is available in the [website privacy notice](https://timonply.com/privacy.en/). The web interface, Android direct download and backend are provided through Cloudflare Workers. Uploaded cover and profile photos and technical limits for abuse prevention are stored in Cloudflare D1. The app's web address is [Wunschkiste](https://wunschkiste.timon-polley1.workers.dev/). Cloudflare processes data to provide and secure these services.

Firebase Authentication manages email access. Cloud Firestore stores account profiles and associations, lists, wishes, invitations, reservations and technical permission and security data, including credential verifiers for older accounts. The Firestore database is configured in Frankfurt am Main, in the europe-west3 region; Google describes it in the [Firestore location overview](https://firebase.google.com/docs/firestore/locations). This location choice does not apply to Firebase Authentication: Google states that this service processes data exclusively in the USA. It therefore does not promise that all Wunschkiste data processing takes place in the EU. Further information is available in the [Firebase privacy notice](https://firebase.google.com/support/privacy).

These providers may process data outside the European Economic Area. Information on their processing and transfer mechanisms is available in [GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement), [Cloudflare's privacy notice](https://www.cloudflare.com/privacypolicy/), the [Firebase privacy notice](https://firebase.google.com/support/privacy) and [Google's privacy policy](https://policies.google.com/privacy). Google mentions, among other measures, the EU-US Data Privacy Framework and contractual data protection provisions. You can ask the controller about safeguards applicable to this service and, where relevant, request a copy of the corresponding agreements.

Wunschkiste uses no Google Analytics and sends no marketing emails. Verification and password emails serve only the access you requested. Premium is currently only a planned offering. This version offers no checkout, purchases or subscriptions and processes no payment data. There is no decision based solely on automated processing that produces legal or similarly significant effects.

## Advertising and voluntary extra capacity

Wunschkiste contains a prepared integration of Google AdMob and the User Messaging Platform (UMP). Production ads and reward videos are currently off. The German/English consent message has been prepared and published for all regions with a direct decline option; this alone does not enable ads. Store association, provider review and technical readiness must also be confirmed. When the integration is disabled, Wunschkiste starts neither UMP nor the advertising SDK. The standalone guest web view contains no advertising integration.

Wunschkiste is intended for adults and children. Before any possible consent or advertising startup, the prepared Android feature neutrally asks for “Under 13”, “13–17” or “18+”; no age group is preselected. Without a choice and for both minor groups, Wunschkiste starts no UMP/advertising integration and requests no ads. Normal list, guest and account features remain available. Only the coarse category is stored locally on this device, without a date of birth, cloud transmission or device backup. Change it under “Profile → Age group” or in settings. Changing it hides banners and blocks further ad requests. Outstanding server confirmations for optional videos remain independently checkable.

When ads are enabled and you explicitly chose “18+”, the lists and gifts overviews may each show a banner. Sign-in, reservations and account deletion are not interrupted by ads. Required consent choices appear before ad requests; the corresponding advertising privacy options remain available in the app. The app requests non-personalized ads capped at Google's “G” content rating; this is not an independent age check or certification of all ad content. Google may process IP addresses, device information and identifiers, consent status and ad interactions. Non-personalized ads may also require access to device information. Details appear in the [Google privacy policy](https://policies.google.com/privacy) and [AdMob consent documentation](https://developers.google.com/admob/android/privacy). Where consent is required, processing relies on Article 6(1)(a) GDPR and consent can be withdrawn for the future.

Optional videos may offer extra capacity when a limit is reached. A random, short-lived operation identifier is sent to Google; it contains no name, email address, product links or list titles. Google sends a signed reward confirmation with operation, ad and transaction identifiers and a timestamp to the backend. Only after verification is extra capacity assigned to the account or selected list. Firestore stores the capacity association and technical evidence to prevent duplicate grants. Account deletion cleans up these associations. Completing a video dialog alone does not guarantee a grant.

## Retention and deletion

Accounts, lists and wishes are retained to provide the ongoing service until deleted through the available features or following a justified request. Archiving hides a list from the active overview and does not delete data; invitations and reservations remain accessible. Removing individual wishes may initially allow restoration. Uninstalling the app or clearing local data does not replace server deletion.

The new provider sign-in flow stores the latest limited consent record in the account, including the explanation version, provider, consent time and acknowledgment time. An additional bounded proof per device session supports safe retry after a lost server response and includes technical verification hashes. No unbounded consent history is created. The account record remains until replaced by a newer record or account deletion. The session proof remains until replaced, cleanup of the relevant session or account deletion. They are separate from the technical operations described above that are usable for only ten minutes.

Deleting an account removes its associated lists, wishes, uploaded cover and profile photos, device sessions, delivery associations, settings, stored notifications and invitations; its reservations in other people's lists are released. For Firebase accounts, deletion of the associated Firebase Authentication account is also initiated. An Apple-associated account requires fresh Apple confirmation for the same account and confirmation of provider revocation. Your general Google or Apple Account is not deleted. Other people's independent lists are retained. Deletion may require several steps; the app confirms completion only after successful server confirmation. Minimal technical deletion and blocking identifiers may remain to prevent old credentials from being reused. Details and a contact method outside the app are available under [Delete account and data](/wunschkiste/deletion.en.html).

Google states that Firebase Authentication retains logged IP addresses for a few weeks. Other authentication data is kept until user deletion is requested and then removed from live and backup systems within 180 days. For Firebase Cloud Messaging, Google retains installation identifiers until an explicit identifier-deletion request; a provider period of up to 180 days then also applies. Removing the Wunschkiste device association is separate from deleting this identifier. The app's completion confirmation does not promise immediate removal of all provider identifiers or backup copies. Source: [Firebase privacy notice](https://firebase.google.com/support/privacy).

Security data and support messages are retained only while necessary to handle requests, protect the service or fulfil legal obligations. Technical backups may contain deleted data until they are overwritten normally. You can ask the controller for specific information about retention of your data.

## Your rights

Subject to the legal requirements, you have rights of access, rectification, erasure, restriction of processing and data portability. You can object to processing based on legitimate interests on grounds relating to your particular situation. Where processing is based on consent, you can withdraw consent with effect for the future.

Contact [dev@timonply.com](mailto:dev@timonply.com) to exercise your rights. Do not send passwords, account keys or complete identity documents. Appropriate verification of permission may be required to protect your data and other people's data. You can also complain to a data protection supervisory authority, such as the [North Rhine-Westphalia Commissioner for Data Protection and Freedom of Information](https://www.ldi.nrw.de/).

## Children and shared planning

Children's birthdays should be organised by a responsible adult. A wish list does not require the child's full name, birth year, home address or photo. Respect other people's rights when entering information about them, and share only what is needed for invitations and gift planning.

## Questions and changes

For questions, contact [dev@timonply.com](mailto:dev@timonply.com). These notices will be updated if features or data processing change. The date at the beginning indicates the document revision.
