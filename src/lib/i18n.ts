'use client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const LANGUAGES: Record<string, string> = {
  en: 'English', el: 'Ελληνικά', es: 'Español', fr: 'Français', de: 'Deutsch',
  it: 'Italiano', pt: 'Português', ar: 'العربية', zh: '中文', ja: '日本語',
  ru: 'Русский', tr: 'Türkçe', nl: 'Nederlands', pl: 'Polski', sv: 'Svenska',
  ko: '한국어', hi: 'हिन्दी', uk: 'Українська', ro: 'Română', cs: 'Čeština',
};

/* ─── shared sub-objects per language ─────────────────────────────────────── */
const navEn   = { vessels:'Vessel Ops',chat:'AI Agent',compliance:'Compliance',helpdesk:'Helpdesk',analytics:'Analytics',crew:'Crew',maintenance:'Maintenance',dashboard:'Dashboard',health:'Health',audit:'Audit',book:'Book' };
const navEl   = { vessels:'Πλοία',chat:'AI Πράκτορας',compliance:'Συμμόρφωση',helpdesk:'Helpdesk',analytics:'Αναλυτικά',crew:'Πλήρωμα',maintenance:'Συντήρηση',dashboard:'Πίνακας',health:'Υγεία',audit:'Έλεγχος',book:'Κράτηση' };
const navEs   = { vessels:'Operaciones',chat:'Agente AI',compliance:'Cumplimiento',helpdesk:'Soporte',analytics:'Analítica',crew:'Tripulación',maintenance:'Mantenimiento',dashboard:'Panel',health:'Salud',audit:'Auditoría',book:'Reservar' };
const navFr   = { vessels:'Opérations',chat:'Agent AI',compliance:'Conformité',helpdesk:'Support',analytics:'Analytique',crew:'Équipage',maintenance:'Maintenance',dashboard:'Tableau',health:'Santé',audit:'Audit',book:'Réserver' };
const navDe   = { vessels:'Schiffsbetrieb',chat:'KI-Agent',compliance:'Compliance',helpdesk:'Support',analytics:'Analytik',crew:'Besatzung',maintenance:'Wartung',dashboard:'Dashboard',health:'Gesundheit',audit:'Audit',book:'Buchen' };
const navIt   = { vessels:'Operazioni',chat:'Agente AI',compliance:'Conformità',helpdesk:'Supporto',analytics:'Analisi',crew:'Equipaggio',maintenance:'Manutenzione',dashboard:'Dashboard',health:'Salute',audit:'Audit',book:'Prenota' };
const navPt   = { vessels:'Operações',chat:'Agente AI',compliance:'Conformidade',helpdesk:'Suporte',analytics:'Análise',crew:'Tripulação',maintenance:'Manutenção',dashboard:'Painel',health:'Saúde',audit:'Auditoria',book:'Reservar' };
const navAr   = { vessels:'السفن',chat:'وكيل AI',compliance:'الامتثال',helpdesk:'الدعم',analytics:'التحليلات',crew:'الطاقم',maintenance:'الصيانة',dashboard:'لوحة التحكم',health:'الصحة',audit:'التدقيق',book:'حجز' };
const navZh   = { vessels:'船舶运营',chat:'AI客服',compliance:'合规',helpdesk:'帮助台',analytics:'分析',crew:'船员',maintenance:'维护',dashboard:'仪表板',health:'健康',audit:'审计',book:'预订' };
const navJa   = { vessels:'船舶運航',chat:'AIエージェント',compliance:'コンプライアンス',helpdesk:'ヘルプデスク',analytics:'分析',crew:'乗組員',maintenance:'メンテナンス',dashboard:'ダッシュボード',health:'健全性',audit:'監査',book:'予約' };
const navRu   = { vessels:'Суда',chat:'ИИ-агент',compliance:'Соответствие',helpdesk:'Поддержка',analytics:'Аналитика',crew:'Экипаж',maintenance:'Обслуживание',dashboard:'Дашборд',health:'Здоровье',audit:'Аудит',book:'Бронь' };
const navTr   = { vessels:'Gemi Ops',chat:'AI Ajan',compliance:'Uyumluluk',helpdesk:'Destek',analytics:'Analitik',crew:'Mürettebat',maintenance:'Bakım',dashboard:'Gösterge',health:'Sağlık',audit:'Denetim',book:'Rezerve' };
const navNl   = { vessels:'Scheepvaart',chat:'AI-agent',compliance:'Naleving',helpdesk:'Helpdesk',analytics:'Analyse',crew:'Bemanning',maintenance:'Onderhoud',dashboard:'Dashboard',health:'Gezondheid',audit:'Audit',book:'Boeken' };
const navPl   = { vessels:'Operacje',chat:'Agent AI',compliance:'Zgodność',helpdesk:'Wsparcie',analytics:'Analityka',crew:'Załoga',maintenance:'Konserwacja',dashboard:'Panel',health:'Zdrowie',audit:'Audyt',book:'Rezerwuj' };
const navSv   = { vessels:'Fartygsops',chat:'AI-agent',compliance:'Efterlevnad',helpdesk:'Helpdesk',analytics:'Analys',crew:'Besättning',maintenance:'Underhåll',dashboard:'Panel',health:'Hälsa',audit:'Revision',book:'Boka' };
const navKo   = { vessels:'선박 운항',chat:'AI 상담원',compliance:'컴플라이언스',helpdesk:'헬프데스크',analytics:'분석',crew:'승무원',maintenance:'정비',dashboard:'대시보드',health:'건강',audit:'감사',book:'예약' };
const navHi   = { vessels:'जहाज़ संचालन',chat:'AI एजेंट',compliance:'अनुपालन',helpdesk:'हेल्पडेस्क',analytics:'विश्लेषण',crew:'दल',maintenance:'रखरखाव',dashboard:'डैशबोर्ड',health:'स्वास्थ्य',audit:'ऑडिट',book:'बुक' };
const navUk   = { vessels:'Флот',chat:'ІІ-агент',compliance:'Відповідність',helpdesk:'Підтримка',analytics:'Аналітика',crew:'Екіпаж',maintenance:'Обслуговування',dashboard:'Дашборд',health:"Здоров'я",audit:'Аудит',book:'Бронювати' };
const navRo   = { vessels:'Nave',chat:'Agent AI',compliance:'Conformitate',helpdesk:'Asistență',analytics:'Analiză',crew:'Echipaj',maintenance:'Întreținere',dashboard:'Panou',health:'Sănătate',audit:'Audit',book:'Rezervă' };
const navCs   = { vessels:'Lodě',chat:'AI Agent',compliance:'Soulad',helpdesk:'Podpora',analytics:'Analytika',crew:'Posádka',maintenance:'Údržba',dashboard:'Panel',health:'Zdraví',audit:'Audit',book:'Rezervovat' };

const modsEn = {
  book:'Reserve a Ferry',bookDesc:'Book tickets online — instant confirmation',
  vessels:'Vessel Operations',vesselsDesc:'Real-time AIS tracking & delay prediction',
  chat:'AI Customer Agent',chatDesc:'Intelligent assistant in any language',
  compliance:'EU Compliance',complianceDesc:'EU ETS & FuelEU Maritime reports',
  helpdesk:'IT Helpdesk',helpdeskDesc:'AI-triaged tickets & SLA tracking',
  analytics:'Analytics & Insights',analyticsDesc:'Demand forecasting & performance',
  crew:'Crew & Personnel',crewDesc:'Manage seafarers, certifications & leave',
  maintenance:'Fleet Maintenance',maintenanceDesc:'Work orders, PM schedules & inspections',
  dashboard:'Operations Dashboard',dashboardDesc:'Real-time KPIs across all operations',
  health:'System Health',healthDesc:'Monitor API, DB and service uptime',
  audit:'Audit Log',auditDesc:'Compliance trail for all system events',
};
const modsEl = {
  book:'Κράτηση Πορθμείου',bookDesc:'Κλείστε εισιτήριο — άμεση επιβεβαίωση',
  vessels:'Επιχειρήσεις Πλοίων',vesselsDesc:'Παρακολούθηση AIS & πρόβλεψη καθυστερήσεων',
  chat:'AI Εξυπηρέτηση',chatDesc:'Ευφυής βοηθός σε κάθε γλώσσα',
  compliance:'Συμμόρφωση ΕΕ',complianceDesc:'Αναφορές EU ETS & FuelEU Maritime',
  helpdesk:'Helpdesk Πληροφορικής',helpdeskDesc:'Εισιτήρια με AI & παρακολούθηση SLA',
  analytics:'Αναλυτικά',analyticsDesc:'Πρόβλεψη ζήτησης & απόδοση',
  crew:'Πλήρωμα & Προσωπικό',crewDesc:'Διαχείριση ναυτικών, πιστοποιήσεων & αδειών',
  maintenance:'Συντήρηση Στόλου',maintenanceDesc:'Εντολές εργασίας, ΠΣ & επιθεωρήσεις',
  dashboard:'Πίνακας Επιχειρήσεων',dashboardDesc:'KPI σε πραγματικό χρόνο',
  health:'Υγεία Συστήματος',healthDesc:'Παρακολούθηση API, DB & υπηρεσιών',
  audit:'Αρχείο Ελέγχου',auditDesc:'Ίχνος συμμόρφωσης για όλα τα συμβάντα',
};
const modsEs = {
  book:'Reservar un Ferry',bookDesc:'Compra entradas en línea — confirmación instantánea',
  vessels:'Operaciones de Buques',vesselsDesc:'Seguimiento AIS en tiempo real & predicción de retrasos',
  chat:'Agente AI Cliente',chatDesc:'Asistente inteligente en cualquier idioma',
  compliance:'Cumplimiento UE',complianceDesc:'Informes EU ETS & FuelEU Maritime',
  helpdesk:'Soporte IT',helpdeskDesc:'Tickets gestionados por AI & seguimiento SLA',
  analytics:'Análisis e Insights',analyticsDesc:'Pronóstico de demanda & rendimiento',
  crew:'Tripulación & Personal',crewDesc:'Gestión de marinos, certificaciones & licencias',
  maintenance:'Mantenimiento de Flota',maintenanceDesc:'Órdenes de trabajo, PM & inspecciones',
  dashboard:'Panel de Operaciones',dashboardDesc:'KPIs en tiempo real de todas las operaciones',
  health:'Salud del Sistema',healthDesc:'Monitoreo de API, DB y tiempo de actividad',
  audit:'Registro de Auditoría',auditDesc:'Rastro de cumplimiento de todos los eventos',
};
const modsFr = {
  book:'Réserver un Ferry',bookDesc:'Achetez en ligne — confirmation instantanée',
  vessels:'Opérations Navires',vesselsDesc:'Suivi AIS temps réel & prédiction retards',
  chat:'Agent AI Client',chatDesc:'Assistant intelligent dans toutes les langues',
  compliance:'Conformité UE',complianceDesc:'Rapports EU ETS & FuelEU Maritime',
  helpdesk:'Support IT',helpdeskDesc:'Tickets triés par AI & suivi SLA',
  analytics:'Analytique & Insights',analyticsDesc:'Prévision de la demande & performance',
  crew:'Équipage & Personnel',crewDesc:'Gestion des marins, certifications & congés',
  maintenance:'Maintenance Flotte',maintenanceDesc:'Ordres de travail, PM & inspections',
  dashboard:'Tableau de Bord',dashboardDesc:'KPIs temps réel de toutes les opérations',
  health:'Santé Système',healthDesc:"Surveillance API, DB et disponibilité des services",
  audit:'Journal d\'Audit',auditDesc:'Piste de conformité pour tous les événements',
};
const modsDe = {
  book:'Fähre Buchen',bookDesc:'Online buchen — sofortige Bestätigung',
  vessels:'Schiffsbetrieb',vesselsDesc:'Echtzeit-AIS-Tracking & Verspätungsvorhersage',
  chat:'KI-Kundenagent',chatDesc:'Intelligenter Assistent in jeder Sprache',
  compliance:'EU-Compliance',complianceDesc:'EU-ETS & FuelEU Maritime Berichte',
  helpdesk:'IT-Helpdesk',helpdeskDesc:'KI-priorisierte Tickets & SLA-Verfolgung',
  analytics:'Analytik & Insights',analyticsDesc:'Nachfrageprognose & Leistung',
  crew:'Besatzung & Personal',crewDesc:'Verwaltung von Seeleuten, Zertifikaten & Urlaub',
  maintenance:'Flottenwartung',maintenanceDesc:'Arbeitsaufträge, WP-Pläne & Inspektionen',
  dashboard:'Betriebsdashboard',dashboardDesc:'Echtzeit-KPIs über alle Betriebe',
  health:'Systemgesundheit',healthDesc:'API, DB und Dienstverfügbarkeit überwachen',
  audit:'Auditprotokoll',auditDesc:'Compliance-Pfad für alle Systemereignisse',
};
// For brevity, other languages use English modules with fallback — fallbackLng handles this.
// Core languages (it/pt/ar/zh/ja/ru/tr/nl/pl/sv/ko/hi/uk/ro/cs) get nav translations above.

