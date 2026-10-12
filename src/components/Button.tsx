import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cx } from '@/lib/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'paper' | 'ink' | 'blue' | 'white';
export type ButtonSize = 'sm' | 'md' | 'bar';

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

function buttonClass({ variant = 'paper', size = 'md' }: StyleProps, extra?: string) {
  return cx(styles.button, styles[variant], styles[size], extra);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass({ variant, size }, className)} {...rest} />
  );
});

/** A router link styled like a button. */
export function ButtonLink({ variant, size, className, ...rest }: LinkProps & StyleProps) {
  return <Link className={buttonClass({ variant, size }, className)} {...rest} />;
}
