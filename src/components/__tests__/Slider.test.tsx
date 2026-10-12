import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from '../Slider';

describe('Slider', () => {
  it('labels the range and shows the formatted value', () => {
    render(
      <Slider
        label="Tile"
        value={140}
        min={60}
        max={240}
        step={10}
        format={(v) => `${v} px`}
        onChange={() => undefined}
      />,
    );
    const input = screen.getByRole('slider', { name: 'Tile' });
    expect(input).toHaveValue('140');
    expect(input).toHaveAttribute('aria-valuetext', '140 px');
    expect(screen.getByText('140 px')).toBeInTheDocument();
  });

  it('reports numeric changes', () => {
    const onChange = vi.fn();
    render(<Slider label="Line" value={1} min={0} max={4} step={0.5} onChange={onChange} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Line' }), { target: { value: '2.5' } });
    expect(onChange).toHaveBeenCalledWith(2.5);
  });
});
