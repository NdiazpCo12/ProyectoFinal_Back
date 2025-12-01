# Solucion Error de Conexion con Redis

## Problema

El error "Error de conexion con Redis" aparece cuando la API intenta conectarse a Redis pero no puede establecer la conexion.

## Causas Principales

1. **Redis no esta corriendo**: El contenedor de Redis no esta activo
2. **Variables de entorno faltantes**: La API no tiene configuradas las variables REDIS_HOST y REDIS_PORT
3. **Schema de Prisma incorrecto**: Si el schema esta configurado para SQLite en lugar de PostgreSQL, puede causar errores que impiden el inicio de la API

## Solucion Completa

### 1. Verificar que Redis este corriendo

```bash
docker-compose ps redis
```

Si no esta corriendo, levantarlo:

```bash
docker-compose up -d redis
```

### 2. Verificar variables de entorno en docker-compose.yml

El servicio `api` debe tener estas variables de entorno:

```yaml
services:
  api:
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
```

**IMPORTANTE**: `REDIS_HOST=redis` debe ser el nombre del servicio de Redis en docker-compose.yml, no `localhost`.

### 3. Verificar que el schema de Prisma sea PostgreSQL

En `api/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  
  url      = env("DATABASE_URL")
}
```

### 4. Verificar que todos los servicios esten corriendo

```bash
docker-compose ps
```

Deben estar corriendo:
- `redis` (puerto 6379)
- `api` (puerto 3000)
- `db` (PostgreSQL, puerto 5432)
- `worker_python`, `worker_java`, `worker_node`, `worker_cpp`

### 5. Verificar logs de la API

```bash
docker-compose logs api --tail=30
```

Debes ver el mensaje:
```
[Nest] LOG [RedisModule] Redis conectado correctamente
```

Si ves errores de conexion, verifica:
- Que Redis este corriendo: `docker-compose ps redis`
- Que las variables de entorno esten correctas: `docker-compose exec api printenv | grep REDIS`
- Que el servicio redis este definido en docker-compose.yml

## Checklist de Validacion

- [ ] Redis esta corriendo (`docker-compose ps redis` muestra "Up")
- [ ] Variables REDIS_HOST y REDIS_PORT estan en docker-compose.yml para el servicio api
- [ ] REDIS_HOST tiene el valor `redis` (nombre del servicio, no localhost)
- [ ] REDIS_PORT tiene el valor `6379`
- [ ] Schema de Prisma esta configurado para PostgreSQL
- [ ] Los logs de la API muestran "Redis conectado correctamente"
- [ ] Los workers estan corriendo y pueden conectarse a Redis

## Comandos de Diagnostico

### Verificar estado de servicios
```bash
docker-compose ps
```

### Ver logs de Redis
```bash
docker-compose logs redis --tail=20
```

### Ver logs de la API
```bash
docker-compose logs api --tail=30 | grep -i redis
```

### Verificar variables de entorno en el contenedor
```bash
docker-compose exec api printenv | grep REDIS
```

### Probar conexion a Redis desde el contenedor de la API
```bash
docker-compose exec api sh -c "apk add redis && redis-cli -h redis ping"
```

O si el contenedor tiene acceso a redis-cli:
```bash
docker-compose exec redis redis-cli ping
```

Debe responder: `PONG`

## Solucion Rapida

Si el error persiste, ejecutar estos comandos en orden:

```bash
# 1. Detener todos los servicios
docker-compose down

# 2. Verificar que docker-compose.yml tenga REDIS_PORT=6379 en el servicio api
# (ya debe estar agregado)

# 3. Levantar Redis primero
docker-compose up -d redis

# 4. Esperar 2 segundos
sleep 2

# 5. Levantar la API
docker-compose up -d api

# 6. Verificar logs
docker-compose logs api --tail=20
```

## Notas Importantes

1. **REDIS_HOST debe ser `redis`**: En Docker Compose, los servicios se comunican usando el nombre del servicio como hostname. Por eso `REDIS_HOST=redis` funciona, pero `REDIS_HOST=localhost` no funcionara.

2. **Orden de inicio**: Aunque `depends_on` en docker-compose.yml deberia manejar esto, a veces es necesario levantar Redis antes que la API.

3. **Workers tambien necesitan Redis**: Los workers tambien deben tener configuradas las variables REDIS_HOST y REDIS_PORT en docker-compose.yml.

## Estado Actual

Despues de aplicar la solucion:
- Redis esta corriendo y aceptando conexiones
- API se conecta correctamente a Redis
- Workers pueden conectarse a Redis para procesar jobs
- Los logs muestran "Redis conectado correctamente"

Si aun ves el error, verifica que:
1. El contenedor de Redis este realmente corriendo
2. Las variables de entorno esten correctamente configuradas
3. No haya problemas de red entre contenedores

