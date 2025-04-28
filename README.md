
# Sistema di Gestione Inventario

Un'applicazione web per la gestione dell'inventario con supporto per codici QR, prestiti e reporting.

## Requisiti

- Node.js 20.x
- SQLite 3.x

## Configurazione Ambiente di Sviluppo (Locale)

1. **Clona il repository**:
   ```bash
   git clone <URL_DEL_REPOSITORY>
   cd <NOME_REPOSITORY>
   ```

2. **Installa le dipendenze**:
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente**:
   Crea un file `.env` nella root del progetto e imposta le seguenti variabili:
   ```
   DATABASE_URL=sqlite:./dev.db
   SESSION_SECRET=your_secret_key_here
   NODE_ENV=development
   ```

4. **Inizializza il database**:
   ```bash
   npm run db:push
   ```

5. **Avvia l'applicazione in modalità sviluppo**:
   ```bash
   npm run dev
   ```

   L'applicazione sarà disponibile all'indirizzo `http://0.0.0.0:5000`.

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

1. **Compila l'applicazione**:
   ```bash
   npm run build
   ```

2. **Configura le variabili d'ambiente per produzione**:
   Crea un file `.env` nella root del progetto e imposta le seguenti variabili:
   ```
   DATABASE_URL=sqlite:./prod.db
   SESSION_SECRET=your_secure_production_secret
   NODE_ENV=production
   ```

3. **Avvia il server di produzione**:
   ```bash
   npm run start
   ```

   Il server sarà disponibile su `http://0.0.0.0:5000`.

## Note per la Produzione

- L'applicazione usa SQLite come database
- Il database viene salvato localmente nel file specificato in DATABASE_URL
- Le sessioni vengono memorizzate nel database
- Il server Express serve sia l'API che i file statici
- La porta predefinita è 5000

## Backup del Database

Si consiglia di configurare backup periodici del file del database SQLite:
- Effettuare una copia del file `.db` regolarmente
- Mantenere i backup in una posizione sicura
- Verificare periodicamente l'integrità dei backup

## Manutenzione

- Backup regolari del file database
- Monitoraggio attività attraverso il pannello admin
- Log degli accessi e delle operazioni

## Supporto

Per assistenza, aprire una issue nel repository.
