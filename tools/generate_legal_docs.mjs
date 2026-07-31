import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const updated = 'July 31, 2026';

const languages = [
  { code: 'de', name: 'Deutsch', order: 1 },
  { code: 'en', name: 'English', order: 2 },
  { code: 'es', name: 'Español', order: 3 },
  { code: 'ja', name: '日本語', order: 4 },
];
const neonroutineOnlyLanguages = [
  { code: 'fr', name: 'Français', order: 5 },
];

const tr = {
  en: {
    lastUpdated: 'Last Updated',
    controller: 'Controller and contact',
    scope: 'What the app does',
    data: 'Data and purposes',
    sharing: 'Processors and third-party services',
    legalBasis: 'Legal bases for EEA users',
    retention: 'Retention, deletion, and user controls',
    rights: 'Your privacy rights',
    children: 'Children and age requirements',
    security: 'Security',
    transfers: 'International transfers',
    changes: 'Changes',
    contact: 'Contact',
    related: 'Related public paths',
    date: 'June 23, 2026',
    productScope: 'Product scope',
    userRespHeading: 'User responsibility',
    accountsSafety: 'Accounts, content, and safety',
    purchasesAds: 'Purchases, subscriptions, and ads',
    thirdParty: 'Third-party services and data sources',
    availability: 'Availability and changes',
    warranty: 'Warranty and liability',
    governing: 'Governing law and dispute resolution',
    automated: 'Automated decision-making',
    commitment: 'Commitment',
    conformanceStatus: 'Conformance status',
    accessibilityFeatures: 'Accessibility features',
    knownLimitations: 'Known limitations',
    feedbackEnforcement: 'Feedback and enforcement',
    primaryMethod: 'Primary method',
    inAppControls: 'In-app controls',
    manualRequest: 'Manual request',
    retentionExceptions: 'Retention exceptions',
    zeroTolerance: 'Zero tolerance',
    prohibitedConduct: 'Prohibited conduct',
    reporting: 'Reporting',
    enforcement: 'Enforcement',
    pointOfContact: 'Point of contact',
    providerInfo: 'Provider information',
    consumerDispute: 'Consumer dispute resolution',
    appSpecificNotices: 'App-specific legal notices',
    preRelease: 'This document reflects the current pre-release implementation scope and must be reviewed again before external launch.',
    termsIntro: 'By downloading, accessing, or using the app, you agree to these Terms. If you do not agree, do not use the app.',
    privacyIntro: (app) => `This Privacy Policy explains how Timon Polley processes information in connection with ${app}.`,
    controllerText: 'Timon Polley, Gutenbergstrasse 5, 51469 Bergisch Gladbach, Germany. Email: [dev@timonply.com](mailto:dev@timonply.com).',
    bases: 'For EEA users, core app processing is based on performance of the user contract or user-requested functionality. Optional ads, tracking, notifications, or permissions rely on consent where required. Security, abuse prevention, and minimal service diagnostics may rely on legitimate interests where legally available.',
    rightsText: 'Depending on your location, you may have rights to access, correction, deletion, restriction, objection, portability, withdrawal of consent, and complaint to a supervisory authority. Contact dev@timonply.com for requests that cannot be completed directly in the app.',
    childrenText: 'The app is not intended for unsupervised use by children below the digital-consent age in their country. A parent or guardian must review the app, purchases, ads, and data controls before a child uses it.',
    securityText: 'We use reasonable technical and organizational safeguards, limit collection to the active product scope, and avoid asking users to send passwords, authentication codes, or unnecessary sensitive data by email.',
    transfersText: 'Some service providers may process data outside the EEA. Where GDPR transfer rules apply, transfers rely on appropriate safeguards such as adequacy decisions, the EU-U.S. Data Privacy Framework where applicable, or Standard Contractual Clauses.',
    changesText: 'We may update this document when the app, legal requirements, or store disclosure requirements change. The date at the top shows the current version.',
    termsTitle: 'Terms of Service',
    privacyTitle: 'Privacy Policy',
    accessibilityTitle: 'Accessibility Statement',
    deletionTitle: 'Deletion and Data Controls',
    csaeTitle: 'CSAE Standards',
    impressumTitle: 'Legal Notice',
    support: 'Support',
    appDocs: 'App documents',
    noMedical: 'The app is for personal information, organization, or wellness support only. It is not a medical device, diagnosis tool, treatment tool, emergency service, or substitute for professional advice.',
    userResponsibility: 'You are responsible for checking entries, settings, shared content, quantities, dates, permissions, and results before relying on them.',
    stores: 'If you install the app through Apple App Store or Google Play, the applicable store terms, billing, cancellation, refund, and subscription-management rules also apply.',
    liability: 'Nothing in these Terms limits liability for intent, gross negligence, injury to life, body, or health, or any liability that cannot legally be limited. Mandatory consumer rights remain unaffected.',
    dispute: 'We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board under the German Consumer Dispute Resolution Act (VSBG).',
    govLaw: 'These Terms are governed by German law, without prejudice to mandatory consumer-protection rights in your country of residence.',
    accessibilityCommitment: (app) => `Timon Polley aims to make ${app} usable by people with disabilities and to improve accessibility as the product evolves.`,
    conformance: 'The app is currently partially conformant with WCAG 2.2 Level AA and EN 301 549 expectations where they apply to mobile apps. Some complex or platform-native interactions may need further improvement.',
    feedback: 'Send accessibility barriers, screen names, device/platform details, assistive technology used, and expected behavior to dev@timonply.com.',
    deletionContact: 'If you cannot use the in-app controls, contact dev@timonply.com from the email address connected to the account where applicable. We may need reasonable verification before acting on a request.',
    csaeIntro: (app) => `${app} prohibits child sexual abuse and exploitation (CSAE), child sexual abuse material (CSAM), grooming, sexual solicitation of minors, and any content or conduct that endangers children.`,
    csaeReport: 'Report suspected CSAE immediately through the in-app reporting tools where available and by emailing dev@timonply.com. If a child is in immediate danger, contact local emergency services or law enforcement first.',
    csaeEnforce: 'We may remove content, restrict features, suspend or terminate accounts, preserve evidence where legally appropriate, and report confirmed CSAM or imminent child-safety threats to NCMEC or the relevant regional authority and law enforcement.',
    csaeContact: 'Child safety point of contact: dev@timonply.com. Communications can be sent in English or German.',
    localOnlyNoAccount: (app) => `${app} currently does not provide an app account or cloud sync. There is no remote account to delete; use the in-app deletion/reset controls, operating-system storage controls, or uninstall the app to remove local data from the device.`,
    accountDeletion: (app) => `${app} provides account-related controls in the app. Deleting an account removes or anonymizes account-linked data unless retention is required for security, fraud prevention, legal compliance, dispute handling, or preserving other users' shared records.`,
  },
  de: {
    lastUpdated: 'Zuletzt aktualisiert',
    controller: 'Verantwortlicher und Kontakt',
    scope: 'Was die App macht',
    data: 'Daten und Zwecke',
    sharing: 'Auftragsverarbeiter und Drittanbieter',
    legalBasis: 'Rechtsgrundlagen für Nutzer im EWR',
    retention: 'Speicherung, Löschung und Nutzerkontrollen',
    rights: 'Ihre Datenschutzrechte',
    children: 'Kinder und Altersanforderungen',
    security: 'Sicherheit',
    transfers: 'Internationale Übermittlungen',
    changes: 'Änderungen',
    contact: 'Kontakt',
    related: 'Verwandte öffentliche Pfade',
    date: '23. Juni 2026',
    productScope: 'Produktumfang',
    userRespHeading: 'Verantwortung der Nutzer',
    accountsSafety: 'Konten, Inhalte und Sicherheit',
    purchasesAds: 'Käufe, Abonnements und Werbung',
    thirdParty: 'Drittanbieter und Datenquellen',
    availability: 'Verfügbarkeit und Änderungen',
    warranty: 'Gewährleistung und Haftung',
    governing: 'Anwendbares Recht und Streitbeilegung',
    automated: 'Automatisierte Entscheidungen',
    commitment: 'Verpflichtung',
    conformanceStatus: 'Konformitätsstatus',
    accessibilityFeatures: 'Barrierefreiheitsfunktionen',
    knownLimitations: 'Bekannte Einschränkungen',
    feedbackEnforcement: 'Feedback und Durchsetzung',
    primaryMethod: 'Primäre Methode',
    inAppControls: 'In-App-Kontrollen',
    manualRequest: 'Manuelle Anfrage',
    retentionExceptions: 'Aufbewahrungsausnahmen',
    zeroTolerance: 'Null-Toleranz',
    prohibitedConduct: 'Verbotenes Verhalten',
    reporting: 'Meldung',
    enforcement: 'Durchsetzung',
    pointOfContact: 'Kontaktstelle',
    providerInfo: 'Anbieterinformationen',
    consumerDispute: 'Verbraucherstreitbeilegung',
    appSpecificNotices: 'App-spezifische Impressen',
    preRelease: 'Dieses Dokument spiegelt den aktuellen Vorveröffentlichungsstand wider und muss vor einem externen Start erneut geprüft werden.',
    termsIntro: 'Mit dem Herunterladen, Aufrufen oder Nutzen der App stimmen Sie diesen Bedingungen zu. Wenn Sie nicht zustimmen, nutzen Sie die App nicht.',
    privacyIntro: (app) => `Diese Datenschutzerklärung erklärt, wie Timon Polley Informationen im Zusammenhang mit ${app} verarbeitet.`,
    controllerText: 'Timon Polley, Gutenbergstraße 5, 51469 Bergisch Gladbach, Deutschland. E-Mail: [dev@timonply.com](mailto:dev@timonply.com).',
    bases: 'Für Nutzer im EWR beruht die Kernverarbeitung auf der Vertragserfüllung oder auf vom Nutzer angeforderten Funktionen. Optionale Werbung, Tracking, Benachrichtigungen oder Berechtigungen beruhen auf Einwilligung, soweit dies erforderlich ist. Sicherheit, Missbrauchsvermeidung und minimale Diagnostik können auf berechtigten Interessen beruhen, soweit zulässig.',
    rightsText: 'Je nach Standort können Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch, Datenübertragbarkeit, Widerruf einer Einwilligung und Beschwerde bei einer Aufsichtsbehörde bestehen. Kontaktieren Sie dev@timonply.com für Anliegen, die nicht direkt in der App erledigt werden können.',
    childrenText: 'Die App ist nicht für unbeaufsichtigte Nutzung durch Kinder unterhalb des digitalen Einwilligungsalters ihres Landes bestimmt. Eltern oder Erziehungsberechtigte müssen App, Käufe, Werbung und Datenkontrollen vor der Nutzung durch ein Kind prüfen.',
    securityText: 'Wir verwenden angemessene technische und organisatorische Schutzmaßnahmen, begrenzen die Erhebung auf den aktuellen Produktumfang und bitten Nutzer nicht, Passwörter, Authentifizierungscodes oder unnötige sensible Daten per E-Mail zu senden.',
    transfersText: 'Einige Dienstleister können Daten außerhalb des EWR verarbeiten. Soweit die DSGVO-Regeln für Übermittlungen gelten, beruhen Übermittlungen auf geeigneten Garantien wie Angemessenheitsbeschlüssen, dem EU-US Data Privacy Framework, soweit anwendbar, oder Standardvertragsklauseln.',
    changesText: 'Wir können dieses Dokument aktualisieren, wenn sich App, Rechtslage oder Store-Offenlegungspflichten ändern. Das Datum oben zeigt die aktuelle Version.',
    termsTitle: 'Nutzungsbedingungen',
    privacyTitle: 'Datenschutzerklärung',
    accessibilityTitle: 'Barrierefreiheitserklärung',
    deletionTitle: 'Löschung und Datenkontrollen',
    csaeTitle: 'CSAE-Standards',
    impressumTitle: 'Impressum',
    support: 'Support',
    appDocs: 'App-Dokumente',
    noMedical: 'Die App dient nur persönlicher Information, Organisation oder Wellness-Unterstützung. Sie ist kein Medizinprodukt, Diagnose-, Behandlungs- oder Notfalldienst und ersetzt keine professionelle Beratung.',
    userResponsibility: 'Sie sind dafür verantwortlich, Einträge, Einstellungen, geteilte Inhalte, Mengen, Termine, Berechtigungen und Ergebnisse zu prüfen, bevor Sie sich darauf verlassen.',
    stores: 'Wenn Sie die App über den Apple App Store oder Google Play installieren, gelten zusätzlich die jeweiligen Store-Bedingungen, Abrechnungs-, Kündigungs-, Erstattungs- und Abonnementregeln.',
    liability: 'Nichts in diesen Bedingungen beschränkt die Haftung für Vorsatz, grobe Fahrlässigkeit, Verletzung von Leben, Körper oder Gesundheit oder eine gesetzlich nicht beschränkbare Haftung. Zwingende Verbraucherrechte bleiben unberührt.',
    dispute: 'Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle nach dem VSBG teilzunehmen.',
    govLaw: 'Diese Bedingungen unterliegen deutschem Recht, unbeschadet zwingender Verbraucherschutzrechte in Ihrem Wohnsitzland.',
    accessibilityCommitment: (app) => `Timon Polley möchte ${app} für Menschen mit Behinderungen nutzbar machen und die Barrierefreiheit mit der Weiterentwicklung des Produkts verbessern.`,
    conformance: 'Die App ist derzeit teilweise konform mit WCAG 2.2 Level AA und den Erwartungen aus EN 301 549, soweit sie für mobile Apps gelten. Einige komplexe oder plattformnative Interaktionen können weitere Verbesserungen benötigen.',
    feedback: 'Senden Sie Barrieren, Bildschirmnamen, Gerät/Plattform, verwendete assistive Technologie und erwartetes Verhalten an dev@timonply.com.',
    deletionContact: 'Wenn Sie die In-App-Kontrollen nicht nutzen können, kontaktieren Sie dev@timonply.com von der mit dem Konto verbundenen E-Mail-Adresse, soweit anwendbar. Vor der Bearbeitung kann eine angemessene Verifizierung erforderlich sein.',
    csaeIntro: (app) => `${app} verbietet sexuellen Missbrauch und Ausbeutung von Kindern (CSAE), Missbrauchsdarstellungen von Kindern (CSAM), Grooming, sexuelle Kontaktanbahnung mit Minderjährigen sowie Inhalte oder Handlungen, die Kinder gefährden.`,
    csaeReport: 'Melden Sie vermutete CSAE sofort über vorhandene In-App-Meldefunktionen und per E-Mail an dev@timonply.com. Wenn ein Kind unmittelbar gefährdet ist, kontaktieren Sie zuerst Notdienste oder Strafverfolgungsbehörden.',
    csaeEnforce: 'Wir können Inhalte entfernen, Funktionen einschränken, Konten sperren oder beenden, Beweise rechtlich angemessen sichern und bestätigte CSAM- oder akute Kinderschutzfälle an NCMEC oder die zuständige regionale Behörde und Strafverfolgung melden.',
    csaeContact: 'Kinderschutz-Kontaktstelle: dev@timonply.com. Kommunikation ist auf Deutsch oder Englisch möglich.',
    localOnlyNoAccount: (app) => `${app} bietet derzeit kein App-Konto und keine Cloud-Synchronisierung. Es gibt kein entferntes Konto zu löschen; verwenden Sie die In-App-Lösch-/Zurücksetzfunktionen, die Betriebssystem-Speicherkontrollen oder deinstallieren Sie die App, um lokale Daten vom Gerät zu entfernen.`,
    accountDeletion: (app) => `${app} bietet kontobezogene Kontrollen in der App. Das Löschen eines Kontos entfernt oder anonymisiert konto verknüpfte Daten, soweit keine Aufbewahrung für Sicherheit, Betrugsvermeidung, Rechtsbefolgung, Streitfälle oder die Erhaltung geteilter Aufzeichnungen anderer Nutzer erforderlich ist.`,
  },
  es: {
    lastUpdated: 'Última actualización',
    controller: 'Responsable y contacto',
    scope: 'Qué hace la app',
    data: 'Datos y finalidades',
    sharing: 'Encargados y servicios de terceros',
    legalBasis: 'Bases jurídicas para usuarios del EEE',
    retention: 'Conservación, eliminación y controles',
    rights: 'Sus derechos de privacidad',
    children: 'Menores y requisitos de edad',
    security: 'Seguridad',
    transfers: 'Transferencias internacionales',
    changes: 'Cambios',
    contact: 'Contacto',
    related: 'Rutas públicas relacionadas',
    date: '23 de junio de 2026',
    productScope: 'Alcance del producto',
    userRespHeading: 'Responsabilidad del usuario',
    accountsSafety: 'Cuentas, contenido y seguridad',
    purchasesAds: 'Compras, suscripciones y anuncios',
    thirdParty: 'Servicios de terceros y fuentes de datos',
    availability: 'Disponibilidad y cambios',
    warranty: 'Garantía y responsabilidad',
    governing: 'Ley aplicable y resolución de disputas',
    automated: 'Decisiones automatizadas',
    commitment: 'Compromiso',
    conformanceStatus: 'Estado de conformidad',
    accessibilityFeatures: 'Funciones de accesibilidad',
    knownLimitations: 'Limitaciones conocidas',
    feedbackEnforcement: 'Comentarios y ejecución',
    primaryMethod: 'Método principal',
    inAppControls: 'Controles dentro de la app',
    manualRequest: 'Solicitud manual',
    retentionExceptions: 'Excepciones de conservación',
    zeroTolerance: 'Tolerancia cero',
    prohibitedConduct: 'Conducta prohibida',
    reporting: 'Reporte',
    enforcement: 'Aplicación',
    pointOfContact: 'Punto de contacto',
    providerInfo: 'Información del proveedor',
    consumerDispute: 'Resolución de litigios de consumo',
    appSpecificNotices: 'Avisos legales específicos de app',
    preRelease: 'Este documento refleja el alcance actual de implementación previa al lanzamiento y debe revisarse de nuevo antes de un lanzamiento externo.',
    termsIntro: 'Al descargar, acceder o usar la app, acepta estos Términos. Si no está de acuerdo, no use la app.',
    privacyIntro: (app) => `Esta Política de Privacidad explica cómo Timon Polley trata información en relación con ${app}.`,
    controllerText: 'Timon Polley, Gutenbergstrasse 5, 51469 Bergisch Gladbach, Alemania. Correo: [dev@timonply.com](mailto:dev@timonply.com).',
    bases: 'Para usuarios del EEE, el tratamiento principal se basa en la ejecución del contrato de usuario o en funcionalidades solicitadas por el usuario. Los anuncios, seguimiento, notificaciones o permisos opcionales se basan en el consentimiento cuando sea necesario. La seguridad, prevención de abusos y diagnósticos mínimos pueden basarse en intereses legítimos cuando la ley lo permita.',
    rightsText: 'Según su ubicación, puede tener derechos de acceso, rectificación, supresión, limitación, oposición, portabilidad, retirada del consentimiento y reclamación ante una autoridad de control. Contacte con dev@timonply.com para solicitudes que no puedan completarse directamente en la app.',
    childrenText: 'La app no está destinada al uso no supervisado por menores por debajo de la edad de consentimiento digital de su país. Un padre, madre o tutor debe revisar la app, compras, anuncios y controles de datos antes de que un menor la use.',
    securityText: 'Usamos medidas técnicas y organizativas razonables, limitamos la recogida al alcance activo del producto y no pedimos contraseñas, códigos de autenticación ni datos sensibles innecesarios por correo.',
    transfersText: 'Algunos proveedores pueden tratar datos fuera del EEE. Cuando se apliquen las normas del RGPD sobre transferencias, estas se basan en garantías adecuadas como decisiones de adecuación, el Marco de Privacidad de Datos UE-EE. UU. cuando sea aplicable, o Cláusulas Contractuales Tipo.',
    changesText: 'Podemos actualizar este documento cuando cambien la app, los requisitos legales o los requisitos de divulgación de las tiendas. La fecha superior indica la versión actual.',
    termsTitle: 'Términos del Servicio',
    privacyTitle: 'Política de Privacidad',
    accessibilityTitle: 'Declaración de Accesibilidad',
    deletionTitle: 'Eliminación y controles de datos',
    csaeTitle: 'Normas CSAE',
    impressumTitle: 'Aviso legal',
    support: 'Soporte',
    appDocs: 'Documentos de la app',
    noMedical: 'La app solo ofrece apoyo personal informativo, organizativo o de bienestar. No es un dispositivo médico, herramienta de diagnóstico o tratamiento, servicio de emergencia ni sustituto de asesoramiento profesional.',
    userResponsibility: 'Usted es responsable de revisar entradas, ajustes, contenido compartido, cantidades, fechas, permisos y resultados antes de basarse en ellos.',
    stores: 'Si instala la app mediante Apple App Store o Google Play, también se aplican las condiciones, facturación, cancelación, reembolsos y gestión de suscripciones de la tienda correspondiente.',
    liability: 'Nada en estos Términos limita la responsabilidad por dolo, negligencia grave, daños a la vida, cuerpo o salud, ni cualquier responsabilidad que no pueda limitarse legalmente. Los derechos obligatorios de consumidores no se ven afectados.',
    dispute: 'No estamos dispuestos ni obligados a participar en procedimientos de resolución de litigios ante una junta arbitral de consumo conforme a la ley alemana VSBG.',
    govLaw: 'Estos Términos se rigen por la ley alemana, sin perjuicio de los derechos obligatorios de protección del consumidor en su país de residencia.',
    accessibilityCommitment: (app) => `Timon Polley busca que ${app} sea utilizable por personas con discapacidad y mejorar su accesibilidad a medida que el producto evoluciona.`,
    conformance: 'La app es actualmente parcialmente conforme con WCAG 2.2 nivel AA y con las expectativas de EN 301 549 cuando se aplican a apps móviles. Algunas interacciones complejas o nativas de plataforma pueden requerir mejoras.',
    feedback: 'Envíe barreras de accesibilidad, nombre de pantalla, dispositivo/plataforma, tecnología asistiva usada y comportamiento esperado a dev@timonply.com.',
    deletionContact: 'Si no puede usar los controles dentro de la app, contacte con dev@timonply.com desde el correo asociado a la cuenta cuando corresponda. Podemos necesitar una verificación razonable antes de actuar.',
    csaeIntro: (app) => `${app} prohíbe el abuso y la explotación sexual infantil (CSAE), material de abuso sexual infantil (CSAM), grooming, solicitud sexual de menores y cualquier contenido o conducta que ponga en peligro a menores.`,
    csaeReport: 'Informe sospechas de CSAE inmediatamente mediante las herramientas de reporte de la app cuando existan y por correo a dev@timonply.com. Si un menor está en peligro inmediato, contacte primero con servicios de emergencia o fuerzas de seguridad.',
    csaeEnforce: 'Podemos retirar contenido, restringir funciones, suspender o terminar cuentas, conservar pruebas cuando sea legalmente adecuado y denunciar CSAM confirmado o amenazas inmediatas para menores a NCMEC o a la autoridad regional y policial competente.',
    csaeContact: 'Punto de contacto de seguridad infantil: dev@timonply.com. Las comunicaciones pueden enviarse en inglés o alemán.',
    localOnlyNoAccount: (app) => `${app} no ofrece actualmente una cuenta de app ni sincronización en la nube. No hay una cuenta remota que eliminar; use los controles de eliminación/restablecimiento de la app, los controles de almacenamiento del sistema operativo o desinstale la app para retirar datos locales del dispositivo.`,
    accountDeletion: (app) => `${app} ofrece controles relacionados con cuentas dentro de la app. Eliminar una cuenta borra o anonimiza los datos vinculados a la cuenta salvo que sea necesaria la conservación por seguridad, prevención de fraude, cumplimiento legal, gestión de disputas o preservación de registros compartidos de otros usuarios.`,
  },
  fr: {
    lastUpdated: 'Dernière mise à jour',
    controller: 'Responsable du traitement et contact',
    scope: 'Fonctionnement de l’application',
    data: 'Données et finalités',
    sharing: 'Sous-traitants et services tiers',
    legalBasis: 'Bases juridiques pour les utilisateurs de l’EEE',
    retention: 'Conservation, suppression et contrôles utilisateur',
    rights: 'Vos droits en matière de protection des données',
    children: 'Enfants et conditions d’âge',
    security: 'Sécurité',
    transfers: 'Transferts internationaux',
    changes: 'Modifications',
    contact: 'Contact',
    related: 'Pages publiques associées',
    date: '31 juillet 2026',
    productScope: 'Champ d’application du produit',
    userRespHeading: 'Responsabilité de l’utilisateur',
    accountsSafety: 'Comptes, contenu et sécurité',
    purchasesAds: 'Achats, abonnements et publicité',
    thirdParty: 'Services tiers et sources de données',
    availability: 'Disponibilité et modifications',
    warranty: 'Garanties et responsabilité',
    governing: 'Droit applicable et règlement des litiges',
    automated: 'Prise de décision automatisée',
    commitment: 'Engagement',
    conformanceStatus: 'État de conformité',
    accessibilityFeatures: 'Fonctionnalités d’accessibilité',
    knownLimitations: 'Limites connues',
    feedbackEnforcement: 'Retours et voies de recours',
    primaryMethod: 'Méthode principale',
    inAppControls: 'Contrôles dans l’application',
    manualRequest: 'Demande manuelle',
    retentionExceptions: 'Exceptions de conservation',
    zeroTolerance: 'Tolérance zéro',
    prohibitedConduct: 'Comportements interdits',
    reporting: 'Signalement',
    enforcement: 'Application',
    pointOfContact: 'Point de contact',
    providerInfo: 'Informations sur le fournisseur',
    consumerDispute: 'Règlement extrajudiciaire des litiges de consommation',
    appSpecificNotices: 'Mentions légales propres aux applications',
    preRelease: 'Ce document reflète le périmètre actuel de l’implémentation avant publication et doit être réexaminé avant tout lancement externe.',
    termsIntro: 'En téléchargeant l’application, en y accédant ou en l’utilisant, vous acceptez les présentes conditions. Si vous ne les acceptez pas, n’utilisez pas l’application.',
    privacyIntro: (app) => `La présente Politique de confidentialité explique comment Timon Polley traite les informations dans le cadre de ${app}.`,
    controllerText: 'Timon Polley, Gutenbergstraße 5, 51469 Bergisch Gladbach, Allemagne. E-mail : [dev@timonply.com](mailto:dev@timonply.com).',
    bases: 'Pour les utilisateurs de l’EEE, les traitements nécessaires au fonctionnement principal reposent sur l’exécution du contrat ou sur les fonctionnalités demandées par l’utilisateur. Les publicités, le suivi, les notifications ou les autorisations facultatives reposent sur le consentement lorsqu’il est requis. La sécurité, la prévention des abus et les diagnostics techniques minimaux peuvent reposer sur l’intérêt légitime lorsque la loi le permet.',
    rightsText: 'Selon votre lieu de résidence, vous pouvez disposer de droits d’accès, de rectification, d’effacement, de limitation, d’opposition, de portabilité, de retrait du consentement et de réclamation auprès d’une autorité de contrôle. Contactez dev@timonply.com pour les demandes qui ne peuvent pas être effectuées directement dans l’application.',
    childrenText: 'L’application n’est pas destinée à être utilisée sans surveillance par des enfants n’ayant pas atteint l’âge du consentement numérique dans leur pays. Un parent ou représentant légal doit examiner l’application, les achats, les publicités et les contrôles de données avant qu’un enfant ne l’utilise.',
    securityText: 'Nous appliquons des mesures techniques et organisationnelles raisonnables, limitons la collecte au périmètre actif du produit et ne demandons pas aux utilisateurs d’envoyer par e-mail des mots de passe, des codes d’authentification ou des données sensibles non nécessaires.',
    transfersText: 'Certains prestataires peuvent traiter des données en dehors de l’EEE. Lorsque les règles du RGPD relatives aux transferts s’appliquent, ceux-ci reposent sur des garanties appropriées, telles qu’une décision d’adéquation, le cadre de protection des données UE–États-Unis lorsqu’il est applicable, ou les clauses contractuelles types.',
    changesText: 'Nous pouvons mettre à jour ce document lorsque l’application, les exigences légales ou les obligations de transparence des boutiques évoluent. La date indiquée en haut correspond à la version actuelle.',
    termsTitle: 'Conditions d’utilisation',
    privacyTitle: 'Politique de confidentialité',
    accessibilityTitle: 'Déclaration d’accessibilité',
    deletionTitle: 'Suppression et contrôle des données',
    csaeTitle: 'Normes relatives à la protection des enfants',
    impressumTitle: 'Mentions légales',
    support: 'Assistance',
    appDocs: 'Documents de l’application',
    noMedical: 'L’application est destinée uniquement à l’information personnelle, à l’organisation et au bien-être. Elle ne constitue ni un dispositif médical, ni un outil de diagnostic ou de traitement, ni un service d’urgence, et ne remplace pas les conseils d’un professionnel qualifié.',
    userResponsibility: 'Vous devez vérifier les saisies, paramètres, contenus partagés, quantités, dates, autorisations et résultats avant de vous y fier.',
    stores: 'Si vous installez l’application depuis l’Apple App Store ou Google Play, les conditions de la boutique concernée ainsi que ses règles de facturation, de résiliation, de remboursement et de gestion des abonnements s’appliquent également.',
    liability: 'Aucune disposition des présentes conditions ne limite la responsabilité en cas de faute intentionnelle, de négligence grave, d’atteinte à la vie, à l’intégrité physique ou à la santé, ni toute responsabilité qui ne peut légalement être limitée. Les droits impératifs des consommateurs restent inchangés.',
    dispute: 'Nous ne sommes ni disposés ni tenus de participer à une procédure de règlement des litiges devant un organisme allemand de médiation de la consommation au titre de la loi allemande sur le règlement des litiges de consommation (VSBG).',
    govLaw: 'Les présentes conditions sont régies par le droit allemand, sans préjudice des dispositions impératives de protection des consommateurs applicables dans votre pays de résidence.',
    accessibilityCommitment: (app) => `Timon Polley s’efforce de rendre ${app} utilisable par les personnes en situation de handicap et d’améliorer son accessibilité à mesure que le produit évolue.`,
    conformance: 'L’application est actuellement partiellement conforme aux WCAG 2.2 niveau AA et aux exigences de la norme EN 301 549 dans la mesure où elles s’appliquent aux applications mobiles. Certaines interactions complexes ou propres à la plateforme peuvent nécessiter des améliorations supplémentaires.',
    feedback: 'Signalez les obstacles d’accessibilité en précisant le nom de l’écran, l’appareil et la plateforme, la technologie d’assistance utilisée ainsi que le comportement attendu, à l’adresse dev@timonply.com.',
    deletionContact: 'Si vous ne pouvez pas utiliser les contrôles intégrés à l’application, contactez dev@timonply.com. Une vérification raisonnable peut être nécessaire avant le traitement de votre demande.',
    csaeIntro: (app) => `${app} interdit les abus et l’exploitation sexuels d’enfants, les contenus d’abus sexuels sur enfants, la sollicitation sexuelle de mineurs et tout contenu ou comportement mettant des enfants en danger.`,
    csaeReport: 'Signalez immédiatement tout soupçon au moyen des outils de signalement intégrés lorsqu’ils sont disponibles et par e-mail à dev@timonply.com. Si un enfant est en danger immédiat, contactez d’abord les services d’urgence ou les autorités compétentes.',
    csaeEnforce: 'Nous pouvons supprimer des contenus, restreindre des fonctionnalités, suspendre ou fermer des comptes, conserver des preuves lorsque la loi le permet et signaler les contenus confirmés ou les menaces imminentes aux autorités compétentes.',
    csaeContact: 'Point de contact pour la sécurité des enfants : dev@timonply.com. Les communications peuvent être envoyées en français, en anglais ou en allemand.',
    localOnlyNoAccount: (app) => `${app} ne propose actuellement ni compte dans l’application ni synchronisation dans le cloud. Il n’existe donc aucun compte distant à supprimer. Utilisez les fonctions de suppression ou de réinitialisation intégrées, les contrôles de stockage du système d’exploitation, ou désinstallez l’application pour supprimer les données locales de l’appareil.`,
    accountDeletion: (app) => `${app} propose des contrôles liés au compte dans l’application. La suppression d’un compte efface ou anonymise les données qui lui sont associées, sauf lorsqu’une conservation est nécessaire pour la sécurité, la prévention de la fraude, le respect d’obligations légales, le traitement de litiges ou la préservation des données partagées d’autres utilisateurs.`,
  },
  ja: {
    lastUpdated: '最終更新日',
    controller: '管理者および連絡先',
    scope: 'アプリの内容',
    data: 'データと目的',
    sharing: '処理委託先および第三者サービス',
    legalBasis: 'EEAユーザー向けの法的根拠',
    retention: '保存、削除、ユーザー管理',
    rights: 'プライバシー権',
    children: '子どもと年齢要件',
    security: 'セキュリティ',
    transfers: '国際移転',
    changes: '変更',
    contact: '連絡先',
    related: '関連する公開パス',
    date: '2026年6月23日',
    productScope: '製品範囲',
    userRespHeading: 'ユーザーの責任',
    accountsSafety: 'アカウント、コンテンツ、安全',
    purchasesAds: '購入、サブスクリプション、広告',
    thirdParty: '第三者サービスおよびデータソース',
    availability: '利用可能性と変更',
    warranty: '保証と責任',
    governing: '準拠法および紛争解決',
    automated: '自動意思決定',
    commitment: '取り組み',
    conformanceStatus: '適合状況',
    accessibilityFeatures: 'アクセシビリティ機能',
    knownLimitations: '既知の制限',
    feedbackEnforcement: 'フィードバックと対応',
    primaryMethod: '主な方法',
    inAppControls: 'アプリ内管理',
    manualRequest: '手動リクエスト',
    retentionExceptions: '保存の例外',
    zeroTolerance: 'ゼロトレランス',
    prohibitedConduct: '禁止行為',
    reporting: '報告',
    enforcement: '執行',
    pointOfContact: '連絡窓口',
    providerInfo: '提供者情報',
    consumerDispute: '消費者紛争解決',
    appSpecificNotices: 'アプリ別運営者情報',
    preRelease: '本書は現在のリリース前実装範囲を反映しており、外部リリース前に再確認が必要です。',
    termsIntro: 'アプリをダウンロード、アクセス、または使用することで、本規約に同意したものとみなされます。同意しない場合はアプリを使用しないでください。',
    privacyIntro: (app) => `本プライバシーポリシーは、${app}に関連してTimon Polleyが情報をどのように処理するかを説明します。`,
    controllerText: 'Timon Polley, Gutenbergstrasse 5, 51469 Bergisch Gladbach, Germany. メール: [dev@timonply.com](mailto:dev@timonply.com)。',
    bases: 'EEAのユーザーについて、主要なアプリ処理はユーザー契約の履行またはユーザーが要求した機能に基づきます。任意の広告、トラッキング、通知、権限は、必要な場合は同意に基づきます。セキュリティ、不正防止、最小限の診断は、法的に認められる範囲で正当な利益に基づく場合があります。',
    rightsText: '所在地によって、アクセス、訂正、削除、制限、異議申立て、データポータビリティ、同意撤回、監督機関への苦情申立ての権利が認められる場合があります。アプリ内で完了できない請求はdev@timonply.comまでご連絡ください。',
    childrenText: '本アプリは、居住国のデジタル同意年齢未満の子どもが監督なしで使用することを意図していません。子どもが使用する前に、親または保護者がアプリ、購入、広告、データ管理を確認する必要があります。',
    securityText: '当社は合理的な技術的・組織的保護措置を用い、収集を現在の製品範囲に限定し、パスワード、認証コード、不要な機微データをメールで送るよう求めません。',
    transfersText: '一部のサービス提供者はEEA外でデータを処理する場合があります。GDPRの移転規則が適用される場合、十分性認定、該当する場合のEU-US Data Privacy Framework、または標準契約条項などの適切な保護措置に基づきます。',
    changesText: 'アプリ、法的要件、またはストア開示要件が変更された場合、本書を更新することがあります。上部の日付が現在の版を示します。',
    termsTitle: '利用規約',
    privacyTitle: 'プライバシーポリシー',
    accessibilityTitle: 'アクセシビリティ声明',
    deletionTitle: '削除とデータ管理',
    csaeTitle: 'CSAE基準',
    impressumTitle: '運営者情報',
    support: 'サポート',
    appDocs: 'アプリ文書',
    noMedical: '本アプリは個人的な情報、整理、またはウェルネス支援のみを目的としています。医療機器、診断・治療ツール、緊急サービス、専門的助言の代替ではありません。',
    userResponsibility: '入力、設定、共有コンテンツ、数量、日付、権限、結果を信頼する前に確認する責任はユーザーにあります。',
    stores: 'Apple App StoreまたはGoogle Playからアプリをインストールした場合、各ストアの規約、請求、解約、返金、サブスクリプション管理規則も適用されます。',
    liability: '本規約のいかなる内容も、故意、重過失、生命・身体・健康への損害、または法的に制限できない責任を制限するものではありません。強行的な消費者権利は影響を受けません。',
    dispute: '当社は、ドイツ消費者紛争解決法（VSBG）に基づく消費者仲裁機関での紛争解決手続に参加する意思も義務もありません。',
    govLaw: '本規約は、居住国の強行的な消費者保護権を害することなく、ドイツ法に準拠します。',
    accessibilityCommitment: (app) => `Timon Polleyは、${app}を障害のある方にも利用しやすくし、製品の発展に合わせてアクセシビリティを改善することを目指します。`,
    conformance: '本アプリは、モバイルアプリに適用される範囲で、WCAG 2.2 レベルAAおよびEN 301 549の期待事項に部分的に適合しています。一部の複雑な操作やプラットフォーム固有の操作にはさらなる改善が必要な場合があります。',
    feedback: 'アクセシビリティ上の障壁、画面名、端末/プラットフォーム、使用した支援技術、期待される動作をdev@timonply.comまでお送りください。',
    deletionContact: 'アプリ内の管理機能を使用できない場合は、該当する場合、アカウントに関連付けられたメールアドレスからdev@timonply.comへ連絡してください。処理前に合理的な本人確認が必要となる場合があります。',
    csaeIntro: (app) => `${app}は、児童の性的虐待・搾取（CSAE）、児童性的虐待資料（CSAM）、グルーミング、未成年者への性的勧誘、その他子どもを危険にさらすコンテンツまたは行為を禁止します。`,
    csaeReport: 'CSAEが疑われる場合は、利用可能なアプリ内報告機能とdev@timonply.comへのメールで直ちに報告してください。子どもに差し迫った危険がある場合は、まず緊急サービスまたは法執行機関に連絡してください。',
    csaeEnforce: '当社は、コンテンツ削除、機能制限、アカウント停止または終了、法的に適切な証拠保全、確認されたCSAMまたは差し迫った子どもの安全上の脅威についてNCMECまたは関連する地域当局・法執行機関への報告を行う場合があります。',
    csaeContact: '子どもの安全に関する連絡先: dev@timonply.com。英語またはドイツ語で連絡できます。',
    localOnlyNoAccount: (app) => `${app}は現在、アプリアカウントまたはクラウド同期を提供していません。削除すべきリモートアカウントはありません。アプリ内の削除/リセット機能、OSのストレージ管理、またはアンインストールにより端末上のローカルデータを削除してください。`,
    accountDeletion: (app) => `${app}はアプリ内でアカウント関連の管理機能を提供します。アカウント削除により、セキュリティ、不正防止、法令遵守、紛争対応、または他ユーザーの共有記録を維持するために保存が必要な場合を除き、アカウントに紐づくデータを削除または匿名化します。`,
  },
};

