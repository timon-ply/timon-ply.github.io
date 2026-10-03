# Wunschkiste: erhaltene Hilfe und Rechtsinformationen

Die rechtlichen Informationen und Hilfeseiten für bestehende Nutzer bleiben auf dieser öffentlichen Website erreichbar. Die ausführbare Web-App, Android-Downloads, App-Link-Zuordnung und Backend-Quellen wurden aus dem aktuellen öffentlichen Website-Stand entfernt.

- `privacy.de.md`: Datenschutzinformationen.
- `impressum.de.md`: Anbieterinformationen.
- `help.de.md`: Hilfe für vorhandene Installationen und Hinweis auf entfernte Web-Links.
- `deletion.de.md`: Konto- und Datenlöschung.

Die kanonischen Routen `/wunschkiste/<dokument>.de/` verwenden das bestehende Jekyll-Layout. Die begleitenden `.html`-Dateien werden mit `node wunschkiste/generate.mjs` erzeugt und verwenden `/assets/wunschkiste-legal.css`. Navigation und Styles hängen nicht von der entfernten App ab.

Private App-/Backend-Quellen werden separat gepflegt. Eine neue öffentliche App-Adresse ist noch nicht eingerichtet. Die Entfernung der Website-Dateien schaltet keinen externen Backend-Dienst ab und verändert keine bestehenden Konten oder Daten.

Vor der Änderung veröffentlichte Quellen und frühere technische Hinweise bleiben in der Git-Historie erhalten. Diese Änderung schreibt die Historie nicht um. Rechtliche Texte benötigen weiterhin menschliche Prüfung; Strukturtests sind keine rechtliche Freigabe.
