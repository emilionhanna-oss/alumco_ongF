# Alumco — Plataforma de Capacitación ELEAM

Proyecto para la ONG **Alumco**: plataforma de capacitación técnica orientada a equipos que trabajan en **ELEAM** (Establecimientos de Larga Estadía para Adultos Mayores).

## Estructura

- `backend-alumco/` — API (Node.js + Express)
- `frontend-alumco/` — App web (React + Vite + TypeScript)

La **fuente de verdad** de los cursos vive en:
- `backend-alumco/data/db.json`

## Requisitos

- Node.js (LTS recomendado)
- npm

## Primer inicio (clonable)

### 1) Instalar dependencias

En una terminal:

```bash
cd backend-alumco
npm install
```

En otra terminal:

```bash
cd frontend-alumco
npm install
```

### 2) Configurar variables de entorno

Backend:
- Copia `backend-alumco/.env.example` a `backend-alumco/.env`
- Ajusta `PORT` (opcional), `CORS_ORIGIN` y `JWT_SECRET`

Frontend:
- Copia `frontend-alumco/.env.example` a `frontend-alumco/.env`
- Ajusta `VITE_API_URL` (opcional). Si no existe, el frontend usa `http://localhost:3000`.

### 3) Ejecutar

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

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Cursos

Los cursos (Prevención de Caídas, Higiene y Control de Infecciones, Medicamentos, Primeros Auxilios, Trato Digno, etc.) se cargan dinámicamente desde el backend. Para editar contenido:

- Modifica `backend-alumco/data/db.json`
- Reinicia el backend (si usas `npm run dev`, `nodemon` recarga automáticamente)

Las imágenes de cursos se sirven desde:
- `backend-alumco/public/course-images/` (ruta pública: `/static/course-images/...`)

## Branding (logo)

Para usar el logo oficial en la UI, coloca el archivo en:
- `frontend-alumco/public/alumco-logo.png`

El frontend lo carga como `/alumco-logo.png` (con fallback a texto si no existe).

## Notas

- El proyecto incluye un login básico de demostración en el backend.
- Credenciales de demo (backend): `admin@alumco.cl` / `123`.
- No se versionan `node_modules`, archivos `.env` ni carpetas de compilación (`dist`).