const apps = {
  neonroutine: {
    name: 'NeonRoutine',
    privacyUpdated: {
      en: 'July 31, 2026',
      de: '31. Juli 2026',
      es: '31 de julio de 2026',
      fr: '31 juillet 2026',
      ja: '2026年7月31日',
    },
    kind: {
      en: 'A cyberpunk habit, routine, streak, premium, notification, local analytics, and rewarded-ad app.',
      de: 'Eine Cyberpunk-App für Gewohnheiten, Routinen, Serien, Premium-Funktionen, Benachrichtigungen, lokale Auswertungen und Rewarded Ads.',
      es: 'Una app cyberpunk de hábitos, rutinas, rachas, funciones premium, notificaciones, analítica local y anuncios recompensados.',
      fr: 'Une application cyberpunk de suivi des habitudes, des routines et des séries, avec fonctionnalités premium, notifications, analyses locales et annonces récompensées.',
      ja: '習慣、ルーティン、連続記録、プレミアム機能、通知、ローカル分析、リワード広告を扱うサイバーパンク風アプリです。',
    },
    data: {
      en: ['Local habit and routine data, execution logs, streaks, XP, credits, faction/accent settings, mood and energy logs, achievements, local analytics, export/import state, and factory-reset state are stored on the device.', 'RevenueCat and the app stores process purchase and subscription status. Google Mobile Ads may process device identifiers, IP address, consent state, ad interactions, and rewarded-ad events when ads are used.', 'On iOS, the Identifier for Advertisers (IDFA) may be available only after the user accepts Apple App Tracking Transparency. In the EEA and UK, Google UMP presents consent choices before applicable personalized ads; the choice can be changed or withdrawn from Settings > AD PREFERENCES. See the [Google Privacy Policy](https://policies.google.com/privacy).', 'Local notifications and home widgets process reminder, schedule, and summary data on the device. No NeonRoutine account or cloud sync is currently provided.', 'With explicit permission, the app may read only the selected activity metric from Apple HealthKit or Android Health Connect: steps, workouts, sleep duration, active energy, hydration, and—on HealthKit only—mindful sessions. The app uses that reading only on the device to support the user-triggered habit or goal action, does not write health data, does not send it to advertising or purchase analytics, and access can be revoked in system settings.', 'Health sync is manual or runs only in the foreground when the app opens or resumes for an explicitly enabled mapping; denial, revocation, or an empty read leaves manual habit execution available. Deleting the sensor cache clears only local sync timestamps and never deletes platform health records.'],
      de: ['Lokale Gewohnheits- und Routinedaten, Ausführungsprotokolle, Serien, XP, Credits, Fraktions-/Akzent-Einstellungen, Stimmungs- und Energieprotokolle, Erfolge, lokale Auswertungen, Export-/Importstatus und Zurücksetzstatus werden auf dem Gerät gespeichert.', 'RevenueCat und die App Stores verarbeiten Kauf- und Abonnementstatus. Google Mobile Ads kann Gerätekennungen, IP-Adresse, Einwilligungsstatus, Anzeigeninteraktionen und Rewarded-Ad-Ereignisse verarbeiten, wenn Werbung genutzt wird.', 'Unter iOS kann die Werbe-ID (IDFA) nur verfügbar sein, nachdem der Nutzer Apple App Tracking Transparency zugestimmt hat. Im EWR und Vereinigten Königreich zeigt Google UMP vor entsprechender personalisierter Werbung Einwilligungsoptionen; die Auswahl kann unter Einstellungen > AD PREFERENCES geändert oder widerrufen werden. Siehe die [Google-Datenschutzrichtlinie](https://policies.google.com/privacy).', 'Lokale Benachrichtigungen und Home-Widgets verarbeiten Erinnerungs-, Zeitplan- und Zusammenfassungsdaten auf dem Gerät. Ein NeonRoutine-Konto oder Cloud-Sync wird derzeit nicht angeboten.', 'Mit ausdrücklicher Berechtigung darf die App aus Apple HealthKit oder Android Health Connect nur den ausgewählten Aktivitätswert lesen: Schritte, Trainingseinheiten, Schlafdauer, aktive Energie, Flüssigkeitsaufnahme und—nur in HealthKit—Achtsamkeitseinheiten. Die App verwendet diesen Wert ausschließlich auf dem Gerät zur Unterstützung der vom Nutzer ausgelösten Gewohnheits- oder Zielaktion, schreibt keine Gesundheitsdaten, übermittelt sie nicht an Werbe- oder Kaufanalysen und der Zugriff kann in den Systemeinstellungen widerrufen werden.', 'Die Gesundheitssynchronisierung erfolgt manuell oder nur im Vordergrund beim Öffnen oder Fortsetzen der App für eine ausdrücklich aktivierte Zuordnung; bei Ablehnung, Widerruf oder leerem Ergebnis bleibt die manuelle Gewohnheitsausführung verfügbar. Das Löschen des Sensor-Caches entfernt nur lokale Synchronisierungszeitstempel und niemals Gesundheitsdaten der Plattform.'],
      es: ['Los datos locales de hábitos y rutinas, registros de ejecución, rachas, XP, créditos, ajustes de facción/acento, registros de ánimo y energía, logros, analítica local, exportación/importación y restablecimiento se almacenan en el dispositivo.', 'RevenueCat y las tiendas de aplicaciones tratan el estado de compras y suscripciones. Google Mobile Ads puede tratar identificadores de dispositivo, dirección IP, estado de consentimiento, interacciones con anuncios y eventos de anuncios recompensados cuando se usan anuncios.', 'En iOS, el identificador para anunciantes (IDFA) solo puede estar disponible después de aceptar la Transparencia de seguimiento de Apple. En el EEE y Reino Unido, Google UMP muestra opciones de consentimiento antes de los anuncios personalizados aplicables; la elección puede cambiarse o retirarse en Ajustes > AD PREFERENCES. Consulte la [Política de Privacidad de Google](https://policies.google.com/privacy).', 'Las notificaciones locales y widgets de inicio tratan recordatorios, horarios y resúmenes en el dispositivo. Actualmente no hay cuenta NeonRoutine ni sincronización en la nube.', 'Con permiso explícito, la app puede leer únicamente la métrica de actividad seleccionada de Apple HealthKit o Android Health Connect: pasos, entrenamientos, duración del sueño, energía activa, hidratación y—solo en HealthKit—sesiones de atención plena. La usa solo en el dispositivo para apoyar la acción de hábito u objetivo iniciada por la persona usuaria, no escribe datos de salud, no los envía a analítica publicitaria o de compras y el acceso puede revocarse en los ajustes del sistema.', 'La sincronización de salud es manual o se ejecuta únicamente en primer plano cuando la app se abre o se reanuda para una vinculación habilitada explícitamente; la denegación, revocación o una lectura vacía mantiene disponible la ejecución manual del hábito. Borrar la caché del sensor elimina solo las marcas de tiempo locales y nunca los registros de salud de la plataforma.'],
      fr: ['Les données locales relatives aux habitudes et aux routines, les journaux d’exécution, les séries, les XP, les crédits, les paramètres de faction et de couleur d’accentuation, les journaux d’humeur et d’énergie, les succès, les analyses locales, l’état des exportations et importations ainsi que l’état de réinitialisation sont stockés sur l’appareil.', 'RevenueCat et les boutiques d’applications traitent l’état des achats et des abonnements. Lorsque des publicités sont utilisées, Google Mobile Ads peut traiter des identifiants de l’appareil, l’adresse IP, l’état du consentement, les interactions publicitaires et les événements liés aux annonces récompensées.', 'Sous iOS, l’identifiant publicitaire (IDFA) ne peut être disponible qu’après l’acceptation de l’App Tracking Transparency (ATT) d’Apple. Dans l’EEE et au Royaume-Uni, Google User Messaging Platform (UMP) présente les choix de consentement avant toute publicité personnalisée concernée ; ce choix peut être modifié ou retiré dans Réglages > AD PREFERENCES. Consultez la [Politique de confidentialité de Google](https://policies.google.com/privacy).', 'Les notifications locales et les widgets de l’écran d’accueil traitent sur l’appareil les données de rappel, de planification et de synthèse. Aucun compte NeonRoutine ni aucune synchronisation dans le cloud ne sont actuellement proposés.', 'Avec une autorisation explicite, l’application peut lire uniquement la mesure d’activité sélectionnée depuis Apple HealthKit ou Android Health Connect : nombre de pas, séances d’entraînement, durée du sommeil, énergie active, hydratation et — uniquement avec HealthKit — séances de pleine conscience. Cette mesure est utilisée exclusivement sur l’appareil pour prendre en charge l’action d’habitude ou d’objectif déclenchée par l’utilisateur ; l’application n’écrit aucune donnée de santé, ne la transmet ni aux systèmes publicitaires ni aux analyses d’achats, et l’accès peut être révoqué dans les réglages système.', 'La synchronisation des données de santé est manuelle ou s’exécute uniquement au premier plan lorsque l’application s’ouvre ou reprend pour une association activée explicitement ; un refus, une révocation ou une lecture vide laisse disponible l’exécution manuelle de l’habitude. La suppression du cache des capteurs efface uniquement les horodatages locaux de synchronisation et ne supprime jamais les données de santé conservées par la plateforme.'],
      ja: ['ローカルの習慣・ルーティンデータ、実行ログ、連続記録、XP、クレジット、派閥/アクセント設定、気分・エネルギー記録、実績、ローカル分析、エクスポート/インポート状態、初期化状態は端末上に保存されます。', 'RevenueCatおよびアプリストアは購入・サブスクリプション状態を処理します。広告を使用する場合、Google Mobile Adsは端末識別子、IPアドレス、同意状態、広告操作、リワード広告イベントを処理する場合があります。', 'iOSでは、Apple App Tracking Transparencyに同意した場合にのみ広告識別子（IDFA）が利用可能になることがあります。EEAおよび英国では、該当するパーソナライズ広告の前にGoogle UMPが同意の選択肢を表示し、設定 > AD PREFERENCESから変更または撤回できます。[Googleプライバシーポリシー](https://policies.google.com/privacy)をご覧ください。', 'ローカル通知とホームウィジェットは、リマインダー、スケジュール、概要データを端末上で処理します。現在、NeonRoutineアカウントまたはクラウド同期は提供していません。', '明示的な許可がある場合、アプリはApple HealthKitまたはAndroid Health Connectから選択されたアクティビティ指標（歩数、ワークアウト、睡眠時間、アクティブエネルギー、水分摂取、およびHealthKitのみのマインドフルセッション）のみを読み取ります。この値はユーザーが開始した習慣または目標の操作を支援するために端末上でのみ使用され、健康データへの書き込み、広告・購入分析への送信は行われず、アクセスはシステム設定から取り消せます。', '健康同期は手動、または明示的に有効化されたマッピングについてアプリの起動・再開時にフォアグラウンドでのみ実行されます。拒否、取り消し、空の読み取りでも習慣の手動実行は利用でき、センサーキャッシュの削除はローカルの同期時刻だけを消去し、プラットフォームの健康記録を削除しません。'],
    },
    processors: {
      en: 'RevenueCat, Apple App Store, Google Play, Google Mobile Ads/AdMob, platform notification services, and operating-system storage/widget services.',
      de: 'RevenueCat, Apple App Store, Google Play, Google Mobile Ads/AdMob, Plattform-Benachrichtigungsdienste sowie Betriebssystem-Speicher- und Widget-Dienste.',
      es: 'RevenueCat, Apple App Store, Google Play, Google Mobile Ads/AdMob, servicios de notificaciones de plataforma y servicios de almacenamiento/widgets del sistema operativo.',
      fr: 'RevenueCat, Apple App Store, Google Play, Google Mobile Ads/AdMob, les services de notification de la plateforme ainsi que les services de stockage et de widgets du système d’exploitation.',
      ja: 'RevenueCat、Apple App Store、Google Play、Google Mobile Ads/AdMob、プラットフォーム通知サービス、OSのストレージおよびウィジェットサービス。',
    },
    account: false,
    csae: false,
    limitations: {
      en: ['High-motion HUD animations, glow effects, shader overlays, and timer screens may need further tuning for some assistive technology combinations.', 'Rewarded-ad and purchase provider dialogs are partly controlled by third-party SDKs or app stores.'],
      de: ['Bewegungsreiche HUD-Animationen, Leuchteffekte, Shader-Overlays und Timer-Bildschirme können für manche Kombinationen assistiver Technologien weitere Anpassungen benötigen.', 'Rewarded-Ad- und Kaufdialoge werden teilweise durch Drittanbieter-SDKs oder App Stores kontrolliert.'],
      es: ['Las animaciones HUD con mucho movimiento, efectos de brillo, superposiciones shader y pantallas de temporizador pueden requerir ajustes adicionales para algunas combinaciones de tecnologías asistivas.', 'Los diálogos de anuncios recompensados y compras son controlados parcialmente por SDKs de terceros o tiendas de apps.'],
      fr: ['Les animations très dynamiques de l’interface HUD, les effets lumineux, les superpositions de shaders et les écrans de minuterie peuvent nécessiter des ajustements supplémentaires avec certaines technologies d’assistance.', 'Les boîtes de dialogue relatives aux annonces récompensées et aux achats sont en partie contrôlées par des SDK tiers ou par les boutiques d’applications.'],
      ja: ['動きの多いHUDアニメーション、発光効果、シェーダーオーバーレイ、タイマー画面は、一部の支援技術との組み合わせで追加調整が必要な場合があります。', 'リワード広告および購入ダイアログは、第三者SDKまたはアプリストアにより一部制御されます。'],
    },
    deletionDetails: {
      fr: 'La commande permettant d’effacer le cache des capteurs supprime uniquement les horodatages locaux de synchronisation. Elle ne supprime jamais les données enregistrées dans Apple HealthKit ou Android Health Connect. Pour retirer ces données de la plateforme de santé, utilisez les contrôles proposés par iOS ou Android.',
    },
  },
  kalvenda: {
    name: 'Kalvenda',
    kind: {
      en: 'A group planning app with accounts, groups, events, invitations, alerts, reactions, notifications, ads, subscriptions, and moderation tools.',
      de: 'Eine Gruppenplanungs-App mit Konten, Gruppen, Events, Einladungen, Alerts, Reaktionen, Benachrichtigungen, Werbung, Abonnements und Moderationswerkzeugen.',
      es: 'Una app de planificación grupal con cuentas, grupos, eventos, invitaciones, alertas, reacciones, notificaciones, anuncios, suscripciones y herramientas de moderación.',
      ja: 'アカウント、グループ、イベント、招待、アラート、リアクション、通知、広告、サブスクリプション、モデレーション機能を備えたグループ計画アプリです。',
    },
    data: {
      en: ['Account and profile data, authentication identifiers, display names, avatars, group memberships, roles, invitations, events, alerts, reactions, reports, blocks, notification settings, and FCM tokens are processed to provide the group service.', 'Optional event locations may include coordinates or map-related data. UGC reports and moderation records may be retained to enforce safety rules and prevent abuse.', 'RevenueCat/app stores handle purchase status; Google AdMob handles ads where enabled; Firebase/Google services provide authentication, database, functions, notifications, diagnostics, and hosting infrastructure.'],
      de: ['Konto- und Profildaten, Authentifizierungskennungen, Anzeigenamen, Avatare, Gruppenmitgliedschaften, Rollen, Einladungen, Events, Alerts, Reaktionen, Meldungen, Blockierungen, Benachrichtigungseinstellungen und FCM-Token werden verarbeitet, um den Gruppendienst bereitzustellen.', 'Optionale Event-Orte können Koordinaten oder Kartendaten enthalten. UGC-Meldungen und Moderationsaufzeichnungen können gespeichert werden, um Sicherheitsregeln durchzusetzen und Missbrauch zu verhindern.', 'RevenueCat/App Stores verwalten Kaufstatus; Google AdMob verarbeitet Werbung, soweit aktiviert; Firebase/Google-Dienste stellen Authentifizierung, Datenbank, Functions, Benachrichtigungen, Diagnostik und Hosting-Infrastruktur bereit.'],
      es: ['Se tratan datos de cuenta y perfil, identificadores de autenticación, nombres visibles, avatares, pertenencia a grupos, roles, invitaciones, eventos, alertas, reacciones, reportes, bloqueos, ajustes de notificaciones y tokens FCM para prestar el servicio grupal.', 'Las ubicaciones opcionales de eventos pueden incluir coordenadas o datos de mapa. Los reportes UGC y registros de moderación pueden conservarse para aplicar reglas de seguridad y prevenir abusos.', 'RevenueCat/tiendas gestionan estado de compras; Google AdMob gestiona anuncios cuando están habilitados; Firebase/Google ofrece autenticación, base de datos, funciones, notificaciones, diagnósticos e infraestructura de alojamiento.'],
      ja: ['グループサービス提供のため、アカウント・プロフィールデータ、認証識別子、表示名、アバター、グループメンバーシップ、役割、招待、イベント、アラート、リアクション、報告、ブロック、通知設定、FCMトークンを処理します。', '任意のイベント場所には座標や地図関連データが含まれる場合があります。UGC報告およびモデレーション記録は、安全ルールの執行と不正防止のため保存される場合があります。', 'RevenueCat/アプリストアは購入状態を扱い、Google AdMobは有効時に広告を扱い、Firebase/Googleサービスは認証、データベース、Functions、通知、診断、ホスティング基盤を提供します。'],
    },
    processors: {
      en: 'Google Firebase, Firebase Authentication, Cloud Firestore, Cloud Functions, Firebase Cloud Messaging, Google Sign-In, Google AdMob, RevenueCat, Apple App Store, and Google Play.',
      de: 'Google Firebase, Firebase Authentication, Cloud Firestore, Cloud Functions, Firebase Cloud Messaging, Google Sign-In, Google AdMob, RevenueCat, Apple App Store und Google Play.',
      es: 'Google Firebase, Firebase Authentication, Cloud Firestore, Cloud Functions, Firebase Cloud Messaging, Google Sign-In, Google AdMob, RevenueCat, Apple App Store y Google Play.',
      ja: 'Google Firebase、Firebase Authentication、Cloud Firestore、Cloud Functions、Firebase Cloud Messaging、Google Sign-In、Google AdMob、RevenueCat、Apple App Store、Google Play。',
    },
    account: true,
    csae: true,
    limitations: {
      en: ['Interactive maps, realtime group updates, admin/moderation views, and dense member/event tables may need ongoing screen-reader and large-text improvements.', 'Some platform permission, ad, payment, and sign-in dialogs are controlled by third-party providers.'],
      de: ['Interaktive Karten, Echtzeit-Gruppenupdates, Admin-/Moderationsansichten und dichte Mitglieder-/Eventlisten benötigen möglicherweise fortlaufende Verbesserungen für Screenreader und große Schrift.', 'Einige Berechtigungs-, Anzeigen-, Zahlungs- und Anmeldedialoge werden von Drittanbietern kontrolliert.'],
      es: ['Mapas interactivos, actualizaciones grupales en tiempo real, vistas de administración/moderación y tablas densas de miembros/eventos pueden requerir mejoras continuas para lectores de pantalla y texto grande.', 'Algunos diálogos de permisos, anuncios, pagos e inicio de sesión son controlados por terceros.'],
      ja: ['インタラクティブ地図、リアルタイムのグループ更新、管理/モデレーション画面、密度の高いメンバー/イベント表は、スクリーンリーダーや大きな文字への継続的な改善が必要な場合があります。', '一部の権限、広告、支払い、サインインダイアログは第三者プロバイダーにより制御されます。'],
    },
  },
  exactake: {
    name: 'Exactake',
    kind: {
      en: 'A local-first nutrition tracker with food logging, nutrition estimates, body metrics, source confidence, exports, local deletion, and user-triggered food-data lookup.',
      de: 'Ein lokal ausgerichteter Ernährungstracker mit Lebensmittelerfassung, Nährwertschätzungen, Körpermetriken, Quellenvertrauen, Exporten, lokaler Löschung und nutzerinitiierter Lebensmitteldatenabfrage.',
      es: 'Un rastreador de nutrición local-first con registro de alimentos, estimaciones nutricionales, métricas corporales, confianza de fuentes, exportaciones, eliminación local y búsqueda de datos alimentarios iniciada por el usuario.',
      ja: '食品記録、栄養推定、身体指標、ソース信頼度、エクスポート、ローカル削除、ユーザー起点の食品データ検索を備えたローカルファーストの栄養トラッカーです。',
    },
    data: {
      en: ['Profile settings, diary entries, foods, recipes, meal templates, body measurements, targets, hydration, supplements, source metadata, consent state, local metrics, imports, exports, and delete state are stored locally on the device.', 'When the user performs an uncached barcode lookup, the normalized barcode may be sent over HTTPS to Open Food Facts to retrieve public product data. Exactake does not send diary entries, body metrics, custom recipes, account identifiers, or payment data with that lookup.', 'The current production scope has no Exactake accounts, cloud sync, production ads, production purchases, remote telemetry, crash SDK, or hosted OCR. Future activation requires updated disclosures before release.'],
      de: ['Profileinstellungen, Tagebucheinträge, Lebensmittel, Rezepte, Mahlzeitenvorlagen, Körpermessungen, Ziele, Flüssigkeit, Supplemente, Quellenmetadaten, Einwilligungsstatus, lokale Metriken, Importe, Exporte und Löschstatus werden lokal auf dem Gerät gespeichert.', 'Wenn der Nutzer eine nicht zwischengespeicherte Barcode-Abfrage ausführt, kann der normalisierte Barcode per HTTPS an Open Food Facts gesendet werden, um öffentliche Produktdaten abzurufen. Exactake sendet dabei keine Tagebucheinträge, Körpermetriken, eigenen Rezepte, Kontokennungen oder Zahlungsdaten.', 'Der aktuelle Produktionsumfang enthält keine Exactake-Konten, keinen Cloud-Sync, keine Produktionswerbung, keine Produktionskäufe, keine Remote-Telemetrie, kein Crash-SDK und kein gehostetes OCR. Eine spätere Aktivierung erfordert vor Veröffentlichung aktualisierte Offenlegungen.'],
      es: ['Ajustes de perfil, entradas de diario, alimentos, recetas, plantillas de comidas, medidas corporales, objetivos, hidratación, suplementos, metadatos de fuentes, estado de consentimiento, métricas locales, importaciones, exportaciones y estado de eliminación se almacenan localmente en el dispositivo.', 'Cuando el usuario realiza una búsqueda de código de barras no almacenada en caché, el código normalizado puede enviarse por HTTPS a Open Food Facts para obtener datos públicos del producto. Exactake no envía entradas de diario, métricas corporales, recetas propias, identificadores de cuenta ni datos de pago con esa consulta.', 'El alcance de producción actual no incluye cuentas Exactake, sincronización en la nube, anuncios de producción, compras de producción, telemetría remota, SDK de fallos ni OCR alojado. Cualquier activación futura requiere divulgaciones actualizadas antes del lanzamiento.'],
      ja: ['プロフィール設定、日記入力、食品、レシピ、食事テンプレート、身体測定、目標、水分、サプリメント、ソースメタデータ、同意状態、ローカル指標、インポート、エクスポート、削除状態は端末上にローカル保存されます。', 'ユーザーがキャッシュされていないバーコード検索を行う場合、正規化されたバーコードがHTTPSでOpen Food Factsに送信され、公開製品データを取得することがあります。この検索でExactakeは日記入力、身体指標、独自レシピ、アカウント識別子、支払いデータを送信しません。', '現在の本番範囲には、Exactakeアカウント、クラウド同期、本番広告、本番購入、リモートテレメトリ、クラッシュSDK、ホスト型OCRは含まれません。将来有効化する場合は、リリース前に開示を更新する必要があります。'],
    },
    processors: {
      en: 'Open Food Facts for user-triggered uncached barcode lookup; Apple App Store and Google Play if future store purchases are enabled. Current local-first scope otherwise avoids remote Exactake processors.',
      de: 'Open Food Facts für nutzerinitiierte, nicht zwischengespeicherte Barcode-Abfragen; Apple App Store und Google Play, falls zukünftige Store-Käufe aktiviert werden. Der aktuelle lokale Umfang vermeidet ansonsten entfernte Exactake-Verarbeiter.',
      es: 'Open Food Facts para búsquedas de código de barras no almacenadas en caché e iniciadas por el usuario; Apple App Store y Google Play si se habilitan compras futuras. El alcance local-first actual evita otros encargados remotos de Exactake.',
      ja: 'ユーザー起点の未キャッシュバーコード検索にはOpen Food Facts、将来ストア購入を有効化する場合はApple App StoreおよびGoogle Play。現在のローカルファースト範囲では、それ以外のExactake向けリモート処理者を避けています。',
    },
    account: false,
    csae: false,
    health: true,
    limitations: {
      en: ['Dense nutrition tables, charts, barcode flows, export/import review, and destructive local-delete confirmation need continued large-text and screen-reader review.', 'Third-party food data can be incomplete, outdated, regional, or wrong.'],
      de: ['Dichte Nährwerttabellen, Diagramme, Barcode-Abläufe, Export-/Importprüfung und destruktive lokale Löschbestätigung benötigen fortlaufende Prüfung für große Schrift und Screenreader.', 'Drittanbieter-Lebensmitteldaten können unvollständig, veraltet, regional oder falsch sein.'],
      es: ['Tablas nutricionales densas, gráficos, flujos de código de barras, revisión de exportación/importación y confirmación destructiva de eliminación local requieren revisión continua de texto grande y lectores de pantalla.', 'Los datos alimentarios de terceros pueden estar incompletos, desactualizados, ser regionales o incorrectos.'],
      ja: ['密度の高い栄養表、グラフ、バーコード操作、エクスポート/インポート確認、破壊的なローカル削除確認は、大きな文字とスクリーンリーダーでの継続的な確認が必要です。', '第三者の食品データは不完全、古い、地域限定、または誤っている場合があります。'],
    },
  },
  flatnest: {
    name: 'Flatnest',
    kind: {
      en: 'A shared-living coordination app for flats, members, chat, chores, expenses, shopping, decisions, invites, notifications, and household records.',
      de: 'Eine App zur Koordination gemeinsamer Wohnungen mit WGs, Mitgliedern, Chat, Aufgaben, Ausgaben, Einkauf, Entscheidungen, Einladungen, Benachrichtigungen und Haushaltsaufzeichnungen.',
      es: 'Una app de coordinación de convivencia para pisos, miembros, chat, tareas, gastos, compras, decisiones, invitaciones, notificaciones y registros del hogar.',
      ja: 'フラット、メンバー、チャット、家事、費用、買い物、意思決定、招待、通知、家庭記録を扱う共同生活調整アプリです。',
    },
    data: {
      en: ['Account, profile, flat membership, role, invite, household summary, chore, chat, decision, expense, shopping, calendar, maintenance, guest, handbook, notification, settings, and audit metadata may be processed for the shared-living service.', 'Message bodies, private notes, receipts, payment details, and legal content are treated as sensitive and must not be used in analytics metadata. Firebase services are the planned backend; production live actions remain approval-gated in the app workspace.', 'The app is pre-release. Legal/store disclosures must be rechecked before external launch if sync, storage, analytics, paid features, RevenueCat, ads, or support-upload flows change.'],
      de: ['Konto-, Profil-, WG-Mitgliedschafts-, Rollen-, Einladungs-, Haushaltsübersichts-, Aufgaben-, Chat-, Entscheidungs-, Ausgaben-, Einkaufs-, Kalender-, Wartungs-, Gäste-, Handbuch-, Benachrichtigungs-, Einstellungs- und Audit-Metadaten können für den WG-Dienst verarbeitet werden.', 'Nachrichtentexte, private Notizen, Belege, Zahlungsdetails und rechtliche Inhalte werden als sensibel behandelt und dürfen nicht in Analyse-Metadaten verwendet werden. Firebase-Dienste sind als Backend vorgesehen; produktive Live-Aktionen bleiben im App-Workspace genehmigungspflichtig.', 'Die App ist vor Veröffentlichung. Rechtliche und Store-Offenlegungen müssen vor externem Launch erneut geprüft werden, wenn Sync, Speicher, Analytics, bezahlte Funktionen, RevenueCat, Werbung oder Support-Upload-Flows geändert werden.'],
      es: ['Pueden tratarse datos de cuenta, perfil, pertenencia al piso, roles, invitaciones, resumen del hogar, tareas, chat, decisiones, gastos, compras, calendario, mantenimiento, invitados, manual, notificaciones, ajustes y metadatos de auditoría para el servicio de convivencia.', 'Cuerpos de mensajes, notas privadas, recibos, detalles de pago y contenido legal se tratan como sensibles y no deben usarse en metadatos de analítica. Firebase es el backend previsto; las acciones de producción en vivo siguen sujetas a aprobación en el workspace de la app.', 'La app está en pre-lanzamiento. Las divulgaciones legales y de tiendas deben revisarse de nuevo antes del lanzamiento externo si cambian sincronización, almacenamiento, analítica, funciones de pago, RevenueCat, anuncios o flujos de carga a soporte.'],
      ja: ['共同生活サービスのため、アカウント、プロフィール、フラットメンバーシップ、役割、招待、家庭概要、家事、チャット、意思決定、費用、買い物、カレンダー、メンテナンス、ゲスト、ハンドブック、通知、設定、監査メタデータが処理される場合があります。', 'メッセージ本文、非公開メモ、領収書、支払い詳細、法的内容は機微情報として扱われ、分析メタデータに使用してはなりません。Firebaseサービスが予定バックエンドであり、本番ライブ操作はアプリワークスペースで承認制のままです。', '本アプリはリリース前です。同期、ストレージ、分析、有料機能、RevenueCat、広告、サポートアップロードが変更される場合、外部リリース前に法的/ストア開示を再確認する必要があります。'],
    },
    processors: {
      en: 'Planned Firebase Authentication, Cloud Firestore, Cloud Storage, Cloud Functions, Firebase Cloud Messaging, Apple App Store, Google Play, and any future approved payment or subscription provider.',
      de: 'Geplant sind Firebase Authentication, Cloud Firestore, Cloud Storage, Cloud Functions, Firebase Cloud Messaging, Apple App Store, Google Play und zukünftige genehmigte Zahlungs- oder Abonnementanbieter.',
      es: 'Están previstos Firebase Authentication, Cloud Firestore, Cloud Storage, Cloud Functions, Firebase Cloud Messaging, Apple App Store, Google Play y cualquier proveedor futuro aprobado de pagos o suscripciones.',
      ja: '予定されるサービスは、Firebase Authentication、Cloud Firestore、Cloud Storage、Cloud Functions、Firebase Cloud Messaging、Apple App Store、Google Play、および将来承認された支払いまたはサブスクリプション提供者です。',
    },
    account: true,
    csae: true,
    prerelease: true,
    limitations: {
      en: ['Chat, expense, decision, role, and household-record screens are dense workflows that need continued keyboard, screen-reader, large-text, and error-state testing.', 'Some current surfaces may be placeholders until feature implementation and visual verification are complete.'],
      de: ['Chat-, Ausgaben-, Entscheidungs-, Rollen- und Haushaltsprotokoll-Bildschirme sind dichte Arbeitsabläufe, die weitere Tests mit Tastatur, Screenreader, großer Schrift und Fehlerzuständen benötigen.', 'Einige aktuelle Oberflächen können Platzhalter sein, bis Feature-Implementierung und visuelle Verifikation abgeschlossen sind.'],
      es: ['Pantallas de chat, gastos, decisiones, roles y registros del hogar son flujos densos que necesitan pruebas continuas de teclado, lector de pantalla, texto grande y estados de error.', 'Algunas superficies actuales pueden ser marcadores de posición hasta completar implementación y verificación visual.'],
      ja: ['チャット、費用、意思決定、役割、家庭記録の画面は密度の高いワークフローであり、キーボード、スクリーンリーダー、大きな文字、エラー状態の継続的なテストが必要です。', '現在の一部画面は、機能実装と視覚検証が完了するまでプレースホルダーの場合があります。'],
    },
  },
};

