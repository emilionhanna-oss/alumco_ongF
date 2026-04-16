# Plataforma de Capacitación Digital Alumco

LMS (Learning Management System) para la ONG **Alumco**, diseñado para la capacitación de colaboradores que trabajan en **ELEAMs** (Establecimientos de Larga Estadía para Adultos Mayores). La plataforma prioriza una experiencia **clara y accesible**, con navegación simple para usuarios finales y un set de herramientas **administrativas** para creación y gestión de cursos.

---

## Tecnologías Utilizadas

- ⚛️ **React 18** (SPA)
- ⚡ **Vite** (dev server y build)
- 🎨 **Tailwind CSS** (estilos)
- 🧩 **Lucide React** (iconografía)
- 🟩 **Node.js + Express** (API backend)
- 🗂️ **Persistencia en JSON (db.json)** (almacenamiento local tipo “JSON Server”)

---

## Arquitectura y Funcionalidades por Vista

### Vistas de Usuario

- **Panel principal**: listado de cursos y acceso rápido al aprendizaje.
- **Detalle de curso**: visualización por módulos con barra de progreso y recorrido guiado.
- **Tipos de módulos soportados**:
  - **Video** (URL http/https)
  - **Lectura** (texto + referencia de archivo)
  - **Quiz** (preguntas de selección múltiple y respuesta escrita)
  - **Práctica presencial** (instrucciones y estado “pendiente de práctica”)
- **Navegación dinámica**: retorno controlado a rutas internas (whitelist), evitando redirecciones inesperadas.

### Dashboard de Administrador

El panel de administración organiza la plataforma en 6 áreas principales:

1. **Alertas de Sistema**: avisos operativos y conectividad.
2. **Mi Aprendizaje**: cursos internos del equipo administrador.
3. **Gestión de Capacitaciones**: creación, edición y asignación de cursos.
4. **Panel de Control (Métricas)**: espacio reservado para indicadores y reportes.
5. **Centro de Usuarios**: listado de usuarios y seguimiento.
6. **Mi Perfil**: datos personales, firma y certificados.

### Editor de Cursos Pro

Editor full-page (ruta de administración) enfocado en productividad:

- **Edición completa del curso**: título, descripción, imagen.
- **Gestión avanzada de módulos**:
  - Agregar módulos por tipo (video/lectura/quiz/práctica presencial)
  - Constructor de **quizzes** con preguntas configurables
  - Eliminación con confirmación
  - **Reordenamiento** de módulos mediante botones (subir/bajar)
- **Experiencia segura**:
  - Confirmación al salir con cambios sin guardar
  - Aviso al cerrar/recargar pestaña con cambios pendientes

### Perfil y Certificación

- **Ruta `/perfil`** (usuario y admin):
  - Datos personales (nombre, RUT/ID, correo, cargo)
  - **Firma electrónica simple**:
    - Opción 1: subir imagen (PNG/JPG)
    - Opción 2: escribir nombre (firma tipográfica)
- **Certificados**:
  - Se habilitan al completar **100%** de un curso
  - Descarga mediante vista imprimible (ideal para “Guardar como PDF”)
  - Mensaje de felicitaciones al completar el curso, con acceso directo al Perfil

---

## Guía de Instalación y Ejecución

### 1) Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd alumco_ong
```

### 2) Instalar dependencias

Backend:

```bash
cd backend-alumco
npm install
```

Frontend:

```bash
cd frontend-alumco
npm install
```

### 3) Configurar variables de entorno

Backend:

- Copia [backend-alumco/.env.example](backend-alumco/.env.example) a `backend-alumco/.env`
- Recomendado para local:
  - `PORT=5000`
  - `CORS_ORIGIN=http://localhost:5173`
  - `JWT_SECRET=...`

Frontend:

- Copia [frontend-alumco/.env.example](frontend-alumco/.env.example) a `frontend-alumco/.env`
- Ajusta:
  - `VITE_API_URL=http://localhost:5000`

> Nota: si mantienes el backend en `3000`, usa `VITE_API_URL=http://localhost:3000`.

### 4) Ejecutar (backend + frontend)

**Opción A — Windows (recomendado):**

```bat
iniciar_proyecto.bat
```

**Opción B — manual (dos terminales):**

Backend:

```bash
cd backend-alumco
npm run dev
```

Frontend:

```bash
cd frontend-alumco
npm run dev
```

URLs por defecto:

- Frontend (Vite): `http://localhost:5173`
- Backend (Express): `http://localhost:5000` (o `3000` si no cambias `PORT`)

---

## Persistencia y Datos

- La **fuente de verdad** vive en [backend-alumco/data/db.json](backend-alumco/data/db.json).
- Las imágenes de cursos se sirven como estáticos desde:
  - `backend-alumco/public/course-images/` → `/static/course-images/...`

### Logo / Branding

El logo se sirve desde el backend:

- Archivo: `backend-alumco/public/alumco-logo.png`
- URL pública: `/static/alumco-logo.png`

---

## Estructura del Proyecto

- `backend-alumco/` — API Express
  - `server.js` — bootstrap del servidor y rutas
  - `src/routes/` — rutas (auth, cursos, usuarios, perfil)
  - `src/controllers/` — controladores
  - `src/middlewares/` — auth/roles
  - `data/db.json` — persistencia
  - `public/` — estáticos (imágenes, logo)

- `frontend-alumco/` — React + Vite + TypeScript
  - `src/app/pages/` — vistas (Login, Panel, Admin, Perfil, CursoDetalle, Editor)
  - `src/app/components/` — componentes UI reutilizables
  - `src/app/services/` — capa de consumo de API
  - `src/app/contexts/` — estado global (Auth)
  - `src/app/types/` — tipos TypeScript

---

## Credenciales de Demo (local)

- `admin@alumco.cl` / `123`

---

## Notas

- No se versionan `node_modules`, archivos `.env` ni carpetas de build (`dist`).
- Este proyecto está orientado a ejecución local con persistencia en JSON para facilitar pruebas y despliegues simples.
