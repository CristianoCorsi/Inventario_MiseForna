# Sistema di Gestione Inventario - Misericordia di Fornacette

Applicazione web per la gestione dell'inventario con supporto per codici QR, prestiti e reporting, sviluppata per le esigenze della Misericordia di Fornacette.

## Installazione e Configurazione

1.  **Clonare il Repository:**
    ```bash
    git clone <URL_DEL_REPOSITORY>
    cd <NOME_DEL_PROGETTO> # Es: cd Inventario_MiseForna
    ```

2.  **Installare le Dipendenze:**
    Questo comando installa tutte le librerie necessarie per il frontend e il backend.
    ```bash
    npm install
    ```

3.  **Configurare le Variabili d'Ambiente:**
    Copia il file di esempio `.env.example` in un nuovo file chiamato `.env` nella root del progetto.
    * Su Windows:
        ```cmd
        copy .env.example .env
        ```
    * Su macOS/Linux:
        ```bash
        cp .env.example .env
        ```
    Modifica il file `.env` se necessario. Le impostazioni predefinite usano SQLite:
    ```dotenv
    # Tipo di database (mantenere sqlite per ora)
    DB_TYPE=sqlite
    # Percorso del file database SQLite (verrà creato se non esiste)
    SQLITE_DB_PATH=data/inventory.db

    # Chiave segreta per le sessioni utente (CAMBIARE IN PRODUZIONE!)
    SESSION_SECRET=secret-key-change-me-in-production

    # Impostazioni Cookie (false in sviluppo locale HTTP)
    COOKIE_SECURE=false

    # Porta del server
    PORT=5000

    # Host (0.0.0.0 per accessibilità in rete locale)
    HOST=0.0.0.0

    # Lingua (opzionale)
    # DEFAULT_LANGUAGE=it
    # FORCE_ITALIAN=true
    ```
    **Importante:** Cambia `SESSION_SECRET` con una stringa lunga e casuale per l'ambiente di produzione.

## Utilizzo in Ambiente di Sviluppo

1.  **Preparare il Database (Prima Esecuzione / Modifiche Schema):**
    * **Configura Drizzle Kit:** Assicurati che il file `drizzle.config.ts` sia configurato per SQLite:
        ```typescript
        // drizzle.config.ts
        import { defineConfig } from "drizzle-kit";
        import { config } from "./server/config"; // Assicurati che importi correttamente

        export default defineConfig({
          out: "./migrations",
          schema: "./shared/schema.ts",
          dialect: "sqlite", // Deve essere sqlite
          dbCredentials: {
             // Usa il percorso dal config o direttamente dal .env
            url: process.env.SQLITE_DB_PATH || config.database.path || 'data/inventory.db',
          },
          verbose: true,
          strict: true,
        });
        ```
    * **(Opzionale) Generare Migrazioni:** Se hai modificato lo schema in `shared/schema.ts`, genera i file di migrazione SQL:
        ```bash
        npx drizzle-kit generate
        ```
    * **Creare/Aggiornare Tabelle:** Applica lo schema al file di database SQLite. Questo comando crea il file `.db` e le tabelle se non esistono, o tenta di aggiornarle.
        ```bash
        npm run db:push
        # oppure direttamente: npx drizzle-kit push
        ```
        *Nota: `db:push` è comodo in sviluppo ma può essere rischioso se il database contiene già dati importanti.*

2.  **Avviare l'Applicazione:**
    Usa gli script forniti per avviare il server di sviluppo (con hot-reload):
    * Su Windows:
        ```cmd
        .\dev-win.bat
        ```
    * Su macOS/Linux:
        ```bash
        # Rendi eseguibile (solo la prima volta)
        chmod +x ./dev.sh
        # Avvia
        ./dev.sh
        ```
    L'applicazione sarà accessibile all'indirizzo `http://localhost:5000`. L'utente admin predefinito è `admin` con password `admin`.

## Deployment in Produzione (SQLite)

1.  **Compilare l'Applicazione:**
    Questo comando crea la build ottimizzata del frontend e traspila il backend nella cartella `dist`.
    ```bash
    npm run build
    ```
    *Assicurati che lo script `build` in `package.json` includa la copia della cartella `migrations` in `dist` se prevedi di usare le migrazioni SQL in futuro.*

2.  **Preparare l'Ambiente di Produzione:**
    * Copia l'intera cartella del progetto (o almeno la cartella `dist`, `node_modules`, `package.json`, `package-lock.json`, la cartella `migrations` e il file `.env`) sul server di produzione.
    * Crea o modifica il file `.env` sul server con le impostazioni di produzione:
        ```dotenv
        NODE_ENV=production
        DB_TYPE=sqlite
        SQLITE_DB_PATH=data/inventory.db # O un percorso più robusto/configurabile
        SESSION_SECRET=TUA_CHIAVE_SEGRETA_DI_PRODUZIONE_MOLTO_SICURA
        COOKIE_SECURE=true # Imposta a true se usi HTTPS (raccomandato)
        PORT=5000
        HOST=0.0.0.0
        # FORCE_ITALIAN=true # Se vuoi forzare l'italiano
        ```
    * Installa solo le dipendenze di produzione:
        ```bash
        npm install --omit=dev
        ```