const localizedCopy = {
  automatedDecision: {
    de: 'Die App trifft keine automatisierten Entscheidungen mit rechtlicher oder ähnlich erheblicher Wirkung. Personalisierte Werbung oder Store-/SDK-Entscheidungen können automatisiert erfolgen, soweit der jeweilige Dienst dies vorsieht und eine erforderliche Einwilligung vorliegt.',
    en: 'The app does not make automated decisions with legal or similarly significant effects. Personalized ads or store/SDK decisions may be automated where the provider offers them and required consent exists.',
    es: 'La app no toma decisiones automatizadas con efectos jurídicos o similares significativos. La publicidad personalizada o decisiones de SDK/tienda pueden ser automatizadas cuando el proveedor las ofrece y exista el consentimiento requerido.',
    fr: 'L’application ne prend aucune décision automatisée produisant des effets juridiques ou des effets similaires significatifs. La personnalisation des publicités ou certaines décisions prises par les boutiques ou les SDK peuvent être automatisées lorsque le fournisseur le prévoit et que le consentement requis a été donné.',
    ja: '本アプリは、法的または同様に重大な効果をもつ自動意思決定を行いません。パーソナライズ広告やストア/SDK側の判断は、各サービスの範囲内で、必要な同意がある場合に自動化されることがあります。',
  },
  noAccountResponsibility: {
    de: 'Die aktuelle Version bietet kein App-Konto. Lokale Daten, Backups und Exportdateien liegen in Ihrer Verantwortung.',
    en: 'The current version does not provide an app account. Local data, backups, and exported files are your responsibility.',
    es: 'La versión actual no ofrece cuenta de app. Los datos locales, copias de seguridad y archivos exportados son responsabilidad del usuario.',
    fr: 'La version actuelle ne propose pas de compte dans l’application. Vous êtes responsable de vos données locales, de vos sauvegardes et de vos fichiers exportés.',
    ja: '現在の版はアプリアカウントを提供しません。ローカルデータ、バックアップ、エクスポートファイルはユーザーの責任です。',
  },
  paidTerms: {
    de: 'Preise, Verlängerungen, Kündigung, Erstattung und Wiederherstellung werden vor dem Kauf durch die jeweilige Store- oder Zahlungsoberfläche angezeigt. Bezahlte Funktionen dürfen nicht missbraucht, übertragen oder umgangen werden.',
    en: 'Prices, renewal, cancellation, refunds, and restore options are shown before purchase by the applicable store or payment interface. Paid features must not be abused, transferred, or bypassed.',
    es: 'Precios, renovación, cancelación, reembolsos y restauración se muestran antes de la compra mediante la tienda o interfaz de pago correspondiente. Las funciones de pago no deben abusarse, transferirse ni eludirse.',
    fr: 'Les prix, renouvellements, résiliations, remboursements et options de restauration sont présentés avant l’achat dans l’interface de la boutique ou de paiement concernée. Les fonctionnalités payantes ne doivent pas être détournées, transférées ou contournées.',
    ja: '価格、更新、解約、返金、復元は、購入前に該当するストアまたは支払い画面で表示されます。有料機能を不正利用、譲渡、回避してはなりません。',
  },
  availability: {
    de: 'Funktionen können geändert, eingeschränkt, unterbrochen oder entfernt werden. Lokale, Store-, Netzwerk- und Drittanbieterbedingungen können die Verfügbarkeit beeinflussen.',
    en: 'Features may change, be limited, interrupted, or removed. Local, store, network, and third-party conditions can affect availability.',
    es: 'Las funciones pueden cambiar, limitarse, interrumpirse o retirarse. Condiciones locales, de tienda, red o terceros pueden afectar la disponibilidad.',
    fr: 'Les fonctionnalités peuvent être modifiées, limitées, interrompues ou supprimées. Les conditions locales, celles des boutiques, du réseau ou de services tiers peuvent affecter leur disponibilité.',
    ja: '機能は変更、制限、中断、削除される場合があります。ローカル環境、ストア、ネットワーク、第三者サービスの条件が利用可能性に影響することがあります。',
  },
  accessibilityFeatures: {
    de: '- Unterstützung für Plattform-Screenreader und semantische Labels, soweit implementiert.\n- Unterstützung für größere Schrift und Betriebssystem-Einstellungen, soweit die jeweilige Oberfläche dies zulässt.\n- Fokus auf ausreichenden Kontrast, klare Aktionen und reduzierte Bewegung, wo verfügbar.',
    en: '- Support for platform screen readers and semantic labels where implemented.\n- Support for larger text and operating-system settings where the surface allows it.\n- Focus on sufficient contrast, clear actions, and reduced motion where available.',
    es: '- Compatibilidad con lectores de pantalla de plataforma y etiquetas semánticas donde estén implementadas.\n- Soporte para texto más grande y ajustes del sistema operativo donde la superficie lo permita.\n- Enfoque en contraste suficiente, acciones claras y reducción de movimiento cuando esté disponible.',
    fr: '- Prise en charge des lecteurs d’écran de la plateforme et des libellés sémantiques lorsqu’ils sont disponibles.\n- Prise en charge d’un texte agrandi et des réglages du système d’exploitation lorsque l’interface le permet.\n- Attention portée à un contraste suffisant, à des actions clairement identifiées et à la réduction des animations lorsqu’elle est disponible.',
    ja: '- 実装されている範囲で、プラットフォームのスクリーンリーダーとセマンティックラベルをサポートします。\n- 画面が許す範囲で、大きな文字とOS設定をサポートします。\n- 十分なコントラスト、明確な操作、利用可能な場合の動きの低減を重視します。',
  },
  accessibilityEnforcement: {
    de: 'Für Verbraucherprodukte und -dienstleistungen in Deutschland kann die zuständige Marktüberwachungsbehörde nach dem BFSG zusätzlich kontaktiert werden, wenn ein Anliegen nicht angemessen gelöst wird.',
    en: 'For consumer products and services in Germany, the competent market surveillance authority under the BFSG may also be contacted if an issue is not resolved appropriately.',
    es: 'Para productos y servicios de consumo en Alemania, la autoridad competente de vigilancia del mercado bajo el BFSG puede contactarse adicionalmente si una incidencia no se resuelve adecuadamente.',
    fr: 'Pour les produits et services destinés aux consommateurs en Allemagne, l’autorité de surveillance du marché compétente au titre du BFSG peut également être saisie si un problème n’est pas résolu de manière appropriée.',
    ja: 'ドイツの消費者向け製品・サービスについて、問題が適切に解決されない場合、BFSGに基づく所管の市場監視当局へ連絡できる場合があります。',
  },
  localDeletionControls: {
    de: 'Verwenden Sie Export-, Import-, Zurücksetz- oder Löschfunktionen in den App-Einstellungen, sofern verfügbar. Exportdateien können sensible Daten enthalten und sollten sicher gespeichert werden.',
    en: 'Use export, import, reset, or deletion features in app settings where available. Export files may contain sensitive data and should be stored securely.',
    es: 'Use las funciones de exportación, importación, restablecimiento o eliminación en los ajustes cuando estén disponibles. Los archivos exportados pueden contener datos sensibles y deben guardarse de forma segura.',
    fr: 'Utilisez, lorsqu’elles sont disponibles, les fonctions d’exportation, d’importation, de réinitialisation ou de suppression dans les réglages de l’application. Les fichiers exportés peuvent contenir des données sensibles et doivent être conservés de manière sécurisée.',
    ja: '利用可能な場合は、アプリ設定のエクスポート、インポート、リセット、削除機能を使用してください。エクスポートファイルには機微データが含まれる場合があり、安全に保存してください。',
  },
  retentionExceptions: {
    de: 'Einige Daten können aufbewahrt werden, soweit dies für Sicherheit, Betrugsprävention, Abrechnung, gesetzliche Pflichten, Nachweisführung, Streitbeilegung, Missbrauchsberichte oder die Rechte anderer Nutzer erforderlich ist. Nicht mehr benötigte Daten werden gelöscht oder anonymisiert.',
    en: 'Some data may be retained where necessary for security, fraud prevention, billing, legal obligations, evidence, dispute resolution, abuse reports, or other users rights. Data no longer needed is deleted or anonymized.',
    es: 'Algunos datos pueden conservarse cuando sea necesario por seguridad, prevención de fraude, facturación, obligaciones legales, pruebas, resolución de disputas, reportes de abuso o derechos de otros usuarios. Los datos que ya no sean necesarios se eliminan o anonimizan.',
    fr: 'Certaines données traitées par les boutiques ou les prestataires peuvent être conservées lorsque cela est nécessaire à la sécurité, à la prévention de la fraude, à la facturation, au respect d’obligations légales, à la preuve ou au règlement de litiges. Les données qui ne sont plus nécessaires sont supprimées ou anonymisées conformément aux règles du prestataire concerné.',
    ja: 'セキュリティ、不正防止、請求、法的義務、証拠保全、紛争解決、乱用報告、他ユーザーの権利のために必要な場合、一部データを保存することがあります。不要になったデータは削除または匿名化されます。',
  },
  appProviderInfo: {
    de: 'Angaben nach § 5 DDG für dieses App-Angebot. Die allgemeine Impressumsseite ist ebenfalls verfügbar.',
    en: 'Provider information under Section 5 DDG for this app offering. The general legal notice is also available.',
    es: 'Información del proveedor conforme al § 5 DDG para esta oferta de app. También está disponible el aviso legal general.',
    fr: 'Informations sur le fournisseur communiquées conformément à l’article 5 du DDG allemand pour cette application. Les mentions légales générales sont également disponibles.',
    ja: '本アプリ提供に関するDDG第5条に基づく提供者情報です。一般の運営者情報ページも利用できます。',
  },
};

