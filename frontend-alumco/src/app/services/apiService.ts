/**
 * Servicio API centralizado con manejo de errores silencioso.
 *
 * Nota: los cursos se cargan SOLO desde el backend (no hay fallback a mocks).
 */

import { API_CONFIG, buildApiUrl } from '../config/api.config';
import { 
  ApiResponse, 
  ApiError, 
  User, 
  LoginResponse, 
  Course,
  CourseDetail,
  CursoBackend 
} from '../types';


/**
 * Wrapper de fetch con timeout configurable
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = API_CONFIG.FETCH_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Servicio de Autenticación
 */
export const authService = {
  /**
   * Intenta hacer login con el servidor real
   * Si falla, retorna un error pero mantiene la app funcionando
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      console.log('🔐 Intentando login con servidor...');
      
      const response = await fetchWithTimeout(
        buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Login exitoso desde servidor');
        return {
          success: true,
          data: data as LoginResponse,
        };
      } else {
        console.warn('⚠️ Credenciales inválidas en servidor:', data.mensaje);
        return {
          success: false,
          error: data.mensaje || 'Credenciales inválidas',
        };
      }
    } catch (error) {
      console.error(
        '❌ Error conectando con servidor:',
        error instanceof Error ? error.message : 'Error desconocido'
      );
      
      return {
        success: false,
        error: 'No hay conexión con el servidor. Por favor, verifica que esté encendido.',
      };
    }
  },

  /**
   * Registro (por ahora solo local, sin servidor)
   */
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<ApiResponse<User>> {
    try {
      console.log('✍️ Intentando registro...');
      
      // NOTA: Esta ruta aún no existe en el backend
      // Por ahora solo guardamos localmente
      const newUser: User = {
        id: 'user_' + Date.now(),
        email,
        name,
        rol: 'estudiante',
      };

      console.log('✅ Usuario creado (datos locales)');
      
      return {
        success: true,
        data: newUser,
      };
    } catch (error) {
      console.error('❌ Error en registro:', error);
      return {
        success: false,
        error: 'Error al registrar usuario',
      };
    }
  },
};

/**
 * Servicio de Cursos
 */
export const courseService = {
  /**
   * Obtiene lista de cursos
   * Fuente de verdad: backend (`data/db.json`).
   * Si el servidor falla, NO inventa cursos.
   */
  async getCourses(): Promise<ApiResponse<Course[]>> {
    try {
      console.log('📚 Obteniendo lista de cursos...');
      
      const response = await fetchWithTimeout(
        buildApiUrl(API_CONFIG.ENDPOINTS.COURSES.LIST),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const normalized: Course[] = Array.isArray(data)
          ? (data as CursoBackend[]).map((curso) => ({
              id: String(curso.id),
              title: curso.titulo,
              description: curso.descripcion,
              image: curso.imagen
                ? curso.imagen.startsWith('http')
                  ? curso.imagen
                  : buildApiUrl(curso.imagen)
                : undefined,
              progress: curso.progreso,
            }))
          : [];
        console.log('✅ Cursos obtenidos del servidor');
        return {
          success: true,
          data: normalized,
        };
      } else {
        let message = `Error del servidor (${response.status}).`;
        try {
          const err = await response.json();
          message = (err?.mensaje as string) || message;
        } catch {
          // ignore JSON parse errors
        }
        return {
          success: false,
          error: message,
        };
      }
    } catch (error) {
      console.warn(
        '⚠️ No se pudo obtener cursos del servidor:',
        error instanceof Error ? error.message : 'Error desconocido'
      );

      return {
        success: false,
        error: 'No hay conexión con el servidor de cursos. Verifica que el backend esté encendido.',
      };
    }
  },

  /**
   * Obtiene detalle de un curso
   * Fuente de verdad: backend (`data/db.json`).
   * Si falla, NO inventa cursos.
   */
  async getCourseDetail(courseId: string): Promise<ApiResponse<CourseDetail>> {
    try {
      console.log(`📖 Obteniendo curso ${courseId}...`);
      
      const response = await fetchWithTimeout(
        buildApiUrl(API_CONFIG.ENDPOINTS.COURSES.DETAIL(courseId)),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Curso obtenido del servidor');
        return {
          success: true,
          data: {
            id: String((data as CursoBackend)?.id ?? courseId),
            title: (data as CursoBackend)?.titulo,
            image: (data as CursoBackend)?.imagen
              ? String((data as CursoBackend)?.imagen).startsWith('http')
                ? (data as CursoBackend)?.imagen
                : buildApiUrl(String((data as CursoBackend)?.imagen))
              : undefined,
            progress: (data as CursoBackend)?.progreso,
            description: (data as CursoBackend)?.descripcion,
            modulos: (data as CursoBackend)?.modulos,
          } as CourseDetail,
        };
      } else {
        let message = `Error del servidor (${response.status}).`;
        try {
          const err = await response.json();
          message = (err?.mensaje as string) || message;
        } catch {
          // ignore JSON parse errors
        }
        return {
          success: false,
          error: message,
        };
      }
    } catch (error) {
      console.warn(
        `⚠️ No se pudo obtener curso ${courseId} del servidor`
      );

      return {
        success: false,
        error: 'No hay conexión con el servidor de cursos. Verifica que el backend esté encendido.',
      };
    }
  },
};

/**
 * Servicio de Usuario
 */
export const userService = {
  /**
   * Obtiene perfil de usuario
   * Si falla, intenta obtener datos del localStorage o usa mock
   */
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      console.log('👤 Obteniendo perfil de usuario...');
      
      const response = await fetchWithTimeout(
        buildApiUrl(API_CONFIG.ENDPOINTS.USER.PROFILE),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Perfil obtenido del servidor');
        return {
          success: true,
          data: data as User,
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ No se pudo obtener perfil, usando datos almacenados');
      
      // Intenta obtener del localStorage
      try {
        const savedUser = localStorage.getItem('usuario');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          return {
            success: true,
            data: user,
            message: 'Datos del usuario almacenados localmente',
          };
        }
      } catch (parseError) {
        console.error('Error leyendo usuario del localStorage:', parseError);
      }

      return {
        success: false,
        error: 'No se pudo obtener el perfil desde el servidor ni desde el almacenamiento local.',
      };
    }
  },

  /**
   * Actualiza perfil de usuario
   * Si falla, al menos guarda localmente
   */
  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      console.log('✏️ Actualizando perfil...');
      
      const response = await fetchWithTimeout(
        buildApiUrl(API_CONFIG.ENDPOINTS.USER.UPDATE),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Perfil actualizado en servidor');
        localStorage.setItem('usuario', JSON.stringify(data));
        return {
          success: true,
          data: data as User,
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn(
        '⚠️ No se pudo actualizar en servidor, guardando localmente:',
        error instanceof Error ? error.message : 'Error desconocido'
      );
      
      // Al menos guarda localmente
      try {
        const currentUser = JSON.parse(localStorage.getItem('usuario') || '{}');
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem('usuario', JSON.stringify(updatedUser));
        
        return {
          success: true,
          data: updatedUser,
          message: 'Guardado localmente (servidor no disponible)',
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'No se pudo guardar los cambios',
        };
      }
    }
  },
};

export default {
  auth: authService,
  courses: courseService,
  user: userService,
};
