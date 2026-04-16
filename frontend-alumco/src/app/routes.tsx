// src/app/routes.tsx
import { createBrowserRouter, Navigate } from 'react-router';
import Login from './pages/Login';
import Panel from './pages/Panel';
import CursoDetalle from './pages/CursoDetalle.tsx';
import AdminPanel from './pages/AdminPanel.tsx';
import Root from './Root';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true,          Component: Login },
      { path: 'login',        Component: Login },
      { path: 'panel',        Component: Panel },
      { path: 'curso/:id',    Component: CursoDetalle },
      { path: 'admin',        Component: AdminPanel },   // ← new
      { path: '*',            element: <Navigate to="/" replace /> },
    ],
  },
]);