---
layout: legal
title: "Datenschutz · Wunschkiste"
doc_id: wunschkiste-privacy
doc_type: "Datenschutz"
app_name: "Wunschkiste"
language: "Deutsch"
language_code: de
language_order: 1
permalink: /wunschkiste/privacy.de/
---
# Datenschutz bei Wunschkiste

Stand: 4. Oktober 2026 · Version 1.6

## Verantwortlicher

Timon Polley, Gutenbergstraße 5, 51469 Bergisch Gladbach, Deutschland. E-Mail: [dev@timonply.com](mailto:dev@timonply.com). Weitere Anbieterangaben stehen im [Impressum](/wunschkiste/impressum.de.html).

## Wofür Wunschkiste Daten verarbeitet

Wunschkiste hilft beim Sammeln und Teilen von Geschenkideen. Listen, Wünsche und Reservierungen werden auf einem Server gespeichert, damit eingeladene Personen sie in der App oder im Browser sehen können. Auch die Nutzung ohne Konto ist deshalb nicht ausschließlich lokal.

Für diese Funktionen verarbeitet Wunschkiste Listentitel, Datum, Beschreibung, ausgewähltes Titelbild, Archivstatus, Wünsche mit Produktadresse, Bildadresse, Preis und Notiz sowie optional Größe und Farbe, Reservierungen und ihren Status. Ein optional hochgeladenes Titelbild wird ebenfalls gespeichert. Verwende nur Bilder, die du teilen darfst; vermeide vertrauliche Angaben, Kinderporträts oder andere unnötige personenbezogene Inhalte.

