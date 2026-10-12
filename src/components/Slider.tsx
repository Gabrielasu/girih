import { useId } from 'react';
import { cx } from '@/lib/cx';
import styles from './Slider.module.css';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Formats the value shown next to the label and announced to screen readers. */
  format?: (value: number) => string;
  variant?: 'default' | 'hue';
}

/** A labelled native range input. Native ranges are keyboard operable by default. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = String,
  variant = 'default',
}: SliderProps) {
  const id = useId();
  const text = format(value);
  return (
    <div className={styles.field}>
      <div className={styles.head}>
        <label htmlFor={id}>{label}</label>
        {/* aria-valuetext announces the value, so the visual copy is hidden from AT. */}
        <span className={styles.value} aria-hidden="true">
          {text}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className={cx(styles.range, variant === 'hue' && styles.hue)}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={text}
        onChange={(e) => {
          onChange(Number(e.currentTarget.value));
        }}
      />
    </div>
  );
}
