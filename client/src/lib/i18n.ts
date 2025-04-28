// Internationalization utility for the application
// This provides a simple translation service for the app
import React from "react";

const FORCE_ITALIAN = true;

// Italian translations (default)
const it = {
  // Common
  "app.name": "Sistema di Gestione Inventario",
  "app.loading": "Caricamento...",
  "app.error": "Si è verificato un errore.",
  "app.save": "Salva",
  "app.cancel": "Annulla",
  "app.edit": "Modifica",
  "app.delete": "Elimina",
  "app.back": "Indietro",
  "app.confirm": "Conferma",
  "app.search": "Cerca",
  "app.filter": "Filtra",
  "app.noResults": "Nessun risultato trovato",
  "app.addNew": "Aggiungi nuovo",
  "app.export": "Esporta",
  "app.print": "Stampa",
  "app.actions": "Azioni",
  "app.description": "Descrizione",
  "app.openMenu": "Apri menu",
  "app.clearSelection": "Cancella selezione",
  "app.generate": "Genera",
  "app.generating": "Generazione in corso...",

  // Navigation
  "nav.dashboard": "Cruscotto",
  "nav.inventory": "Inventario",
  "nav.loans": "Prestiti",
  "nav.qrcodes": "QR Code",
  "nav.reports": "Rapporti",
  "nav.settings": "Impostazioni",

  // Dashboard
  "dashboard.title": "Dashboard",
  "dashboard.totalItems": "Articoli totali",
  "dashboard.itemsOnLoan": "Articoli in prestito",
  "dashboard.overdueItems": "Articoli in ritardo",
  "dashboard.recentActivity": "Attività recenti",
  "dashboard.quickActions": "Azioni rapide",
  "dashboard.addItem": "Aggiungi articolo",
  "dashboard.scanQrCode": "Scansiona codice QR",
  "dashboard.createLoan": "Crea prestito",
  "dashboard.viewReports": "Visualizza rapporti",

  // Inventory
  "inventory.title": "Inventario",
  "inventory.search": "Cerca articoli",
  "inventory.filter": "Filtra",
  "inventory.add": "Aggiungi articolo",
  "inventory.generateQr": "Genera QR code",
  "inventory.name": "Nome",
  "inventory.id": "ID",
  "inventory.location": "Posizione",
  "inventory.category": "Categoria",
  "inventory.status": "Stato",
  "inventory.value": "Valore",
  "inventory.origin": "Origine",
  "inventory.actions": "Azioni",
  "inventory.status.available": "Disponibile",
  "inventory.status.loaned": "In prestito",
  "inventory.status.maintenance": "Manutenzione",
  "inventory.status.overdue": "Scaduto",

  // QR Codes
  "qrcode.title": "Codici QR",

  // Item Details
  "item.details.title": "Dettagli articolo",
  "item.details.name": "Nome",
  "item.details.id": "ID",
  "item.details.location": "Posizione",
  "item.details.category": "Categoria",
  "item.details.status": "Stato",
  "item.details.value": "Valore",
  "item.details.origin": "Origine",
  "item.details.notes": "Note",
  "item.details.loanHistory": "Cronologia prestiti",
  "item.activityHistory": "Cronologia attività",

  // Loans
  "loans.title": "Prestiti",
  "loans.active": "Prestiti attivi",
  "loans.overdue": "Prestiti in ritardo",
  "loans.history": "Cronologia prestiti",
  "loans.create": "Crea prestito",
  "loans.return": "Registra restituzione",
  "loans.extend": "Estendi prestito",
  "loans.name": "Nome articolo",
  "loans.borrower": "Richiedente",
  "loans.batch": "Elaborazione in blocco",
  "loans.email": "Email",
  "loans.phone": "Telefono",

  // Activity Types
  "activity.new": "Nuova",
  "activity.loan": "Prestito",
  "activity.return": "Restituzione",
  "activity.edit": "Modifica",
  "activity.delete": "Elimina",
  "activity.qrGenerated": "QR Generato",
  "activity.qrAssociated": "QR Associato",

  // Form Validation
  "validation.required": "Campo obbligatorio",
  "validation.email": "Email non valida",
  "validation.future": "La data deve essere nel futuro",
  "validation.positive": "Il valore deve essere positivo",
  "validation.maxLength": "Troppo lungo",
  "validation.minLength": "Troppo corto",

  // Reports
  "reports.reportType": "Tipo di rapporto",
  "reports.type.inventory": "Stato inventario",
  "reports.type.loans": "Stato prestiti",
  "reports.type.activity": "Timeline attività",
  "reports.dateRange": "Intervallo date",
  "reports.dateRange.7": "Ultimi 7 giorni",
  "reports.dateRange.30": "Ultimi 30 giorni",
  "reports.dateRange.90": "Ultimi 90 giorni",
  "reports.dateRange.365": "Ultimi 365 giorni",
  "reports.generate": "Genera rapporto",
  "reports.heading.inventory": "Rapporto stato inventario",
  "reports.heading.loans": "Rapporto stato prestiti",
  "reports.heading.activity": "Rapporto timeline attività",
  "reports.description.inventory":
    "Panoramica dello stato attuale dell'inventario e della distribuzione",
  "reports.description.loans":
    "Riepilogo dei prestiti attivi, scaduti e restituiti",
  "reports.description.activity":
    "Andamento delle attività negli ultimi {{days}} giorni",
  "reports.chart.inventoryByStatus": "Inventario per stato",
  "reports.chart.inventoryByLocation": "Inventario per posizione",
  "reports.chart.loanStatusDistribution": "Distribuzione stato prestiti",
  "reports.chart.loanSummary": "Riepilogo prestiti",
  "reports.chart.activityTimeline": "Timeline attività",
  "reports.summary.totalLoans": "Prestiti totali",
  "reports.summary.activeLoans": "Prestiti attivi",
  "reports.summary.overdue": "Scaduti",
  "reports.summary.returned": "Restituiti",
  // Table Headers
  "table.header.status": "Stato",
  "table.header.count": "Conteggio",
  "table.header.percentage": "Percentuale",
  "table.header.total": "Totale",
  // Reports Footer
  "reports.footer.generatedOn": "Rapporto generato il",
  "reports.footer.dataRange": "Intervallo dati: ultimi {days} giorni",

  // Settings
  "settings.systemSettings": "Impostazioni di sistema",
  "settings.configurePreferences":
    "Configura le preferenze del sistema di gestione inventario",
  "settings.general": "Generale",
  "settings.database": "Database",
  "settings.qrCodes": "Codici QR",
  "settings.generalSettings": "Impostazioni generali",
  "settings.generalDescription":
    "Configura le impostazioni di base dell'organizzazione e del sistema",
  "settings.organizationInformation": "Informazioni sull'organizzazione",
  "settings.organizationName": "Nome dell'organizzazione",
  "settings.contactEmail": "Email di contatto",
  "settings.loanSettings": "Impostazioni prestiti",
  "settings.defaultLoanDuration": "Durata prestito predefinita (giorni)",
  "settings.sendLoanReminders": "Invia promemoria prestito",
  "settings.enabled": "Abilitato",
  "settings.disabled": "Disabilitato",
  "settings.sendRemindersDescription":
    "Invia promemoria via email per prestiti imminenti e in scadenza",
  "settings.saveSettings": "Salva impostazioni",
  "settings.databaseConfiguration": "Configurazione database",
  "settings.databaseDescription":
    "Configura impostazioni database e preferenze di backup",
  "settings.databaseSettings": "Impostazioni database",
  "settings.databaseType": "Tipo di database",
  "settings.selectDatabaseType": "Seleziona tipo di database",
  "settings.sqlite": "SQLite (Predefinito)",
  "settings.postgresql": "PostgreSQL",
  "settings.mysql": "MySQL",
  "settings.mssql": "Microsoft SQL Server",
  "settings.changeDbWarning":
    "Attenzione: cambiare il tipo di database richiederà un riavvio e potrebbe necessitare di configurazioni aggiuntive",
  "settings.backupSettings": "Impostazioni backup",
  "settings.enableAutomaticBackups": "Abilita backup automatici",
  "settings.backupFrequency": "Frequenza backup",
  "settings.selectFrequency": "Seleziona frequenza",
  "settings.hourly": "Ogni ora",
  "settings.daily": "Quotidiano",
  "settings.weekly": "Settimanale",
  "settings.monthly": "Mensile",
  "settings.backupTime": "Orario backup",
  "settings.runManualBackup": "Esegui backup manuale",
  "settings.qrCodeSettings": "Impostazioni codice QR",
  "settings.qrCodeDescription":
    "Configura impostazioni generazione codici QR e barcode",
  "settings.idGeneration": "Generazione ID",
  "settings.idPrefix": "Prefisso ID",
  "settings.idPrefixPlaceholder": "ITEM-",
  "settings.prefixDescription":
    "Prefisso aggiunto a tutti gli ID generati automaticamente",
  "settings.autoGenerateIds": "Genera automaticamente ID",
  "settings.autoGenerateDescription":
    "Genera automaticamente ID per nuovi elementi",
  "settings.qrCodeContent": "Contenuto codice QR",
  "settings.includeLocationInQr": "Includi posizione nel codice QR",
  "settings.includeLocationDescription":
    "Includi informazioni di posizione dell'elemento nei dati QR",
  "settings.qrCodePreview": "Anteprima codice QR",
  "settings.exampleItem": "Elemento di esempio",
  "settings.exampleLocation": "Magazzino A",
  "settings.settingsSaved": "Impostazioni salvate",
  "settings.settingsSavedDescription":
    "Le tue impostazioni sono state salvate con successo.",
  "settings.settingsSaveError": "Impossibile salvare le impostazioni",
};

