# Modulo 6 - Evaluaciones y Calificacion - Validacion y Pruebas

## Implementacion Completada

### 1. Schema de Base de Datos
- Modelo `Evaluation` (name, startDate, endDate, duration, maxAttempts, status)
- Modelo `EvaluationChallenge` (relacion evaluaciones-retos)
- Modelo `EvaluationCourse` (relacion evaluaciones-cursos)
- Campo `evaluationId` opcional en `Submission` para asociar envios con evaluaciones
- Enum `EvaluationStatus` (SCHEDULED, ACTIVE, CLOSED)
- Migracion aplicada: `add_evaluations_module`

### 2. Funcionalidades del Profesor (ADMIN)

#### Crear evaluacion
- **Endpoint**: `POST /evaluations`
- **Autenticacion**: Requiere JWT + AdminGuard
- **Body**:
```json
{
  "name": "Parcial 1 - Estructuras de Datos",
  "startDate": "2025-12-01T10:00:00Z",
  "endDate": "2025-12-01T11:30:00Z",
  "duration": 90,
  "maxAttempts": 3,
  "challengeIds": ["challenge_id_1", "challenge_id_2"],
  "courseIds": ["course_id_1"]
}
```

#### Ver todas las evaluaciones
- **Endpoint**: `GET /evaluations`
- **Autenticacion**: Requiere JWT
- **Query params opcionales**: `courseId`, `status`
- **Respuesta**: Lista de evaluaciones con conteo de retos y cursos

#### Ver detalles de evaluacion
- **Endpoint**: `GET /evaluations/:id`
- **Autenticacion**: Requiere JWT
- **Respuesta**: Detalles completos con retos, cursos y estado de acceso

#### Ver resultados de evaluacion
- **Endpoint**: `GET /evaluations/:id/results`
- **Autenticacion**: Requiere JWT + AdminGuard
- **Respuesta**: Resultados de todos los estudiantes con puntajes por reto y total

### 3. Funcionalidades del Estudiante

#### Ver evaluaciones disponibles
- **Endpoint**: `GET /evaluations`
- **Autenticacion**: Requiere JWT
- **Filtrado automatico**: Solo ve evaluaciones de cursos donde esta inscrito
- **Query params opcionales**: `courseId`, `status`

#### Ver detalles de evaluacion
- **Endpoint**: `GET /evaluations/:id`
- **Autenticacion**: Requiere JWT
- **Validacion**: Debe estar inscrito en un curso con esta evaluacion
- **Respuesta**: Retos disponibles, fecha/hora, duracion, intentos permitidos

#### Enviar solucion en evaluacion
- **Endpoint**: `POST /submissions`
- **Autenticacion**: Requiere JWT
- **Validaciones automaticas**:
  - Evaluacion debe estar activa (dentro del tiempo limite)
  - Estudiante debe estar inscrito en curso con la evaluacion
  - No exceder maximo de intentos por reto
- **Body**:
```json
{
  "challengeId": "challenge_id",
  "language": "python",
  "code": "def solve():\n    return 42"
}
```

#### Consultar estado de submission
- **Endpoint**: `GET /submissions/:id`
- **Autenticacion**: Requiere JWT
- **Respuesta**: Estado actual, resultado, puntaje, tiempo de ejecucion

### 4. Flujo Completo del Sistema

#### Paso 1: Admin crea evaluacion
1. Admin se autentica: `POST /auth/login`
2. Admin crea evaluacion: `POST /evaluations`
3. Sistema asocia retos y cursos a la evaluacion
4. Estado inicial: `SCHEDULED` (si startDate es futuro) o `ACTIVE` (si ya inicio)

#### Paso 2: Estudiante accede a evaluacion
1. Estudiante se autentica: `POST /auth/login`
2. Estudiante lista evaluaciones: `GET /evaluations`
3. Estudiante ve detalles: `GET /evaluations/:id`
4. Sistema valida que este inscrito en curso con la evaluacion

