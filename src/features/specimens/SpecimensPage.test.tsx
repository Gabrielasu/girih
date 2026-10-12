import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '@/test/render';
import { SPECIMENS } from './specimens';

describe('Specimens', () => {
  it('shows the featured plate and twelve plates linking to the Studio', () => {
    renderRoute('/specimens');
    expect(
      screen.getByRole('heading', { name: 'Quarter Turn in Ultramarine' }),
    ).toBeInTheDocument();
    const list = screen
      .getAllByRole('list')
      .find((l) => l.tagName === 'UL' && within(l).queryByText('Blue Hour'));
    if (!list) throw new Error('plate list missing');
    const links = within(list).getAllByRole('link');
    expect(links).toHaveLength(12);
    expect(links[0]).toHaveAttribute(
      'href',
      expect.stringContaining('/studio?grid=square&sym=p4m&motif=petal'),
    );
  });

  it('filters by symmetry', async () => {
    const user = userEvent.setup();
    renderRoute('/specimens');
    await user.click(screen.getByRole('button', { name: 'p1' }));
    expect(screen.getByRole('button', { name: 'p1' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Gilded Scales')).toBeInTheDocument();
    expect(screen.queryByText('Blue Hour')).not.toBeInTheDocument();
    expect(SPECIMENS.filter((s) => s.recipe.symmetry === 'p1')).toHaveLength(1);
  });

  it('opens a plate in the Studio', async () => {
    const user = userEvent.setup();
    renderRoute('/specimens');
    await user.click(screen.getByRole('link', { name: /Night Kites/ }));
    expect(await screen.findByTestId('plate-caption')).toHaveTextContent(
      'Plate 021 · p4 · Kite · Triadic',
    );
  });
});