3.  **Inizializzare il Database di Produzione (Manuale):**
    * **Copia il File DB:** Se hai un file `inventory.db` già pronto e testato, puoi semplicemente copiarlo nel percorso definito da `SQLITE_DB_PATH` sul server.
    * **Oppure, Crea da Zero:** Se devi creare il database sul server per la prima volta:
        * Installa temporaneamente `drizzle-kit`: `npm install --save-dev drizzle-kit`
        * Esegui il push dello schema: `npx drizzle-kit push --config=drizzle.config.ts` (assicurati che `drizzle.config.ts` punti al percorso DB di produzione).
        * Disinstalla `drizzle-kit`: `npm uninstall drizzle-kit`

4.  **Avviare l'Applicazione:**
    Usa lo script `start` o gli script specifici per l'ambiente:
    * Metodo Standard (usa `npm start` definito in `package.json`):
        ```bash
        npm run start
        ```
        Questo eseguirà `NODE_ENV=production node dist/index.js`.
    * Script Specifici (se configurati e preferiti):
        * Windows (es. `start-with-sqlite-win.bat`):
            ```cmd
            .\start-with-sqlite-win.bat
            ```
        * Linux/macOS (es. `start-with-sqlite.sh`):
            ```bash
            chmod +x ./start-with-sqlite.sh # Se necessario
            ./start-with-sqlite.sh
            ```

    L'applicazione sarà in ascolto su `http://<IP_DEL_SERVER>:5000`. Si consiglia di usare un reverse proxy (come Nginx o Caddy) per gestire HTTPS e l'esposizione pubblica.

## Struttura del Progetto

Inventario_MiseForna/
├── client/         # Codice frontend (React, Vite)
│   ├── public/
│   ├── src/
│   └── ...
├── dist/           # Output della build di produzione
├── migrations/     # File di migrazione SQL generati da Drizzle Kit
├── node_modules/   # Dipendenze installate
├── server/         # Codice backend (Express, Node.js)
│   ├── src/        # (Se usi una sotto-cartella src)
│   └── index.ts    # Entry point del server
│   └── db.ts       # Configurazione DB e Drizzle ORM
│   └── auth.ts     # Gestione autenticazione
│   └── routes.ts   # Definizione API routes
│   └── storage.ts  # Logica accesso dati (interfaccia con Drizzle)
│   └── ...
├── shared/         # Codice TypeScript condiviso (es. schema Drizzle)
│   └── schema.ts
├── data/           # Cartella per il file database SQLite (gitignore consigliato)
│   └── inventory.db
├── .env            # Variabili d'ambiente LOCALI (gitignore)
├── .env.example    # Esempio variabili d'ambiente
├── drizzle.config.ts # Configurazione Drizzle Kit
├── package.json
├── package-lock.json
├── tsconfig.json
├── dev-win.bat     # Script avvio sviluppo Windows
├── dev.sh          # Script avvio sviluppo Linux/macOS
├── README.md       # Questo file
└── ...             # Altri file di configurazione (vite, tailwind, etc.)

## Backup del Database SQLite

**È FONDAMENTALE eseguire backup regolari del file di database SQLite (`data/inventory.db` o il percorso configurato).**

* Pianifica copie automatiche del file `.db`.
* Conserva i backup in una posizione sicura e separata dal server principale.
* Verifica periodicamente la validità e ripristinabilità dei backup.

## Risoluzione dei Problemi Comuni

*(La sezione esistente sulla risoluzione dei problemi sembra già abbastanza buona, puoi mantenerla o adattarla se necessario)*

### Errori in ambiente Windows

1.  **Errore `NODE_ENV=development non è riconosciuto...`**: Usare `.\dev-win.bat`.
2.  **Variabili d'ambiente mancanti**: Assicurarsi che il file `.env` esista e sia corretto. Copiare da `.env.example` se necessario.
3.  **Errori Login/Registrazione**: Verificare `SESSION_SECRET` in `.env`, assicurarsi `DB_TYPE=sqlite`. Se il DB sembra corrotto, cancellare il file `.db` e ricrearlo con `npm run db:push`.
4.  **Errore accesso Admin**: Verificare di aver fatto login come `admin` (password default: `admin`).

### Errori in ambiente Linux/macOS

* Se gli script `.sh` non sono eseguibili: `chmod +x ./nome_script.sh`.

## Supporto

Per problemi o domande, aprire una issue nel repository GitHub del progetto o contattare gli sviluppatori.