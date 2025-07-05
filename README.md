# Task Manager Backend (Express + TypeScript)

Backend REST API para la gestión de tareas, proyectos y usuarios. Incluye autenticación JWT, MongoDB, Redis pub/sub, seguridad reforzada y entorno Docker listo para desarrollo.

## Características principales

- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- Redis (cache + pub/sub)
- Autenticación JWT con blacklist de tokens (logout seguro)
- CRUD Usuarios / Proyectos / Tareas
- Validaciones con `express-validator` (DTO centralizados)
- Seguridad: Helmet, Rate-Limit, CORS, sanitización NoSQL, XSS-Clean, compresión
- Logs con Winston (requestId, consola + archivo)
- Seed automático (10 usuarios, 5 proyectos, 20 tareas) si la BD está vacía
- Docker-Compose con healthchecks para Mongo & Redis

## Requisitos

- Node 20+
- npm 9+
- Docker + Docker Compose (opcional para entorno contenerizado)

## Instalación local

```bash
# Clonar repo y entrar
npm install             # instala deps
cp .env.example .env    # ajusta variables
npm run dev             # nodemon + ts-node (puerto 3000 por defecto)
```

La API estará en `http://localhost:3000` y expone `/health`.

## Uso con Docker

```bash
docker compose up -d    # compila imagen y levanta mongodb, redis y app

# Logs
docker logs -f task-manager-app
```

### Variables de entorno

Debes configurar **todas** las variables definidas en `.env.example` antes de ejecutar la aplicación (puerto, MongoDB, Redis, JWT, límites, etc.).

## Endpoints principales

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /users/me          (auth)

GET    /projects          (auth)
POST   /projects          (auth)
GET    /projects/:id      (auth)
PUT    /projects/:id      (auth, owner)
DELETE /projects/:id      (auth, owner)
PATCH  /projects/:id/members (owner)

GET    /tasks             (auth)
POST   /tasks             (auth)
GET    /tasks/:id         (auth)
PUT    /tasks/:id         (auth)
DELETE /tasks/:id         (auth)
```

## Scripts útiles

```bash
npm run dev      # Nodemon + ts-node (entorno de desarrollo)
npm run build    # Transpila TypeScript a dist/
```

## Arquitectura del proyecto

```
src/
 ├── app.ts                # Config Express & middlewares
 ├── server.ts             # Arranque y conexiones
 ├── config/               # DB, Redis, env
 ├── controllers/          # Lógica de rutas
 ├── middlewares/          # auth, blacklist, errorHandler, etc.
 ├── models/               # Mongoose Schemas
 ├── routes/               # Definición de rutas REST
 ├── validators/           # DTO validators (express-validator)
 ├── utils/                # logger, redis client, publishers
 ├── redis/subscriber.ts   # Listener pub/sub
 └── seed.ts               # Data seed inicial
```

## Eventos Redis

- `task:created|updated|deleted`
- `project:created|updated|deleted`

Puedes conectar un WebSocket u otro servicio y suscribirte a estos canales para notificaciones en tiempo real.

## Documentación API (Swagger)

El archivo `swagger.yml` contiene la especificación **OpenAPI 3.0.3** de toda la API.

1. Online: abre https://editor.swagger.io y usa *File → Import File…* para cargar `swagger.yml`.
2. Localmente:

```bash
npx redoc-cli serve swagger.yml
```

Se abrirá `http://localhost:8080` con la documentación interactiva.

---
¡Listo! Contribuciones y PRs son bienvenidos. Para cualquier pregunta abre un issue. 