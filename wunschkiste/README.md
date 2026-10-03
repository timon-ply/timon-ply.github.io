# Wunschkiste: Dokumente und Integrationsprüfung

Stand: 3. Oktober 2026. Diese Dateien sind ein vorbereiteter Entwurf für die neue Konto-/Gast-/Bildversion, keine Bestätigung einer veröffentlichten Implementierung. Rechtliche Prüfung erforderlich. Vor Veröffentlichung müssen die unten genannten offenen Tatsachen geklärt und die Texte mit der tatsächlich ausgelieferten Version abgeglichen werden.

## Dateien und Routen

| Markdown-Quelle | Jekyll-Route | Statische HTML-Ausgabe |
| --- | --- | --- |
| privacy.de.md | /wunschkiste/privacy.de/ | /wunschkiste/privacy.de.html |
| impressum.de.md | /wunschkiste/impressum.de/ | /wunschkiste/impressum.de.html |
| help.de.md | /wunschkiste/help.de/ | /wunschkiste/help.de.html |
| deletion.de.md | /wunschkiste/deletion.de/ | /wunschkiste/deletion.de.html |

Markdown verwendet das bestehende `legal`-Layout. Die unmittelbar auslieferbaren HTML-Dateien übernehmen Navigation, Typografie und Styles der vorhandenen Wunschkiste-Infoseiten über `/appidee/info.css`. Keine neuen externen Fonts, Skripte, Tracker oder Dienste. HTML erneut erzeugen mit `node wunschkiste/generate.mjs`. Der lokale Renderer schreibt ausschließlich die vier HTML-Dateien in diesem Ordner; der vorhandene Root-Generator wurde nicht verändert.

Die .html-Routen sind echte Begleitdateien, deshalb keine kollidierenden Jekyll-redirect_from-Einträge. Absolute interne Dokumentlinks funktionieren in beiden Routentypen. Bestehende `/appidee/datenschutz.html` und `/appidee/hilfe.html` bleiben durch diese Arbeit unverändert. Vor dem App-Release muss der Integrator die App-/Weblinks auf den geprüften neuen Stand führen.

## Herkunft der Anbieterangaben

Am 3. Oktober 2026 aus der bereits vorhandenen, lokal veränderten `../impressum.de.md` übernommen: Timon Polley; Gutenbergstraße 5; 51469 Bergisch Gladbach; Deutschland; dev@timonply.com; +49 178 9702884; Wirtschafts-Identifikationsnummer DE460704313. Die Arbeitskopie wurde gelesen, nicht geändert. Keine unabhängige Identitäts-, Adress- oder Registerprüfung durchgeführt. Keine Umsatzsteuer-ID, Rechtsform oder Registereintragung hinzuerfunden.

## Veröffentlichung: offene Tatsachen abgleichen

