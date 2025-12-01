# Configuración de Datos de Prueba

## Crear Challenge de Prueba

Para probar el frontend, necesitas crear algunos challenges en la base de datos. Aquí tienes varias opciones:

### Opción 1: Usar Prisma Studio (Recomendado)

```bash
cd api
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:4466` donde puedes:
1. Ir a la tabla `challenges`
2. Crear un nuevo registro con estos datos:

```json
{
  "id": "challenge-1",
  "title": "Suma de Dos Números",
  "description": "Escribe un programa que sume dos números enteros.",
  "difficulty": "EASY",
  "tags": ["matemáticas", "básico"],
  "timeLimit": 1000,
  "memoryLimit": 256,
  "status": "PUBLISHED"
}
```

3. Crear test cases en la tabla `test_cases`:

```json
{
  "id": "test-1",
  "challengeId": "challenge-1",
  "input": "2\n3",
  "expectedOutput": "5",
  "isHidden": false
}
```

```json
{
  "id": "test-2",
  "challengeId": "challenge-1",
  "input": "10\n20",
  "expectedOutput": "30",
  "isHidden": false
}
```

### Opción 2: Usar API Directamente

Una vez que tengas un usuario admin autenticado, puedes usar el endpoint:

```bash
POST http://localhost:3000/challenges
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Suma de Dos Números",
  "description": "Escribe un programa que sume dos números enteros.",
  "difficulty": "EASY",
  "tags": ["matemáticas", "básico"],
  "timeLimit": 1000,
  "memoryLimit": 256,
  "status": "PUBLISHED",
  "testCases": [
    {
      "input": "2\n3",
      "expectedOutput": "5",
      "isHidden": false
    },
    {
      "input": "10\n20",
      "expectedOutput": "30",
      "isHidden": false
    }
  ]
}
```

### Opción 3: Crear Usuario Admin Primero

Si no tienes un usuario admin, créalo primero:

```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "admin123",
  "role": "ADMIN"
}
```

### Opción 4: Script SQL Directo

Si tienes acceso directo a PostgreSQL:

```sql
-- Crear challenge
INSERT INTO challenges (id, title, description, difficulty, tags, "timeLimit", "memoryLimit", status, "createdAt", "updatedAt")
VALUES ('challenge-1', 'Suma de Dos Números', 'Escribe un programa que sume dos números enteros.', 'EASY', ARRAY['matemáticas', 'básico'], 1000, 256, 'PUBLISHED', NOW(), NOW());

-- Crear test cases
INSERT INTO test_cases (id, "challengeId", input, "expectedOutput", "isHidden", "createdAt")
VALUES ('test-1', 'challenge-1', '2\n3', '5', false, NOW());

INSERT INTO test_cases (id, "challengeId", input, "expectedOutput", "isHidden", "createdAt")
VALUES ('test-2', 'challenge-1', '10\n20', '30', false, NOW());
```

## Verificar que Funciona

Después de crear el challenge:

1. Ve a `http://localhost:3001` (frontend)
2. Inicia sesión con cualquier usuario
3. Ve a la página de Challenges
4. Deberías ver el challenge "Suma de Dos Números"
5. Haz clic en él para ver los detalles

## Próximos Pasos

Una vez que tengas datos de prueba:

1. **Implementar Submissions** - Para enviar código y ver resultados
2. **Agregar más challenges** - Con diferentes dificultades
3. **Crear cursos** - Para organizar challenges
4. **Implementar evaluaciones** - Para exámenes

¿Necesitas ayuda con algún paso específico?