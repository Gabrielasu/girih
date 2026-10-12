import { ButtonLink } from '@/components/Button';
import { Header } from '@/components/Header';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <div className={styles.page}>
      <Header />
      <main id="main" className={styles.main}>
        <span className={styles.mono}>Plate 404</span>
        <h1 className={styles.title}>NOTHING TILES HERE.</h1>
        <ButtonLink to="/" variant="ink">
          Back to the index
        </ButtonLink>
      </main>
    </div>
  );
}
