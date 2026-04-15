/**
 * Tipos TypeScript con propiedades opcionales para datos en transición
 */

// ============ USUARIO ============
export interface User {
  id?: string;
  email: string;
  name: string;
  rol?: 'admin' | 'instructor' | 'estudiante';
  avatar?: string;
}

// ============ AUTENTICACIÓN ============
export interface LoginResponse {
  mensaje?: string;
  usuario?: User;
  token?: string;
}

export interface RegisterResponse {
  mensaje?: string;
  usuario?: User;
  token?: string;
  id?: string;
}

// ============ CURSOS ============
export interface Course {
  id?: string;
  title?: string;
  description?: string;
  instructor?: string;
  duration?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  enrolledStudents?: number;
  image?: string;
  progress?: number; // 0-100
}

export interface CourseDetail extends Course {
  content?: string;
  modules?: Module[];
  modulos?: CursoModulo[];
  students?: User[];
}

// ============ CURSOS (BACKEND - FUENTE DE VERDAD) ============
export type CursoModuloTipo = 'video' | 'lectura' | 'quiz';

export interface CursoModulo {
  tituloModulo?: string;
  tipo?: CursoModuloTipo;
  contenido?: string;
  materialDescargable?: string | null;
  completado?: boolean;
}

export interface CursoBackend {
  id: string;
  titulo: string;
  imagen?: string;
  progreso?: number; // 0-100
  descripcion: string;
  modulos: CursoModulo[];
}

export interface Module {
  id?: string;
  title?: string;
  description?: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id?: string;
  title?: string;
  content?: string;
  videoUrl?: string;
  completed?: boolean;
}

// ============ API RESPONSES ============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  originalError?: Error;
}
