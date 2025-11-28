#!/bin/sh
set -e

CODE_FILE="/app/main.js"

# Ejecutar código Node.js leyendo desde stdin
node "$CODE_FILE" 2>&1 || EXIT_CODE=$?

exit ${EXIT_CODE:-0}
