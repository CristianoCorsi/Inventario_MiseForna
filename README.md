
# Sistema di Gestione Inventario - Misericordia di Fornacette

Un'applicazione web per la gestione dell'inventario con supporto per codici QR, prestiti e reporting, sviluppata specificamente per le esigenze della Misericordia di Fornacette.

## Requisiti

- Node.js 20.x o superiore
- SQLite 3.x (incluso come dipendenza, non richiede installazione separata)
- Sistemi operativi supportati: Windows, macOS, Linux

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
   Copia il file `.env.example` in un nuovo file `.env`:
   
   Per Windows:
   ```cmd
   copy .env.example .env
   ```
   
   Per macOS/Linux:
   ```bash
   cp .env.example .env
   ```
   
   Il file `.env` contiene già le configurazioni predefinite per utilizzare SQLite.

4. **Avvia l'applicazione in modalità sviluppo**:
   
   Per Windows:
   ```cmd
   .\dev-win.bat
   ```
   
   Per macOS/Linux:
   ```bash
   # Rendi lo script eseguibile
   chmod +x ./dev.sh
   # Esegui lo script
   ./dev.sh
   ```

   L'applicazione sarà disponibile all'indirizzo `http://localhost:5000`.

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

### Compilazione e Avvio Standard

1. **Compila l'applicazione**:
   ```bash
   npm run build
   ```

2. **Configura le variabili d'ambiente per produzione**:
   Crea un file `.env` nella root del progetto utilizzando il file `.env.example` come base:
   ```
   DB_TYPE=sqlite
   SESSION_SECRET=your_secure_production_secret
   NODE_ENV=production
   COOKIE_SECURE=true  # Se usi HTTPS
   ```

3. **Avvia il server di produzione**:
   ```bash
   npm run start
   ```

   Il server sarà disponibile su `http://0.0.0.0:5000`.

### Script di Avvio per SQLite in Produzione

Per semplificare l'avvio con SQLite in produzione, è stato creato uno script dedicato:

**Windows**:
1. Crea un file `start-with-sqlite-win.bat` contenente:
   ```cmd
   @echo off
   set NODE_ENV=production
   set DB_TYPE=sqlite
   set SESSION_SECRET=your-secure-production-secret
   node dist/index.js
   ```

2. Esegui lo script:
   ```cmd
   .\start-with-sqlite-win.bat
   ```

**Linux/macOS**:
1. Utilizza lo script `start-with-sqlite.sh` già incluso:
   ```bash
   chmod +x ./start-with-sqlite.sh
   ./start-with-sqlite.sh
   ```

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

## Risoluzione dei problemi comuni

### Errori in ambiente Windows

1. **Errore "NODE_ENV=development non è riconosciuto come comando" quando si esegue npm run dev**:
   Utilizzare lo script batch `dev-win.bat` creato appositamente per Windows:
   ```cmd
   .\dev-win.bat
   ```

2. **Errore "DATABASE_URL must be set"**:
   Assicurarsi di avere un file `.env` corretto nella root del progetto. Copiare il file `.env.example` e rinominarlo in `.env`:
   ```cmd
   copy .env.example .env
   ```

3. **Errori di login o registrazione utente**:
   - Verificare che sia impostata la variabile `SESSION_SECRET` nel file `.env`
   - Controllare che l'applicazione stia usando il database SQLite (`DB_TYPE=sqlite` nel file `.env`)
   - Se necessario, eliminare il database esistente e lasciare che l'applicazione ne crei uno nuovo all'avvio

4. **Errore di accesso alla pagina Admin**:
   - Assicurarsi di aver effettuato l'accesso con un account avente ruolo "admin"
   - L'utente predefinito è "admin" con password "admin"

### Errori in ambiente Linux/macOS

Se gli script `.sh` non sono eseguibili, concedere i permessi di esecuzione:
```bash
chmod +x ./dev.sh ./start-with-sqlite.sh
```

## Supporto

Per assistenza tecnica, aprire una issue nel repository o contattare il team di sviluppo.