- **Verfahren B freigegeben, Laufzeitfreigabe noch offen:** Die Android-App berechnet PBKDF2-HMAC-SHA256 mit 600.000 Iterationen aus dem unverändert als UTF-8 kodierten Passwort, festgelegter Domaintrennung und zufälligem Client-Salt. Der Server berechnet für den erhaltenen Anmeldenachweis einen separaten PBKDF2-Prüfwert mit eigenem Salt und 100.000 Iterationen. Migrationsschritte 0006 (Cover) und 0007 (Anmeldung) werden implementiert. Passwortpfade bleiben hinter `PASSWORD_AUTH_ENABLED`, bis der echte Free-Laufzeittest und die Sicherheitsprüfung erfolgreich sind. Nicht verlinken/veröffentlichen, bevor Login, Migration und Löschbestätigung tatsächlich funktionieren.
- Der Client-Nachweis ist ein wiederverwendbares Anmeldegeheimnis, kein öffentlich sicherer Hash. Seine Offenlegung ermöglicht Anmeldung ohne erneute Passwortableitung. Das zweistufige Verfahren ist nicht als „700.000 serverseitige Iterationen“ oder pauschal „OWASP-konform“ zu bezeichnen. Keine Klartextpasswörter oder Nachweise in Logs, URLs, Fehlern, SavedState oder Analytik; keine SMTP-/Reset-E-Mail-Funktion.
- Gastkisten-Erstellung und ausdrückliche Übernahme müssen Ende-zu-Ende funktionieren. Eigentum erfordert die lokale private Berechtigung, nicht nur Einladungscode/List-ID. Nach Geräteverlust darf der Support nicht allein anhand öffentlichen Wissens übernehmen oder löschen.
- Passwort-Reauthentifizierung für Kontolöschung, optionaler Legacy-Zugang, Cascade inklusive Cover und Freigabe fremder Reservierungen müssen mit der neuen Version bestätigt werden. Dokumente nennen absichtlich keine noch unbestätigten Buttonbeschriftungen für die Bestätigung.
- Neue Cover laut Backend-Worker geplant: JPEG höchstens 200.000 Bytes, D1 BLOB, Dimensionen höchstens 2048 pro Seite und vier Megapixel; APP-/COM-/EXIF-Metadaten werden entfernt; Ersetzung entfernt das vorherige Bild; Presetwechsel/Kontolöschung entfernt gespeichertes Cover. Vor Veröffentlichung Testbeleg abgleichen. Öffentliche Cover-URL ist wie die Kiste zugänglich; keine Privatsphäre nur aufgrund schwer erratbarer URLs versprechen.
- Globaler Zieldeckel 500 Kisten muss einschließlich älterer Daten, Transaktionen, Bilder, Metadaten und Indexgrößen wirklich erzwungen werden. 500 × 200.000 Bytes sind 100 MB reine Bilddaten; das ist keine Garantie für Datenbankgröße oder Free-Verfügbarkeit.
- Aktuelle D1-/Workers-Free-Zuordnung, CPU/Krypto-Fähigkeiten, Rate-Limits und Ablehnung bei Grenzerreichung bestätigen. Keine automatische Umstellung auf Bezahltarif, keinen R2-/SMTP-/Analytics-Dienst einführen.
- Reale Sitzungslaufzeit, Missbrauchsdaten (IP-Hash, Zähler), Aufbewahrung entfernter Wünsche, Protokolle und Supportnachrichten festlegen. Die Texte erfinden keine feste Aufbewahrungsdauer. Art. 13 DSGVO verlangt Dauer oder nachvollziehbare Kriterien; reine pauschale Formulierungen müssen anhand des tatsächlichen Betriebs konkretisiert werden.
- Cloudflare-DPA, GitHub-Vertragsrollen, tatsächlich geltende Garantien für Drittlandübermittlungen und zuständige Ansprechpartner nachweisen. Vorhandene Anbieterseiten belegen keinen konkreten Vertragsabschluss. Keine Behauptung ausschließlich europäischer Verarbeitung.
- D1 Time Travel hat laut offizieller Dokumentation im Free-Tarif ein begrenztes Wiederherstellungsfenster. Tatsächliche Konfiguration und zusätzliche Exporte prüfen, ehe im Nutzertext eine feste Backup-Löschfrist genannt wird.
- Alters-/Elternkonzept, Rechtsgrundlagen für Angaben über eingeladene Dritte und Bildrechte im tatsächlichen Produkt prüfen. Keine Gesundheitsdaten, Klarnamen oder Kinderfotos anfordern, wenn nicht benötigt.

## Authentifizierung: kleinster vertretbarer Pfad

1. Gastnutzung bleibt verfügbar; lokale zufällige Verwaltungsberechtigung wird vor dem ersten POST dauerhaft geschützt gespeichert. Kein verpflichtender Rohschlüssel-Onboarding-Screen. Öffentliche Einladungen und private Verwaltungsberechtigungen bleiben strikt getrennt.
2. Optionales Konto mit Benutzername und Passwort, expliziter Übernahme eigener Gastkisten nach erfolgreicher Kontoeinrichtung. Bereits existierende Konten erhalten Zugangsdaten in einer bestehenden Sitzung; keine neue leere Identität über ihre Kisten schreiben. Wiederholungen verlorener Antworten bleiben idempotent.
3. Benutzernamen eindeutig und serverseitig kanonisieren; ein einfacher ASCII-Namensraum reduziert Verwechslungsrisiken. Anzeigename getrennt halten. Passwort niemals trimmen, normalisieren, loggen oder in Android SavedState/Bundle legen; Passwortmanager und Einfügen erlauben. Die implementierte App-Policy erlaubt 15–128 Unicode-Zeichen; Leerzeichen bleiben unverändert. Ohne MFA empfiehlt OWASP mindestens 15 Zeichen. Lange Passphrasen zulassen und keine willkürlichen Sonderzeichenregeln erzwingen.
4. Rate-Limits vor teurer KDF-Arbeit, generische Loginfehler, konstanter Vergleich, zufälliger Salt, versionierte Parameter, kein schneller SHA256-Passworthash. Unbekannter Benutzer darf Timing/Antwort nicht deutlich verraten. Harte dauerhafte Kontosperren ermöglichen fremde Aussperrung; begrenzte Wartezeiten bevorzugen.
5. Freigegebenes Verfahren B explizit und versioniert implementieren: native SHA256-PBKDF2 mit 600.000 Iterationen und zufälligem Client-Salt, serverseitig eigener Salt und 100.000 Iterationen. Client-Salt/Version müssen für die Anmeldung reproduzierbar abrufbar sein; Antworten für unbekannte Benutzernamen dürfen keine triviale Kontenabfrage ermöglichen. UTF-8, Domaintrennung, Parameter und Ausgabeformat auf Android und Server mit festen Testvektoren abstimmen. Neues Passwort und neue Salts dürfen eine bestehende Identität nicht unbeabsichtigt ersetzen. Insbesondere verlorene Antworten auf Registrierung/Upgrade/Passwortwechsel und die Wiederherstellung derselben Sitzung testen. Worker-Free-CPU und Kryptoobergrenzen vor Aktivierung messen, bei Fehlschlag Feature gesperrt lassen statt Parameter heimlich abzusenken.
6. Ohne E-Mail gibt es keinen E-Mail-Reset. Vor Registrierung klar erklären, Passwortmanager anbieten. Passwortänderung benötigt erneute Berechtigungsprüfung und nachvollziehbare Sitzungssperre; verlorenes Passwort nicht über öffentliche Listendaten „zurücksetzen“. Legacy-Schlüssel bleiben optionaler Migrationsweg, nicht mit Einladungscodes verwechseln.

