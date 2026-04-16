import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { ChevronLeft, LogOut, Users } from 'lucide-react';
import { userService } from '../services/apiService';
import type { User } from '../types';
import { BACKEND_URL } from '../config/api.config';

const LOGO_SRC = `${BACKEND_URL}/static/alumco-logo.png`;

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; users: User[] };

export default function AdminUsuarios() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [logoOk, setLogoOk] = useState(true);

  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setState({ status: 'loading' });
      try {
        const response = await userService.getUsers();
        if (!response.success) {
          throw new Error(response.error || 'No se pudieron cargar los usuarios.');
        }

        if (!isMounted) return;
        setState({ status: 'ready', users: response.data || [] });
      } catch (error) {
        if (!isMounted) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'No se pudieron cargar los usuarios.',
        });
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const rows = useMemo(() => {
    if (state.status !== 'ready') return [];

    return (state.users || []).map((u) => {
      const nombre = u.nombreCompleto || u.nombre || u.name || '—';
      const email = u.email || '—';
      const rol = Array.isArray(u.rol) && u.rol.length > 0 ? u.rol.join(', ') : '—';

      return { id: u.id || `${email}-${nombre}`, nombre, email, rol };
    });
  }, [state]);

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
              <div className="text-sm text-gray-600 leading-tight">Admin · Centro de Usuarios</div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => navigate('/admin')} variant="outline" className="flex items-center gap-2">
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
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-100 rounded-lg">
              <Users className="w-6 h-6 text-cyan-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1a2840]">Centro de Usuarios</h2>
              <p className="text-sm text-gray-600">Listado de usuarios (admin)</p>
            </div>
          </div>
        </div>

        {state.status === 'loading' ? (
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 w-1/3" />
              <div className="h-3 bg-gray-100 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-gray-100 rounded" />
            </CardContent>
          </Card>
        ) : state.status === 'error' ? (
          <Card>
            <CardHeader>
              <CardTitle>No se pudo cargar</CardTitle>
              <CardDescription>{state.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()}>Reintentar</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>{rows.length} usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-gray-600">
                        No hay usuarios.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-gray-900">{r.nombre}</TableCell>
                        <TableCell className="text-gray-700">{r.email}</TableCell>
                        <TableCell className="text-gray-700">{r.rol}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
