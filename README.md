
# Sistema di Gestione Inventario

Un'applicazione web per la gestione dell'inventario con supporto per codici QR, prestiti e reporting.

## Requisiti

- Node.js 20.x
- PostgreSQL 16.x

## Configurazione Ambiente di Sviluppo

1. Clona il repository su Replit
2. Installa le dipendenze:
```bash
npm install
```

3. Configura le variabili d'ambiente nel tool Secrets di Replit:
- `DATABASE_URL`: URL di connessione al database PostgreSQL
- `SESSION_SECRET`: Chiave segreta per la sessione
- `NODE_ENV`: Impostare a "development" per lo sviluppo

4. Inizializza il database:
```bash
npm run db:push
```

5. Avvia l'applicazione in modalità sviluppo:
```bash
npm run dev
```

L'applicazione sarà disponibile all'indirizzo fornito da Replit.

## Struttura del Progetto

- `/client`: Applicazione frontend React
- `/server`: Server Express.js
- `/shared`: Codice condiviso tra client e server
- `/migrations`: Migrazioni del database

## Funzionalità Principali

- Gestione inventario con supporto QR
- Sistema di prestiti
- Reporting e analytics
- Gestione utenti e permessi
- Interfaccia multilingua (IT/EN)

## Deployment in Produzione

1. Dalla dashboard di Replit, clicca sul pulsante "Deploy"

2. L'applicazione verrà compilata automaticamente:
```bash
npm run build
```

3. Il server di produzione verrà avviato con:
```bash
npm run start
```

## Note per la Produzione

- L'applicazione usa PostgreSQL come database
- Le sessioni vengono memorizzate nel database
- Il server Express serve sia l'API che i file statici
- La porta predefinita è 5000

## Manutenzione

- Backup automatici configurabili dalle impostazioni
- Monitoraggio attività attraverso il pannello admin
- Log degli accessi e delle operazioni

## Supporto

Per assistenza, aprire una issue nel repository Replit.
