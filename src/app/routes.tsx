import type { RouteObject } from 'react-router';
import { LandingPage } from '@/features/landing/LandingPage';
import { SpecimensPage } from '@/features/specimens/SpecimensPage';
import { StudioPage } from '@/features/studio/StudioPage';
import { Layout } from './Layout';
import { NotFound } from './NotFound';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'studio', element: <StudioPage /> },
      { path: 'specimens', element: <SpecimensPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
