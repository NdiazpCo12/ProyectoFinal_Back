#!/bin/sh
set -e

CODE_FILE="/app/Main.java"

# Compilar
javac "$CODE_FILE" 2>&1 || EXIT_CODE=$?
if [ ${EXIT_CODE:-0} -ne 0 ]; then
  exit ${EXIT_CODE:-1}
fi

# Ejecutar con límites de memoria leyendo desde stdin
java -Xmx256m -Xms32m Main 2>&1 || EXIT_CODE=$?

exit ${EXIT_CODE:-0}
