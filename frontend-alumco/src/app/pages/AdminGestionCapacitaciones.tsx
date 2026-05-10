import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { GraduationCap, LogOut, Users, ChevronLeft } from 'lucide-react';
import { courseService, userService } from '../services/apiService';
import type { Course, User } from '../types';
import { BACKEND_URL } from '../config/api.config';

const LOGO_SRC = `${BACKEND_URL}/static/alumco-logo.png`;

export default function AdminGestionCapacitaciones() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [logoOk, setLogoOk] = useState(true);

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Detectar si es profesor
  const isProfesor = user?.rol?.includes('profesor') && !user?.rol?.includes('admin');

  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [createCourseError, setCreateCourseError] = useState<string | null>(null);

  const usersById = useMemo(() => {
    const map = new Map<string, User>();
    for (const u of users) {
      if (u?.id) map.set(u.id, u);
    }
    return map;
  }, [users]);

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const response = await courseService.getCourses({ all: true });
        let allCourses = response.success && response.data ? response.data : [];
        
        // Si es profesor, filtrar solo sus cursos (donde instructor_id == user.id)
        if (isProfesor && user?.id) {
          allCourses = allCourses.filter(c => String(c.instructorId) === String(user.id));
        }
        
        setCourses(allCourses);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    loadCourses();
  }, [isProfesor, user?.id]);

  const ensureUsersLoaded = async () => {
    if (users.length > 0) return;

    setIsLoadingUsers(true);
    try {
      const response = await userService.getUsers();
      setUsers(response.success && response.data ? response.data : []);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateCourse = () => {
    if (isCreatingCourse) return;

    setIsCreatingCourse(true);
    setCreateCourseError(null);

    navigate('/admin/editar-curso/nuevo');
  };

  const openAssignDialog = async (course: Course) => {
    setSelectedCourse(course);
    setSelectedUserIds(Array.isArray(course.alumnosInscritos) ? course.alumnosInscritos : []);
    setIsDialogOpen(true);
    await ensureUsersLoaded();
  };

  const closeAssignDialog = () => {
    if (isSaving) return;
    setIsDialogOpen(false);
    setSelectedCourse(null);
    setSelectedUserIds([]);
  };

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) return prev.filter((id) => id !== userId);
      return [...prev, userId];
    });
  };

  const handleSaveAssignments = async () => {
    if (!selectedCourse?.id) return;

    setIsSaving(true);
    try {
      const response = await courseService.assignStudentsToCourse(selectedCourse.id, selectedUserIds);
      if (response.success && response.data) {
        setCourses((prev) => prev.map((c) => (c.id === selectedCourse.id ? response.data! : c)));
        setIsDialogOpen(false);
        setSelectedCourse(null);
        setSelectedUserIds([]);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const enrolledCount = (course: Course) =>
    Array.isArray(course.alumnosInscritos) ? course.alumnosInscritos.length : 0;

  const selectedUsersPreview = useMemo(() => {
    if (selectedUserIds.length === 0) return 'Nadie';

    const names = selectedUserIds
      .map((id) => usersById.get(id))
      .filter(Boolean)
      .map((u) => u!.nombreCompleto || u!.nombre || u!.email || u!.id);

    return names.length > 0 ? names.join(', ') : `${selectedUserIds.length} usuarios`;
  }, [selectedUserIds, usersById]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {logoOk ? (
                <img
                  src={LOGO_SRC}
                  alt="Logo de Alumco"
                  className="h-10 w-auto"
                  onError={() => setLogoOk(false)}
                />
              ) : (
                <div className="text-xl sm:text-2xl font-semibold text-[#1a2840] leading-tight">
                  ALUMCO
                </div>
              )}
              <div className="text-sm text-gray-600 leading-tight">
                {isProfesor ? 'Profesor' : 'Admin'} · Gestión de Capacitaciones
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate(isProfesor ? '/profesor' : '/admin')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
              <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 ${isProfesor ? 'bg-green-100' : 'bg-purple-100'} rounded-lg`}>
                <GraduationCap className={`w-6 h-6 ${isProfesor ? 'text-green-600' : 'text-purple-600'}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1a2840]">
                  {isProfesor ? 'Mis Capacitaciones' : 'Gestión de Capacitaciones'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isProfesor 
                    ? 'Crea, edita y gestiona tus cursos' 
                    : 'Asigna usuarios a cursos'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={handleCreateCourse} 
                disabled={isCreatingCourse}
                className={isProfesor ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {isCreatingCourse ? 'Creando\u2026' : 'Crear Nueva Capacitación'}
              </Button>
            </div>
          </div>

          {createCourseError ? (
            <div className="mt-2 text-sm text-red-600">{createCourseError}</div>
          ) : null}
        </div>

        {isLoadingCourses ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200" />
                <CardHeader>
                  <div className="h-4 bg-gray-200 mb-2" />
                  <div className="h-3 bg-gray-100" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No hay cursos</CardTitle>
              <CardDescription>Crea o carga cursos para poder asignar usuarios.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col min-h-[360px]"
              >
                <div
                  className={`h-40 bg-gradient-to-br ${isProfesor ? 'from-green-400 to-green-600' : 'from-purple-400 to-purple-600'}`}
                  style={
                    course.image
                      ? {
                          backgroundImage: `url("${course.image}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : undefined
                  }
                />

                <CardHeader className="flex-1">
                  <CardTitle className="text-lg">{course.title || 'Sin título'}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {course.description || 'Sin descripción'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      {(() => {
                        const count = enrolledCount(course);
                        const badgeClass =
                          count > 0
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200';

                        return (
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeClass}`}
                          >
                            {count} inscritos
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className={`mt-3 grid gap-2 ${isProfesor ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {!isProfesor && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => openAssignDialog(course)}
                      >
                        Asignar usuarios
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={isProfesor ? 'default' : 'outline'}
                      className={`w-full ${isProfesor ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      onClick={() => {
                        if (!course?.id) return;
                        navigate(`/admin/editar-curso/${course.id}`);
                      }}
                    >
                      {isProfesor ? 'Editar Curso' : 'Editar Contenido'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeAssignDialog())}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Asignar usuarios</DialogTitle>
              <DialogDescription>
                {selectedCourse?.title ? (
                  <span>
                    Curso: <strong>{selectedCourse.title}</strong>
                  </span>
                ) : (
                  'Selecciona los usuarios que quedarán inscritos en este curso.'
                )}
              </DialogDescription>
            </DialogHeader>

            {isLoadingUsers ? (
              <div className="text-sm text-gray-600">Cargando usuarios\u2026</div>
            ) : users.length === 0 ? (
              <div className="text-sm text-gray-600">No hay usuarios disponibles.</div>
            ) : (
              <div className="max-h-[320px] overflow-auto space-y-3 pr-2">
                {users.map((u) => {
                  if (!u.id) return null;

                  return (
                    <label
                      key={u.id}
                      className="flex items-start gap-3 p-3 rounded-md border bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedUserIds.includes(u.id)}
                        onCheckedChange={() => toggleUser(u.id)}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {u.nombreCompleto || u.nombre || u.email || u.id}
                        </div>
                        <div className="text-xs text-gray-600 truncate">{u.email}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="text-xs text-gray-600">
              Seleccionados: <span className="font-medium">{selectedUsersPreview}</span>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeAssignDialog} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSaveAssignments} disabled={isSaving || !selectedCourse?.id}>
                {isSaving ? 'Guardando\u2026' : 'Guardar asignación'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
