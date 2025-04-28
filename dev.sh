
#!/bin/bash
# Script per avviare l'applicazione in ambiente Linux/Mac usando SQLite
export NODE_ENV=development
export DB_TYPE=sqlite
export SESSION_SECRET=misericordia-dev-secret
npx tsx server/index.ts
