---
layout: legal
title: "Delete account and data · Wunschkiste"
doc_id: wunschkiste-deletion
doc_type: "Deletion and data controls"
app_name: "Wunschkiste"
language: "English"
language_code: en
language_order: 2
permalink: /wunschkiste/deletion.en/
---
# Delete your account and data

Last updated: 14 October 2026

## Delete your account

Open “Profile” in Wunschkiste and choose “Delete account”. Read the summary and confirm deletion with your password and the explicit deletion confirmation. For existing accounts without a password, your existing private access is checked. Uninstalling or signing out does not delete your account.

If you use Google exclusively, confirm the action by signing in with Google again instead of entering a Wunschkiste password. The new Google confirmation flow first requires explicit, initially unchecked consent to possible Firebase provider association with the same verified email address. Cancelling the sign-in dialog does not start account deletion.

If the account is associated with Apple and that access is offered, fresh Apple sign-in using the access belonging to that same account is required. The app first explains the possible Firebase provider association and requires explicit, initially unchecked consent for this new provider operation. After authentication, revocation of the Apple provider permission must also be confirmed before account deletion continues. Another Apple access does not replace this proof. Your general Apple or Google Account is not deleted. Revocation or later cancellation does not automatically undo Firebase provider associations already made.

Account deletion removes the lists, wishes, uploaded cover, wish and profile photos, device sessions, push delivery associations, settings, stored notifications and invitations associated with the account. Your reservations in other people's lists are released. For a Firebase account, the Firebase Authentication access is disabled and then deleted after the Wunschkiste data has been cleaned up. Your general Google or Apple Account is not deleted. Other people's independent lists are not deleted. A confirmed account deletion cannot be undone through the app.

Stored passkey verification data and recovery codes belonging to older accounts are also removed. Archived lists belong to the account and are deleted with it. Archiving alone does not delete a list or revoke an invitation.

## Manage subscriptions separately

