# Módulo 5 - Cursos - Validación y Pruebas

## Implementación Completada

### 1. Schema de Base de Datos
- Modelo `Course` (name, nrc, period, group)
- Modelo `CourseEnrollment` (relación estudiantes-cursos)
- Modelo `CourseProfessor` (relación profesores-cursos)
- Modelo `CourseChallenge` (relación retos-cursos)
- Migración aplicada: `20251129004552_add_courses_module`

### 2. Funcionalidades del Profesor (ADMIN)

#### Crear y administrar cursos
- **Endpoint**: `POST /courses`
- **Autenticación**: Requiere JWT + AdminGuard
- **Body**:
```json
{
  "name": "Lenguaje de Programación Backend",
  "nrc": "12345",
  "period": "2025-1",
  "group": 1
}
```

#### Asignar profesores a cursos
- **Endpoint**: `POST /courses/:id/professors`
- **Autenticación**: Requiere JWT + AdminGuard
- **Body**:
```json
{
  "professorId": "professor_user_id"
}
```

#### Asignar retos a cursos
- **Endpoint**: `POST /courses/:id/challenges`
- **Autenticación**: Requiere JWT + AdminGuard
- **Body**:
```json
{
  "challengeId": "challenge_id"
}
```

#### Inscribir estudiantes
- **Endpoint**: `POST /courses/:id/enroll`
- **Autenticación**: Requiere JWT + AdminGuard
- **Body**:
```json
{
  "studentId": "student_user_id"
}
```

#### Ver cursos que administra
- **Endpoint**: `GET /courses`
- **Autenticación**: Requiere JWT
- **Respuesta**: Lista de cursos filtrados por profesor (si es ADMIN)

### 3. Funcionalidades del Estudiante

#### Ver cursos en los que está inscrito
- **Endpoint**: `GET /courses`
- **Autenticación**: Requiere JWT
- **Respuesta**: Lista de cursos filtrados por estudiante (si es STUDENT)

#### Ver retos de sus cursos
- **Endpoint**: `GET /courses/:id/challenges`
- **Autenticación**: Requiere JWT
- **Validación**: Verifica que el estudiante esté inscrito en el curso
- **Respuesta**: Lista de retos asignados al curso

#### Ver solo retos de sus cursos (filtrado global)
- **Endpoint**: `GET /challenges`
- **Autenticación**: Requiere JWT
- **Comportamiento**: 
  - Si es STUDENT: Solo muestra retos de cursos en los que está inscrito
  - Si es ADMIN: Muestra todos los retos

#### Ver detalles de un reto (con validación)
- **Endpoint**: `GET /challenges/:id`
- **Autenticación**: Requiere JWT
- **Validación**: Si es STUDENT, verifica que el reto pertenezca a uno de sus cursos

#### Realizar submissions de retos de sus cursos
- **Endpoint**: `POST /submissions`
- **Autenticación**: Requiere JWT
- **Validación**: Verifica que el estudiante esté inscrito en un curso que tenga el reto
- **Body**:
```json
{
  "challengeId": "challenge_id",
  "language": "python",
  "code": "def solution():\n    return 42"
}
```

## Validaciones de Seguridad Implementadas

1. **Estudiantes solo ven retos de sus cursos**:
   - `GET /challenges` filtra por cursos del estudiante
   - `GET /challenges/:id` valida acceso al reto
   - `POST /submissions` valida que el reto pertenezca a un curso del estudiante

2. **Acceso a retos de curso**:
   - `GET /courses/:id/challenges` valida inscripción del estudiante
   - Lanza `ForbiddenException` si el estudiante no está inscrito

3. **Operaciones de administración**:
   - Todos los endpoints de creación/edición requieren `AdminGuard`
   - Solo usuarios con rol `ADMIN` pueden crear cursos, asignar profesores, etc.

## Flujo de Prueba Recomendado

### 1. Crear usuarios de prueba
```bash
# Crear profesor (ADMIN)
POST /auth/register
{
  "email": "profesor@test.com",
  "password": "password123",
  "role": "ADMIN"
}

# Crear estudiante
POST /auth/register
{
  "email": "estudiante@test.com",
  "password": "password123",
  "role": "STUDENT"
}
```

### 2. Como Profesor (ADMIN)