// English translations
const en = {
  // Common
  "app.name": "Inventory Management System",
  "app.loading": "Loading...",
  "app.error": "An error occurred.",
  "app.save": "Save",
  "app.cancel": "Cancel",
  "app.edit": "Edit",
  "app.delete": "Delete",
  "app.back": "Back",
  "app.confirm": "Confirm",
  "app.search": "Search",
  "app.filter": "Filter",
  "app.noResults": "No results found",
  "app.addNew": "Add New",
  "app.export": "Export",
  "app.print": "Print",

  // Navigation
  "nav.dashboard": "Dashboard",
  "nav.inventory": "Inventory",
  "nav.loans": "Loans",
  "nav.qrcodes": "QR Codes",
  "nav.reports": "Reports",
  "nav.settings": "Settings",

  // Dashboard
  "dashboard.title": "Dashboard",
  "dashboard.totalItems": "Total Items",
  "dashboard.itemsOnLoan": "Items on Loan",
  "dashboard.overdueItems": "Overdue Items",
  "dashboard.recentActivity": "Recent Activity",
  "dashboard.quickActions": "Quick Actions",
  "dashboard.addItem": "Add Item",
  "dashboard.scanQrCode": "Scan QR Code",
  "dashboard.createLoan": "Create Loan",
  "dashboard.viewReports": "View Reports",

  // Inventory
  "inventory.title": "Inventory",
  "inventory.search": "Search items",
  "inventory.filter": "Filter",
  "inventory.add": "Add Item",
  "inventory.generateQr": "Generate QR",
  "inventory.name": "Name",
  "inventory.id": "ID",
  "inventory.location": "Location",
  "inventory.category": "Category",
  "inventory.status": "Status",
  "inventory.value": "Value",
  "inventory.origin": "Origin",
  "inventory.actions": "Actions",
  "inventory.status.available": "Available",
  "inventory.status.loaned": "Loaned",
  "inventory.status.maintenance": "Maintenance",
  "inventory.status.overdue": "Overdue",

  // QR Codes
  "qrcode.title": "QR Codes",

  // Item Details
  "item.details.title": "Item Details",
  "item.details.name": "Name",
  "item.details.id": "ID",
  "item.details.location": "Location",
  "item.details.category": "Category",
  "item.details.status": "Status",
  "item.details.value": "Value",
  "item.details.origin": "Origin",
  "item.details.notes": "Notes",
  "item.details.loanHistory": "Loan History",
  "item.activityHistory": "Activity History",

  // Loans
  "loans.title": "Loans",
  "loans.active": "Active Loans",
  "loans.overdue": "Overdue Loans",
  "loans.history": "Loan History",
  "loans.create": "Create Loan",
  "loans.return": "Record Return",
  "loans.extend": "Extend Loan",
  "loans.name": "Item Name",
  "loans.borrower": "Borrower",
  "loans.batch": "Batch Processing",
  "loans.email": "Email",
  "loans.phone": "Phone",

  // Activity Types
  "activity.new": "New",
  "activity.loan": "Loan",
  "activity.return": "Return",
  "activity.edit": "Edit",
  "activity.delete": "Delete",
  "activity.qrGenerated": "QR Generated",
  "activity.qrAssociated": "QR Associated",

  // Form Validation
  "validation.required": "Field is required",
  "validation.email": "Invalid email",
  "validation.future": "Date must be in the future",
  "validation.positive": "Value must be positive",
  "validation.maxLength": "Too long",
  "validation.minLength": "Too short",

  // Reports
  "reports.reportType": "Report Type",
  "reports.type.inventory": "Inventory Status",
  "reports.type.loans": "Loan Status",
  "reports.type.activity": "Activity Timeline",
  "reports.dateRange": "Date Range",
  "reports.dateRange.7": "Last 7 days",
  "reports.dateRange.30": "Last 30 days",
  "reports.dateRange.90": "Last 90 days",
  "reports.dateRange.365": "Last 365 days",
  "reports.generate": "Generate Report",
  "reports.heading.inventory": "Inventory Status Report",
  "reports.heading.loans": "Loan Status Report",
  "reports.heading.activity": "Activity Timeline Report",
  "reports.description.inventory":
    "Overview of current inventory status and distribution",
  "reports.description.loans": "Summary of active, overdue and returned loans",
  "reports.description.activity": "Activity trends over the last {{days}} days",
  "reports.chart.inventoryByStatus": "Inventory by Status",
  "reports.chart.inventoryByLocation": "Inventory by Location",
  "reports.chart.loanStatusDistribution": "Loan Status Distribution",
  "reports.chart.loanSummary": "Loan Summary",
  "reports.chart.activityTimeline": "Activity Timeline",
  "reports.summary.totalLoans": "Total Loans",
  "reports.summary.activeLoans": "Active Loans",
  "reports.summary.overdue": "Overdue",
  "reports.summary.returned": "Returned",
  // Table Headers
  "table.header.status": "Status",
  "table.header.count": "Count",
  "table.header.percentage": "Percentage",
  "table.header.total": "Total",
  // Reports Footer
  "reports.footer.generatedOn": "Report generated on",
  "reports.footer.dataRange": "Data range: Last {{days}} days",

  // Settings
  "settings.systemSettings": "System Settings",
  "settings.configurePreferences":
    "Configure your inventory management system preferences",
  "settings.general": "General",
  "settings.database": "Database",
  "settings.qrCodes": "QR Codes",
  "settings.generalSettings": "General Settings",
  "settings.generalDescription":
    "Configure basic organization and system settings",
  "settings.organizationInformation": "Organization Information",
  "settings.organizationName": "Organization Name",
  "settings.contactEmail": "Contact Email",
  "settings.loanSettings": "Loan Settings",
  "settings.defaultLoanDuration": "Default Loan Duration (days)",
  "settings.sendLoanReminders": "Send Loan Reminders",
  "settings.enabled": "Enabled",
  "settings.disabled": "Disabled",
  "settings.sendRemindersDescription":
    "Send email reminders for upcoming and overdue loans",
  "settings.saveSettings": "Save Settings",
  "settings.databaseConfiguration": "Database Configuration",
  "settings.databaseDescription":
    "Configure database settings and backup preferences",
  "settings.databaseSettings": "Database Settings",
  "settings.databaseType": "Database Type",
  "settings.selectDatabaseType": "Select database type",
  "settings.sqlite": "SQLite (Default)",
  "settings.postgresql": "PostgreSQL",
  "settings.mysql": "MySQL",
  "settings.mssql": "Microsoft SQL Server",
  "settings.changeDbWarning":
    "Warning: Changing database type will require a restart and may require additional configuration",
  "settings.backupSettings": "Backup Settings",
  "settings.enableAutomaticBackups": "Enable Automatic Backups",
  "settings.backupFrequency": "Backup Frequency",
  "settings.selectFrequency": "Select frequency",
  "settings.hourly": "Hourly",
  "settings.daily": "Daily",
  "settings.weekly": "Weekly",
  "settings.monthly": "Monthly",
  "settings.backupTime": "Backup Time",
  "settings.runManualBackup": "Run Manual Backup",
  "settings.qrCodeSettings": "QR Code Settings",
  "settings.qrCodeDescription":
    "Configure QR code and barcode generation settings",
  "settings.idGeneration": "ID Generation",
  "settings.idPrefix": "ID Prefix",
  "settings.idPrefixPlaceholder": "ITEM-",
  "settings.prefixDescription":
    "Prefix added to all automatically generated IDs",
  "settings.autoGenerateIds": "Auto-generate IDs",
  "settings.autoGenerateDescription":
    "Automatically generate IDs for new items",
  "settings.qrCodeContent": "QR Code Content",
  "settings.includeLocationInQr": "Include Location in QR Code",
  "settings.includeLocationDescription":
    "Include item location information in QR code data",
  "settings.qrCodePreview": "QR Code Preview",
  "settings.exampleItem": "Example Item",
  "settings.exampleLocation": "Storage A",
  "settings.settingsSaved": "Settings saved",
  "settings.settingsSavedDescription":
    "Your settings have been saved successfully.",
  "settings.settingsSaveError": "Failed to save settings",
};

