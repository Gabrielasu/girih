import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { build, DEFAULT_RECIPE } from '@/engine';
import { PatternSvg } from '../PatternSvg';
import { Swatches } from '../Swatches';

describe('PatternSvg', () => {
  it('renders one path per shape inside a pattern with a unique id', () => {
    const tile = build({ ...DEFAULT_RECIPE, grid: 'diamond' });
    const { container } = render(
      <>
        <PatternSvg tile={tile} width={100} height={100} label="One" />
        <PatternSvg tile={tile} width={100} height={100} />
      </>,
    );
    const patterns = container.querySelectorAll('pattern');
    expect(patterns).toHaveLength(2);
    expect(patterns[0]?.id).not.toBe(patterns[1]?.id);
    expect(patterns[0]?.getAttribute('patternTransform')).toBe('rotate(45)');
    expect(patterns[0]?.querySelectorAll('path')).toHaveLength(tile.shapes.length);
    const svgs = container.querySelectorAll('svg');
    expect(svgs[0]).toHaveAttribute('role', 'img');
    expect(svgs[1]).toHaveAttribute('aria-hidden', 'true');
  });

  it('can force a hairline stroke', () => {
    const tile = build(DEFAULT_RECIPE, { line: 3 });
    const { container } = render(<PatternSvg tile={tile} width={10} height={10} strokeWidth={1} />);
    const widths = [...container.querySelectorAll('path')].map((p) =>
      p.getAttribute('stroke-width'),
    );
    expect(new Set(widths)).toEqual(new Set(['1']));
  });
});

describe('Swatches', () => {
  it('shows hex codes as text in the full variant', () => {
    const { getByText } = render(<Swatches colors={['#FFFFFF', '#000000']} />);
    expect(getByText('#FFFFFF')).toBeInTheDocument();
  });

  it('labels mini swatches', () => {
    const { getByRole } = render(<Swatches variant="mini" colors={['#FFFFFF']} />);
    expect(getByRole('img', { name: 'Palette #FFFFFF' })).toBeInTheDocument();
  });
});
