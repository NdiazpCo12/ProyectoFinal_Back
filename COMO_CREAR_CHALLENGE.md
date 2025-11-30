# Como Crear un Challenge

## Usando Prisma Directamente (Para Scripts de Seeding)

Si estas creando un script de seeding y necesitas crear challenges directamente con Prisma:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createChallenge() {
  const challenge = await prisma.challenge.create({
    data: {
      title: "Suma de dos numeros",
      description: "Dados dos numeros, devuelve su suma",
      difficulty: "EASY",
      tags: ["matematicas", "basico"],
      timeLimit: 1000,
      memoryLimit: 128,
      status: "DRAFT",
      testCases: {
        create: [
          {
            input: "5 3",
            expectedOutput: "8",
            isHidden: false
          },
          {
            input: "10 20",
            expectedOutput: "30",
            isHidden: true
          }
        ]
      }
    },
    include: {
      testCases: true
    }
  });

  console.log('Challenge creado:', challenge);
  return challenge;
}
```

## Notas Importantes

1. **Autenticacion**: Solo usuarios con rol ADMIN pueden crear challenges
2. **Test Cases**: Debes incluir al menos un test case
3. **Status**: Los challenges se crean con status "DRAFT" por defecto
4. **Validaciones**:
   - timeLimit: minimo 100ms, maximo 10000ms
   - memoryLimit: minimo 16MB, maximo 1024MB
   - testCases: array minimo de 1 elemento

## Respuesta Exitosa

```json
{
  "id": "cmil6dazx001rpt4scu264u90",
  "title": "Suma de dos numeros",
  "description": "Dados dos numeros, devuelve su suma",
  "difficulty": "EASY",
  "tags": ["matematicas", "basico"],
  "timeLimit": 1000,
  "memoryLimit": 128,
  "status": "DRAFT",
  "createdAt": "2025-11-30T03:43:00.333Z",
  "testCasesCount": 2
}
```

## Errores Comunes

1. **401 Unauthorized**: No estas autenticado o el token es invalido
2. **403 Forbidden**: No tienes permisos de ADMIN
3. **400 Bad Request**: Faltan campos requeridos o valores invalidos
4. **409 Conflict**: Ya existe un challenge con ese titulo (si aplica)

## Para el Script de Seeding

**IMPORTANTE: Para scripts de seeding, SIEMPRE usa el Metodo 2 (Prisma directamente). NO uses el endpoint HTTP.**

Si tu script de seeding falla al crear o buscar un challenge, sigue este flujo:

### Flujo Correcto para Seeding

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedChallenge() {
  // 1. PRIMERO: Verificar si ya existe
  let challenge = await prisma.challenge.findFirst({
    where: { title: "Suma de dos numeros" }
  });

  // 2. Si NO existe, crearlo
  if (!challenge) {
    try {
      challenge = await prisma.challenge.create({
        data: {
          title: "Suma de dos numeros",
          description: "Dados dos numeros, devuelve su suma",
          difficulty: "EASY",
          tags: ["matematicas", "basico"],
          timeLimit: 1000,
          memoryLimit: 128,
          status: "DRAFT",
          testCases: {
            create: [
              { input: "5 3", expectedOutput: "8", isHidden: false },
              { input: "10 20", expectedOutput: "30", isHidden: true }
            ]
          }
        },
        include: {
          testCases: true
        }
      });
      console.log('[SEED] Challenge creado:', challenge.id);
    } catch (error) {
      console.error('[SEED] Error creando challenge:', error);
      throw error;
    }
  } else {
    console.log('[SEED] Challenge ya existe:', challenge.id);
  }

  // 3. Verificar que se creo correctamente
  if (!challenge) {
    throw new Error('No se pudo crear ni encontrar el challenge');
  }

  // 4. Retornar el ID para usarlo en otras partes del seeding
  return challenge.id;
}
```

### Errores Comunes en Seeding

1. **No incluir testCases**: El challenge se crea pero sin casos de prueba
2. **Buscar antes de crear**: Intentar buscar un challenge que no existe
3. **No manejar errores**: Si falla la creacion, el script se detiene
4. **Usar el endpoint HTTP**: En seeding siempre usa Prisma directamente

### Ejemplo Completo de Seeding

```typescript
async function seed() {
  console.log('[SEED] Creando challenge...');
  
  // Buscar si existe
  let challenge = await prisma.challenge.findFirst({
    where: { title: "Suma de dos numeros" }
  });

  // Si no existe, crearlo
  if (!challenge) {
    challenge = await prisma.challenge.create({
      data: {
        title: "Suma de dos numeros",
        description: "Dados dos numeros, devuelve su suma",
        difficulty: "EASY",
        tags: ["matematicas", "basico"],
        timeLimit: 1000,
        memoryLimit: 128,
        status: "DRAFT",
        testCases: {
          create: [
            { input: "5 3", expectedOutput: "8", isHidden: false },
            { input: "10 20", expectedOutput: "30", isHidden: true }
          ]
        }
      }
    });
    console.log('[SEED] Challenge creado:', challenge.id);
  } else {
    console.log('[SEED] Challenge ya existe:', challenge.id);
  }

  // IMPORTANTE: Verificar que challenge existe antes de continuar
  if (!challenge) {
    throw new Error('No se pudo crear ni encontrar el challenge');
  }

  return challenge.id;
}
```

### Si el Challenge No Se Crea

Si ves que en Prisma Studio hay 0 challenges pero los demas datos se crearon:

1. **Verifica que el codigo de creacion se ejecuto**: Agrega console.log antes y despues de la creacion
2. **Verifica los testCases**: Asegurate de que el array de testCases no este vacio
3. **Verifica los tipos**: difficulty debe ser "EASY", "MEDIUM" o "HARD" (en mayusculas)
4. **Verifica las validaciones**: timeLimit minimo 100, memoryLimit minimo 16

### Debug en Seeding

```typescript
async function seedChallenge() {
  console.log('[SEED] Iniciando creacion de challenge...');
  
  // Verificar conexion
  const count = await prisma.challenge.count();
  console.log('[SEED] Challenges existentes:', count);

  // Intentar crear
  try {
    const challenge = await prisma.challenge.create({
      data: {
        title: "Suma de dos numeros",
        description: "Dados dos numeros, devuelve su suma",
        difficulty: "EASY",
        tags: ["matematicas", "basico"],
        timeLimit: 1000,
        memoryLimit: 128,
        status: "DRAFT",
        testCases: {
          create: [
            { input: "5 3", expectedOutput: "8", isHidden: false }
          ]
        }
      }
    });
    console.log('[SEED] Challenge creado exitosamente:', challenge.id);
    return challenge.id;
  } catch (error) {
    console.error('[SEED] Error al crear challenge:', error);
    console.error('[SEED] Detalles del error:', JSON.stringify(error, null, 2));
    throw error;
  }
}
```

