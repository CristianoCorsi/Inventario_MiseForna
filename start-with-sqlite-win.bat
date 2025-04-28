@echo off
rem Script per avviare l'applicazione in ambiente Windows usando SQLite in produzione
set NODE_ENV=production
set DB_TYPE=sqlite
set SESSION_SECRET=misericordia-production-secret
rem Cambia il SECRET_KEY in produzione con un valore sicuro e univoco!

echo Avvio dell'applicazione in modalità produzione con SQLite...
node dist/index.js