1. **Login como profesor**
```bash
POST /auth/login
{
  "email": "profesor@test.com",
  "password": "password123"
}
# Guardar el access_token
```

2. **Crear un curso**
```bash
POST /courses
Authorization: Bearer {professor_token}
{
  "name": "Lenguaje de Programación Backend",
  "nrc": "12345",
  "period": "2025-1",
  "group": 1
}
# Guardar el course_id
```

3. **Asignarse como profesor del curso**
```bash
POST /courses/{course_id}/professors
Authorization: Bearer {professor_token}
{
  "professorId": "{professor_user_id}"
}
```

4. **Crear un reto**
```bash
POST /challenges
Authorization: Bearer {professor_token}
{
  "title": "Suma de dos números",
  "description": "Suma dos números enteros",
  "difficulty": "EASY",
  "tags": ["math", "basic"],
  "timeLimit": 1000,
  "memoryLimit": 128,
  "testCases": [
    {
      "input": "2 3",
      "expectedOutput": "5",
      "isHidden": false
    }
  ]
}
# Guardar el challenge_id
```

5. **Asignar reto al curso**
```bash
POST /courses/{course_id}/challenges
Authorization: Bearer {professor_token}
{
  "challengeId": "{challenge_id}"
}
```

### 3. Como Estudiante

1. **Login como estudiante**
```bash
POST /auth/login
{
  "email": "estudiante@test.com",
  "password": "password123"
}
# Guardar el access_token
```

2. **Ver cursos (debe estar vacío inicialmente)**
```bash
GET /courses
Authorization: Bearer {student_token}
# Debe retornar []
```

3. **Profesor inscribe al estudiante** (como ADMIN)
```bash
POST /courses/{course_id}/enroll
Authorization: Bearer {professor_token}
{
  "studentId": "{student_user_id}"
}
```

4. **Estudiante ve sus cursos**
```bash
GET /courses
Authorization: Bearer {student_token}
# Debe retornar el curso creado
```

5. **Estudiante ve retos de su curso**
```bash
GET /courses/{course_id}/challenges
Authorization: Bearer {student_token}
# Debe retornar el reto asignado
```

6. **Estudiante ve solo retos de sus cursos (filtrado global)**
```bash
GET /challenges
Authorization: Bearer {student_token}
# Solo debe mostrar retos de cursos en los que está inscrito
```

7. **Estudiante hace submission**
```bash
POST /submissions
Authorization: Bearer {student_token}
{
  "challengeId": "{challenge_id}",
  "language": "python",
  "code": "def solution():\n    a, b = map(int, input().split())\n    return a + b"
}
```

### 4. Validaciones de Seguridad

1. **Estudiante intenta ver reto de curso no inscrito**
```bash
# Crear otro curso y reto sin inscribir al estudiante
# Intentar acceder:
GET /courses/{other_course_id}/challenges
Authorization: Bearer {student_token}
# Debe retornar 403 Forbidden
```

2. **Estudiante intenta hacer submission de reto no accesible**
```bash
POST /submissions
Authorization: Bearer {student_token}
{
  "challengeId": "{challenge_id_de_otro_curso}",
  "language": "python",
  "code": "code here"
}
# Debe retornar 403 Forbidden
```

## Checklist de Validación

- [x] Profesor puede crear cursos
- [x] Profesor puede asignar profesores a cursos
- [x] Profesor puede asignar retos a cursos
- [x] Profesor puede inscribir estudiantes
- [x] Profesor ve cursos que administra
- [x] Estudiante ve solo cursos en los que está inscrito
- [x] Estudiante ve solo retos de sus cursos (endpoint `/courses/:id/challenges`)
- [x] Estudiante ve solo retos de sus cursos (endpoint `/challenges` - filtrado global)
- [x] Estudiante no puede ver retos de cursos no inscritos
- [x] Estudiante no puede hacer submission de retos no accesibles
- [x] Validaciones de seguridad funcionan correctamente
- [x] Migración de base de datos aplicada correctamente

## Estado del Módulo

**MÓDULO 5 COMPLETAMENTE FUNCIONAL**

Todas las funcionalidades requeridas para el rol de profesor y estudiante están implementadas y validadas según la especificación del módulo.

