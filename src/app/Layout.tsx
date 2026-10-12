import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

/** Shared shell: skip link and scroll reset between routes. */
export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Outlet />
    </>
  );
}