Ein optionales Konto ergänzt diese Daten um Anzeigename, interne Kontokennung und technische Gerätesitzungen. Neue Konten verwenden eine E-Mail-Adresse und ein Passwort über Firebase Authentication von Google. Die App übermittelt diese Angaben über eine verschlüsselte Verbindung an Google; dein Passwort wird nicht an das Wunschkiste-Backend übermittelt. Das Backend erhält und prüft Anmeldetokens und speichert die Kontozuordnung, E-Mail-Adresse und ihren Bestätigungsstatus. Google verarbeitet außerdem technische Verbindungsdaten wie IP-Adresse und Angaben zum verwendeten Client für Anmeldung und Missbrauchsschutz. Weitere Angaben stehen in den [Firebase-Datenschutzhinweisen](https://firebase.google.com/support/privacy).

Wenn die Google-Anmeldung angeboten wird, kannst du alternativ deinen Google-Zugang verwenden. Google und Firebase Authentication verarbeiten die dafür benötigten Konto- und Anmeldedaten; Wunschkiste erhält einen geprüften Anmeldenachweis, die Kontokennung, E-Mail-Adresse und gegebenenfalls den Anzeigenamen. Dein Google-Passwort wird nicht an Wunschkiste übermittelt. Die Anmeldung erteilt keinen Zugriff auf dein Postfach, deine Kontakte oder Dateien. Die weitere Verarbeitung durch Google wird in dessen [Datenschutzerklärung](https://policies.google.com/privacy) beschrieben.

Du kannst ein eigenes Profilfoto hochladen, ersetzen oder entfernen. Es wird als privates Kontobild gespeichert und nur über einen authentifizierten Kontozugang abgerufen. Es erscheint nicht automatisch auf öffentlichen Einladungen oder bei Reservierungen. Beim Entfernen ist das ausgewählte Bild nicht mehr abrufbar. Nicht verwendete Upload-Zwischendaten können in begrenzter Anzahl bis zu einem späteren Upload nach der technischen Schutzfrist oder bis zur Kontolöschung gespeichert bleiben; sie sind nicht über das Profil abrufbar. Sprachwahl und Benachrichtigungseinstellungen werden zur Umsetzung deiner Auswahl gespeichert. Produktnamen und andere selbst eingegebene Inhalte werden nicht an einen Übersetzungsdienst gesendet.

Du kannst einen Bestätigungslink oder einen Link zum Zurücksetzen deines Passworts anfordern. Diese Nachrichten werden über Firebase Authentication an deine E-Mail-Adresse gesendet. Eine erfolgreiche E-Mail-Bestätigung ist erforderlich, bevor der neue Zugang mit deinem Wunschkiste-Konto verbunden wird. Eine gespeicherte Gerätesitzung und lokale Anmeldetokens ermöglichen die weitere Nutzung ohne erneute Passworteingabe bei jedem Öffnen. Diese Zugangsdaten sind vertraulich und werden nicht anderen Gästen angezeigt.

Bisherige Konten behalten zunächst ihre Anmeldung mit Benutzername und Passwort. Dabei leitet die Android-App aus dem Passwort auf dem Gerät einen Anmeldenachweis ab, den das Backend mit einem eigenen Salt als Prüfwert verarbeitet. Ein solcher Nachweis ist trotz dieser Verarbeitung vertraulich. Du kannst aus deinem angemeldeten bisherigen Konto einen bestätigten E-Mail-Zugang einrichten; dafür wird zusätzlich dein bisheriges Passwort beziehungsweise bei Konten ohne Passwort der bisherige Kontoschlüssel geprüft. Kisten und Reservierungen bleiben demselben Konto zugeordnet. Gleiche Namen oder E-Mail-Adressen führen nicht automatisch zu einer Zusammenführung von Konten. Nach der Verknüpfung ersetzt der E-Mail-Zugang die bisherigen Anmelde- und Wiederherstellungswege.

Ältere Konten können zusätzlich über einen privaten Kontoschlüssel verfügen. Dieser ist ein optionaler bestehender Zugangsweg und keine Pflicht für die neue Registrierung. Kontoschlüssel, Sitzungs- und Gastberechtigungen sind Zugangsdaten und gehören nicht in öffentliche Nachrichten.

Für bisherige Konten ohne E-Mail-Verknüpfung bleiben optionale Passkeys verfügbar. Wunschkiste speichert dafür den öffentlichen Schlüssel, die technische Kennung, Erstellungszeit und Angaben zur sicheren Prüfung der Anmeldung. Private Schlüssel und eine gegebenenfalls verwendete biometrische Prüfung verbleiben beim Geräte- beziehungsweise Passkeyanbieter; Wunschkiste erhält keine Fingerabdruck- oder Gesichtsdaten. Bei einem synchronisierten Passkey gelten zusätzlich die Bedingungen deines gewählten Anbieters. Falls du in einer früheren Version einen Wiederherstellungscode eingerichtet hast, speichert der Server diesen als Prüfwert. Die Android-App kann einen noch nicht als gesichert bestätigten Code verschlüsselt vorhalten. Beim Zurücksetzen eines bisherigen Kontos werden der Code verbraucht und bestehende Sitzungen, Passkeys und alte Zugänge ungültig. Für E-Mail-Konten bietet diese Version keine Passkey-Anmeldung an.

Die Bereitstellung angeforderter Listen-, Konto- und Geschenkfunktionen stützt sich auf Art. 6 Abs. 1 Buchst. b DSGVO. Technische Maßnahmen gegen Missbrauch und unbefugten Zugriff dienen dem berechtigten Interesse an einem sicheren Dienst nach Art. 6 Abs. 1 Buchst. f DSGVO. Verpflichtende Angaben werden im jeweiligen Formular kenntlich gemacht; ohne erforderliche Anmelde- oder Listendaten kann die entsprechende Funktion nicht angeboten werden.

## Gastmodus und Daten auf deinem Gerät

Ohne Konto wird die Berechtigung zum Bearbeiten eigener Kisten beziehungsweise eigener Reservierungen lokal auf dem Gerät oder im Browser gehalten. Diese Berechtigung ist von dem öffentlichen Einladungslink getrennt. Android schützt lokale Zugangsdaten mit dem Android Keystore; sie werden nicht in das normale Gerätebackup aufgenommen. Die Web-Version verwendet lokalen Browserspeicher für benötigte Verwaltungs- und Reservierungsberechtigungen.

Die Speicherung dient der von dir angeforderten Funktion und dem Wiedererkennen deiner Berechtigung, nicht Werbung oder geräteübergreifendem Tracking. Wenn du Appdaten oder Browserspeicher löschst, das Gerät verlierst oder die App deinstallierst, kann ein Gastzugang verloren gehen. Die zuvor hochgeladenen Listen werden dadurch nicht automatisch vom Server gelöscht. Sichere benötigte Verwaltungszugänge beziehungsweise verknüpfe deine Kisten vorher über die dafür angebotene Kontofunktion.

Ob du die freiwillige Einführung bereits gesehen oder übersprungen hast, wird getrennt von deinen Zugangsdaten lokal gespeichert. Dieser Eintrag bleibt beim Abmelden erhalten. Die Einführung kann in der Hilfe erneut geöffnet werden; es erfolgt keine Analyse deines Lernfortschritts.

## Einladungen, Reservierungen und Produktbilder

Wer einen gültigen Einladungslink oder Einladungscode kennt, kann die zugehörige Kiste und ihre Inhalte einschließlich Titelbild, Beschreibung und Datum sehen. Teile diese Zugangsinformation deshalb nur mit den gewünschten Personen. Geschenke bleiben standardmäßig anonym. Wenn eine Kiste Namensfreigaben erlaubt, können angemeldete Gäste ausdrücklich zustimmen, ihren Anzeigenamen bei ihrer Reservierung und zugehörigen Hinweisen in der App anzuzeigen. Ohne diese eigene Zustimmung wird kein Name angezeigt; eine spätere Änderung der Kisteneinstellung erteilt keine Zustimmung für bestehende Reservierungen. E-Mail-Adresse und Profilfoto werden dabei nicht veröffentlicht. Technische Zuordnungen ermöglichen weiterhin, dass du eigene Reservierungen ändern kannst; dies ist keine vollständige Anonymität gegenüber dem Dienstanbieter.

Die Einstellung „Reservierungen für mich ausblenden“ blendet für den Ersteller Angaben zu reservierten oder gekauften Wünschen in der angemeldeten App und zugehörigen Hinweisen aus. Sie ist eine Anzeigeeinstellung und keine Geheimhaltung gegenüber Personen, die die öffentliche Gastansicht öffnen können. Gäste sehen weiterhin die Verfügbarkeit von Wünschen.

Bei unterstützten Produktlinks ruft das Backend öffentliche Produktinformationen ab. Geeignete öffentliche Produktvorschauen können für höchstens fünf Minuten in einem begrenzten Arbeitsspeicher-Cache wiederverwendet werden. Links mit URL-Abfrageparametern und Kurzlinks werden nicht als gemeinsame Cache-Einträge gespeichert; der eingegebene Kauflink bleibt erhalten. Externe Produktbilder werden von ihrer jeweiligen Adresse geladen; dabei erhält der Bildanbieter technisch notwendige Verbindungsdaten, insbesondere deine IP-Adresse. Beim Öffnen eines Shops gelten dessen eigene Datenschutzregeln. Ein Klick oder eine Reservierung löst in Wunschkiste keinen Kauf aus.

## Benachrichtigungen

Push-Mitteilungen über neue Gäste oder gekaufte Wünsche sind standardmäßig ausgeschaltet. Du kannst sie einzeln aktivieren und wieder abschalten. Unabhängig von diesen Schaltern wird eine begrenzte Aktivitätsübersicht der letzten höchstens 20 Ereignisse im Konto gespeichert. Sie entsteht aus tatsächlichen Aktionen in deinen Kisten, bleibt bei ausgeschaltetem Push verfügbar und wird nicht zur Analyse oder Werbung verwendet.

Push-Nachrichten werden nur angeboten, wenn der Versand eingerichtet ist. Nach deiner Aktivierung kann die App zusätzlich die Benachrichtigungsberechtigung des Geräts anfordern. Für den Versand mit Firebase Cloud Messaging werden technische Gerätekennungen und Versandtokens deinem angemeldeten Gerät zugeordnet; höchstens zehn Gerätesitzungen werden berücksichtigt. Nachrichten enthalten keine Namen oder Profilbilder von Schenkenden und keine privaten Zugangsdaten. Google verarbeitet die für die Zustellung erforderlichen Daten. Die Verbindung ist verschlüsselt; Firebase Cloud Messaging bietet selbst keine Ende-zu-Ende-Verschlüsselung. Siehe [Firebase-Datenschutzhinweise](https://firebase.google.com/support/privacy) und [FCM-Hinweise zur Nachrichtensicherheit](https://firebase.google.com/docs/cloud-messaging/encryption).

Das Abschalten von Push-Nachrichten oder der Geräteberechtigung entfernt nicht automatisch bereits gespeicherte Hinweise aus dem Konto. Nach dem Abmelden beziehungsweise Widerrufen einer Gerätesitzung wird diese Sitzung nicht mehr für den Versand verwendet; beim Löschen des Kontos werden gespeicherte Hinweise, Einstellungen und Gerätezuordnungen entfernt. Freiwillige Namensfreigaben und Push-Aktivierungen beruhen auf deiner Einwilligung nach Art. 6 Abs. 1 Buchst. a DSGVO; du kannst sie für die Zukunft widerrufen.

## Hosting und Empfänger

Diese Dokumente werden über GitHub Pages bereitgestellt. GitHub verarbeitet bei Seitenaufrufen technische Verbindungsdaten; Näheres steht in den [Datenschutzhinweisen der Website](https://timonply.com/privacy.de/). Weboberfläche, Android-Direktdownload und Backend werden über Cloudflare Workers bereitgestellt. Hochgeladene Titel- und Profilbilder sowie technische Begrenzungen zum Missbrauchsschutz werden in Cloudflare D1 gespeichert. Die App-Webadresse ist [Wunschkiste](https://wunschkiste.timon-polley1.workers.dev/). Cloudflare verarbeitet Daten zur Bereitstellung und Absicherung dieser Dienste.

Firebase Authentication verwaltet den E-Mail-Zugang. Cloud Firestore speichert Kontoprofile und Kontozuordnungen, Kisten, Wünsche, Einladungen, Reservierungen sowie technische Berechtigungs- und Sicherheitsdaten, einschließlich der Zugangsdaten-Prüfwerte bisheriger Konten. Die Firestore-Datenbank ist in Frankfurt am Main in der Region europe-west3 eingerichtet; Google beschreibt diese Region in der [Firestore-Standortübersicht](https://firebase.google.com/docs/firestore/locations). Diese Standortwahl gilt nicht für Firebase Authentication: Laut Google verarbeitet dieser Dienst Daten ausschließlich in den USA. Sie ist daher keine Zusage, dass sämtliche Datenverarbeitung von Wunschkiste in der EU erfolgt. Informationen dazu stehen in den [Firebase-Datenschutzhinweisen](https://firebase.google.com/support/privacy).

Diese Anbieter können Daten außerhalb des Europäischen Wirtschaftsraums verarbeiten. Informationen zu ihren Verarbeitungen und Übermittlungsmechanismen finden sich in der [Datenschutzerklärung von GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement), den [Cloudflare-Datenschutzhinweisen](https://www.cloudflare.com/privacypolicy/), den [Firebase-Datenschutzhinweisen](https://firebase.google.com/support/privacy) und der [Datenschutzerklärung von Google](https://policies.google.com/privacy). Google nennt unter anderem das EU-US Data Privacy Framework und vertragliche Datenschutzbestimmungen. Informationen zu den für diesen Dienst geltenden Garantien und gegebenenfalls eine Kopie entsprechender Vereinbarungen kannst du beim Verantwortlichen anfragen.

Wunschkiste verwendet keine Analyse- oder Werbe-SDKs, insbesondere kein Google Analytics, und versendet keine Werbe-E-Mails. Bestätigungs- und Passwort-E-Mails dienen ausschließlich dem von dir angeforderten Zugang. Premium ist derzeit nur ein geplantes Angebot. Diese Version bietet keinen Checkout, keine Käufe oder Abonnements an und verarbeitet keine Zahlungsdaten. Es findet keine ausschließlich automatisierte Entscheidung mit rechtlicher oder vergleichbar erheblicher Wirkung statt.

## Aufbewahrung und Löschung

Konten, Kisten und Wünsche werden für die fortlaufende Bereitstellung aufbewahrt, bis sie über die angebotenen Funktionen oder auf eine berechtigte Anfrage hin gelöscht werden. Archivieren blendet eine Kiste in der aktiven Übersicht aus und löscht keine Daten; Einladungen und Reservierungen bleiben erreichbar. Das Entfernen einzelner Wünsche kann zunächst eine Wiederherstellung ermöglichen. Eine Deinstallation oder das Löschen lokaler Daten ersetzt keine Serverlöschung.

Beim Löschen eines Kontos werden seine zugeordneten Listen, Wünsche, hochgeladenen Titel- und Profilbilder, Gerätesitzungen, Versandzuordnungen, Einstellungen, gespeicherten Hinweise und Einladungen entfernt; seine Reservierungen in fremden Kisten werden freigegeben. Bei Firebase-Konten wird auch die Löschung des zugehörigen Firebase-Authentication-Kontos veranlasst. Dein allgemeines Google-Konto wird dabei nicht gelöscht. Unabhängige Kisten anderer Personen bleiben erhalten. Die Löschung kann mehrere Schritte benötigen; die App bestätigt den Abschluss erst nach erfolgreicher Serverbestätigung. Minimale technische Lösch- und Sperrkennungen können zum Schutz vor wiederholter Verwendung alter Zugänge bestehen bleiben. Details und ein Kontaktweg außerhalb der App stehen unter [Konto und Daten löschen](/wunschkiste/deletion.de.html).

Google gibt für Firebase Authentication an, protokollierte IP-Adressen einige Wochen aufzubewahren. Andere Authentifizierungsdaten bleiben bis zur angeforderten Nutzerlöschung gespeichert und werden anschließend innerhalb von 180 Tagen aus Live- und Sicherungssystemen entfernt. Bei Firebase Cloud Messaging bleiben Installationskennungen laut Google bis zu einer ausdrücklichen Anfrage zur Kennungslöschung gespeichert; danach gilt ebenfalls eine Anbieterfrist von bis zu 180 Tagen. Das Entfernen der Wunschkiste-Gerätezuordnung ist von dieser Kennungslöschung zu unterscheiden. Die Abschlussbestätigung der App ist keine Zusage zur sofortigen Löschung sämtlicher Anbieterkennungen oder Sicherungskopien. Quelle: [Firebase-Datenschutzhinweise](https://firebase.google.com/support/privacy).

Sicherheitsdaten und Supportnachrichten werden nur aufbewahrt, solange sie für die Bearbeitung, den Schutz des Dienstes oder gesetzliche Pflichten erforderlich sind. Technische Sicherungen können gelöschte Daten bis zu ihrer regulären Überschreibung enthalten. Konkrete Auskünfte zur Aufbewahrung deiner Daten erhältst du beim Verantwortlichen.

## Deine Rechte

Unter den gesetzlichen Voraussetzungen hast du Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit. Gegen eine Verarbeitung auf Grundlage berechtigter Interessen kannst du aus Gründen deiner besonderen Situation Widerspruch einlegen. Soweit eine Verarbeitung auf Einwilligung beruht, kannst du diese mit Wirkung für die Zukunft widerrufen.

Schreibe an [dev@timonply.com](mailto:dev@timonply.com), wenn du deine Rechte ausüben möchtest. Sende keine Passwörter, Kontoschlüssel oder vollständigen Ausweisdokumente mit. Zum Schutz deiner und fremder Daten kann eine angemessene Berechtigungsprüfung erforderlich sein. Du kannst dich auch bei einer Datenschutzaufsichtsbehörde beschweren, beispielsweise der [Landesbeauftragten für Datenschutz und Informationsfreiheit Nordrhein-Westfalen](https://www.ldi.nrw.de/).

## Kinder und gemeinsame Planung

Kindergeburtstage sollten von einer verantwortlichen erwachsenen Person organisiert werden. Für eine Wunschkiste sind weder vollständiger Name noch Geburtsjahr, Wohnadresse oder ein Foto des Kindes erforderlich. Beachte bei Angaben über andere Personen deren Rechte und teile nur, was für die Einladung und Geschenkplanung benötigt wird.

## Fragen und Änderungen

Bei Fragen nutze [dev@timonply.com](mailto:dev@timonply.com). Wenn sich Funktionen oder Datenverarbeitungen ändern, werden diese Hinweise angepasst. Das Datum am Anfang bezeichnet den Dokumentstand.
