import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import styles from './Header.module.css';
import { Logo } from './Logo';

const NAV = [
  { to: '/studio', label: 'Studio' },
  { to: '/specimens', label: 'Specimens' },
  { to: '/', label: 'Index' },
] as const;

/** Site header: wordmark, primary navigation and a route specific slot on the right. */
export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand} aria-label="Girih, go to the index">
        <Logo />
        <span className={styles.wordmark} aria-hidden="true">
          GIRIH
        </span>
      </Link>
      <nav aria-label="Primary" className={styles.nav}>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end className={styles.navLink}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.slot}>{children}</div>
    </header>
  );
}
