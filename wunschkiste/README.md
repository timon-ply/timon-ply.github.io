# Wunschkiste: erhaltene Hilfe und Rechtsinformationen

Die rechtlichen Informationen und Hilfeseiten für bestehende Nutzer bleiben auf dieser öffentlichen Website erreichbar. Die ausführbare Web-App, Android-Downloads, App-Link-Zuordnung und Backend-Quellen wurden aus dem aktuellen öffentlichen Website-Stand entfernt.

- `privacy.de.md`: Datenschutzinformationen.
- `impressum.de.md`: Anbieterinformationen.
- `help.de.md`: Hilfe für vorhandene Installationen und Hinweis auf entfernte Web-Links.
- `deletion.de.md`: Konto- und Datenlöschung.

Die kanonischen Routen `/wunschkiste/<dokument>.de/` verwenden das bestehende Jekyll-Layout. Die begleitenden `.html`-Dateien werden mit `node wunschkiste/generate.mjs` erzeugt und verwenden `/assets/wunschkiste-legal.css`. Navigation und Styles hängen nicht von der entfernten App ab.

Private App-/Backend-Quellen werden separat gepflegt. Die neue App-Adresse ist https://wunschkiste-671c5.web.app/. Webansicht und Backend werden separat über Firebase Hosting und Cloud Functions for Firebase bereitgestellt; ein Android-Direktdownload bleibt bis zur Freigabe der aktualisierten Version ausgesetzt. Diese Website bleibt auf Hilfe und Rechtsinformationen beschränkt. Alte Einladungs- und Verwaltungslinks müssen nach der Umstellung mit der neuen Adresse geteilt werden; frühere Cloudflare-Adressen werden nicht weitergeleitet. Die Entfernung der alten Website-Dateien verändert keine bestehenden Konten oder Daten.

Vor der Änderung veröffentlichte Quellen und frühere technische Hinweise bleiben in der Git-Historie erhalten. Diese Änderung schreibt die Historie nicht um. Rechtliche Texte benötigen weiterhin menschliche Prüfung; Strukturtests sind keine rechtliche Freigabe.
