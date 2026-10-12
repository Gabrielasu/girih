import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Segmented } from '../Segmented';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
] as const;

describe('Segmented', () => {
  it('exposes the selection with aria-pressed inside a labelled group', () => {
    render(<Segmented label="Letters" options={options} value="b" onChange={() => undefined} />);
    expect(screen.getByRole('group', { name: 'Letters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alpha' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Beta' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onChange with the option value, by mouse and keyboard', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Segmented label="Letters" options={options} value="b" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Alpha' }));
    expect(onChange).toHaveBeenLastCalledWith('a');
    screen.getByRole('button', { name: 'Beta' }).focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('b');
  });

  it('supports custom rendering and aria labels', () => {
    render(
      <Segmented
        label="Letters"
        options={[{ value: 'x', label: 'X', ariaLabel: 'Letter X' }]}
        value="x"
        onChange={() => undefined}
        renderOption={(o, selected) => `${o.label}${selected ? '!' : ''}`}
      />,
    );
    expect(screen.getByRole('button', { name: 'Letter X' })).toHaveTextContent('X!');
  });
});