function copyFor(section, code) {
  return localizedCopy[section][code] ?? localizedCopy[section].en;
}

function file(path, content) {
  const full = join(root, path);
  const normalizedContent = path === 'docs/regulatory-review.md'
    ? content.replace(
        'Added route matrix paths for all four languages: German, English, Spanish, and Japanese.',
        'Added route matrix paths for the four portfolio languages (German, English, Spanish, and Japanese) plus the NeonRoutine-only French routes.',
      )
    : content;
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, `${normalizedContent.trim()}\n`, 'utf8');
}

function yamlList(items) {
  if (!items?.length) return '';
  return `redirect_from:\n${items.map((item) => `  - ${item}`).join('\n')}\n`;
}

function frontmatter({ title, docId, docType, appName, lang, permalink, redirects = [] }) {
  return `---\nlayout: legal\ntitle: "${title}"\ndoc_id: ${docId}\ndoc_type: "${docType}"\napp_name: "${appName}"\nlanguage: "${lang.name}"\nlanguage_code: ${lang.code}\nlanguage_order: ${lang.order}\npermalink: ${permalink}\n${yamlList(redirects)}---`;
}

function docRedirects(appKey, doc, code) {
  const redirects = [`/${appKey}/${doc}.${code}.html`, `/${appKey}/${doc}.${code}.md`];
  if (appKey === 'neonroutine' && doc === 'privacy' && code === 'en') {
    redirects.push('/neonroutine/privacy/');
  }
  return redirects;
}

