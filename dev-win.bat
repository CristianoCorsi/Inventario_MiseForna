@echo off
rem Script per avviare l'applicazione in ambiente Windows usando SQLite
set NODE_ENV=development
set DB_TYPE=sqlite
set SESSION_SECRET=misericordia-dev-secret
tsx server/index.ts