#### Paso 3: Estudiante envia solucion
1. Estudiante envia codigo: `POST /submissions`
2. Sistema valida:
   - Evaluacion activa y dentro del tiempo limite
   - Estudiante inscrito en curso
   - No exceder intentos maximos
3. API guarda submission y lo encola en Redis
4. Submission asociado con `evaluationId`

#### Paso 4: Procesamiento automatico
1. Worker correspondiente toma el job de Redis
2. Worker lanza runner con Docker (--network none)
3. Runner compila/ejecuta codigo contra casos de prueba
4. Worker guarda resultados en base de datos
5. Submission actualizado con status, score, tiempo

#### Paso 5: Estudiante consulta estado
1. Estudiante consulta submission: `GET /submissions/:id`
2. Ve estado final (ACCEPTED, WRONG_ANSWER, etc.)
3. Ve puntaje obtenido y tiempo de ejecucion

#### Paso 6: Profesor revisa resultados
1. Profesor accede a resultados: `GET /evaluations/:id/results`
2. Ve puntajes de todos los estudiantes
3. Ve mejor puntaje por reto y puntaje total
4. Resultados ordenados por puntaje total descendente

### 5. Validaciones y Reglas de Negocio

#### Validaciones al crear evaluacion
- Fecha de inicio debe ser anterior a fecha de fin
- Duracion debe ser mayor a 0
- Debe incluir al menos un reto
- Debe asignarse a al menos un curso
- Retos y cursos deben existir

#### Validaciones al enviar submission
- Evaluacion debe estar en estado ACTIVE
- Fecha actual debe estar entre startDate y endDate
- Estudiante debe estar inscrito en curso con la evaluacion
- Reto debe pertenecer a la evaluacion
- No exceder maxAttempts (si esta configurado)

#### Cierre automatico
- Sistema actualiza estado a CLOSED cuando endDate ha pasado
- Actualizacion ocurre al consultar evaluaciones
- Evaluaciones cerradas no permiten nuevos envios

### 6. Ejemplos de Prueba

#### Ejemplo 1: Crear evaluacion completa
```bash
# 1. Login como admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "admin123"}'

# 2. Crear evaluacion
curl -X POST http://localhost:3000/evaluations \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Parcial 1 - Estructuras de Datos",
    "startDate": "2025-12-01T10:00:00Z",
    "endDate": "2025-12-01T11:30:00Z",
    "duration": 90,
    "maxAttempts": 3,
    "challengeIds": ["challenge_1", "challenge_2"],
    "courseIds": ["course_1"]
  }'
```

#### Ejemplo 2: Estudiante envia solucion
```bash
# 1. Login como estudiante
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@test.com", "password": "student123"}'

# 2. Ver evaluaciones disponibles
curl -X GET http://localhost:3000/evaluations \
  -H "Authorization: Bearer {token}"

# 3. Ver detalles de evaluacion
curl -X GET http://localhost:3000/evaluations/{evaluation_id} \
  -H "Authorization: Bearer {token}"

# 4. Enviar solucion
curl -X POST http://localhost:3000/submissions \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "challengeId": "challenge_1",
    "language": "python",
    "code": "def solve():\n    n = int(input())\n    return sum(range(1, n+1))"
  }'

# 5. Consultar estado
curl -X GET http://localhost:3000/submissions/{submission_id} \
  -H "Authorization: Bearer {token}"
```

#### Ejemplo 3: Profesor ve resultados
```bash
# 1. Login como profesor
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "professor@test.com", "password": "prof123"}'

# 2. Ver resultados de evaluacion
curl -X GET http://localhost:3000/evaluations/{evaluation_id}/results \
  -H "Authorization: Bearer {token}"
```

### 7. Integracion con Modulos Anteriores

#### Modulo 1 - Autenticacion
- JWT requerido para todos los endpoints
- AdminGuard para creacion y visualizacion de resultados
- Roles: ADMIN (profesor) y STUDENT

#### Modulo 2 - Challenges
- Evaluaciones agrupan multiples retos
- Retos deben existir antes de crear evaluacion
- Test cases de retos se usan para calificar

