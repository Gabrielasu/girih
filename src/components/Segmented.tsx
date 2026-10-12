import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Segmented.module.css';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Accessible name when the visible content is not plain text. */
  ariaLabel?: string;
}

interface SegmentedProps<T extends string> {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  layout?: 'joined' | 'gapped';
  /** Selected tone: blue (default) or ink. */
  tone?: 'blue' | 'ink';
  optionClassName?: string;
  className?: string;
  renderOption?: (option: SegmentedOption<T>, selected: boolean) => ReactNode;
}

/**
 * A single choice group rendered as toggle buttons. Each button exposes its
 * state with aria-pressed so screen readers announce the current choice.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 3,
  layout = 'joined',
  tone = 'blue',
  optionClassName,
  className,
  renderOption,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cx(styles.group, styles[layout], tone === 'ink' && styles.inkSelected, className)}
      style={{ '--cols': columns } as CSSProperties}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={cx(styles.option, optionClassName)}
            aria-pressed={selected}
            aria-label={option.ariaLabel}
            onClick={() => {
              onChange(option.value);
            }}
          >
            {renderOption ? renderOption(option, selected) : option.label}
          </button>
        );
      })}
    </div>
  );
}
