// Internationalization utility for the application
// This provides a simple translation service for the app
import React from 'react';

// Italian translations (default)
const it = {
  // Common
  'app.name': 'Sistema di Gestione Inventario',
  'app.loading': 'Caricamento...',
  'app.error': 'Si è verificato un errore.',
  'app.save': 'Salva',
  'app.cancel': 'Annulla',
  'app.edit': 'Modifica',
  'app.delete': 'Elimina',
  'app.back': 'Indietro',
  'app.confirm': 'Conferma',
  'app.search': 'Cerca',
  'app.filter': 'Filtra',
  'app.noResults': 'Nessun risultato trovato',
  'app.addNew': 'Aggiungi nuovo',
  'app.actions': 'Azioni',
  'app.description': 'Descrizione',
  'app.openMenu': 'Apri menu',
  'app.clearSelection': 'Cancella selezione',
  'app.generate': 'Genera',
  'app.generating': 'Generazione in corso...',
  
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.inventory': 'Inventario',
  'nav.loans': 'Prestiti',
  'nav.qrcodes': 'QR Codes',
  'nav.reports': 'Rapporti',
  'nav.settings': 'Impostazioni',
  
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.totalItems': 'Articoli totali',
  'dashboard.itemsOnLoan': 'Articoli in prestito',
  'dashboard.overdueItems': 'Articoli in ritardo',
  'dashboard.recentActivity': 'Attività recenti',
  'dashboard.quickActions': 'Azioni rapide',
  'dashboard.addItem': 'Aggiungi articolo',
  'dashboard.scanQrCode': 'Scansiona QR code',
  'dashboard.createLoan': 'Crea prestito',
  'dashboard.viewReports': 'Visualizza rapporti',
  
  // Inventory
  'inventory.title': 'Inventario',
  'inventory.search': 'Cerca articoli',
  'inventory.filter': 'Filtra',
  'inventory.add': 'Aggiungi articolo',
  'inventory.generateQr': 'Genera QR code',
  'inventory.name': 'Nome',
  'inventory.id': 'ID',
  'inventory.location': 'Posizione',
  'inventory.category': 'Categoria',
  'inventory.status': 'Stato',
  'inventory.value': 'Valore',
  'inventory.origin': 'Origine',
  'inventory.actions': 'Azioni',
  'inventory.status.available': 'Disponibile',
  'inventory.status.loaned': 'In prestito',
  'inventory.status.maintenance': 'In manutenzione',
  'inventory.status.overdue': 'In ritardo',
  
  // Item Details
  'item.details': 'Dettagli articolo',
  'item.edit': 'Modifica articolo',
  'item.delete': 'Elimina articolo',
  'item.createLoan': 'Crea prestito',
  'item.name': 'Nome',
  'item.description': 'Descrizione',
  'item.location': 'Posizione',
  'item.category': 'Categoria',
  'item.status': 'Stato',
  'item.value': 'Valore',
  'item.serialNumber': 'Numero di serie',
  'item.purchaseDate': 'Data di acquisto',
  'item.origin': 'Origine',
  'item.notes': 'Note',
  'item.loanHistory': 'Cronologia prestiti',
  'item.activityHistory': 'Cronologia attività',
  
  // Loans
  'loans.title': 'Prestiti',
  'loans.active': 'Prestiti attivi',
  'loans.overdue': 'Prestiti in ritardo',
  'loans.history': 'Cronologia prestiti',
  'loans.create': 'Crea prestito',
  'loans.return': 'Registra restituzione',
  'loans.extend': 'Estendi prestito',
  'loans.name': 'Nome articolo',
  'loans.borrower': 'Richiedente',
  'loans.email': 'Email',
  'loans.phone': 'Telefono',
  'loans.dueDate': 'Data di scadenza',
  'loans.returnDate': 'Data di restituzione',
  'loans.status': 'Stato',
  'loans.status.active': 'Attivo',
  'loans.status.returned': 'Restituito',
  'loans.status.overdue': 'In ritardo',
  'loans.confirmReturn': 'Conferma restituzione',
  
  // QR Codes
  'qrcode.title': 'QR Codes',
  'qrcode.generator': 'Generatore QR',
  'qrcode.batchGenerate': 'Genera QR in batch',
  'qrcode.print': 'Stampa',
  'qrcode.scanned': 'QR Scansionato',
  'qrcode.itemId': 'ID Articolo',
  'qrcode.preGenerate': 'Genera QR pre-assegnazione',
  'qrcode.generateEmpty': 'Genera QR vuoto',
  'qrcode.namePrefix': 'Prefisso nome',
  'qrcode.quantity': 'Quantità',
  'qrcode.emptyCodesList': 'Lista di QR codes non assegnati',
  'qrcode.emptyCodesDescription': 'QR codes che possono essere associati agli articoli',
  'qrcode.associate': 'Associa a un articolo',
  'qrcode.associateWithItem': 'Associa con articolo',
  'qrcode.exportCSV': 'Esporta elenco CSV',
  'qrcode.scanToAssociate': 'Scansiona per associare',
  'qrcode.scanner': 'Scanner',
  'qrcode.scannerSoon': 'La funzionalità di scansione sarà implementata a breve.',
  'qrcode.code': 'Codice',
  'qrcode.dateGenerated': 'Data generazione',
  'qrcode.selected': 'selezionati',
  'qrcode.generateNew': 'Genera nuovi QR',
  'qrcode.generateNewDescription': 'Crea nuovi codici QR non associati',
  'qrcode.noEmptyCodes': 'Nessun QR code non assegnato',
  'qrcode.noEmptyCodesDescription': 'Genera nuovi QR codes per associarli agli articoli successivamente',
  'qrcode.prefix': 'Prefisso',
  'qrcode.prefixHelp': 'Un prefisso significativo aiuta a identificare i codici (es. ITEM-, TOOL-)',
  'qrcode.quantityHelp': 'Numero di QR codes da generare (max 100)',
  'qrcode.descriptionPlaceholder': 'Descrizione opzionale',
  'qrcode.quantityInvalid': 'La quantità deve essere tra 1 e 100',
  'qrcode.generated': 'QR codes generati',
  'qrcode.generatedSuccess': 'I QR codes sono stati generati con successo',
  'qrcode.generationFailed': 'Si è verificato un errore durante la generazione dei QR codes',
  'qrcode.associated': 'QR code associato',
  'qrcode.associatedSuccess': 'Il QR code è stato associato con successo',
  'qrcode.associationFailed': 'Si è verificato un errore durante l\'associazione del QR code',
  
  // Settings
  'settings.title': 'Impostazioni',
  'settings.organization': 'Organizzazione',
  'settings.orgName': 'Nome organizzazione',
  'settings.language': 'Lingua',
  'settings.database': 'Database',
  'settings.qrCode': 'Impostazioni QR Code',
  'settings.qrPrefix': 'Prefisso QR',
  'settings.autoGenerate': 'Genera automaticamente QR',
  'settings.itemDefaults': 'Valori predefiniti articoli',
  'settings.defaultLoanDuration': 'Durata prestito predefinita (giorni)',
  
  // Activity Types
  'activity.new': 'Nuovo',
  'activity.loan': 'Prestito',
  'activity.return': 'Restituzione',
  'activity.edit': 'Modifica',
  'activity.delete': 'Eliminazione',
  'activity.qrGenerated': 'QR Generato',
  'activity.qrAssociated': 'QR Associato',
  
  // Form Validation
  'validation.required': 'Campo obbligatorio',
  'validation.email': 'Email non valida',
  'validation.future': 'La data deve essere nel futuro',
  'validation.positive': 'Il valore deve essere positivo',
  'validation.maxLength': 'Troppo lungo',
  'validation.minLength': 'Troppo corto',
};