Purchases are prepared but not yet enabled. Once purchases are enabled, manage or cancel a subscription in the original [Apple Account](https://support.apple.com/en-us/118428) or [Google Play account](https://support.google.com/googleplay/answer/7018481?hl=en). Subscriptions renew according to the terms shown by the store unless canceled. Account deletion, signing out and uninstalling do not cancel a store subscription. “Restore purchases” requires the original store access and original Wunschkiste account association; it does not transfer a purchase to another account or restore a deleted account.

## Continue an interrupted deletion

Deletion may require several steps. Cover and wish images of all associated boxes are also removed in bounded steps. A pending image-deletion step is stored and retried on continuation before completion is confirmed. If “Account is being deleted” appears, the final server confirmation is still outstanding. The app stores your deletion confirmation securely on this device. Choose “Continue deletion” once your connection is available again. If prompted, confirm your access again. A connection error does not mean that completed deletion steps have been reversed.

If Apple account deletion has not yet started and needs renewed provider confirmation, use the offered Apple sign-in for the same account. An expired confirmation operation requires a new start; it can continue the already stored deletion operation. Deletion already started on the server is confirmed through the stored continuation. Do not create a replacement account for this. Removing Wunschkiste from your Apple settings alone does not replace deletion of Wunschkiste data.

Do not clear app data or uninstall the app while deletion is in progress. Otherwise, you may lose the stored permission needed to continue. Only the final confirmation in the app indicates that deletion has been completed by the server. If you cannot continue, use the contact method below.

## Without access to the app

You can also request deletion outside the app at [dev@timonply.com](mailto:dev@timonply.com?subject=Wunschkiste%20%E2%80%93%20Deletion%20request). Mention Wunschkiste, the email address you use for an email account, your username if available for an older account, and whether the entire account or a particular guest list is affected. Also mention if deletion has already started in the app. To help locate a list, you can provide its public invitation link.

Do not send passwords, private management links, account keys or complete identity documents by email. A public link, username or simply stating an email address does not prove permission. We will agree on an appropriate verification process with you to avoid deleting someone else's data. Requests concerning privacy rights are answered within the statutory time limits; you will be informed if an extension is necessary.

## Guest lists and local data

For guest lists, the management permission is stored on your device or in your browser. Use the available management features while you have access. If you no longer have access or the deletion feature you need is unavailable, use the contact method above. Clearing local storage removes your local permission, but does not automatically delete the uploaded list.

You can remove app data through Android or local web data through your browser settings. Complete any desired server deletion first. Otherwise, you may lose the local permission needed to manage or delete the list.

Older Android versions store the coarse age choice for the prepared advertising feature locally. The new family flow additionally stores required account eligibility and parent approval records in the backend. Clearing local data does not erase these server records; use account deletion or the contact route above. No ads are requested without an age choice or for minor groups.

On iOS, account access, guest permissions and proofs needed for deletion recovery are stored in the device-bound Keychain. “Sign out” ends account access and attempts to remove the local push token and delivered device notifications; guest permissions may remain. Uninstalling deletes no server data and does not reliably promise removal of all Keychain data. During an unfinished deletion, retain the app and access until the server confirms completion. Any required renewed sign-in must confirm the same account; another account must not take over the stored deletion.

Generic iOS messages already handed to APNs/FCM may still appear after disabling notifications, signing out or deletion. The requested short expiry is not an immediate recall guarantee. New sends require a valid device/session association, current account eligibility and enabled settings. iOS advertising is prepared but disabled pending readiness. Clearing local data does not erase server-side age eligibility or family consent records.

Parents can withdraw a child's approval under Profile → Family; withdrawal blocks application access but is separate from erasure of the child's account and shared content. Parent account erasure also withdraws associated approvals. Child account erasure removes identity bindings and family associations. A minimal hashed anti-replay receipt can remain until the original request's 24-hour expiry, then is reclaimed on access. Expiry of an uncompleted parent request does not automatically delete a Firebase identity already created afterwards; contact the controller if account verification was abandoned and you need deletion help.

## Individual wishes and reservations

As the creator, you can remove your own wishes. An available undo feature may initially restore them. As a gift-giver, you can release your own reservation. Releasing a reservation does not delete the other person's wish.

## Retention after deletion

After a Premium purchase, account deletion retains a private anti-reuse record: a SHA-256 digest of the store, environment and original purchase identifier, the deleted internal account identifier, a provider timestamp and, where applicable, the identifier of a revoked transaction. It contains no name, email address, raw Google purchase token or random purchase-account identifier. It cannot sign in to or restore the deleted account. The current flow has no automatic expiry for this record, so deletion after a fixed further period is not promised. Contact the controller with questions about its continued necessity or erasure. Current membership records and the random purchase-account identifier are removed in both test and production environments.

Minimal technical deletion and blocking identifiers may be retained to prevent old access credentials from being reused. They do not allow sign-in or restoration of the deleted account. A completion confirmation does not mean that all providers' backup copies are removed at that same moment: technical backups may contain data until they are overwritten normally. The specific retention periods for Firebase Authentication are described under “Retention and deletion” in the [privacy notice](/wunschkiste/privacy.en.html).

After confirmed image removal, the private image store may retain empty objects with zero image bytes and bounded technical deletion fences. They prevent a delayed upload from restoring a removed image under the same object identifier. These records may include internal owner, list/account, resource and object identifiers and bounded status and capacity data; the fence contains no image content, names or email addresses and cannot sign in to or restore a deleted account. Historically occupied object slots are not released by removing an image. These technical fences currently have no automatic expiry, so complete removal of every technical reference or later release of all capacity is not promised. Contact the controller with questions about their continued necessity or erasure.

Deletion confirmation also does not promise that Apple or Google immediately remove all their own identifiers and security data. Their respective privacy notices additionally apply. Technical Apple/Google sign-in operations, valid for ten minutes, are cleaned up after expiry only when later operations start; confirmed Apple handoff token payloads are removed after acknowledgment or cancellation. Limited consent records in the Wunschkiste account and its sessions are cleaned up during account deletion.

Information needed to process a request or comply with legal obligations is retained only for that purpose and for as long as necessary. You can ask the controller about your particular data.

[Privacy](/wunschkiste/privacy.en.html) · [Legal notice](/wunschkiste/impressum.en.html) · [Help](/wunschkiste/help.en.html)

## Report data and blocks

Confirmed account deletion removes own blocks and pending iOS report drafts associated with that account. Received reports are retained for handling, including a bounded pseudonymous reporter reference that remains after account deletion until handling or manual cleanup and cannot be used to sign in. Necessary evidence about another user’s content may remain for handling and legitimate claims. Closed evidence is intended for manual cleanup after 90 days; open cases remain until handled. Deleting your account does not automatically authorize deletion of another user’s content.
