# Erklärung zur Barrierefreiheit für Kalvenda

Stand: März 2026

## Verpflichtungserklärung
Timon Polley verpflichtet sich, die digitale Barrierefreiheit für Menschen mit Behinderungen zu gewährleisten. Wir verbessern kontinuierlich die Benutzererfahrung für alle und wenden die relevanten Barrierefreiheitsstandards für **Kalvenda** an, in Übereinstimmung mit dem Barrierefreiheitsstärkungsgesetz (BFSG), gültig ab dem 28. Juni 2025.

## Konformitätsstatus
**Kalvenda** ist **teilweise konform** mit **WCAG 2.1 Stufe AA** und dem europäischen Standard **EN 301 549 V3.2.1**.

„Teilweise konform" bedeutet, dass einige Teile des Inhalts den Anforderungen noch nicht vollständig entsprechen, wie im Abschnitt „Bekannte Einschränkungen" beschrieben.

## Technische Spezifikationen
Die Barrierefreiheit von Kalvenda stützt sich auf folgende Technologien:
- Flutter / Dart
- iOS Accessibility APIs (VoiceOver, Dynamische Schriftgröße)
- Android Accessibility APIs (TalkBack, Anzeigeschriftgröße)

## Funktionen zur Barrierefreiheit
Wir haben folgende Funktionen implementiert:

- **Kontrast & Skalierbarkeit**: Textkontrastverhältnisse erfüllen die Anforderungen von WCAG 2.1 Stufe AA. Die Benutzeroberfläche lässt sich ohne Funktionsverlust auf bis zu 200 % Textgröße skalieren.
- **Screenreader-Unterstützung**: Interaktive Elemente sind mit semantischen Labels für VoiceOver (iOS) und TalkBack (Android) versehen.
- **Bewegungsreduzierung**: Animationen und Übergänge berücksichtigen die systemweite Einstellung „Bewegung reduzieren" / „Animationen entfernen".

## Bekannte Einschränkungen
Folgende Bereiche sind derzeit noch nicht vollständig konform:

- **Interaktive Kartenansichten**: Komplexe Karteninteraktionen (z. B. der Standort-Picker für Events) bieten möglicherweise eingeschränkte Screenreader-Unterstützung. Wo möglich, wird eine alternative Texteingabe für Koordinaten angeboten.
- **Dynamisch geladene Inhalte**: Inhalte, die in Echtzeit geladen werden (z. B. Gruppenaktualisierungen, eingehende Benachrichtigungen), werden von Screenreadern möglicherweise nicht sofort angekündigt.

Wir arbeiten aktiv daran, diese Einschränkungen in zukünftigen Updates zu beheben.

## Letzte Überprüfung
Diese Erklärung zur Barrierefreiheit wurde zuletzt im **März 2026** überprüft.

## Feedback, Kontakt & Durchsetzung
Wir freuen uns auf Ihr Feedback zur Barrierefreiheit von Kalvenda. Bitte lassen Sie es uns wissen, falls Sie auf Barrieren stoßen:

**E-Mail:** timon.polley1@gmail.com

Falls Ihre Beschwerde zur Barrierefreiheit nicht innerhalb einer angemessenen Frist zufriedenstellend bearbeitet wird, können Sie sich an die zuständige Marktüberwachungsbehörde nach dem BFSG wenden:

**Bundesnetzagentur** (Bundesbehörde)
Tulpenfeld 4, 53113 Bonn
www.bundesnetzagentur.de