// English translations
const en = {
  // Common
  'app.name': 'Inventory Management System',
  'app.loading': 'Loading...',
  'app.error': 'An error occurred.',
  'app.save': 'Save',
  'app.cancel': 'Cancel',
  'app.edit': 'Edit',
  'app.delete': 'Delete',
  'app.back': 'Back',
  'app.confirm': 'Confirm',
  'app.search': 'Search',
  'app.filter': 'Filter',
  'app.noResults': 'No results found',
  'app.addNew': 'Add New',
  
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.inventory': 'Inventory',
  'nav.loans': 'Loans',
  'nav.qrcodes': 'QR Codes',
  'nav.reports': 'Reports',
  'nav.settings': 'Settings',
  
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.totalItems': 'Total Items',
  'dashboard.itemsOnLoan': 'Items on Loan',
  'dashboard.overdueItems': 'Overdue Items',
  'dashboard.recentActivity': 'Recent Activity',
  'dashboard.quickActions': 'Quick Actions',
  'dashboard.addItem': 'Add Item',
  'dashboard.scanQrCode': 'Scan QR Code',
  'dashboard.createLoan': 'Create Loan',
  'dashboard.viewReports': 'View Reports',
  
  // Inventory
  'inventory.title': 'Inventory',
  'inventory.search': 'Search items',
  'inventory.filter': 'Filter',
  'inventory.add': 'Add Item',
  'inventory.generateQr': 'Generate QR',
  'inventory.name': 'Name',
  'inventory.id': 'ID',
  'inventory.location': 'Location',
  'inventory.category': 'Category',
  'inventory.status': 'Status',
  'inventory.value': 'Value',
  'inventory.origin': 'Origin',
  'inventory.actions': 'Actions',
  'inventory.status.available': 'Available',
  'inventory.status.loaned': 'Loaned',
  'inventory.status.maintenance': 'Maintenance',
  'inventory.status.overdue': 'Overdue',
  
  // Item Details
  'item.details': 'Item Details',
  'item.edit': 'Edit Item',
  'item.delete': 'Delete Item',
  'item.createLoan': 'Create Loan',
  'item.name': 'Name',
  'item.description': 'Description',
  'item.location': 'Location',
  'item.category': 'Category',
  'item.status': 'Status',
  'item.value': 'Value',
  'item.serialNumber': 'Serial Number',
  'item.purchaseDate': 'Purchase Date',
  'item.origin': 'Origin',
  'item.notes': 'Notes',
  'item.loanHistory': 'Loan History',
  'item.activityHistory': 'Activity History',
  
  // Loans
  'loans.title': 'Loans',
  'loans.active': 'Active Loans',
  'loans.overdue': 'Overdue Loans',
  'loans.history': 'Loan History',
  'loans.create': 'Create Loan',
  'loans.return': 'Record Return',
  'loans.extend': 'Extend Loan',
  'loans.name': 'Item Name',
  'loans.borrower': 'Borrower',
  'loans.email': 'Email',
  'loans.phone': 'Phone',
  'loans.dueDate': 'Due Date',
  'loans.returnDate': 'Return Date',
  'loans.status': 'Status',
  'loans.status.active': 'Active',
  'loans.status.returned': 'Returned',
  'loans.status.overdue': 'Overdue',
  'loans.confirmReturn': 'Confirm Return',
  
  // QR Codes
  'qrcode.title': 'QR Codes',
  'qrcode.generator': 'QR Generator',
  'qrcode.batchGenerate': 'Batch Generate QR',
  'qrcode.print': 'Print',
  'qrcode.scanned': 'Scanned QR',
  'qrcode.itemId': 'Item ID',
  'qrcode.preGenerate': 'Pre-Generate QR',
  'qrcode.generateEmpty': 'Generate Empty QR',
  'qrcode.namePrefix': 'Name Prefix',
  'qrcode.quantity': 'Quantity',
  'qrcode.emptyCodesList': 'List of Unassigned QR Codes',
  'qrcode.emptyCodesDescription': 'QR codes that can be associated with items',
  'qrcode.associate': 'Associate with Item',
  'qrcode.associateWithItem': 'Associate with Item',
  'qrcode.exportCSV': 'Export CSV List',
  'qrcode.scanToAssociate': 'Scan to Associate',
  'qrcode.scanner': 'Scanner',
  'qrcode.scannerSoon': 'Scanner functionality will be implemented soon.',
  'qrcode.code': 'Code',
  'qrcode.dateGenerated': 'Date Generated',
  'qrcode.selected': 'selected',
  'qrcode.generateNew': 'Generate New QR Codes',
  'qrcode.generateNewDescription': 'Create new unassociated QR codes',
  'qrcode.noEmptyCodes': 'No unassigned QR codes',
  'qrcode.noEmptyCodesDescription': 'Generate new QR codes to associate with items later',
  'qrcode.prefix': 'Prefix',
  'qrcode.prefixHelp': 'A meaningful prefix helps identify codes (e.g., ITEM-, TOOL-)',
  'qrcode.quantityHelp': 'Number of QR codes to generate (max 100)',
  'qrcode.descriptionPlaceholder': 'Optional description',
  'qrcode.quantityInvalid': 'Quantity must be between 1 and 100',
  'qrcode.generated': 'QR codes generated',
  'qrcode.generatedSuccess': 'QR codes have been generated successfully',
  'qrcode.generationFailed': 'An error occurred while generating QR codes',
  'qrcode.associated': 'QR code associated',
  'qrcode.associatedSuccess': 'QR code has been associated successfully',
  'qrcode.associationFailed': 'An error occurred while associating the QR code',
  
  // Settings
  'settings.title': 'Settings',
  'settings.organization': 'Organization',
  'settings.orgName': 'Organization Name',
  'settings.language': 'Language',
  'settings.database': 'Database',
  'settings.qrCode': 'QR Code Settings',
  'settings.qrPrefix': 'QR Prefix',
  'settings.autoGenerate': 'Auto-generate QR',
  'settings.itemDefaults': 'Item Defaults',
  'settings.defaultLoanDuration': 'Default Loan Duration (days)',
  
  // Activity Types
  'activity.new': 'New',
  'activity.loan': 'Loan',
  'activity.return': 'Return',
  'activity.edit': 'Edit',
  'activity.delete': 'Delete',
  'activity.qrGenerated': 'QR Generated',
  'activity.qrAssociated': 'QR Associated',
  
  // Form Validation
  'validation.required': 'Field is required',
  'validation.email': 'Invalid email',
  'validation.future': 'Date must be in the future',
  'validation.positive': 'Value must be positive',
  'validation.maxLength': 'Too long',
  'validation.minLength': 'Too short',
};