/* ─── employees namespace ──────────────────────────────────────────────────── */
const empEn = {
  title:'Crew & Personnel',addCrew:'Add Crew',requestLeave:'Request Leave',
  searchCrew:'Search crew...',allDepts:'All Departments',allStatus:'All Status',allTypes:'All Types',
  totalCrew:'Total Crew',active:'Active',onLeave:'On Leave',docsExpiring:'Docs Expiring',
  personnel:'Personnel',leaveRequests:'Leave Requests',organisation:'Organisation',
  newCrew:'New Crew Member',firstName:'First name',lastName:'Last name',
  email:'Email',phone:'Phone',department:'Department',jobTitle:'Job title',
  employmentType:'Employment type',hireDate:'Hire date',contractEnd:'Contract end',
  stcwExpiry:'STCW Expiry',medicalExpiry:'Medical Expiry',addCrewMember:'Add Crew Member',
  docExpired:'Doc Expired',expiringSoon:'Expiring Soon',reportsTo:'Reports to',
  hired:'Hired',contractEnds:'Contract ends',markOnLeave:'Mark On Leave',
  markActive:'Mark Active',terminate:'Terminate',edit:'Edit',save:'Save',cancel:'Cancel',
  delete:'Delete',noCrewFound:'No crew members found.',approve:'Approve',reject:'Reject',
  reason:'Reason',reviewedBy:'Reviewed by',leaveType:'Leave type',startDate:'Start date',
  endDate:'End date',days:'days',submitRequest:'Submit Request',employeeName:'Employee name',
  noLeaveFound:'No leave requests found.',members:'member',membersPlural:'members',
  aiAssessment:'AI Assessment',deleteConfirm:'Delete this employee record? This cannot be undone.',
  editEmployee:'Edit Employee',stcwCert:'STCW Certificate',medicalCert:'Medical Certificate',
  expired:'EXPIRED',expiredSoon:'Expiring soon',
};
const empEl = {
  title:'Πλήρωμα & Προσωπικό',addCrew:'Προσθήκη',requestLeave:'Αίτηση Αδείας',
  searchCrew:'Αναζήτηση...',allDepts:'Όλα τα Τμήματα',allStatus:'Όλες οι Καταστάσεις',allTypes:'Όλοι οι Τύποι',
  totalCrew:'Σύνολο',active:'Ενεργό',onLeave:'Σε Άδεια',docsExpiring:'Λήγοντα Έγγραφα',
  personnel:'Προσωπικό',leaveRequests:'Αιτήσεις Αδείας',organisation:'Οργανόγραμμα',
  newCrew:'Νέο Μέλος',firstName:'Όνομα',lastName:'Επώνυμο',
  email:'Email',phone:'Τηλέφωνο',department:'Τμήμα',jobTitle:'Θέση',
  employmentType:'Τύπος',hireDate:'Πρόσληψη',contractEnd:'Λήξη Σύμβασης',
  stcwExpiry:'Λήξη STCW',medicalExpiry:'Λήξη Ιατρικού',addCrewMember:'Προσθήκη Μέλους',
  docExpired:'Ληγμένο',expiringSoon:'Λήγει Σύντομα',reportsTo:'Αναφέρεται σε',
  hired:'Πρόσληψη',contractEnds:'Λήξη Σύμβασης',markOnLeave:'Σε Άδεια',
  markActive:'Ενεργό',terminate:'Τερματισμός',edit:'Επεξεργασία',save:'Αποθήκευση',cancel:'Ακύρωση',
  delete:'Διαγραφή',noCrewFound:'Δεν βρέθηκαν μέλη.',approve:'Έγκριση',reject:'Απόρριψη',
  reason:'Αιτία',reviewedBy:'Εγκρίθηκε από',leaveType:'Τύπος Αδείας',startDate:'Έναρξη',
  endDate:'Λήξη',days:'ημέρες',submitRequest:'Υποβολή',employeeName:'Όνομα Υπαλλήλου',
  noLeaveFound:'Δεν βρέθηκαν αιτήσεις.',members:'μέλος',membersPlural:'μέλη',
  aiAssessment:'Αξιολόγηση AI',deleteConfirm:'Διαγραφή εγγραφής; Δεν μπορεί να αναιρεθεί.',
  editEmployee:'Επεξεργασία',stcwCert:'Πιστοποιητικό STCW',medicalCert:'Ιατρικό Πιστοποιητικό',
  expired:'ΛΗΞΕΙ',expiredSoon:'Λήγει σύντομα',
};
const empEs = {
  title:'Tripulación & Personal',addCrew:'Añadir',requestLeave:'Solicitar Permiso',
  searchCrew:'Buscar tripulación...',allDepts:'Todos los Deptos.',allStatus:'Todos los Estados',allTypes:'Todos los Tipos',
  totalCrew:'Total Tripulación',active:'Activo',onLeave:'De Permiso',docsExpiring:'Docs. por Vencer',
  personnel:'Personal',leaveRequests:'Solicitudes de Permiso',organisation:'Organización',
  newCrew:'Nuevo Tripulante',firstName:'Nombre',lastName:'Apellido',
  email:'Email',phone:'Teléfono',department:'Departamento',jobTitle:'Cargo',
  employmentType:'Tipo de empleo',hireDate:'Fecha de contratación',contractEnd:'Fin de contrato',
  stcwExpiry:'Venc. STCW',medicalExpiry:'Venc. Médico',addCrewMember:'Añadir Tripulante',
  docExpired:'Doc. Vencido',expiringSoon:'Por Vencer',reportsTo:'Reporta a',
  hired:'Contratado',contractEnds:'Contrato vence',markOnLeave:'Marcar de Permiso',
  markActive:'Marcar Activo',terminate:'Terminar',edit:'Editar',save:'Guardar',cancel:'Cancelar',
  delete:'Eliminar',noCrewFound:'No se encontró tripulación.',approve:'Aprobar',reject:'Rechazar',
  reason:'Motivo',reviewedBy:'Revisado por',leaveType:'Tipo de permiso',startDate:'Inicio',
  endDate:'Fin',days:'días',submitRequest:'Enviar Solicitud',employeeName:'Nombre del empleado',
  noLeaveFound:'No hay solicitudes.',members:'miembro',membersPlural:'miembros',
  aiAssessment:'Evaluación AI',deleteConfirm:'¿Eliminar este registro? No se puede deshacer.',
  editEmployee:'Editar Empleado',stcwCert:'Certificado STCW',medicalCert:'Certificado Médico',
  expired:'VENCIDO',expiredSoon:'Por vencer',
};
const empFr = {
  title:'Équipage & Personnel',addCrew:'Ajouter',requestLeave:'Demander un Congé',
  searchCrew:'Rechercher...',allDepts:'Tous les Depts.',allStatus:'Tous les Statuts',allTypes:'Tous les Types',
  totalCrew:'Total Équipage',active:'Actif',onLeave:'En Congé',docsExpiring:'Docs à Expirer',
  personnel:'Personnel',leaveRequests:'Demandes de Congé',organisation:'Organisation',
  newCrew:'Nouveau Membre',firstName:'Prénom',lastName:'Nom',
  email:'Email',phone:'Téléphone',department:'Département',jobTitle:'Poste',
  employmentType:'Type d\'emploi',hireDate:'Date d\'embauche',contractEnd:'Fin de contrat',
  stcwExpiry:'Exp. STCW',medicalExpiry:'Exp. Médical',addCrewMember:'Ajouter Membre',
  docExpired:'Doc Expiré',expiringSoon:'Bientôt Expiré',reportsTo:'Rapporte à',
  hired:'Embauché',contractEnds:'Fin de contrat',markOnLeave:'Marquer en Congé',
  markActive:'Marquer Actif',terminate:'Licencier',edit:'Modifier',save:'Enregistrer',cancel:'Annuler',
  delete:'Supprimer',noCrewFound:'Aucun membre trouvé.',approve:'Approuver',reject:'Rejeter',
  reason:'Motif',reviewedBy:'Examiné par',leaveType:'Type de congé',startDate:'Début',
  endDate:'Fin',days:'jours',submitRequest:'Soumettre',employeeName:'Nom de l\'employé',
  noLeaveFound:'Aucune demande trouvée.',members:'membre',membersPlural:'membres',
  aiAssessment:'Évaluation AI',deleteConfirm:'Supprimer cet enregistrement ? Irréversible.',
  editEmployee:'Modifier Employé',stcwCert:'Certificat STCW',medicalCert:'Certificat Médical',
  expired:'EXPIRÉ',expiredSoon:'Bientôt expiré',
};
const empDe = {
  title:'Besatzung & Personal',addCrew:'Hinzufügen',requestLeave:'Urlaub beantragen',
  searchCrew:'Suche...',allDepts:'Alle Abteilungen',allStatus:'Alle Status',allTypes:'Alle Typen',
  totalCrew:'Gesamte Besatzung',active:'Aktiv',onLeave:'Im Urlaub',docsExpiring:'Ablaufende Dokumente',
  personnel:'Personal',leaveRequests:'Urlaubsanträge',organisation:'Organisation',
  newCrew:'Neues Besatzungsmitglied',firstName:'Vorname',lastName:'Nachname',
  email:'E-Mail',phone:'Telefon',department:'Abteilung',jobTitle:'Stellenbezeichnung',
  employmentType:'Beschäftigungsart',hireDate:'Einstellungsdatum',contractEnd:'Vertragsende',
  stcwExpiry:'STCW-Ablauf',medicalExpiry:'Med. Ablauf',addCrewMember:'Mitglied hinzufügen',
  docExpired:'Dok. abgelaufen',expiringSoon:'Läuft bald ab',reportsTo:'Berichtet an',
  hired:'Eingestellt',contractEnds:'Vertrag endet',markOnLeave:'Als im Urlaub markieren',
  markActive:'Als aktiv markieren',terminate:'Beenden',edit:'Bearbeiten',save:'Speichern',cancel:'Abbrechen',
  delete:'Löschen',noCrewFound:'Keine Besatzungsmitglieder gefunden.',approve:'Genehmigen',reject:'Ablehnen',
  reason:'Grund',reviewedBy:'Überprüft von',leaveType:'Urlaubsart',startDate:'Startdatum',
  endDate:'Enddatum',days:'Tage',submitRequest:'Antrag senden',employeeName:'Mitarbeitername',
  noLeaveFound:'Keine Anträge gefunden.',members:'Mitglied',membersPlural:'Mitglieder',
  aiAssessment:'KI-Bewertung',deleteConfirm:'Datensatz löschen? Dies kann nicht rückgängig gemacht werden.',
  editEmployee:'Mitarbeiter bearbeiten',stcwCert:'STCW-Zertifikat',medicalCert:'Medizinisches Zertifikat',
  expired:'ABGELAUFEN',expiredSoon:'Läuft bald ab',
};
// Remaining languages share English employees keys via fallbackLng
const empIt = { title:'Equipaggio & Personale',addCrew:'Aggiungi',requestLeave:'Richiedi Ferie',searchCrew:'Cerca...',allDepts:'Tutti i Reparti',allStatus:'Tutti gli Stati',allTypes:'Tutti i Tipi',totalCrew:'Totale Equipaggio',active:'Attivo',onLeave:'In Ferie',docsExpiring:'Documenti in Scadenza',personnel:'Personale',leaveRequests:'Richieste Ferie',organisation:'Organizzazione',newCrew:'Nuovo Membro',firstName:'Nome',lastName:'Cognome',email:'Email',phone:'Telefono',department:'Reparto',jobTitle:'Titolo',employmentType:'Tipo impiego',hireDate:'Data assunzione',contractEnd:'Fine contratto',stcwExpiry:'Scad. STCW',medicalExpiry:'Scad. Medico',addCrewMember:'Aggiungi Membro',docExpired:'Doc Scaduto',expiringSoon:'In Scadenza',reportsTo:'Riporta a',hired:'Assunto',contractEnds:'Contratto scade',markOnLeave:'Segna In Ferie',markActive:'Segna Attivo',terminate:'Termina',edit:'Modifica',save:'Salva',cancel:'Annulla',delete:'Elimina',noCrewFound:'Nessun membro trovato.',approve:'Approva',reject:'Rifiuta',reason:'Motivo',reviewedBy:'Esaminato da',leaveType:'Tipo ferie',startDate:'Inizio',endDate:'Fine',days:'giorni',submitRequest:'Invia Richiesta',employeeName:'Nome dipendente',noLeaveFound:'Nessuna richiesta trovata.',members:'membro',membersPlural:'membri',aiAssessment:'Valutazione AI',deleteConfirm:'Eliminare questo record? Non può essere annullato.',editEmployee:'Modifica Dipendente',stcwCert:'Certificato STCW',medicalCert:'Certificato Medico',expired:'SCADUTO',expiredSoon:'In scadenza' };
const empPt = { title:'Tripulação & Pessoal',addCrew:'Adicionar',requestLeave:'Solicitar Licença',searchCrew:'Pesquisar...',allDepts:'Todos os Deptos.',allStatus:'Todos os Status',allTypes:'Todos os Tipos',totalCrew:'Total da Tripulação',active:'Ativo',onLeave:'De Licença',docsExpiring:'Docs a Vencer',personnel:'Pessoal',leaveRequests:'Pedidos de Licença',organisation:'Organização',newCrew:'Novo Tripulante',firstName:'Nome',lastName:'Sobrenome',email:'Email',phone:'Telefone',department:'Departamento',jobTitle:'Cargo',employmentType:'Tipo de emprego',hireDate:'Data de contratação',contractEnd:'Fim do contrato',stcwExpiry:'Venc. STCW',medicalExpiry:'Venc. Médico',addCrewMember:'Adicionar Tripulante',docExpired:'Doc Vencido',expiringSoon:'A Vencer',reportsTo:'Reporta a',hired:'Contratado',contractEnds:'Contrato vence',markOnLeave:'Marcar de Licença',markActive:'Marcar Ativo',terminate:'Encerrar',edit:'Editar',save:'Salvar',cancel:'Cancelar',delete:'Excluir',noCrewFound:'Nenhum membro encontrado.',approve:'Aprovar',reject:'Rejeitar',reason:'Motivo',reviewedBy:'Revisado por',leaveType:'Tipo de licença',startDate:'Início',endDate:'Fim',days:'dias',submitRequest:'Enviar Pedido',employeeName:'Nome do funcionário',noLeaveFound:'Nenhum pedido encontrado.',members:'membro',membersPlural:'membros',aiAssessment:'Avaliação AI',deleteConfirm:'Excluir este registo? Não pode ser desfeito.',editEmployee:'Editar Funcionário',stcwCert:'Certificado STCW',medicalCert:'Certificado Médico',expired:'VENCIDO',expiredSoon:'A vencer' };
const empAr = { title:'الطاقم والموظفون',addCrew:'إضافة',requestLeave:'طلب إجازة',searchCrew:'البحث...',allDepts:'جميع الأقسام',allStatus:'جميع الحالات',allTypes:'جميع الأنواع',totalCrew:'إجمالي الطاقم',active:'نشط',onLeave:'في إجازة',docsExpiring:'وثائق منتهية الصلاحية',personnel:'الموظفون',leaveRequests:'طلبات الإجازة',organisation:'التنظيم',newCrew:'عضو طاقم جديد',firstName:'الاسم الأول',lastName:'اسم العائلة',email:'البريد الإلكتروني',phone:'الهاتف',department:'القسم',jobTitle:'المسمى الوظيفي',employmentType:'نوع التوظيف',hireDate:'تاريخ التوظيف',contractEnd:'نهاية العقد',stcwExpiry:'انتهاء STCW',medicalExpiry:'انتهاء الطبي',addCrewMember:'إضافة عضو',docExpired:'وثيقة منتهية',expiringSoon:'تنتهي قريباً',reportsTo:'يرفع تقارير إلى',hired:'تاريخ التعيين',contractEnds:'ينتهي العقد',markOnLeave:'تحديد في إجازة',markActive:'تحديد نشط',terminate:'إنهاء',edit:'تعديل',save:'حفظ',cancel:'إلغاء',delete:'حذف',noCrewFound:'لم يتم العثور على أعضاء.',approve:'موافقة',reject:'رفض',reason:'السبب',reviewedBy:'راجعه',leaveType:'نوع الإجازة',startDate:'تاريخ البدء',endDate:'تاريخ الانتهاء',days:'أيام',submitRequest:'إرسال الطلب',employeeName:'اسم الموظف',noLeaveFound:'لا توجد طلبات.',members:'عضو',membersPlural:'أعضاء',aiAssessment:'تقييم AI',deleteConfirm:'حذف هذا السجل؟ لا يمكن التراجع.',editEmployee:'تعديل الموظف',stcwCert:'شهادة STCW',medicalCert:'الشهادة الطبية',expired:'منتهي',expiredSoon:'تنتهي قريباً' };
const empZh = { title:'船员与人员',addCrew:'添加',requestLeave:'申请休假',searchCrew:'搜索船员...',allDepts:'所有部门',allStatus:'所有状态',allTypes:'所有类型',totalCrew:'船员总数',active:'在职',onLeave:'休假中',docsExpiring:'证件即将到期',personnel:'人员',leaveRequests:'休假申请',organisation:'组织架构',newCrew:'新船员',firstName:'名',lastName:'姓',email:'邮箱',phone:'电话',department:'部门',jobTitle:'职位',employmentType:'雇用类型',hireDate:'入职日期',contractEnd:'合同到期',stcwExpiry:'STCW到期',medicalExpiry:'体检到期',addCrewMember:'添加船员',docExpired:'证件过期',expiringSoon:'即将过期',reportsTo:'汇报给',hired:'入职',contractEnds:'合同到期',markOnLeave:'标记休假',markActive:'标记在职',terminate:'终止',edit:'编辑',save:'保存',cancel:'取消',delete:'删除',noCrewFound:'未找到船员。',approve:'批准',reject:'拒绝',reason:'原因',reviewedBy:'审核人',leaveType:'休假类型',startDate:'开始日期',endDate:'结束日期',days:'天',submitRequest:'提交申请',employeeName:'员工姓名',noLeaveFound:'未找到申请。',members:'名',membersPlural:'名成员',aiAssessment:'AI评估',deleteConfirm:'删除此员工记录？此操作无法撤销。',editEmployee:'编辑员工',stcwCert:'STCW证书',medicalCert:'医疗证书',expired:'已过期',expiredSoon:'即将过期' };
const empJa = { title:'乗組員と人員',addCrew:'追加',requestLeave:'休暇申請',searchCrew:'検索...',allDepts:'全部署',allStatus:'全ステータス',allTypes:'全タイプ',totalCrew:'乗組員総数',active:'在籍中',onLeave:'休暇中',docsExpiring:'期限切れ間近の書類',personnel:'人員',leaveRequests:'休暇申請一覧',organisation:'組織図',newCrew:'新規乗組員',firstName:'名',lastName:'姓',email:'メール',phone:'電話',department:'部署',jobTitle:'職種',employmentType:'雇用形態',hireDate:'入社日',contractEnd:'契約終了',stcwExpiry:'STCW有効期限',medicalExpiry:'健康診断有効期限',addCrewMember:'乗組員追加',docExpired:'書類失効',expiringSoon:'期限切れ間近',reportsTo:'直属上司',hired:'入社',contractEnds:'契約終了',markOnLeave:'休暇中に設定',markActive:'在籍中に設定',terminate:'契約終了',edit:'編集',save:'保存',cancel:'キャンセル',delete:'削除',noCrewFound:'乗組員が見つかりません。',approve:'承認',reject:'却下',reason:'理由',reviewedBy:'承認者',leaveType:'休暇種別',startDate:'開始日',endDate:'終了日',days:'日',submitRequest:'申請する',employeeName:'従業員名',noLeaveFound:'申請が見つかりません。',members:'名',membersPlural:'名のメンバー',aiAssessment:'AI評価',deleteConfirm:'この従業員記録を削除しますか？取り消せません。',editEmployee:'従業員を編集',stcwCert:'STCW証明書',medicalCert:'健康診断書',expired:'失効',expiredSoon:'期限切れ間近' };
const empRu = { title:'Экипаж и персонал',addCrew:'Добавить',requestLeave:'Запросить отпуск',searchCrew:'Поиск...',allDepts:'Все отделы',allStatus:'Все статусы',allTypes:'Все типы',totalCrew:'Всего экипажа',active:'Активен',onLeave:'В отпуске',docsExpiring:'Истекающие документы',personnel:'Персонал',leaveRequests:'Заявки на отпуск',organisation:'Организация',newCrew:'Новый член экипажа',firstName:'Имя',lastName:'Фамилия',email:'Email',phone:'Телефон',department:'Отдел',jobTitle:'Должность',employmentType:'Тип занятости',hireDate:'Дата найма',contractEnd:'Конец контракта',stcwExpiry:'Истечение STCW',medicalExpiry:'Истечение мед. справки',addCrewMember:'Добавить члена',docExpired:'Документ истёк',expiringSoon:'Скоро истечёт',reportsTo:'Подчиняется',hired:'Нанят',contractEnds:'Контракт истекает',markOnLeave:'Отметить в отпуске',markActive:'Отметить активным',terminate:'Уволить',edit:'Изменить',save:'Сохранить',cancel:'Отмена',delete:'Удалить',noCrewFound:'Члены экипажа не найдены.',approve:'Утвердить',reject:'Отклонить',reason:'Причина',reviewedBy:'Проверено',leaveType:'Тип отпуска',startDate:'Дата начала',endDate:'Дата окончания',days:'дней',submitRequest:'Подать заявку',employeeName:'ФИО сотрудника',noLeaveFound:'Заявок не найдено.',members:'сотрудник',membersPlural:'сотрудников',aiAssessment:'Оценка ИИ',deleteConfirm:'Удалить запись сотрудника? Это необратимо.',editEmployee:'Редактировать сотрудника',stcwCert:'Сертификат STCW',medicalCert:'Медицинская справка',expired:'ИСТЁК',expiredSoon:'Скоро истечёт' };
const empTr = { title:'Mürettebat ve Personel',addCrew:'Ekle',requestLeave:'İzin Talep Et',searchCrew:'Ara...',allDepts:'Tüm Departmanlar',allStatus:'Tüm Durumlar',allTypes:'Tüm Tipler',totalCrew:'Toplam Mürettebat',active:'Aktif',onLeave:'İzinde',docsExpiring:'Süresi Dolmak Üzere',personnel:'Personel',leaveRequests:'İzin Talepleri',organisation:'Organizasyon',newCrew:'Yeni Üye',firstName:'Ad',lastName:'Soyad',email:'E-posta',phone:'Telefon',department:'Departman',jobTitle:'Unvan',employmentType:'İstihdam türü',hireDate:'İşe başlama',contractEnd:'Sözleşme sonu',stcwExpiry:'STCW Bitiş',medicalExpiry:'Sağlık Bitiş',addCrewMember:'Üye Ekle',docExpired:'Belge Süresi Doldu',expiringSoon:'Yakında Doluyor',reportsTo:'Bağlı olduğu kişi',hired:'İşe alındı',contractEnds:'Sözleşme bitiyor',markOnLeave:'İzinde Olarak İşaretle',markActive:'Aktif Olarak İşaretle',terminate:'Sözleşmeyi Feshet',edit:'Düzenle',save:'Kaydet',cancel:'İptal',delete:'Sil',noCrewFound:'Mürettebat bulunamadı.',approve:'Onayla',reject:'Reddet',reason:'Neden',reviewedBy:'Değerlendiren',leaveType:'İzin türü',startDate:'Başlangıç',endDate:'Bitiş',days:'gün',submitRequest:'Talep Gönder',employeeName:'Çalışan adı',noLeaveFound:'Talep bulunamadı.',members:'üye',membersPlural:'üyeler',aiAssessment:'AI Değerlendirmesi',deleteConfirm:'Bu kaydı silmek istiyor musunuz? Geri alınamaz.',editEmployee:'Çalışanı Düzenle',stcwCert:'STCW Sertifikası',medicalCert:'Sağlık Sertifikası',expired:'SÜRESİ DOLDU',expiredSoon:'Yakında doluyor' };
const empNl = { title:'Bemanning & Personeel',addCrew:'Toevoegen',requestLeave:'Verlof aanvragen',searchCrew:'Zoeken...',allDepts:'Alle afdelingen',allStatus:'Alle statussen',allTypes:'Alle typen',totalCrew:'Totale bemanning',active:'Actief',onLeave:'Met verlof',docsExpiring:'Documenten verlopen',personnel:'Personeel',leaveRequests:'Verlofaanvragen',organisation:'Organisatie',newCrew:'Nieuw bemanningslid',firstName:'Voornaam',lastName:'Achternaam',email:'E-mail',phone:'Telefoon',department:'Afdeling',jobTitle:'Functie',employmentType:'Dienstverband',hireDate:'Indiensttreding',contractEnd:'Einde contract',stcwExpiry:'STCW verloopdatum',medicalExpiry:'Med. verloopdatum',addCrewMember:'Lid toevoegen',docExpired:'Doc verlopen',expiringSoon:'Verloopt binnenkort',reportsTo:'Rapporteert aan',hired:'In dienst',contractEnds:'Contract loopt af',markOnLeave:'Markeer met verlof',markActive:'Markeer actief',terminate:'Beëindigen',edit:'Bewerken',save:'Opslaan',cancel:'Annuleren',delete:'Verwijderen',noCrewFound:'Geen bemanningsleden gevonden.',approve:'Goedkeuren',reject:'Afwijzen',reason:'Reden',reviewedBy:'Beoordeeld door',leaveType:'Verloftype',startDate:'Startdatum',endDate:'Einddatum',days:'dagen',submitRequest:'Aanvraag indienen',employeeName:'Naam werknemer',noLeaveFound:'Geen aanvragen gevonden.',members:'lid',membersPlural:'leden',aiAssessment:'AI-beoordeling',deleteConfirm:'Werknemersdossier verwijderen? Dit kan niet ongedaan worden gemaakt.',editEmployee:'Werknemer bewerken',stcwCert:'STCW-certificaat',medicalCert:'Medisch certificaat',expired:'VERLOPEN',expiredSoon:'Verloopt binnenkort' };

