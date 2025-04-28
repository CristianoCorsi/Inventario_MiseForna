#!/bin/bash

# Imposta il tipo di database su SQLite
export DB_TYPE=sqlite

# Avvia il server con configurazione SQLite
NODE_ENV=development tsx server/index-unified.ts