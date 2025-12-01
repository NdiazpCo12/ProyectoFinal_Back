#!/bin/sh
set -e

CODE_FILE="/app/main.py"

# Ejecutar codigo Python leyendo desde stdin
python3 "$CODE_FILE" 2>&1 || EXIT_CODE=$?

exit ${EXIT_CODE:-0}
