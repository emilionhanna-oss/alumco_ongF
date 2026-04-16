// src/app/services/adminCourseService.ts

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Modulo {
  tituloModulo: string;
  tipo: 'video' | 'lectura' | 'quiz';
  contenido: string;
  materialDescargable: string | null;
  completado: boolean;
}

export interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  progreso: number;
  modulos: Modulo[];
}

export type CursoPayload = Omit<Curso, 'id' | 'progreso'>;

// ── Helper ────────────────────────────────────────────────────────────────────

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.mensaje ?? `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function listarCursos(): Promise<Curso[]> {
  const res = await fetch(`${API_URL}/api/cursos`);
  return handleResponse<Curso[]>(res);
}

export async function crearCurso(payload: CursoPayload): Promise<Curso> {
  const res = await fetch(`${API_URL}/api/cursos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Curso>(res);
}

export async function actualizarCurso(id: string, payload: Partial<CursoPayload>): Promise<Curso> {
  const res = await fetch(`${API_URL}/api/cursos/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Curso>(res);
}

export async function eliminarCurso(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/cursos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse<void>(res);
}