// Create a map of languages
const translations: Record<string, Record<string, string>> = {
  it,
  en,
};

// Default language is Italian
let currentLanguage: "it" | "en" = "it";

/**
 * Get a translation for a key in the current language
 * @param key The translation key
 * @param params Optional parameters to interpolate
 * @returns The translated string
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const translation =
    translations[currentLanguage][key] || translations.it[key] || key;

  if (!params) {
    return translation;
  }

  // Simple interpolation
  return Object.entries(params).reduce(
    (str, [key, value]) =>
      str.replace(new RegExp(`{${key}}`, "g"), String(value)),
    translation,
  );
}

/**
 * Set the application language
 * @param lang Language code (e.g., 'en', 'it')
 */
export function setLanguage(lang: "en" | "it"): void {
  if (translations[lang]) {
    currentLanguage = lang;
    // Persist language preference
    localStorage.setItem("appLanguage", lang);

    // Dispatch event for components to re-render
    window.dispatchEvent(new Event("languageChanged"));
  }
}

/**
 * Initialize language from stored preference or browser language
 */
export function initLanguage(): void {
  // First try from localStorage
  const storedLang = localStorage.getItem("appLanguage") as "en" | "it" | null;

  if (storedLang && translations[storedLang]) {
    currentLanguage = storedLang;
    return;
  }

  // Next try from browser settings, but default to Italian regardless
  const browserLang = navigator.language.split("-")[0];

  if (
    browserLang === "en" &&
    translations[browserLang] &&
    FORCE_ITALIAN == false
  ) {
    currentLanguage = browserLang;
  } else {
    // Default to Italian
    currentLanguage = "it";
  }
}

/**
 * Get the current language code
 */
export function getCurrentLanguage(): string {
  return currentLanguage;
}

/**
 * Hook to use translations with re-render on language change
 */
export function useTranslation() {
  const [, setRender] = React.useState(0);

  React.useEffect(() => {
    // Force re-render when language changes
    const handleLanguageChange = () => setRender((prev) => prev + 1);
    window.addEventListener("languageChanged", handleLanguageChange);

    return () => {
      window.removeEventListener("languageChanged", handleLanguageChange);
    };
  }, []);

  return { t, setLanguage, language: currentLanguage };
}

// Initialize on import
initLanguage();

console.log("[i18n] Lingua inizializzata:", getCurrentLanguage());

export default { t, setLanguage, getCurrentLanguage, useTranslation };
