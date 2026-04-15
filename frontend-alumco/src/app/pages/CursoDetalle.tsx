import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { buildApiUrl, API_CONFIG } from '../config/api.config';
import type { CursoBackend, CursoModulo } from '../types';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; curso: CursoBackend };

function normalizeModulo(modulo: CursoModulo): Required<Pick<CursoModulo, 'tituloModulo' | 'tipo' | 'contenido'>> & CursoModulo {
  return {
    tituloModulo: modulo.tituloModulo || 'Módulo sin título',
    tipo: (modulo.tipo || 'lectura') as 'video' | 'lectura' | 'quiz',
    contenido: modulo.contenido || '',
    ...modulo,
  };
}

export default function CursoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState<LoadState>({ status: 'loading' });

  const cursoId = useMemo(() => (id ? String(id) : ''), [id]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!cursoId) {
        setState({ status: 'error', message: 'Falta el ID del curso.' });
        return;
      }

      setState({ status: 'loading' });

      try {
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.COURSES.DETAIL(cursoId)), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Curso no encontrado. Verifica el ID en la URL.');
          }
          throw new Error(`Error del servidor (${response.status}).`);
        }

        const data = (await response.json()) as CursoBackend;

        if (!isMounted) return;
        setState({ status: 'ready', curso: data });
      } catch (error) {
        if (!isMounted) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'No se pudo cargar el curso.',
        });
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [cursoId]);

  if (state.status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-7 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-full" />
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
            <div className="h-32 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Curso</CardTitle>
            <CardDescription>No se pudo cargar el detalle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">{state.message}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/panel')}>
                Volver al panel
              </Button>
              <Button onClick={() => window.location.reload()}>Reintentar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { curso } = state;
  const modulos = (curso.modulos || []).map(normalizeModulo);
  const heroImageUrl = curso.imagen
    ? String(curso.imagen).startsWith('http')
      ? curso.imagen
      : buildApiUrl(String(curso.imagen))
    : undefined;
  const completedFromFlags = modulos.filter((m) => m.completado === true).length;
  const hasAnyCompletionFlag = modulos.some((m) => typeof m.completado === 'boolean');
  const completedCount = hasAnyCompletionFlag
    ? completedFromFlags
    : Math.max(
        0,
        Math.min(
          modulos.length,
          Math.floor(Math.max(0, Math.min(100, Number(curso.progreso ?? 0))) / 100 * modulos.length)
        )
      );
  const computedProgress = modulos.length > 0 ? Math.round((completedCount / modulos.length) * 100) : 0;
  const progressValue = hasAnyCompletionFlag
    ? computedProgress
    : Math.max(0, Math.min(100, Number(curso.progreso ?? 0)));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="overflow-hidden mb-4">
        {heroImageUrl ? (
          <div
            className="h-44 sm:h-56 bg-gray-200"
            style={{
              backgroundImage: `url(\"${heroImageUrl}\")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : (
          <div className="h-44 sm:h-56 bg-gradient-to-br from-gray-200 to-gray-100" />
        )}
      </Card>

      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border rounded-lg p-4 mb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a2840] truncate">{curso.titulo}</h1>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{curso.descripcion}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/panel')}>Volver</Button>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-700">Progreso</span>
            <span className="text-xs font-bold text-blue-600">
              {progressValue}%{modulos.length > 0 ? ` • ${completedCount} de ${modulos.length} módulos` : ''}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      </div>

      {modulos.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Módulos</CardTitle>
            <CardDescription>Este curso aún no tiene módulos publicados.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {modulos.map((modulo, index) => {
            const isCompleted = index < completedCount;
            const isPathToThisCompleted = index <= completedCount - 1;
            const isPathAfterThisCompleted = index + 1 <= completedCount - 1;

            return (
              <div key={`${modulo.tituloModulo}-${index}`} className="relative pl-10">
                {/* Rail (top segment) */}
                {index > 0 ? (
                  <div
                    className={`absolute left-3 top-0 h-6 w-px ${
                      isPathToThisCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ) : null}

                {/* Rail (bottom segment) */}
                {index < modulos.length - 1 ? (
                  <div
                    className={`absolute left-3 top-6 bottom-0 w-px ${
                      isPathAfterThisCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ) : null}

                {/* Dot */}
                <div
                  className={`absolute left-3 top-6 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full border ${
                    isCompleted ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                  }`}
                  aria-label={isCompleted ? 'Módulo completado' : 'Módulo pendiente'}
                />

                <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{modulo.tituloModulo}</CardTitle>
                      <CardDescription>
                        Tipo: <span className="font-medium">{modulo.tipo}</span>
                        {isCompleted ? (
                          <span className="ml-2 text-xs font-medium text-blue-700">• Visto</span>
                        ) : (
                          <span className="ml-2 text-xs font-medium text-gray-500">• Pendiente</span>
                        )}
                      </CardDescription>
                    </div>
                    {modulo.materialDescargable ? (
                      <a
                        href={modulo.materialDescargable}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Descargar material
                      </a>
                    ) : null}
                  </div>
                </CardHeader>

                <CardContent>
                  {modulo.tipo === 'video' ? (
                    <div className="w-full aspect-video rounded overflow-hidden bg-black">
                      <iframe
                        title={modulo.tituloModulo}
                        src={modulo.contenido}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : modulo.tipo === 'lectura' ? (
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-line text-gray-800 leading-relaxed">{modulo.contenido}</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-gray-50 p-4">
                      <p className="text-sm font-medium text-gray-900">Actividad tipo quiz</p>
                      <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{modulo.contenido}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
