import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { routes } from './routes';

/** Root component. The basename follows Vite's base so GitHub Pages subpaths work. */
export function App() {
  const router = useMemo(
    () =>
      createBrowserRouter(routes, { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' }),
    [],
  );
  return <RouterProvider router={router} />;
}
