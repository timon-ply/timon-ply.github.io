# Datenschutzerklärung für Kalvenda

Stand: März 2026

## 1. Einleitung
Diese Datenschutzerklärung gilt für die Nutzung der mobilen Anwendung **Kalvenda** (die „App“), entwickelt und betrieben von Timon Polley („wir“, „uns“ oder „unser“). Wir verpflichten uns, Ihre Privatsphäre zu schützen und die Sicherheit Ihrer persönlichen Daten in Übereinstimmung mit der Datenschutz-Grundverordnung (DSGVO) sowie anderen anwendbaren Gesetzen (z. B. TDDDG, DDG) zu gewährleisten.

## 2. Erhobene Daten & Rechtsgrundlage (Art. 6 DSGVO)
Wir erheben nur die Daten, die für den Betrieb der App erforderlich sind:

- **Konto- & Profildaten**: Bei der Kontoerstellung erfassen wir E-Mail-Adresse, Anzeigename, User-IDs und Authentifizierungsdaten (via Google oder E-Mail/Passwort).
  *Rechtsgrundlage: Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).*

- **Soziale & Gruppendaten (Nutzergenerierte Inhalte)**: Erstellte Gruppen, Events, Benachrichtigungen, Reaktionen und Mitgliedschaftsinformationen werden auf unseren Servern (Google Firebase/Firestore) sicher gespeichert, um eine geräteübergreifende Synchronisation mit Ihren Gruppenmitgliedern zu ermöglichen.
  *Rechtsgrundlage: Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).*

- **Standort- & Kartendaten**: Wenn Sie einem Event einen Standort hinzufügen, werden präzise Koordinatendaten (Breiten- und Längengrad) erfasst, optional in unserer Datenbank gespeichert und auf einer interaktiven Karte angezeigt. Es erfolgt keine kontinuierliche oder Hintergrund-Standortverfolgung. Diese Datenerhebung ist strikt freiwillig.
  *Rechtsgrundlage: Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).*

- **In-App-Käufe & Abonnements**: Abgewickelt über RevenueCat, das Kaufhistorie, App-Nutzer-IDs und Geräte-IDs in unserem Auftrag verarbeitet. Zahlungen werden sicher über Apple oder Google abgewickelt.
  *Rechtsgrundlage: Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).*

- **Werbung & Tracking**: Wir nutzen Google AdMob zur Anzeigenausspielung. AdMob erhebt Geräte-Identifikatoren (z. B. Advertising ID), den ungefähren Standort und Interaktionsdaten, um personalisierte Werbung auszuliefern. Dies beinhaltet das Tracking über andere Apps und Webseiten hinweg (bei iOS unterliegt dies der "App Tracking Transparency" (ATT)-Zustimmung).
  *Rechtsgrundlage: Ausdrückliche Einwilligung (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG).*

- **Nutzungsdaten, Analytics & Absturzberichte**: Firebase erhebt Interaktionsdaten, Absturzberichte, Diagnosedaten, Geräteinformationen und den ungefähren Standort (IP-basiert) zur Verbesserung der App-Leistung. Diese Datenerhebung ist freiwillig und kann jederzeit in den App-Einstellungen deaktiviert werden. 
  *Rechtsgrundlage: Ausdrückliche Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).*

- **Push-Benachrichtigungen**: Zur Benachrichtigung über Gruppeneinladungen und Updates. Firebase Cloud Messaging (FCM) verarbeitet einen Geräte-Token zur Zustellung. Dies erfordert Ihre ausdrückliche Genehmigung.
  *Rechtsgrundlage: Ausdrückliche Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).*

**Pflichtangaben vs. freiwillige Daten**: E-Mail und Authentifizierung sind zwingend erforderlich. Standort, Analytics, Push und Werbe-Tracking sind freiwillig.

## 3. Drittanbieter & Auftragsverarbeiter (Art. 28 DSGVO)
Wir haben Auftragsverarbeitungsverträge (AVV) mit folgenden Anbietern geschlossen:    
- **Google LLC (Firebase, Google AdMob, Google Sign-In)**: Hosting, Authentifizierung, Crash-Reporting und Anzeigenausspielung. Daten werden soweit technisch möglich in der EU (europe-west3) gehostet. Googles AVV beinhaltet EU-Standardvertragsklauseln (SCC).
- **RevenueCat, Inc.**: Verwaltung von Abonnements und In-App-Käufen. [Datenschutzrichtlinie](https://www.revenuecat.com/privacy)
- **Apple Inc. / Google LLC**: Zahlungsabwicklung.

## 4. Internationale Datenübermittlungen (Art. 46 DSGVO)
Google LLC und RevenueCat haben ihren Sitz in den USA. Übermittlungen in die USA werden durch Standardvertragsklauseln (SCC) abgesichert.

## 5. Automatisierte Entscheidungsfindung & Profiling (Art. 22 DSGVO)
Wir treffen keine automatisierten Entscheidungen mit rechtlich erheblicher Wirkung. Google AdMob kann auf Basis von Geräte-Identifikatoren automatisiert Profile zur Auswahl personalisierter Werbung erstellen, vorausgesetzt Ihre Einwilligung liegt vor.

## 6. Ihre Rechte (Art. 15–22 DSGVO)
- **Auskunft & Datenübertragbarkeit**: Sie können jederzeit eine Kopie Ihrer Daten anfordern.
- **Löschung (Konto löschen)**: Sie können Ihr Konto direkt in den App-Einstellungen ("Konto löschen") permanent löschen. Dadurch werden Ihr Nutzerprofil, Ihre Authentifizierungsdaten und alle mit Ihnen verknüpften Nutzerdaten vollständig und unwiderruflich von unseren Firestore-Datenbanken und Servern gelöscht.
- **Berichtigung**: Sie können Ihr Profil und Ihre Inhalte in der App bearbeiten.
- **Widerruf & Widerspruch**: Sie können Ihre Einwilligungen in Werbung und Analytics in den Datenschutzeinstellungen der App widerrufen.
- **Beschwerderecht**: Sie haben das Recht, bei der zuständigen Aufsichtsbehörde Beschwerde einzulegen.

## 7. Datenspeicherung
- **Konto & Soziale Daten**: Bis zur Kontolöschung. Nach der Löschung werden Ihre Daten vollständig gelöscht. Anonymisierte Metadaten oder gruppenbezogene Inhalte bleiben ggf. erhalten, um die Integrität der Gruppen für andere zu wahren.
- **Analytics & Absturzberichte**: Werden von Google Firebase bis zu 90 Tage gespeichert.

## 8. Kinderschutz (CSAE)
Wir verfolgen eine strikte Null-Toleranz-Richtlinie in Bezug auf den sexuellen Missbrauch und die Ausbeutung von Kindern. Weitere Informationen finden Sie in unseren [CSAE-Standards](https://timonply.com/kalvenda/csae.de).

## 9. Kontakt
Bei Fragen zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte unter:
**E-Mail:** timon.polley1@gmail.com