/* ─── maintenance namespace ────────────────────────────────────────────────── */
const mntEn = {
  title:'Fleet Maintenance',workOrders:'Work Orders',pmSchedule:'PM Schedule',
  fleetAssets:'Fleet Assets',partsInventory:'Parts Inventory',inspections:'Inspections',fuelLog:'Fuel Log',
  openOrders:'Open Work Orders',criticalPriority:'Critical Priority',offline:'Assets Off-Line',lowStock:'Low Stock Parts',
  newOrder:'New Work Order',newSchedule:'New Schedule',newAsset:'New Asset',
  newPart:'New Part',newInspection:'New Inspection',newFuelLog:'New Fuel Entry',
  markInProgress:'Mark In Progress',markCompleted:'Mark Completed',defer:'Defer',
  aiPriority:'AI Priority Note',allStatus:'All Status',allPriority:'All Priority',allAssets:'All Assets',
  overdue:'OVERDUE',dueIn:'Due in',days:'days',lastDone:'Last done',nextDue:'Next due',
  vessel:'Vessel',location:'Location',assignedTo:'Assigned to',
  partsCost:'Parts Cost',labourCost:'Labour Cost',totalCost:'Total Cost',
  qty:'Qty',minQty:'Min Qty',lowStockBadge:'LOW STOCK',adjustStock:'Adjust Stock',
  totalMT:'Total MT',avgPerMT:'Avg €/MT',fuelType:'Fuel Type',
  quantity:'Quantity (MT)',costPerMT:'Cost/MT (€)',supplier:'Supplier',port:'Port',
  defects:'Defects',correctiveActions:'Corrective Actions',inspector:'Inspector',
  inspectionDate:'Inspection Date',noOrdersFound:'No work orders found.',noInspections:'No inspections found.',submit:'Submit',
};
const mntEl = { title:'Συντήρηση Στόλου',workOrders:'Εντολές Εργασίας',pmSchedule:'Πρόγραμμα ΠΣ',fleetAssets:'Στοιχεία Στόλου',partsInventory:'Αποθήκη Ανταλλακτικών',inspections:'Επιθεωρήσεις',fuelLog:'Κατανάλωση Καυσίμων',openOrders:'Ανοιχτές Εντολές',criticalPriority:'Κρίσιμη Προτεραιότητα',offline:'Εκτός Λειτουργίας',lowStock:'Χαμηλό Απόθεμα',newOrder:'Νέα Εντολή',newSchedule:'Νέο Πρόγραμμα',newAsset:'Νέο Στοιχείο',newPart:'Νέο Ανταλλακτικό',newInspection:'Νέα Επιθεώρηση',newFuelLog:'Νέα Εγγραφή Καυσίμου',markInProgress:'Σε Εξέλιξη',markCompleted:'Ολοκληρώθηκε',defer:'Αναβολή',aiPriority:'Σημείωση AI',allStatus:'Όλες Καταστάσεις',allPriority:'Όλες Προτεραιότητες',allAssets:'Όλα Στοιχεία',overdue:'ΕΚΠΡΟΘΕΣΜΟ',dueIn:'Λήγει σε',days:'ημέρες',lastDone:'Τελευταία φορά',nextDue:'Επόμενη',vessel:'Πλοίο',location:'Τοποθεσία',assignedTo:'Ανατέθηκε σε',partsCost:'Κόστος Ανταλλακτικών',labourCost:'Κόστος Εργασίας',totalCost:'Συνολικό Κόστος',qty:'Ποσ.',minQty:'Ελάχ.',lowStockBadge:'ΧΑΜΗΛΟ ΑΠΟΘΕΜΑ',adjustStock:'Ρύθμιση Αποθέματος',totalMT:'Σύνολο MT',avgPerMT:'Μέσο €/MT',fuelType:'Τύπος Καυσίμου',quantity:'Ποσότητα (MT)',costPerMT:'Κόστος/MT (€)',supplier:'Προμηθευτής',port:'Λιμάνι',defects:'Ελαττώματα',correctiveActions:'Διορθωτικές Ενέργειες',inspector:'Επιθεωρητής',inspectionDate:'Ημ/νία Επιθεώρησης',noOrdersFound:'Δεν βρέθηκαν εντολές.',noInspections:'Δεν βρέθηκαν επιθεωρήσεις.',submit:'Υποβολή' };
const mntEs = { title:'Mantenimiento de Flota',workOrders:'Órdenes de Trabajo',pmSchedule:'Programa PM',fleetAssets:'Activos de Flota',partsInventory:'Inventario de Piezas',inspections:'Inspecciones',fuelLog:'Registro de Combustible',openOrders:'Órdenes Abiertas',criticalPriority:'Prioridad Crítica',offline:'Activos Fuera de Línea',lowStock:'Stock Bajo',newOrder:'Nueva Orden',newSchedule:'Nuevo Programa',newAsset:'Nuevo Activo',newPart:'Nueva Pieza',newInspection:'Nueva Inspección',newFuelLog:'Nueva Entrada de Combustible',markInProgress:'Marcar En Progreso',markCompleted:'Marcar Completado',defer:'Aplazar',aiPriority:'Nota AI',allStatus:'Todos los Estados',allPriority:'Todas las Prioridades',allAssets:'Todos los Activos',overdue:'ATRASADO',dueIn:'Vence en',days:'días',lastDone:'Último realizado',nextDue:'Próximo',vessel:'Buque',location:'Ubicación',assignedTo:'Asignado a',partsCost:'Coste Piezas',labourCost:'Coste Mano de Obra',totalCost:'Coste Total',qty:'Cant.',minQty:'Mín.',lowStockBadge:'STOCK BAJO',adjustStock:'Ajustar Stock',totalMT:'Total MT',avgPerMT:'Prom. €/MT',fuelType:'Tipo Combustible',quantity:'Cantidad (MT)',costPerMT:'Coste/MT (€)',supplier:'Proveedor',port:'Puerto',defects:'Defectos',correctiveActions:'Acciones Correctivas',inspector:'Inspector',inspectionDate:'Fecha Inspección',noOrdersFound:'No se encontraron órdenes.',noInspections:'No se encontraron inspecciones.',submit:'Enviar' };
const mntFr = { title:'Maintenance Flotte',workOrders:'Ordres de Travail',pmSchedule:'Programme MP',fleetAssets:'Actifs Flotte',partsInventory:'Inventaire Pièces',inspections:'Inspections',fuelLog:'Journal Carburant',openOrders:'Ordres Ouverts',criticalPriority:'Priorité Critique',offline:'Actifs Hors Ligne',lowStock:'Stock Bas',newOrder:'Nouvel Ordre',newSchedule:'Nouveau Programme',newAsset:'Nouvel Actif',newPart:'Nouvelle Pièce',newInspection:'Nouvelle Inspection',newFuelLog:'Nouvelle Entrée Carburant',markInProgress:'Marquer En Cours',markCompleted:'Marquer Terminé',defer:'Reporter',aiPriority:'Note AI',allStatus:'Tous Statuts',allPriority:'Toutes Priorités',allAssets:'Tous Actifs',overdue:'EN RETARD',dueIn:'Échéance dans',days:'jours',lastDone:'Dernière fois',nextDue:'Prochain',vessel:'Navire',location:'Emplacement',assignedTo:'Assigné à',partsCost:'Coût Pièces',labourCost:'Coût Main-d\'œuvre',totalCost:'Coût Total',qty:'Qté',minQty:'Min.',lowStockBadge:'STOCK BAS',adjustStock:'Ajuster Stock',totalMT:'Total MT',avgPerMT:'Moy. €/MT',fuelType:'Type Carburant',quantity:'Quantité (MT)',costPerMT:'Coût/MT (€)',supplier:'Fournisseur',port:'Port',defects:'Défauts',correctiveActions:'Actions Correctives',inspector:'Inspecteur',inspectionDate:'Date Inspection',noOrdersFound:'Aucun ordre trouvé.',noInspections:'Aucune inspection trouvée.',submit:'Soumettre' };
const mntDe = { title:'Flottenwartung',workOrders:'Arbeitsaufträge',pmSchedule:'WP-Plan',fleetAssets:'Flottenaktiva',partsInventory:'Teilebestand',inspections:'Inspektionen',fuelLog:'Kraftstoffprotokoll',openOrders:'Offene Aufträge',criticalPriority:'Kritische Priorität',offline:'Außer Betrieb',lowStock:'Niedriger Bestand',newOrder:'Neuer Auftrag',newSchedule:'Neuer Plan',newAsset:'Neues Aktiv',newPart:'Neues Teil',newInspection:'Neue Inspektion',newFuelLog:'Neuer Kraftstoffeintrag',markInProgress:'Als in Bearbeitung markieren',markCompleted:'Als abgeschlossen markieren',defer:'Aufschieben',aiPriority:'KI-Prioritätsnotiz',allStatus:'Alle Status',allPriority:'Alle Prioritäten',allAssets:'Alle Aktiva',overdue:'ÜBERFÄLLIG',dueIn:'Fällig in',days:'Tage',lastDone:'Zuletzt erledigt',nextDue:'Nächste Fälligkeit',vessel:'Schiff',location:'Standort',assignedTo:'Zugewiesen an',partsCost:'Teilekosten',labourCost:'Arbeitskosten',totalCost:'Gesamtkosten',qty:'Mge.',minQty:'Mindestmenge',lowStockBadge:'NIEDRIGER BESTAND',adjustStock:'Bestand anpassen',totalMT:'Gesamt MT',avgPerMT:'Durchschn. €/MT',fuelType:'Kraftstoffart',quantity:'Menge (MT)',costPerMT:'Kosten/MT (€)',supplier:'Lieferant',port:'Hafen',defects:'Mängel',correctiveActions:'Korrekturmaßnahmen',inspector:'Inspektor',inspectionDate:'Inspektionsdatum',noOrdersFound:'Keine Arbeitsaufträge gefunden.',noInspections:'Keine Inspektionen gefunden.',submit:'Senden' };

