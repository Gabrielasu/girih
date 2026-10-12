/** The Girih mark: a square and its 45 degree twin around a knot. */
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true" focusable="false">
      <rect
        x="5"
        y="5"
        width="16"
        height="16"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="1.6"
      />
      <rect
        x="5"
        y="5"
        width="16"
        height="16"
        fill="none"
        stroke="var(--color-blue)"
        strokeWidth="1.6"
        transform="rotate(45 13 13)"
      />
      <circle cx="13" cy="13" r="3" fill="var(--color-ink)" />
    </svg>
  );
}
