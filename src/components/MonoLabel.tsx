import type { ElementType, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './MonoLabel.module.css';

interface MonoLabelProps {
  children: ReactNode;
  /** Secondary text aligned right, e.g. the current selection. */
  aside?: ReactNode;
  as?: ElementType;
  id?: string;
  className?: string;
}

/** Uppercase monospaced section label, as used for "01 Grid" and friends. */
export function MonoLabel({ children, aside, as: Tag = 'span', id, className }: MonoLabelProps) {
  if (aside === undefined) {
    return (
      <Tag id={id} className={cx(styles.label, className)}>
        {children}
      </Tag>
    );
  }
  return (
    <div className={cx(styles.label, styles.row, className)}>
      <Tag id={id} className={styles.label}>
        {children}
      </Tag>
      <span className={styles.aside}>{aside}</span>
    </div>
  );
}