// Create a map of languages
const translations: Record<string, Record<string, string>> = {
  it,
  en,
};

// Default language is Italian
let currentLanguage: 'it' | 'en' = 'it';

/**
 * Get a translation for a key in the current language
 * @param key The translation key
 * @param params Optional parameters to interpolate
 * @returns The translated string
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const translation = translations[currentLanguage][key] || translations.it[key] || key;
  
  if (!params) {
    return translation;
  }
  
  // Simple interpolation
  return Object.entries(params).reduce(
    (str, [key, value]) => str.replace(new RegExp(`{${key}}`, 'g'), String(value)),
    translation
  );
}

/**
 * Set the application language
 * @param lang Language code (e.g., 'en', 'it')
 */
export function setLanguage(lang: 'en' | 'it'): void {
  if (translations[lang]) {
    currentLanguage = lang;
    // Persist language preference
    localStorage.setItem('appLanguage', lang);
    
    // Dispatch event for components to re-render
    window.dispatchEvent(new Event('languageChanged'));
  }
}

/**
 * Initialize language from stored preference or browser language
 */
export function initLanguage(): void {
  // First try from localStorage
  const storedLang = localStorage.getItem('appLanguage') as 'en' | 'it' | null;
  
  if (storedLang && translations[storedLang]) {
    currentLanguage = storedLang;
    return;
  }
  
  // Next try from browser settings, but default to Italian regardless
  const browserLang = navigator.language.split('-')[0];
  
  if (browserLang === 'en' && translations[browserLang]) {
    currentLanguage = browserLang;
  } else {
    // Default to Italian
    currentLanguage = 'it';
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
    const handleLanguageChange = () => setRender(prev => prev + 1);
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);
  
  return { t, setLanguage, language: currentLanguage };
}

// Initialize on import
initLanguage();

export default { t, setLanguage, getCurrentLanguage, useTranslation };