## Android App Links und Teilen

- Der aktuelle Manifestfilter umfasst exakt `https://timonply.com/appidee/` und `/appidee`. Damit fallen neue Rechtsrouten außerhalb des Filters. Keine breite Host-/Pfadübernahme, die Impressum oder Datenschutz wieder in die App leitet.
- `assetlinks.json` unter `https://timonply.com/.well-known/assetlinks.json` muss ohne Redirect erreichbar sein und den tatsächlich verteilten Signaturfingerprint enthalten. Für Play App Signing später dessen App-Signing-Zertifikat statt nur des Upload-Zertifikats prüfen. Installierte App, Browser ohne App und Android-Einstellung „Unterstützte Links öffnen“ getrennt testen.
- Native `ACTION_SEND`, `text/plain`, `EXTRA_TEXT` und `Intent.createChooser` sind passend. Teile nur den öffentlichen Gästelink plus optionalen Code/Titel, niemals Session-, Konto- oder Owner-Schlüssel. Auch nach Bild-Upload bleibt die Einladung ein HTTPS-Link; der Empfänger braucht keine App.
- Eingehende Links als untrusted input behandeln: Schema/Host/Pfad exakt prüfen, ID/Code begrenzen, nur unterstützte Parameter lesen, keine automatische Eigentumsübernahme oder Reservierung. Vorschau vor ausdrücklichem Beitritt. `onNewIntent` und kalt gestartete App müssen denselben Pfad verwenden. Ein alter privater Verwaltungslink benötigt eine ausdrückliche Übernahmebestätigung.
- API-Abfrage der Vorschau darf nicht bereits eine Mitgliedschaft erzeugen. Selbst geteilte öffentliche Einladung muss Gastansicht öffnen, obwohl der angemeldete Nutzer Eigentümer ist. Browser-Reservierungen bleiben gegenüber App-Reservierungen konsistent.

## Quellen, am 3. Oktober 2026 geprüft

- OWASP Password Storage: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP Authentication: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- Workers-Limits: https://developers.cloudflare.com/workers/platform/limits/
- Workers Web Crypto: https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
- workerd PBKDF2 Issue: https://github.com/cloudflare/workerd/issues/1346
- D1-Preise/Free-Limits: https://developers.cloudflare.com/d1/platform/pricing/
- D1 Time Travel: https://developers.cloudflare.com/d1/reference/time-travel/
- Android App Links: https://developer.android.com/training/app-links/verify-android-applinks
- Android Sharesheet: https://developer.android.com/develop/ui/compose/sharing/send
- DSGVO, besonders Art. 6, 12–14, 17, 21, 28 und 44 ff.: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- § 5 DDG: https://www.gesetze-im-internet.de/ddg/__5.html
- Cloudflare DPA: https://www.cloudflare.com/cloudflare-customer-dpa/

## Prüfung

Keine Veröffentlichung, kein Commit, keine Änderung bestehender Rechtsdokumente oder des Root-Generators. Statische HTML-Dateien müssen mit den Quellen synchron bleiben. `node --test tests/site-structure.test.mjs`: 17/17 bestanden. Dieser bestehende Test deckt die neuen Routen nicht automatisch vollständig ab; ergänzende Prüfung aller vier HTML-Dateien bestätigte gültiges UTF-8 ohne Ersatzzeichen, Sprache Deutsch, genau eine H1, mit Markdown synchronisierte Abschnittsüberschriften, auflösbare lokale Links und keine Skripteinbindung. Eine Browser-/Jekyll-Buildprüfung wurde durch diesen Worker nicht durchgeführt.