#### Modulo 3 - Submissions
- Submissions asociados con evaluaciones via `evaluationId`
- Validaciones adicionales cuando submission pertenece a evaluacion
- Procesamiento igual (Redis -> Worker -> Runner -> BD)

#### Modulo 4 - Workers y Runners
- Mismo sistema de procesamiento
- Workers procesan submissions de evaluaciones igual que normales
- Runners ejecutan codigo en contenedores aislados

#### Modulo 5 - Cursos
- Evaluaciones asignadas a cursos
- Solo estudiantes inscritos pueden acceder
- Solo profesores del curso pueden ver resultados

### 8. Checklist de Validacion

#### Funcionalidades Basicas
- [x] Crear evaluacion como admin
- [x] Listar evaluaciones como estudiante
- [x] Listar evaluaciones como profesor
- [x] Ver detalles de evaluacion
- [x] Enviar submission en evaluacion activa
- [x] Consultar estado de submission
- [x] Ver resultados como profesor

#### Validaciones
- [x] No crear evaluacion sin retos
- [x] No crear evaluacion sin cursos
- [x] No enviar submission si evaluacion cerrada
- [x] No enviar submission si excede intentos
- [x] No acceder a evaluacion de curso no inscrito
- [x] No ver resultados si no es profesor

#### Integracion
- [x] Submission se encola correctamente en Redis
- [x] Worker procesa submission de evaluacion
- [x] Runner ejecuta codigo correctamente
- [x] Resultados se guardan en BD
- [x] Estado se actualiza correctamente
- [x] Puntajes se calculan correctamente

#### Flujo Completo
- [x] Admin crea evaluacion -> Estudiante la ve -> Envia solucion -> Se procesa -> Ve resultado -> Profesor ve resultados

### 11. Resultados de Pruebas

#### Prueba Completa Ejecutada
Fecha: 2025-11-30
Script: test_backend_completo.ps1

#### Resultados
1. **Creacion de usuarios**: OK (admin, estudiante, profesor)
2. **Autenticacion**: OK (todos los roles)
3. **Creacion de curso**: OK
4. **Inscripcion de estudiante**: OK
5. **Asignacion de profesor**: OK
6. **Creacion de challenge**: OK
7. **Asignacion de challenge a curso**: OK
8. **Creacion de evaluacion**: OK (Estado ACTIVE)
9. **Estudiante consulta evaluaciones**: OK (ve evaluaciones disponibles)
10. **Estudiante ve detalles**: OK (retos, fecha, duracion)
11. **Estudiante envia solucion**: OK (submission creado y encolado)
12. **Procesamiento**: OK (Worker procesa, Runner ejecuta)
13. **Estudiante consulta estado**: OK (ACCEPTED, 100 puntos, 2542 ms)
14. **Profesor ve resultados**: OK (puede ver resultados de estudiantes)

#### Notas
- El flujo completo funciona correctamente
- Los submissions se procesan automaticamente
- Los puntajes se calculan correctamente
- La integracion con Redis, Workers y Runners funciona
- Las validaciones de evaluaciones activas funcionan
- El sistema de calificacion automatica funciona

### 9. Notas Importantes

- Las evaluaciones se cierran automaticamente cuando pasa endDate
- El estado se actualiza al consultar (SCHEDULED -> ACTIVE -> CLOSED)
- Los intentos se cuentan por reto dentro de una evaluacion
- Los puntajes se calculan automaticamente basados en test cases
- Los estudiantes solo ven sus propios resultados
- Los profesores ven resultados de todos los estudiantes del curso

### 10. Endpoints Resumen

| Metodo | Endpoint | Rol | Descripcion |
|--------|----------|-----|-------------|
| POST | /evaluations | ADMIN | Crear evaluacion |
| GET | /evaluations | ALL | Listar evaluaciones |
| GET | /evaluations/:id | ALL | Ver detalles evaluacion |
| GET | /evaluations/:id/results | ADMIN | Ver resultados |
| POST | /submissions | STUDENT | Enviar solucion (con validacion de evaluacion) |
| GET | /submissions/:id | ALL | Consultar estado submission |