function generalRedirects(doc, code) {
  return [`/${doc}.${code}.html`, `/${doc}.${code}.md`];
}

function related(appKey, app, code, includeCsae = app.csae) {
  const labels = tr[code];
  const rows = [
    [labels.privacyTitle, `/${appKey}/privacy.${code}/`],
    [labels.termsTitle, `/${appKey}/terms.${code}/`],
    [labels.accessibilityTitle, `/${appKey}/accessibility.${code}/`],
    [labels.deletionTitle, `/${appKey}/deletion.${code}/`],
  ];
  if (includeCsae) rows.push([labels.csaeTitle, `/${appKey}/csae.${code}/`]);
  rows.push([labels.impressumTitle, `/${appKey}/impressum.${code}/`]);
  rows.push([labels.support, '/support.html']);
  return `## ${labels.related}\n\n${rows.map(([label, path]) => `- ${label}: [https://timonply.com${path}](https://timonply.com${path})`).join('\n')}`;
}

function titleFor(langCode, docTitle, appName) {
  if (langCode === 'de') return `${docTitle} für ${appName}`;
  if (langCode === 'es') return `${docTitle} de ${appName}`;
  if (langCode === 'fr') return `${docTitle} de ${appName}`;
  if (langCode === 'ja') return `${appName} ${docTitle}`;
  return `${docTitle} for ${appName}`;
}

function processors(app, code) {
  return typeof app.processors === 'string' ? app.processors : app.processors[code];
}

function privacyDoc(appKey, app, lang) {
  const l = tr[lang.code];
  const title = titleFor(lang.code, l.privacyTitle, app.name);
  const privacyDate = app.privacyUpdated?.[lang.code] ?? l.date;
  return `${frontmatter({ title, docId: `${appKey}-privacy`, docType: l.privacyTitle, appName: app.name, lang, permalink: `/${appKey}/privacy.${lang.code}/`, redirects: docRedirects(appKey, 'privacy', lang.code) })}\n# ${title}\n\n${l.lastUpdated}: ${privacyDate}\n\n${l.privacyIntro(app.name)}\n\n## ${l.controller}\n\n${l.controllerText}\n\n## ${l.scope}\n\n${app.kind[lang.code]}${app.health ? `\n\n${l.noMedical}` : ''}${app.prerelease ? `\n\n${l.preRelease}` : ''}\n\n## ${l.data}\n\n${app.data[lang.code].map((line) => `- ${line}`).join('\n')}\n\n## ${l.sharing}\n\n${processors(app, lang.code)}\n\n## ${l.legalBasis}\n\n${l.bases}\n\n## ${l.retention}\n\n${app.account ? l.accountDeletion(app.name) : l.localOnlyNoAccount(app.name)}\n\n${l.deletionContact}\n\n## ${l.rights}\n\n${l.rightsText}\n\n## ${l.children}\n\n${l.childrenText}\n\n## ${l.security}\n\n${l.securityText}\n\n## ${l.transfers}\n\n${l.transfersText}\n\n## ${l.automated}\n\n${copyFor('automatedDecision', lang.code)}\n\n## ${l.changes}\n\n${l.changesText}\n\n${related(appKey, app, lang.code)}`;
}

function termsDoc(appKey, app, lang) {
  const l = tr[lang.code];
  const title = titleFor(lang.code, l.termsTitle, app.name);
  const ugc = app.csae ? (lang.code === 'de' ? 'Nutzerinhalte dürfen nicht rechtswidrig, missbräuchlich, belästigend, diskriminierend, sexuell ausbeuterisch, kindergefährdend oder verletzend sein. Wir können Meldungen prüfen, Inhalte entfernen, Funktionen einschränken und Konten sperren.' : lang.code === 'es' ? 'El contenido de usuarios no puede ser ilegal, abusivo, acosador, discriminatorio, sexualmente explotador, peligroso para menores o lesivo. Podemos revisar reportes, retirar contenido, restringir funciones y suspender cuentas.' : lang.code === 'ja' ? 'ユーザーコンテンツは、違法、虐待的、嫌がらせ、差別的、性的搾取、子どもを危険にさらすもの、または権利侵害であってはなりません。当社は報告を確認し、コンテンツ削除、機能制限、アカウント停止を行う場合があります。' : 'User content must not be unlawful, abusive, harassing, discriminatory, sexually exploitative, child-endangering, or infringing. We may review reports, remove content, restrict features, and suspend accounts.') : '';
  const paid = copyFor('paidTerms', lang.code);
  const accountResponsibility = app.account
    ? (lang.code === 'de' ? 'Sie sind für die Sicherheit Ihres Kontos, korrekte Angaben und zulässige Nutzung geteilter Bereiche verantwortlich.' : lang.code === 'es' ? 'Usted es responsable de la seguridad de su cuenta, de datos correctos y del uso permitido de espacios compartidos.' : lang.code === 'ja' ? 'アカウントの安全、正確な情報、共有領域の適切な利用について責任を負います。' : 'You are responsible for account security, accurate information, and lawful use of shared spaces.')
    : copyFor('noAccountResponsibility', lang.code);
  return `${frontmatter({ title, docId: `${appKey}-terms`, docType: l.termsTitle, appName: app.name, lang, permalink: `/${appKey}/terms.${lang.code}/`, redirects: docRedirects(appKey, 'terms', lang.code) })}\n# ${title}\n\n${l.lastUpdated}: ${l.date}\n\n## 1. ${l.termsTitle}\n\n${l.termsIntro}\n\n${l.controllerText}\n\n## 2. ${l.productScope}\n\n${app.kind[lang.code]}\n\n${app.health || appKey === 'neonroutine' ? l.noMedical : ''}\n\n## 3. ${l.userRespHeading}\n\n${l.userResponsibility}\n\n## 4. ${l.accountsSafety}\n\n${accountResponsibility}\n\n${ugc}\n\n## 5. ${l.purchasesAds}\n\n${paid}\n\n${l.stores}\n\n## 6. ${l.thirdParty}\n\n${processors(app, lang.code)}\n\n${appKey === 'exactake' ? (lang.code === 'de' ? 'Lebensmittel- und Nährwertdaten von Drittanbietern können unvollständig, veraltet oder falsch sein. Prüfen Sie Quellen, Labels, Mengen und Unsicherheiten selbst.' : lang.code === 'es' ? 'Los datos alimentarios y nutricionales de terceros pueden estar incompletos, desactualizados o ser incorrectos. Revise fuentes, etiquetas, cantidades e incertidumbre.' : lang.code === 'ja' ? '第三者の食品・栄養データは不完全、古い、または誤っている場合があります。ソース、ラベル、数量、不確実性を確認してください。' : 'Third-party food and nutrition data can be incomplete, outdated, or wrong. Review sources, labels, quantities, and uncertainty yourself.') : ''}\n\n## 7. ${l.availability}\n\n${copyFor('availability', lang.code)}\n\n## 8. ${l.warranty}\n\n${l.liability}\n\n## 9. ${l.governing}\n\n${l.govLaw}\n\n${l.dispute}\n\n## 10. ${l.changes}\n\n${l.changesText}\n\n${related(appKey, app, lang.code)}`;
}

function accessibilityDoc(appKey, app, lang) {
  const l = tr[lang.code];
  const title = titleFor(lang.code, l.accessibilityTitle, app.name);
  return `${frontmatter({ title, docId: `${appKey}-accessibility`, docType: l.accessibilityTitle, appName: app.name, lang, permalink: `/${appKey}/accessibility.${lang.code}/`, redirects: docRedirects(appKey, 'accessibility', lang.code) })}\n# ${title}\n\n${l.lastUpdated}: ${l.date}\n\n## ${l.commitment}\n\n${l.accessibilityCommitment(app.name)}\n\n## ${l.conformanceStatus}\n\n${l.conformance}\n\n## ${l.accessibilityFeatures}\n\n${copyFor('accessibilityFeatures', lang.code)}\n\n## ${l.knownLimitations}\n\n${app.limitations[lang.code].map((item) => `- ${item}`).join('\n')}\n\n## ${l.feedbackEnforcement}\n\n${l.feedback}\n\n${copyFor('accessibilityEnforcement', lang.code)}\n\n${related(appKey, app, lang.code)}`;
}

function deletionDoc(appKey, app, lang) {
  const l = tr[lang.code];
  const title = titleFor(lang.code, l.deletionTitle, app.name);
  const inAppControls = app.account
    ? (lang.code === 'de' ? 'Verwenden Sie die Konto-, Datenschutz- oder Einstellungen-Bereiche der App, um Konto-, Export-, Lösch- oder Zustimmungskontrollen aufzurufen.' : lang.code === 'es' ? 'Use las áreas de cuenta, privacidad o ajustes de la app para acceder a controles de cuenta, exportación, eliminación o consentimiento.' : lang.code === 'ja' ? 'アプリ内のアカウント、プライバシー、設定画面から、アカウント、エクスポート、削除、同意管理にアクセスしてください。' : 'Use the app account, privacy, or settings areas to access account, export, deletion, or consent controls.')
    : copyFor('localDeletionControls', lang.code);
  const deletionDetails = app.deletionDetails?.[lang.code];
  return `${frontmatter({ title, docId: `${appKey}-deletion`, docType: l.deletionTitle, appName: app.name, lang, permalink: `/${appKey}/deletion.${lang.code}/`, redirects: docRedirects(appKey, 'deletion', lang.code) })}\n# ${title}\n\n${l.lastUpdated}: ${l.date}\n\n## ${l.primaryMethod}\n\n${app.account ? l.accountDeletion(app.name) : l.localOnlyNoAccount(app.name)}\n\n## ${l.inAppControls}\n\n${inAppControls}${deletionDetails ? `\n\n${deletionDetails}` : ''}\n\n## ${l.manualRequest}\n\n${l.deletionContact}\n\n## ${l.retentionExceptions}\n\n${copyFor('retentionExceptions', lang.code)}\n\n${related(appKey, app, lang.code)}`;
}

function csaeDoc(appKey, app, lang) {
  const l = tr[lang.code];
  const title = titleFor(lang.code, l.csaeTitle, app.name);
  return `${frontmatter({ title, docId: `${appKey}-csae`, docType: l.csaeTitle, appName: app.name, lang, permalink: `/${appKey}/csae.${lang.code}/`, redirects: docRedirects(appKey, 'csae', lang.code) })}\n# ${title}\n\n${l.lastUpdated}: ${l.date}\n\n## ${l.zeroTolerance}\n\n${l.csaeIntro(app.name)}\n\n## ${l.prohibitedConduct}\n\n${lang.code === 'de' ? '- CSAM hochladen, teilen, anfordern, verlinken oder beschreiben.\n- Minderjährige sexuell kontaktieren, groomen, erpressen oder ausbeuten.\n- Gruppen, Chats, Events, Profile, Einladungen oder Anhänge zur Gefährdung von Kindern nutzen.\n- Meldesysteme missbrauchen oder Ermittlungen behindern.' : lang.code === 'es' ? '- Subir, compartir, solicitar, enlazar o describir CSAM.\n- Contactar, preparar, extorsionar o explotar sexualmente a menores.\n- Usar grupos, chats, eventos, perfiles, invitaciones o adjuntos para poner en peligro a menores.\n- Abusar de sistemas de reporte u obstaculizar investigaciones.' : lang.code === 'ja' ? '- CSAMをアップロード、共有、要求、リンク、説明すること。\n- 未成年者に性的に接触、グルーミング、脅迫、搾取すること。\n- グループ、チャット、イベント、プロフィール、招待、添付ファイルを子どもの危険に利用すること。\n- 報告システムを乱用し、調査を妨げること。' : '- Uploading, sharing, requesting, linking to, or describing CSAM.\n- Sexually contacting, grooming, sextorting, trafficking, or exploiting minors.\n- Using groups, chats, events, profiles, invitations, or attachments to endanger children.\n- Abusing reporting systems or interfering with investigations.'}\n\n## ${l.reporting}\n\n${l.csaeReport}\n\n## ${l.enforcement}\n\n${l.csaeEnforce}\n\n## ${l.pointOfContact}\n\n${l.csaeContact}\n\n${related(appKey, app, lang.code, true)}`;
}

function appImpressum(appKey, app, lang) {
  const l = tr[lang.code];
  const title = titleFor(lang.code, l.impressumTitle, app.name);
  const country = lang.code === 'fr' ? 'Allemagne' : 'Germany';
  const emailLabel = lang.code === 'fr' ? 'E-mail' : 'Email';
  const phoneLabel = lang.code === 'fr' ? 'Téléphone' : 'Phone';
  return `${frontmatter({ title, docId: `${appKey}-impressum`, docType: l.impressumTitle, appName: app.name, lang, permalink: `/${appKey}/impressum.${lang.code}/`, redirects: docRedirects(appKey, 'impressum', lang.code) })}\n# ${title}\n\n${l.lastUpdated}: ${l.date}\n\n## ${l.controller}\n\nTimon Polley<br>\nGutenbergstraße 5<br>\n51469 Bergisch Gladbach<br>\n${country}\n\n${emailLabel}: [dev@timonply.com](mailto:dev@timonply.com)<br>\n${phoneLabel}: +49 178 9702884\n\n## ${l.providerInfo}\n\n${copyFor('appProviderInfo', lang.code)}\n\n## ${l.consumerDispute}\n\n${l.dispute}\n\n${related(appKey, app, lang.code)}`;
}

function generalImpressum(lang) {
  const l = tr[lang.code];
  const title = l.impressumTitle;
  return `${frontmatter({ title, docId: 'impressum', docType: l.impressumTitle, appName: 'General', lang, permalink: `/impressum.${lang.code}/`, redirects: generalRedirects('impressum', lang.code) })}\n# ${title}\n\n${l.lastUpdated}: ${l.date}\n\n## ${l.controller}\n\nTimon Polley<br>\nGutenbergstraße 5<br>\n51469 Bergisch Gladbach<br>\nGermany\n\nEmail: [dev@timonply.com](mailto:dev@timonply.com)<br>\nPhone: +49 178 9702884\n\n## ${l.providerInfo}\n\n${lang.code === 'de' ? 'Angaben gemäß § 5 DDG.' : lang.code === 'es' ? 'Información conforme al § 5 DDG.' : lang.code === 'ja' ? 'DDG第5条に基づく情報。' : 'Information in accordance with Section 5 DDG.'}\n\n## ${l.consumerDispute}\n\n${l.dispute}\n\n## ${l.appSpecificNotices}\n\n${Object.entries(apps).map(([key, app]) => `- [${app.name}](https://timonply.com/${key}/impressum.${lang.code}/)`).join('\n')}`;
}

function generateAppDocuments(key, app, lang) {
  file(`${key}/privacy.${lang.code}.md`, privacyDoc(key, app, lang));
  file(`${key}/terms.${lang.code}.md`, termsDoc(key, app, lang));
  file(`${key}/accessibility.${lang.code}.md`, accessibilityDoc(key, app, lang));
  file(`${key}/deletion.${lang.code}.md`, deletionDoc(key, app, lang));
  file(`${key}/impressum.${lang.code}.md`, appImpressum(key, app, lang));
  if (app.csae) file(`${key}/csae.${lang.code}.md`, csaeDoc(key, app, lang));
}

for (const lang of languages) {
  file(`impressum.${lang.code}.md`, generalImpressum(lang));
  for (const [key, app] of Object.entries(apps)) {
    generateAppDocuments(key, app, lang);
  }
}

for (const lang of neonroutineOnlyLanguages) {
  generateAppDocuments('neonroutine', apps.neonroutine, lang);
}

file('flatnest/privacy.md', `---\nlayout: legal\ntitle: "Flatnest Privacy Policy"\ndoc_id: flatnest-privacy-legacy\ndoc_type: "Privacy Policy"\napp_name: "Flatnest"\nlanguage: "English"\nlanguage_code: en\nlanguage_order: 2\npermalink: /flatnest/privacy/\nredirect_to: /flatnest/privacy.en/\n---\n# Flatnest Privacy Policy\n\nThe current English privacy policy is available at [https://timonply.com/flatnest/privacy.en/](https://timonply.com/flatnest/privacy.en/).\n\nUse the language selector there for German, Spanish, and Japanese versions.`);

file('flatnest/terms.md', `---\nlayout: legal\ntitle: "Flatnest Terms of Service"\ndoc_id: flatnest-terms-legacy\ndoc_type: "Terms of Service"\napp_name: "Flatnest"\nlanguage: "English"\nlanguage_code: en\nlanguage_order: 2\npermalink: /flatnest/terms/\nredirect_to: /flatnest/terms.en/\n---\n# Flatnest Terms of Service\n\nThe current English terms are available at [https://timonply.com/flatnest/terms.en/](https://timonply.com/flatnest/terms.en/).\n\nUse the language selector there for German, Spanish, and Japanese versions.`);

file('flatnest/LEGAL_REVIEW_REQUIRED.md', `# Flatnest Legal Review Notes\n\nFlatnest is pre-release. The public legal documents in this repository reflect the current local implementation contracts and must be reviewed again before external launch, store submission, live Firebase activation, paid features, RevenueCat, advertising, analytics, support uploads, or production legal publication.\n\nCurrent canonical routes:\n\n- Privacy: https://timonply.com/flatnest/privacy.en/\n- Terms: https://timonply.com/flatnest/terms.en/\n- Accessibility: https://timonply.com/flatnest/accessibility.en/\n- Deletion and data controls: https://timonply.com/flatnest/deletion.en/\n- CSAE standards: https://timonply.com/flatnest/csae.en/\n- Legal notice: https://timonply.com/flatnest/impressum.en/`);

const matrixLines = [];
matrixLines.push(
  '---',
  'layout: legal',
  'title: "Legal Route Matrix"',
  'doc_id: legal-route-matrix',
  'doc_type: "Route Matrix"',
  'app_name: "Portfolio"',
  'language: "English"',
  'language_code: en',
  'language_order: 2',
  'permalink: /docs/legal-route-matrix/',
  '---',
  '# Legal Route Matrix',
  '',
  `Last updated: ${updated}`,
  '',
  'Canonical public routes for app, store, support, and dashboard configuration. Portfolio language codes: `de`, `en`, `es`, `ja`; NeonRoutine additionally publishes `fr`.',
  '',
);
for (const [key, app] of Object.entries(apps)) {
  const routeLanguages = key === 'neonroutine'
    ? [...languages, ...neonroutineOnlyLanguages]
    : languages;
  matrixLines.push(`## ${app.name}`, '', `Application workspace checked: ${key === 'exactake' ? 'C:\\\\coding\\\\applications\\\\exactake' : key === 'neonroutine' ? 'C:\\\\coding\\\\Flutter-Learning\\\\neon_routine' : `C:\\\\coding\\\\Flutter-Learning\\\\${key}`}`, '', `| Document | ${routeLanguages.map((lang) => lang.code).join(' | ')} |`, `|${[null, ...routeLanguages].map(() => '---').join('|')}|`);
  const docs = ['privacy', 'terms', 'accessibility', 'deletion', 'impressum'];
  if (app.csae) docs.splice(4, 0, 'csae');
  for (const doc of docs) {
    matrixLines.push(`| ${doc} | ${routeLanguages.map((lang) => `[${doc}.${lang.code}](https://timonply.com/${key}/${doc}.${lang.code}/)`).join(' | ')} |`);
  }
  matrixLines.push('');
}
matrixLines.push('## Shared routes', '', '| Route | Purpose |', '|---|---|', '| [https://timonply.com/support.html](https://timonply.com/support.html) | Support, privacy requests, accessibility feedback, and safety reports. |', '| [https://timonply.com/app-ads.txt](https://timonply.com/app-ads.txt) | Authorized seller declaration for Google ad inventory. |', '| [https://timonply.com/impressum.en/](https://timonply.com/impressum.en/) | General legal notice. |');
file('docs/legal-route-matrix.md', matrixLines.join('\n'));

file('docs/regulatory-review.md', `---\nlayout: legal\ntitle: "Regulatory Review Notes"\ndoc_id: regulatory-review\ndoc_type: "Review Notes"\napp_name: "Portfolio"\nlanguage: "English"\nlanguage_code: en\nlanguage_order: 2\npermalink: /docs/regulatory-review/\n---\n# Regulatory Review Notes\n\nLast updated: ${updated}\n\nThis is an engineering compliance checklist, not legal advice or a certification. It records the public sources and repository changes used for the current legal-document update.\n\n## Sources checked\n\n- GDPR Article 13 transparency requirements: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A02016R0679-20160504\n- German DDG provider information, Section 5: https://www.gesetze-im-internet.de/ddg/__5.html\n- German TDDDG terminal-device consent, Section 25: https://www.gesetze-im-internet.de/ttdsg/__25.html\n- Google Play app account deletion requirements: https://support.google.com/googleplay/android-developer/answer/13327111?hl=en\n- Google Play child safety standards policy: https://support.google.com/googleplay/android-developer/answer/9878809?hl=en\n- Google EU User Consent Policy: https://www.google.com/about/company/user-consent-policy/\n- Apple App Privacy Details and privacy links: https://developer.apple.com/app-store/app-privacy-details/\n- Apple App Review broken-link/support/privacy expectation: https://developer.apple.com/distribute/app-review/\n- EU Digital Services Act baseline terms/contact and moderation transparency: https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng\n- European Accessibility Act: https://eur-lex.europa.eu/eli/dir/2019/882/oj/eng\n- EU ODR platform discontinuation as of 20 July 2025: https://consumer-redress.ec.europa.eu/site-relocation_en\n\n## Changes made from this review\n\n- Removed live references to the discontinued EU ODR platform from generated terms and legal notices.\n- Added app-scoped legal notices so app-specific Impressum links resolve.\n- Added web deletion/data-control pages for every app, including no-account local-first apps.\n- Added CSAE standards for apps with social or user-generated-content surfaces: Kalvenda and Flatnest.\n- Added redirect aliases for legacy \`.html\` and \`.md\` app legal links used by current app code.\n- Added route matrix paths for all four languages: German, English, Spanish, and Japanese.\n\n## Remaining legal review points\n\n- Confirm each app-store privacy/data-safety form matches the shipped SDK and feature flags immediately before submission.\n- Confirm production ads and personalized ads remain behind valid consent where required.\n- Confirm Flatnest legal text again before external launch because the app is pre-release and live production services are approval-gated.\n- Confirm any future accounts, cloud sync, remote telemetry, support uploads, paid features, or moderation automation before release.`);

console.log('Generated multilingual legal documents and route matrix.');
