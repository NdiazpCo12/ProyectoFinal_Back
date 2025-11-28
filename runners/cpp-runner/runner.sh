#!/bin/sh
set -e

CODE_FILE="/app/main.cpp"
BINARY="/app/main"

# Compilar
g++ -std=c++17 -O2 -pipe -s "$CODE_FILE" -o "$BINARY" 2>&1 || EXIT_CODE=$?
if [ ${EXIT_CODE:-0} -ne 0 ]; then
  exit ${EXIT_CODE:-1}
fi

# Ejecutar leyendo desde stdin
"$BINARY" 2>&1 || EXIT_CODE=$?

exit ${EXIT_CODE:-0}