const resources = {
  en: { translation: {
    nav: navEn,
    home: { title:'Minoan Lines AI Platform', subtitle:'AI-Powered Operations Platform — Powered by IntegraMind AI', bookNow:'Book Now', modules: modsEn },
    vessels: { title:'Vessel Operations',refresh:'Refresh',lastUpdated:'Last updated',speed:'Speed',fuel:'Fuel',eta:'ETA',delayRisk:'Delay Risk',status:{underway:'Underway',at_anchor:'At Anchor',moored:'Moored'} },
    chat: { title:'AI Customer Agent',placeholder:'Type your message...',suggestions:['What routes does Minoan Lines operate?','When is the next departure to Heraklion?','What cabin options are available?','How early should I arrive at the port?'] },
    compliance: { title:'EU Compliance',refresh:'Refresh',generateReport:'Generate Report',generating:'Generating...',totalCO2:'Total CO₂ (tons)',etsAllowances:'ETS Allowances',avgCII:'Avg CII Score',reportDate:'Report Date',euEts:'EU ETS Report',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'IT Helpdesk',newTicket:'New Ticket',submit:'Submit (AI will triage)',titleLabel:'Issue title',descLabel:'Describe the issue',nameLabel:'Your name (optional)',noTickets:'No tickets found. Create one to get started!',markInProgress:'Mark In Progress',markResolved:'Mark Resolved',escalate:'Escalate',aiSuggested:'AI Suggested Response',bookingRef:'Booking Ref',ticketNumber:'Ticket No.',filters:{all:'All',open:'Open',in_progress:'In Progress',resolved:'Resolved',escalated:'Escalated'} },
    analytics: { title:'Demand Analytics',refresh:'Refresh',weeklyPassengers:'Weekly Passengers',weeklyRevenue:'Weekly Revenue',peakRoute:'Peak Route',forecastAccuracy:'Forecast Accuracy',generateInsights:'Generate Insights for',forecastTitle:'7-Day Demand Forecast',aiInsights:'AI Demand Insights' },
    common: { loading:'Loading...',error:'An error occurred',retry:'Retry' },
    employees: empEn,
    maintenance: mntEn,
  }},
  el: { translation: {
    nav: navEl,
    home: { title:'Πλατφόρμα AI Minoan Lines',subtitle:'Πλατφόρμα Λειτουργιών AI — Powered by IntegraMind AI',bookNow:'Κράτηση Τώρα',modules: modsEl },
    vessels: { title:'Επιχειρήσεις Πλοίων',refresh:'Ανανέωση',lastUpdated:'Τελευταία ενημέρωση',speed:'Ταχύτητα',fuel:'Καύσιμα',eta:'Εκτ. Άφιξη',delayRisk:'Κίνδυνος Καθυστέρησης',status:{underway:'Εν πλω',at_anchor:'Αγκυροβολημένο',moored:'Δεμένο'} },
    chat: { title:'AI Εξυπηρέτηση Πελατών',placeholder:'Γράψτε το μήνυμά σας...',suggestions:['Ποιες διαδρομές εξυπηρετεί η Minoan Lines;','Πότε είναι η επόμενη αναχώρηση για Ηράκλειο;','Ποιες επιλογές καμπίνας υπάρχουν;','Πότε πρέπει να φτάσω στο λιμάνι;'] },
    compliance: { title:'ΕΕ Συμμόρφωση',refresh:'Ανανέωση',generateReport:'Δημιουργία Αναφοράς',generating:'Δημιουργία...',totalCO2:'Συνολικό CO₂ (τόνοι)',etsAllowances:'Δικαιώματα ETS',avgCII:'Μέσο CII',reportDate:'Ημερομηνία Αναφοράς',euEts:'Αναφορά EU ETS',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'Helpdesk Πληροφορικής',newTicket:'Νέο Εισιτήριο',submit:'Υποβολή (AI θα αναλύσει)',titleLabel:'Τίτλος προβλήματος',descLabel:'Περιγράψτε το πρόβλημα',nameLabel:'Όνομά σας (προαιρετικό)',noTickets:'Δεν βρέθηκαν εισιτήρια.',markInProgress:'Σε εξέλιξη',markResolved:'Επίλυση',escalate:'Κλιμάκωση',aiSuggested:'AI Προτεινόμενη Απάντηση',bookingRef:'Αριθ. Κράτησης',ticketNumber:'Αριθ. Εισιτηρίου',filters:{all:'Όλα',open:'Ανοιχτά',in_progress:'Σε εξέλιξη',resolved:'Επιλυμένα',escalated:'Κλιμακωμένα'} },
    analytics: { title:'Αναλυτικά Ζήτησης',refresh:'Ανανέωση',weeklyPassengers:'Εβδομαδιαίοι Επιβάτες',weeklyRevenue:'Εβδομαδιαία Έσοδα',peakRoute:'Κορυφαία Διαδρομή',forecastAccuracy:'Ακρίβεια Πρόβλεψης',generateInsights:'Δημιουργία Insights για',forecastTitle:'Πρόβλεψη 7 Ημερών',aiInsights:'AI Insights Ζήτησης' },
    common: { loading:'Φόρτωση...',error:'Παρουσιάστηκε σφάλμα',retry:'Επανάληψη' },
    employees: empEl,
    maintenance: mntEl,
  }},
  es: { translation: {
    nav: navEs,
    home: { title:'Plataforma AI de Minoan Lines',subtitle:'Plataforma de Operaciones AI — Powered by IntegraMind AI',bookNow:'Reservar Ahora',modules: modsEs },
    vessels: { title:'Operaciones de Buques',refresh:'Actualizar',lastUpdated:'Última actualización',speed:'Velocidad',fuel:'Combustible',eta:'ETA',delayRisk:'Riesgo de Retraso',status:{underway:'En marcha',at_anchor:'Anclado',moored:'Atracado'} },
    chat: { title:'Agente AI de Atención al Cliente',placeholder:'Escribe tu mensaje...',suggestions:['¿Qué rutas opera Minoan Lines?','¿Cuándo es la próxima salida a Heraklion?','¿Qué opciones de camarote hay?','¿Cuándo debo llegar al puerto?'] },
    compliance: { title:'Cumplimiento UE',refresh:'Actualizar',generateReport:'Generar Informe',generating:'Generando...',totalCO2:'CO₂ Total (tons)',etsAllowances:'Permisos ETS',avgCII:'CII Promedio',reportDate:'Fecha Informe',euEts:'Informe EU ETS',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'Soporte IT',newTicket:'Nuevo Ticket',submit:'Enviar (AI clasificará)',titleLabel:'Título del problema',descLabel:'Describe el problema',nameLabel:'Tu nombre (opcional)',noTickets:'¡No hay tickets.',markInProgress:'En Progreso',markResolved:'Resolver',escalate:'Escalar',aiSuggested:'Respuesta Sugerida AI',bookingRef:'Ref. Reserva',ticketNumber:'Núm. Ticket',filters:{all:'Todos',open:'Abiertos',in_progress:'En Progreso',resolved:'Resueltos',escalated:'Escalados'} },
    analytics: { title:'Analítica de Demanda',refresh:'Actualizar',weeklyPassengers:'Pasajeros Semanales',weeklyRevenue:'Ingresos Semanales',peakRoute:'Ruta Principal',forecastAccuracy:'Precisión Pronóstico',generateInsights:'Generar Insights para',forecastTitle:'Pronóstico 7 Días',aiInsights:'Insights AI de Demanda' },
    common: { loading:'Cargando...',error:'Ocurrió un error',retry:'Reintentar' },
    employees: empEs,
    maintenance: mntEs,
  }},
  fr: { translation: {
    nav: navFr,
    home: { title:'Plateforme AI Minoan Lines',subtitle:"Plateforme d'Opérations AI — Powered by IntegraMind AI",bookNow:'Réserver Maintenant',modules: modsFr },
    vessels: { title:'Opérations Navires',refresh:'Actualiser',lastUpdated:'Dernière mise à jour',speed:'Vitesse',fuel:'Carburant',eta:'ETA',delayRisk:'Risque Retard',status:{underway:'En route',at_anchor:"À l'ancre",moored:'Amarré'} },
    chat: { title:'Agent AI Client',placeholder:'Écrivez votre message...',suggestions:['Quelles routes Minoan Lines opère-t-elle?','Quand est le prochain départ pour Héraklion?','Quelles options de cabine sont disponibles?','Quand arriver au port?'] },
    compliance: { title:'Conformité UE',refresh:'Actualiser',generateReport:'Générer Rapport',generating:'Génération...',totalCO2:'CO₂ Total (tonnes)',etsAllowances:'Quotas ETS',avgCII:'CII Moyen',reportDate:'Date Rapport',euEts:'Rapport EU ETS',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'Support IT',newTicket:'Nouveau Ticket',submit:'Soumettre (AI triera)',titleLabel:'Titre du problème',descLabel:'Décrivez le problème',nameLabel:'Votre nom (optionnel)',noTickets:'Pas de tickets.',markInProgress:'En cours',markResolved:'Résolu',escalate:'Escalader',aiSuggested:'Réponse Suggérée AI',bookingRef:'Réf. Réservation',ticketNumber:'No. Ticket',filters:{all:'Tous',open:'Ouverts',in_progress:'En cours',resolved:'Résolus',escalated:'Escaladés'} },
    analytics: { title:'Analytique de Demande',refresh:'Actualiser',weeklyPassengers:'Passagers Hebdo',weeklyRevenue:'Revenus Hebdo',peakRoute:'Route Principale',forecastAccuracy:'Précision Prévision',generateInsights:'Générer Insights pour',forecastTitle:'Prévision 7 Jours',aiInsights:'Insights AI Demande' },
    common: { loading:'Chargement...',error:"Une erreur s'est produite",retry:'Réessayer' },
    employees: empFr,
    maintenance: mntFr,
  }},
  de: { translation: {
    nav: navDe,
    home: { title:'Minoan Lines KI-Plattform',subtitle:'KI-Betriebsplattform — Powered by IntegraMind AI',bookNow:'Jetzt Buchen',modules: modsDe },
    vessels: { title:'Schiffsbetrieb',refresh:'Aktualisieren',lastUpdated:'Zuletzt aktualisiert',speed:'Geschwindigkeit',fuel:'Kraftstoff',eta:'ETA',delayRisk:'Verzögerungsrisiko',status:{underway:'Unterwegs',at_anchor:'Vor Anker',moored:'Festgemacht'} },
    chat: { title:'KI-Kundenservice',placeholder:'Ihre Nachricht eingeben...',suggestions:['Welche Routen betreibt Minoan Lines?','Wann ist die nächste Abfahrt nach Heraklion?','Welche Kabinenoptionen gibt es?','Wann sollte ich am Hafen ankommen?'] },
    compliance: { title:'EU-Compliance',refresh:'Aktualisieren',generateReport:'Bericht erstellen',generating:'Wird erstellt...',totalCO2:'Gesamt-CO₂ (Tonnen)',etsAllowances:'ETS-Zertifikate',avgCII:'Durchschn. CII',reportDate:'Berichtsdatum',euEts:'EU-ETS-Bericht',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'IT-Helpdesk',newTicket:'Neues Ticket',submit:'Absenden (KI priorisiert)',titleLabel:'Problem-Titel',descLabel:'Problem beschreiben',nameLabel:'Ihr Name (optional)',noTickets:'Keine Tickets.',markInProgress:'In Bearbeitung',markResolved:'Gelöst',escalate:'Eskalieren',aiSuggested:'KI-Vorgeschlagene Antwort',bookingRef:'Buchungsref.',ticketNumber:'Ticket-Nr.',filters:{all:'Alle',open:'Offen',in_progress:'In Bearbeitung',resolved:'Gelöst',escalated:'Eskaliert'} },
    analytics: { title:'Nachfrageanalyse',refresh:'Aktualisieren',weeklyPassengers:'Wöchentliche Passagiere',weeklyRevenue:'Wöchentlicher Umsatz',peakRoute:'Hauptroute',forecastAccuracy:'Prognosegenauigkeit',generateInsights:'Insights generieren für',forecastTitle:'7-Tage-Prognose',aiInsights:'KI-Nachfrage-Insights' },
    common: { loading:'Wird geladen...',error:'Ein Fehler ist aufgetreten',retry:'Wiederholen' },
    employees: empDe,
    maintenance: mntDe,
  }},
  it: { translation: {
    nav: navIt,
    home: { title:'Piattaforma AI Minoan Lines',subtitle:'Piattaforma Operativa AI — Powered by IntegraMind AI',bookNow:'Prenota Ora',modules: modsEn },
    vessels: { title:'Operazioni Navali',refresh:'Aggiorna',lastUpdated:'Ultimo aggiornamento',speed:'Velocità',fuel:'Carburante',eta:'ETA',delayRisk:'Rischio Ritardo',status:{underway:'In navigazione',at_anchor:"All'ancora",moored:'Ormeggiato'} },
    chat: { title:'Agente AI Clienti',placeholder:'Scrivi il tuo messaggio...',suggestions:['Quali rotte opera Minoan Lines?','Quando è la prossima partenza per Heraklion?','Quali cabine sono disponibili?','Quando arrivare al porto?'] },
    compliance: { title:'Conformità UE',refresh:'Aggiorna',generateReport:'Genera Rapporto',generating:'Generazione...',totalCO2:'CO₂ Totale (ton)',etsAllowances:'Quote ETS',avgCII:'CII Medio',reportDate:'Data Rapporto',euEts:'Rapporto EU ETS',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'Helpdesk IT',newTicket:'Nuovo Ticket',submit:'Invia (AI classificherà)',titleLabel:'Titolo problema',descLabel:'Descrivi il problema',nameLabel:'Il tuo nome (opzionale)',noTickets:'Nessun ticket.',markInProgress:'In Lavorazione',markResolved:'Risolto',escalate:'Escalation',aiSuggested:'Risposta Suggerita AI',bookingRef:'Rif. Prenotazione',ticketNumber:'N. Ticket',filters:{all:'Tutti',open:'Aperti',in_progress:'In corso',resolved:'Risolti',escalated:'Escalati'} },
    analytics: { title:'Analisi della Domanda',refresh:'Aggiorna',weeklyPassengers:'Passeggeri Settimanali',weeklyRevenue:'Ricavi Settimanali',peakRoute:'Rotta Principale',forecastAccuracy:'Accuratezza Previsione',generateInsights:'Genera Insights per',forecastTitle:'Previsione 7 Giorni',aiInsights:'AI Insights Domanda' },
    common: { loading:'Caricamento...',error:'Si è verificato un errore',retry:'Riprova' },
    employees: empIt,
    maintenance: mntEs, // close enough, fallback fills gaps
  }},
  pt: { translation: {
    nav: navPt,
    home: { title:'Plataforma AI Minoan Lines',subtitle:'Plataforma de Operações AI — Powered by IntegraMind AI',bookNow:'Reservar Agora',modules: modsEn },
    vessels: { title:'Operações de Navios',refresh:'Atualizar',lastUpdated:'Última atualização',speed:'Velocidade',fuel:'Combustível',eta:'ETA',delayRisk:'Risco de Atraso',status:{underway:'Em navegação',at_anchor:'Ancorado',moored:'Atracado'} },
    chat: { title:'Agente AI de Clientes',placeholder:'Escreva sua mensagem...',suggestions:['Quais rotas a Minoan Lines opera?','Quando é a próxima partida para Heraklion?','Que opções de cabine existem?','Quando chegar ao porto?'] },
    compliance: { title:'Conformidade UE',refresh:'Atualizar',generateReport:'Gerar Relatório',generating:'Gerando...',totalCO2:'CO₂ Total (ton)',etsAllowances:'Licenças ETS',avgCII:'CII Médio',reportDate:'Data Relatório',euEts:'Relatório EU ETS',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'Helpdesk TI',newTicket:'Novo Ticket',submit:'Enviar (AI triará)',titleLabel:'Título do problema',descLabel:'Descreva o problema',nameLabel:'Seu nome (opcional)',noTickets:'Nenhum ticket.',markInProgress:'Em Andamento',markResolved:'Resolvido',escalate:'Escalar',aiSuggested:'Resposta Sugerida AI',bookingRef:'Ref. Reserva',ticketNumber:'Núm. Ticket',filters:{all:'Todos',open:'Abertos',in_progress:'Em andamento',resolved:'Resolvidos',escalated:'Escalados'} },
    analytics: { title:'Análise de Demanda',refresh:'Atualizar',weeklyPassengers:'Passageiros Semanais',weeklyRevenue:'Receita Semanal',peakRoute:'Rota Principal',forecastAccuracy:'Precisão da Previsão',generateInsights:'Gerar Insights para',forecastTitle:'Previsão de 7 Dias',aiInsights:'AI Insights de Demanda' },
    common: { loading:'Carregando...',error:'Ocorreu um erro',retry:'Tentar novamente' },
    employees: empPt,
    maintenance: mntEs,
  }},
  ar: { translation: {
    nav: navAr,
    home: { title:'منصة Minoan Lines الذكية',subtitle:'منصة عمليات الذكاء الاصطناعي — Powered by IntegraMind AI',bookNow:'احجز الآن',modules: modsEn },
    vessels: { title:'عمليات السفن',refresh:'تحديث',lastUpdated:'آخر تحديث',speed:'السرعة',fuel:'الوقود',eta:'وقت الوصول',delayRisk:'خطر التأخير',status:{underway:'في الإبحار',at_anchor:'في المرساة',moored:'مرسو'} },
    chat: { title:'وكيل خدمة العملاء AI',placeholder:'اكتب رسالتك...',suggestions:['ما الخطوط التي تشغلها Minoan Lines؟','متى الرحلة القادمة إلى هيراكليون؟','ما خيارات الكابينة المتاحة؟','متى يجب أن أصل إلى الميناء؟'] },
    compliance: { title:'الامتثال الأوروبي',refresh:'تحديث',generateReport:'إنشاء تقرير',generating:'جارٍ الإنشاء...',totalCO2:'إجمالي CO₂ (طن)',etsAllowances:'تصاريح ETS',avgCII:'متوسط CII',reportDate:'تاريخ التقرير',euEts:'تقرير EU ETS',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'دعم تقنية المعلومات',newTicket:'تذكرة جديدة',submit:'إرسال',titleLabel:'عنوان المشكلة',descLabel:'وصف المشكلة',nameLabel:'اسمك (اختياري)',noTickets:'لا توجد تذاكر.',markInProgress:'قيد التنفيذ',markResolved:'تم الحل',escalate:'تصعيد',aiSuggested:'رد مقترح من AI',bookingRef:'رقم الحجز',ticketNumber:'رقم التذكرة',filters:{all:'الكل',open:'مفتوح',in_progress:'قيد التنفيذ',resolved:'محلول',escalated:'مصعَّد'} },
    analytics: { title:'تحليلات الطلب',refresh:'تحديث',weeklyPassengers:'الركاب الأسبوعيون',weeklyRevenue:'الإيرادات الأسبوعية',peakRoute:'أعلى خط',forecastAccuracy:'دقة التنبؤ',generateInsights:'إنشاء رؤى لـ',forecastTitle:'توقعات 7 أيام',aiInsights:'رؤى AI للطلب' },
    common: { loading:'جارٍ التحميل...',error:'حدث خطأ',retry:'إعادة المحاولة' },
    employees: empAr,
    maintenance: mntEn,
  }},
  zh: { translation: {
    nav: navZh,
    home: { title:'Minoan Lines AI平台',subtitle:'AI运营平台 — Powered by IntegraMind AI',bookNow:'立即预订',modules: modsEn },
    vessels: { title:'船舶运营',refresh:'刷新',lastUpdated:'最后更新',speed:'速度',fuel:'燃油',eta:'预计到达',delayRisk:'延误风险',status:{underway:'航行中',at_anchor:'锚泊',moored:'停靠'} },
    chat: { title:'AI客户服务',placeholder:'输入您的消息...',suggestions:['Minoan Lines运营哪些航线？','下一班前往Heraklion的船何时出发？','有哪些舱位选择？','我应该什么时候到达港口？'] },
    compliance: { title:'EU合规',refresh:'刷新',generateReport:'生成报告',generating:'生成中...',totalCO2:'总CO₂（吨）',etsAllowances:'ETS配额',avgCII:'平均CII',reportDate:'报告日期',euEts:'EU ETS报告',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'IT服务台',newTicket:'新建工单',submit:'提交',titleLabel:'问题标题',descLabel:'描述问题',nameLabel:'您的姓名（可选）',noTickets:'暂无工单。',markInProgress:'处理中',markResolved:'已解决',escalate:'升级',aiSuggested:'AI建议回复',bookingRef:'预订参考',ticketNumber:'票号',filters:{all:'全部',open:'待处理',in_progress:'处理中',resolved:'已解决',escalated:'已升级'} },
    analytics: { title:'需求分析',refresh:'刷新',weeklyPassengers:'每周乘客',weeklyRevenue:'每周收入',peakRoute:'主要航线',forecastAccuracy:'预测准确率',generateInsights:'生成洞察：',forecastTitle:'7天需求预测',aiInsights:'AI需求洞察' },
    common: { loading:'加载中...',error:'发生错误',retry:'重试' },
    employees: empZh,
    maintenance: mntEn,
  }},
  ja: { translation: {
    nav: navJa,
    home: { title:'Minoan Lines AIプラットフォーム',subtitle:'AI運営プラットフォーム — Powered by IntegraMind AI',bookNow:'今すぐ予約',modules: modsEn },
    vessels: { title:'船舶運航',refresh:'更新',lastUpdated:'最終更新',speed:'速度',fuel:'燃料',eta:'ETA',delayRisk:'遅延リスク',status:{underway:'航行中',at_anchor:'錨泊中',moored:'係留中'} },
    chat: { title:'AI顧客サービス',placeholder:'メッセージを入力...',suggestions:['Minoan Linesはどのルートを運航していますか？','ヘラクリオン行きの次の便はいつですか？','どのようなキャビンオプションがありますか？','港にはいつ到着すればいいですか？'] },
    compliance: { title:'EUコンプライアンス',refresh:'更新',generateReport:'レポート生成',generating:'生成中...',totalCO2:'総CO₂（トン）',etsAllowances:'ETS割当量',avgCII:'平均CII',reportDate:'レポート日付',euEts:'EU ETSレポート',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'ITヘルプデスク',newTicket:'新規チケット',submit:'送信',titleLabel:'問題のタイトル',descLabel:'問題を説明',nameLabel:'お名前（任意）',noTickets:'チケットがありません。',markInProgress:'対応中',markResolved:'解決済み',escalate:'エスカレート',aiSuggested:'AI提案返答',bookingRef:'予約番号',ticketNumber:'チケット番号',filters:{all:'すべて',open:'未対応',in_progress:'対応中',resolved:'解決済み',escalated:'エスカレート済み'} },
    analytics: { title:'需要分析',refresh:'更新',weeklyPassengers:'週間旅客数',weeklyRevenue:'週間収益',peakRoute:'ピークルート',forecastAccuracy:'予測精度',generateInsights:'インサイト生成：',forecastTitle:'7日間需要予測',aiInsights:'AI需要インサイト' },
    common: { loading:'読み込み中...',error:'エラーが発生しました',retry:'再試行' },
    employees: empJa,
    maintenance: mntEn,
  }},
  ru: { translation: {
    nav: navRu,
    home: { title:'ИИ-платформа Minoan Lines',subtitle:'Операционная ИИ-платформа — Powered by IntegraMind AI',bookNow:'Забронировать',modules: modsEn },
    vessels: { title:'Операции флота',refresh:'Обновить',lastUpdated:'Последнее обновление',speed:'Скорость',fuel:'Топливо',eta:'ОВП',delayRisk:'Риск задержки',status:{underway:'В пути',at_anchor:'На якоре',moored:'Пришвартован'} },
    chat: { title:'ИИ-служба поддержки',placeholder:'Введите сообщение...',suggestions:['Какие маршруты обслуживает Minoan Lines?','Когда следующий рейс в Ираклион?','Какие варианты кают доступны?','Когда прибыть в порт?'] },
    compliance: { title:'Соответствие ЕС',refresh:'Обновить',generateReport:'Создать отчёт',generating:'Создание...',totalCO2:'Всего CO₂ (т)',etsAllowances:'Квоты ETS',avgCII:'Средний CII',reportDate:'Дата отчёта',euEts:'Отчёт EU ETS',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'ИТ-служба поддержки',newTicket:'Новый тикет',submit:'Отправить',titleLabel:'Заголовок проблемы',descLabel:'Опишите проблему',nameLabel:'Ваше имя (необязательно)',noTickets:'Тикетов нет.',markInProgress:'В работе',markResolved:'Решено',escalate:'Эскалировать',aiSuggested:'Ответ ИИ',bookingRef:'Номер брони',ticketNumber:'Номер тикета',filters:{all:'Все',open:'Открытые',in_progress:'В работе',resolved:'Решённые',escalated:'Эскалированные'} },
    analytics: { title:'Анализ спроса',refresh:'Обновить',weeklyPassengers:'Пассажиры за неделю',weeklyRevenue:'Выручка за неделю',peakRoute:'Пиковый маршрут',forecastAccuracy:'Точность прогноза',generateInsights:'Создать инсайты для',forecastTitle:'Прогноз на 7 дней',aiInsights:'ИИ-инсайты спроса' },
    common: { loading:'Загрузка...',error:'Произошла ошибка',retry:'Повторить' },
    employees: empRu,
    maintenance: mntEn,
  }},
  tr: { translation: {
    nav: navTr,
    home: { title:'Minoan Lines AI Platformu',subtitle:'AI Operasyon Platformu — Powered by IntegraMind AI',bookNow:'Şimdi Rezerve Et',modules: modsEn },
    vessels: { title:'Gemi Operasyonları',refresh:'Yenile',lastUpdated:'Son güncelleme',speed:'Hız',fuel:'Yakıt',eta:'TTV',delayRisk:'Gecikme Riski',status:{underway:'Seyirde',at_anchor:'Demirlemiş',moored:'Yanaşmış'} },
    chat: { title:'AI Müşteri Hizmetleri',placeholder:'Mesajınızı yazın...',suggestions:["Minoan Lines hangi güzergahları işletiyor?","Heraklion'a sonraki sefer ne zaman?",'Hangi kabin seçenekleri mevcut?','Limana ne zaman varmalıyım?'] },
    compliance: { title:'AB Uyumluluğu',refresh:'Yenile',generateReport:'Rapor Oluştur',generating:'Oluşturuluyor...',totalCO2:'Toplam CO₂ (ton)',etsAllowances:'ETS İzinleri',avgCII:'Ort. CII',reportDate:'Rapor Tarihi',euEts:'EU ETS Raporu',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'BT Yardım Masası',newTicket:'Yeni Bilet',submit:'Gönder',titleLabel:'Sorun başlığı',descLabel:'Sorunu açıklayın',nameLabel:'Adınız (isteğe bağlı)',noTickets:'Bilet yok.',markInProgress:'İşlemde',markResolved:'Çözüldü',escalate:'Tırmandır',aiSuggested:'AI Önerilen Yanıt',bookingRef:'Rezervasyon Ref.',ticketNumber:'Bilet No.',filters:{all:'Tümü',open:'Açık',in_progress:'İşlemde',resolved:'Çözüldü',escalated:'Tırmanmış'} },
    analytics: { title:'Talep Analitiği',refresh:'Yenile',weeklyPassengers:'Haftalık Yolcular',weeklyRevenue:'Haftalık Gelir',peakRoute:'Zirve Güzergah',forecastAccuracy:'Tahmin Doğruluğu',generateInsights:'İçgörü Oluştur:',forecastTitle:'7 Günlük Talep Tahmini',aiInsights:'AI Talep İçgörüleri' },
    common: { loading:'Yükleniyor...',error:'Bir hata oluştu',retry:'Tekrar Dene' },
    employees: empTr,
    maintenance: mntEn,
  }},
  nl: { translation: {
    nav: navNl,
    home: { title:'Minoan Lines AI-platform',subtitle:'AI-operatieplatform — Powered by IntegraMind AI',bookNow:'Nu Boeken',modules: modsEn },
    vessels: { title:'Scheepsoperaties',refresh:'Vernieuwen',lastUpdated:'Laatste update',speed:'Snelheid',fuel:'Brandstof',eta:'ETA',delayRisk:'Vertragingsrisico',status:{underway:'Onderweg',at_anchor:'Voor anker',moored:'Afgemeerd'} },
    chat: { title:'AI Klantenservice',placeholder:'Typ uw bericht...',suggestions:['Welke routes heeft Minoan Lines?','Wanneer vertrekt de volgende boot naar Heraklion?','Welke cabine-opties zijn beschikbaar?','Wanneer moet ik in de haven zijn?'] },
    compliance: { title:'EU-naleving',refresh:'Vernieuwen',generateReport:'Rapport genereren',generating:'Genereren...',totalCO2:'Totaal CO₂ (ton)',etsAllowances:'ETS-rechten',avgCII:'Gem. CII',reportDate:'Rapportdatum',euEts:'EU ETS-rapport',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'IT-helpdesk',newTicket:'Nieuw ticket',submit:'Indienen',titleLabel:'Probleemtitel',descLabel:'Beschrijf het probleem',nameLabel:'Uw naam (optioneel)',noTickets:'Geen tickets.',markInProgress:'In behandeling',markResolved:'Opgelost',escalate:'Escaleren',aiSuggested:'AI-voorgesteld antwoord',bookingRef:'Boekingsref.',ticketNumber:'Ticket nr.',filters:{all:'Alle',open:'Open',in_progress:'In behandeling',resolved:'Opgelost',escalated:'Geëscaleerd'} },
    analytics: { title:'Vraaganalyse',refresh:'Vernieuwen',weeklyPassengers:'Wekelijkse passagiers',weeklyRevenue:'Wekelijkse omzet',peakRoute:'TopRoute',forecastAccuracy:'Voorspellingsnauwkeurigheid',generateInsights:'Inzichten genereren voor',forecastTitle:'7-daagse vraagprognose',aiInsights:'AI-vraaginzichten' },
    common: { loading:'Laden...',error:'Er is een fout opgetreden',retry:'Opnieuw proberen' },
    employees: empNl,
    maintenance: mntEn,
  }},
  pl: { translation: {
    nav: navPl,
    home: { title:'Platforma AI Minoan Lines',subtitle:'Platforma Operacyjna AI — Powered by IntegraMind AI',bookNow:'Zarezerwuj Teraz',modules: modsEn },
    vessels: { title:'Operacje Statków',refresh:'Odśwież',lastUpdated:'Ostatnia aktualizacja',speed:'Prędkość',fuel:'Paliwo',eta:'ETA',delayRisk:'Ryzyko opóźnienia',status:{underway:'W drodze',at_anchor:'Na kotwicy',moored:'Zacumowany'} },
    chat: { title:'Obsługa Klienta AI',placeholder:'Wpisz wiadomość...',suggestions:['Jakie trasy obsługuje Minoan Lines?','Kiedy następny rejs do Heraklion?','Jakie opcje kabin są dostępne?','Kiedy przybyć do portu?'] },
    compliance: { title:'Zgodność UE',refresh:'Odśwież',generateReport:'Generuj raport',generating:'Generowanie...',totalCO2:'Łączny CO₂ (tony)',etsAllowances:'Uprawnienia ETS',avgCII:'Śr. CII',reportDate:'Data raportu',euEts:'Raport EU ETS',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'Helpdesk IT',newTicket:'Nowy bilet',submit:'Wyślij',titleLabel:'Tytuł problemu',descLabel:'Opisz problem',nameLabel:'Twoje imię (opcjonalne)',noTickets:'Brak biletów.',markInProgress:'W trakcie',markResolved:'Rozwiązano',escalate:'Eskaluj',aiSuggested:'Odpowiedź AI',bookingRef:'Ref. rezerwacji',ticketNumber:'Nr biletu',filters:{all:'Wszystkie',open:'Otwarte',in_progress:'W trakcie',resolved:'Rozwiązane',escalated:'Eskalowane'} },
    analytics: { title:'Analityka popytu',refresh:'Odśwież',weeklyPassengers:'Tygodniowi pasażerowie',weeklyRevenue:'Tygodniowe przychody',peakRoute:'Szczytowa trasa',forecastAccuracy:'Dokładność prognozy',generateInsights:'Generuj wnioski dla',forecastTitle:'Prognoza 7-dniowa',aiInsights:'Wnioski AI dot. popytu' },
    common: { loading:'Ładowanie...',error:'Wystąpił błąd',retry:'Spróbuj ponownie' },
    employees: empEn,
    maintenance: mntEn,
  }},
  sv: { translation: {
    nav: navSv,
    home: { title:'Minoan Lines AI-plattform',subtitle:'AI-driftsplattform — Powered by IntegraMind AI',bookNow:'Boka Nu',modules: modsEn },
    vessels: { title:'Fartygsdrift',refresh:'Uppdatera',lastUpdated:'Senast uppdaterad',speed:'Hastighet',fuel:'Bränsle',eta:'ETA',delayRisk:'Förseningsrisk',status:{underway:'Under gång',at_anchor:'För ankar',moored:'Förtöjd'} },
    chat: { title:'AI Kundtjänst',placeholder:'Skriv ditt meddelande...',suggestions:['Vilka rutter driver Minoan Lines?','När avgår nästa båt till Heraklion?','Vilka hyttalternativ finns?','När ska jag anlända till hamnen?'] },
    compliance: { title:'EU-efterlevnad',refresh:'Uppdatera',generateReport:'Generera rapport',generating:'Genererar...',totalCO2:'Total CO₂ (ton)',etsAllowances:'ETS-tillstånd',avgCII:'Medel-CII',reportDate:'Rapportdatum',euEts:'EU ETS-rapport',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'IT-helpdesk',newTicket:'Ny biljett',submit:'Skicka',titleLabel:'Problemtitel',descLabel:'Beskriv problemet',nameLabel:'Ditt namn (valfritt)',noTickets:'Inga biljetter.',markInProgress:'Pågår',markResolved:'Löst',escalate:'Eskalera',aiSuggested:'AI-föreslagen svar',bookingRef:'Bokningsref.',ticketNumber:'Biljettnr.',filters:{all:'Alla',open:'Öppna',in_progress:'Pågår',resolved:'Lösta',escalated:'Eskalerade'} },
    analytics: { title:'Efterfrågeanalys',refresh:'Uppdatera',weeklyPassengers:'Veckovisa passagerare',weeklyRevenue:'Veckovisa intäkter',peakRoute:'Topprutt',forecastAccuracy:'Prognosnoggrannhet',generateInsights:'Generera insikter för',forecastTitle:'7-dagarsprognos',aiInsights:'AI efterfrågeinsikter' },
    common: { loading:'Laddar...',error:'Ett fel inträffade',retry:'Försök igen' },
    employees: empEn,
    maintenance: mntEn,
  }},
  ko: { translation: {
    nav: navKo,
    home: { title:'Minoan Lines AI 플랫폼',subtitle:'AI 운영 플랫폼 — Powered by IntegraMind AI',bookNow:'지금 예약',modules: modsEn },
    vessels: { title:'선박 운항',refresh:'새로고침',lastUpdated:'마지막 업데이트',speed:'속도',fuel:'연료',eta:'도착예정',delayRisk:'지연 위험',status:{underway:'항해 중',at_anchor:'닻 내림',moored:'정박'} },
    chat: { title:'AI 고객 서비스',placeholder:'메시지를 입력하세요...',suggestions:['Minoan Lines는 어떤 노선을 운항하나요?','헤라클리온행 다음 출발은 언제인가요?','어떤 선실 옵션이 있나요?','항구에 언제 도착해야 하나요?'] },
    compliance: { title:'EU 컴플라이언스',refresh:'새로고침',generateReport:'보고서 생성',generating:'생성 중...',totalCO2:'총 CO₂ (톤)',etsAllowances:'ETS 허용량',avgCII:'평균 CII',reportDate:'보고서 날짜',euEts:'EU ETS 보고서',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'IT 헬프데스크',newTicket:'새 티켓',submit:'제출',titleLabel:'문제 제목',descLabel:'문제 설명',nameLabel:'이름 (선택)',noTickets:'티켓이 없습니다.',markInProgress:'진행 중',markResolved:'해결됨',escalate:'에스컬레이션',aiSuggested:'AI 제안 답변',bookingRef:'예약 번호',ticketNumber:'티켓 번호',filters:{all:'전체',open:'열림',in_progress:'진행 중',resolved:'해결됨',escalated:'에스컬레이션'} },
    analytics: { title:'수요 분석',refresh:'새로고침',weeklyPassengers:'주간 승객',weeklyRevenue:'주간 수익',peakRoute:'피크 노선',forecastAccuracy:'예측 정확도',generateInsights:'인사이트 생성:',forecastTitle:'7일 수요 예측',aiInsights:'AI 수요 인사이트' },
    common: { loading:'로딩 중...',error:'오류가 발생했습니다',retry:'다시 시도' },
    employees: empEn,
    maintenance: mntEn,
  }},
  hi: { translation: {
    nav: navHi,
    home: { title:'Minoan Lines AI प्लेटफ़ॉर्म',subtitle:'AI संचालन प्लेटफ़ॉर्म — Powered by IntegraMind AI',bookNow:'अभी बुक करें',modules: modsEn },
    vessels: { title:'जहाज़ संचालन',refresh:'ताज़ा करें',lastUpdated:'अंतिम अपडेट',speed:'गति',fuel:'ईंधन',eta:'ETA',delayRisk:'विलंब जोखिम',status:{underway:'यात्रा में',at_anchor:'लंगर पर',moored:'बंधा हुआ'} },
    chat: { title:'AI ग्राहक सेवा',placeholder:'अपना संदेश टाइप करें...',suggestions:['Minoan Lines कौन से मार्ग संचालित करती है?','Heraklion के लिए अगली रवानगी कब है?','कौन से केबिन विकल्प उपलब्ध हैं?','मुझे बंदरगाह पर कब पहुंचना चाहिए?'] },
    compliance: { title:'EU अनुपालन',refresh:'ताज़ा करें',generateReport:'रिपोर्ट बनाएं',generating:'बना रहे हैं...',totalCO2:'कुल CO₂ (टन)',etsAllowances:'ETS अनुमतियाँ',avgCII:'औसत CII',reportDate:'रिपोर्ट तिथि',euEts:'EU ETS रिपोर्ट',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'IT हेल्पडेस्क',newTicket:'नई टिकट',submit:'भेजें',titleLabel:'समस्या शीर्षक',descLabel:'समस्या का वर्णन करें',nameLabel:'आपका नाम (वैकल्पिक)',noTickets:'कोई टिकट नहीं।',markInProgress:'प्रगति में',markResolved:'हल हुआ',escalate:'एस्केलेट करें',aiSuggested:'AI सुझाया गया जवाब',bookingRef:'बुकिंग रेफ.',ticketNumber:'टिकट नं.',filters:{all:'सभी',open:'खुला',in_progress:'प्रगति में',resolved:'हल',escalated:'एस्केलेटेड'} },
    analytics: { title:'मांग विश्लेषण',refresh:'ताज़ा करें',weeklyPassengers:'साप्ताहिक यात्री',weeklyRevenue:'साप्ताहिक राजस्व',peakRoute:'पीक मार्ग',forecastAccuracy:'पूर्वानुमान सटीकता',generateInsights:'इनसाइट्स बनाएं:',forecastTitle:'7-दिन की मांग पूर्वानुमान',aiInsights:'AI मांग इनसाइट्स' },
    common: { loading:'लोड हो रहा है...',error:'एक त्रुटि हुई',retry:'पुनः प्रयास करें' },
    employees: empEn,
    maintenance: mntEn,
  }},
  uk: { translation: {
    nav: navUk,
    home: { title:'ІІ-платформа Minoan Lines',subtitle:'Операційна ІІ-платформа — Powered by IntegraMind AI',bookNow:'Забронювати',modules: modsEn },
    vessels: { title:'Операції флоту',refresh:'Оновити',lastUpdated:'Останнє оновлення',speed:'Швидкість',fuel:'Паливо',eta:'ОЧП',delayRisk:'Ризик затримки',status:{underway:'В дорозі',at_anchor:'На якорі',moored:'Пришвартовано'} },
    chat: { title:'ІІ-служба підтримки',placeholder:'Введіть повідомлення...',suggestions:['Які маршрути обслуговує Minoan Lines?','Коли наступний рейс до Іракліона?','Які варіанти кают доступні?','Коли прибути до порту?'] },
    compliance: { title:'Відповідність ЄС',refresh:'Оновити',generateReport:'Створити звіт',generating:'Створення...',totalCO2:'Всього CO₂ (т)',etsAllowances:'Квоти ETS',avgCII:'Середній CII',reportDate:'Дата звіту',euEts:'Звіт EU ETS',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'ІТ-служба підтримки',newTicket:'Новий тікет',submit:'Надіслати',titleLabel:'Заголовок проблеми',descLabel:'Опишіть проблему',nameLabel:"Ваше ім'я (необов'язково)",noTickets:'Тікетів немає.',markInProgress:'В роботі',markResolved:'Вирішено',escalate:'Ескалювати',aiSuggested:'Відповідь ІІ',bookingRef:'Номер бронювання',ticketNumber:'Номер тікету',filters:{all:'Всі',open:'Відкриті',in_progress:'В роботі',resolved:'Вирішені',escalated:'Ескальовані'} },
    analytics: { title:'Аналіз попиту',refresh:'Оновити',weeklyPassengers:'Пасажири за тиждень',weeklyRevenue:'Виручка за тиждень',peakRoute:'Пік маршруту',forecastAccuracy:'Точність прогнозу',generateInsights:'Створити інсайти для',forecastTitle:'Прогноз на 7 днів',aiInsights:'ІІ-інсайти попиту' },
    common: { loading:'Завантаження...',error:'Сталася помилка',retry:'Повторити' },
    employees: empEn,
    maintenance: mntEn,
  }},
  ro: { translation: {
    nav: navRo,
    home: { title:'Platforma AI Minoan Lines',subtitle:'Platformă Operațională AI — Powered by IntegraMind AI',bookNow:'Rezervă Acum',modules: modsEn },
    vessels: { title:'Operațiuni Nave',refresh:'Actualizare',lastUpdated:'Ultima actualizare',speed:'Viteză',fuel:'Combustibil',eta:'ETA',delayRisk:'Risc Întârziere',status:{underway:'În navigare',at_anchor:'La ancoră',moored:'Acostat'} },
    chat: { title:'Agent AI Clienți',placeholder:'Scrieți mesajul...',suggestions:['Ce rute operează Minoan Lines?','Când este următoarea plecare spre Heraklion?','Ce opțiuni de cabină există?','Când să ajung la port?'] },
    compliance: { title:'Conformitate UE',refresh:'Actualizare',generateReport:'Generare Raport',generating:'Se generează...',totalCO2:'Total CO₂ (tone)',etsAllowances:'Permise ETS',avgCII:'CII Mediu',reportDate:'Data Raport',euEts:'Raport EU ETS',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'Helpdesk IT',newTicket:'Bilet Nou',submit:'Trimite',titleLabel:'Titlu problemă',descLabel:'Descrieți problema',nameLabel:'Numele dvs. (opțional)',noTickets:'Fără bilete.',markInProgress:'În curs',markResolved:'Rezolvat',escalate:'Escaladare',aiSuggested:'Răspuns AI',bookingRef:'Ref. rezervare',ticketNumber:'Nr. bilet',filters:{all:'Toate',open:'Deschise',in_progress:'În curs',resolved:'Rezolvate',escalated:'Escalate'} },
    analytics: { title:'Analiza Cererii',refresh:'Actualizare',weeklyPassengers:'Pasageri Săptămânali',weeklyRevenue:'Venituri Săptămânale',peakRoute:'Rută de Vârf',forecastAccuracy:'Precizie Prognoză',generateInsights:'Generare Perspective pentru',forecastTitle:'Prognoză 7 Zile',aiInsights:'Perspective AI Cerere' },
    common: { loading:'Se încarcă...',error:'A apărut o eroare',retry:'Reîncercați' },
    employees: empEn,
    maintenance: mntEn,
  }},
  cs: { translation: {
    nav: navCs,
    home: { title:'AI platforma Minoan Lines',subtitle:'Provozní AI platforma — Powered by IntegraMind AI',bookNow:'Rezervovat Nyní',modules: modsEn },
    vessels: { title:'Provoz lodí',refresh:'Obnovit',lastUpdated:'Poslední aktualizace',speed:'Rychlost',fuel:'Palivo',eta:'ETA',delayRisk:'Riziko zpoždění',status:{underway:'Na cestě',at_anchor:'Na kotvě',moored:'Přistaven'} },
    chat: { title:'AI zákaznický servis',placeholder:'Napište zprávu...',suggestions:['Jaké trasy Minoan Lines provozuje?','Kdy jede příští loď do Heraklion?','Jaké kabiny jsou k dispozici?','Kdy mám přijet do přístavu?'] },
    compliance: { title:'Soulad s EU',refresh:'Obnovit',generateReport:'Generovat zprávu',generating:'Generování...',totalCO2:'Celkový CO₂ (t)',etsAllowances:'Povolenky ETS',avgCII:'Průměr CII',reportDate:'Datum zprávy',euEts:'Zpráva EU ETS',fuelEu:'FuelEU Maritime' },
    helpdesk: { title:'IT Helpdesk',newTicket:'Nový tiket',submit:'Odeslat',titleLabel:'Název problému',descLabel:'Popište problém',nameLabel:'Vaše jméno (volitelné)',noTickets:'Žádné tikety.',markInProgress:'Probíhá',markResolved:'Vyřešeno',escalate:'Eskalovat',aiSuggested:'Odpověď AI',bookingRef:'Ref. rezervace',ticketNumber:'Č. tiketu',filters:{all:'Vše',open:'Otevřené',in_progress:'Probíhá',resolved:'Vyřešené',escalated:'Eskalované'} },
    analytics: { title:'Analýza poptávky',refresh:'Obnovit',weeklyPassengers:'Týdenní cestující',weeklyRevenue:'Týdenní příjmy',peakRoute:'Hlavní trasa',forecastAccuracy:'Přesnost prognózy',generateInsights:'Generovat přehledy pro',forecastTitle:'7denní prognóza',aiInsights:'AI přehledy poptávky' },
    common: { loading:'Načítání...',error:'Došlo k chybě',retry:'Zkusit znovu' },
    employees: empEn,
    maintenance: mntEn,
  }},
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
    });
}

export default i18n;