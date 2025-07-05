📌 Overview
Un backend API REST para la gestión de tareas personales y de equipo. Permite crear, editar, listar, completar y eliminar tareas, además de organizarlas por proyectos y usuarios.
Es ideal como backend de una app estilo Todoist, Trello o Notion simple.
Usuarios objetivo: frontend web/móvil, o aplicaciones empresariales internas.

⚙️ Core Features
- Autenticación con JWT
- CRUD de usuarios (registro, login, perfil)
- CRUD de proyectos
- CRUD de tareas
- Búsqueda y filtros de tareas
- Marcar tareas como completadas
- Redis pub/sub para cambios en tareas
- Paginación y ordenamiento
- Middleware de autorización por usuario
- Validación de datos robusta
- Documentación Swagger.yml


🌐 User Experience (API Consumers)
rutas:
Recurso	    Método	    Ruta	            Descripción
Auth	    POST	    /auth/register	    Crear usuario
Auth	    POST	    /auth/login	        Obtener token JWT (login)
Tareas	    GET	        /tasks	            Listar tareas del usuario
Tareas	    GET	        /tasks/:id	        Detalles de tarea
Tareas	    POST	    /tasks	            Crear tarea
Tareas	    PUT	        /tasks/:id	        Editar tarea
Tareas	    DELETE	    /tasks/:id	        Eliminar tarea
Proyectos	CRUD	    /projects/...	    Asociar tareas a proyectos
usuarios	CRUD	    /users/...	        Crear, editar, listar y eliminar usuarios

Parámetros de consulta típicos:
?page=1&limit=10

?status=completed

?dueBefore=2025-12-31

?project=devops

🧱 Technical Architecture
- Framework: Express con Typescript (Nodejs con typescript)
- Base de datos: MongoDB (con Mongoose)
- Autenticación: JWT (token en header)
- Validación: express-validator
- Documentación: Swagger.yml
- Logs: Middleware personalizado (winston)
- Redis pub/sub para cambios en tareas

🧩 Modelo de Datos
- User
  - _id
  - email (unique)
  - password (hash)
  - name
  - createdAt
  - updatedAt

- Project
  - _id
  - name
  - description (optional)
  - ownerId (ref User)
  - members (array de IDs de usuario)
  - createdAt
  - updatedAt

- Task
  - _id
  - title
  - description
  - status (pending, in-progress, completed)
  - priority (low, medium, high)
  - dueDate
  - assignedTo (ref User)
  - projectId (ref Project)
  - createdBy (ref User)
  - createdAt
  - updatedAt

🚧 Development Roadmap
Semana	Tareas
1	    Setup Express + Mongo + Docker
2	    Autenticación (JWT, bcrypt, validaciones)
3	    CRUD de tareas con validaciones
4	    CRUD de proyectos y asociaciones
5	    Filtros, paginación, ordenamiento
6	    Middleware de errores, documentación
7	    Redis pub/sub para cambios en tareas
8	    Deploy opcional en Railway/Render

🔗 Logical Dependency Chain
- Base de datos + conexión Mongoose
- Modelo de usuario + auth
- CRUD de tareas
- CRUD de proyectos
- Relación usuario ↔ proyecto ↔ tarea
- Validaciones y filtros
- Documentación

⚠️ Risks and Mitigations
Riesgo	                                Mitigación
JWT sin expiración o sin revocación	    Agregar expiración + token blacklist
Validaciones inconsistentes	            Uso intensivo de express-validator y DTOs
Escalabilidad en consultas	            Indexar campos como dueDate, ownerId, status
Pérdida de contexto en errores	        Middleware centralizado de errores + logger

📎 Appendix
- Ejemplo de payloads en Swagger.yml
- Colección Postman exportable
- Dockerfile y archivo .env.example
- Datos precargados (usuarios, tareas, proyectos)
- DB_ERD.md
- ARCHITECTURE.md
- DOCKER_DEV_ARCH.md