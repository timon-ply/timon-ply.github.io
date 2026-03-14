# Accessibility Statement for Kalvenda

Last Updated: March 2026

## Statement of Commitment
Timon Polley is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards for **Kalvenda**, in accordance with the European Accessibility Act (EAA) as implemented by the Barrierefreiheitsstärkungsgesetz (BFSG), effective June 28, 2025.

## Conformance Status
**Kalvenda** is **partially conformant** with **WCAG 2.1 Level AA** and the European standard **EN 301 549 V3.2.1**.

"Partially conformant" means that some parts of the content do not fully conform to the accessibility standard, as described in the Known Limitations section below.

## Technical Specifications
Accessibility of Kalvenda relies on the following technologies:
- Flutter / Dart
- iOS Accessibility APIs (VoiceOver, Dynamic Type)
- Android Accessibility APIs (TalkBack, Display Size)

## Accessibility Features
We have implemented the following features:

- **Contrast & Scalability**: Text contrast ratios meet WCAG 2.1 Level AA requirements. The UI scales gracefully to 200% text size without loss of functionality.
- **Screen Reader Support**: Interactive elements include semantic labels for VoiceOver (iOS) and TalkBack (Android) screen readers.
- **Motion Reduction**: Animations and transitions respect the OS-level "Reduce Motion" / "Remove Animations" setting.

## Known Limitations
The following areas are currently not fully conformant:

- **Interactive map views**: Complex map interactions (e.g., the event location picker) may have limited screen reader accessibility. Alternative text input for coordinates is provided where possible.
- **Dynamically loaded content**: Content loaded in real time (e.g., group updates, incoming notifications) may not always be immediately announced by screen readers.

We are actively working to address these limitations in future updates.

## Last Assessment
This accessibility statement was last reviewed in **March 2026**.

## Feedback, Contact & Enforcement
We welcome your feedback on the accessibility of Kalvenda. Please let us know if you encounter accessibility barriers:

**Email:** timon.polley1@gmail.com

If your accessibility complaint is not satisfactorily addressed within a reasonable time, you may contact the competent market surveillance authority under the BFSG:

**Bundesnetzagentur** (Federal Network Agency)
Tulpenfeld 4, 53113 Bonn, Germany
www.bundesnetzagentur.de
