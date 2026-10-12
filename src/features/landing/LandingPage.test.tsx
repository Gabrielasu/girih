import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '@/test/render';

describe('Index', () => {
  it('renders the hero, story, steps and footer credit', () => {
    renderRoute('/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'PURE GEOMETRY. ENDLESS SURFACES.'.replace(/ /g, ''),
    );
    expect(screen.getByRole('heading', { name: /GIRIH MEANS/ })).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /girih tile/ })).toHaveLength(5);
    expect(screen.getByRole('heading', { name: /FIVE TILES/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '@gabigebis' })).toHaveAttribute(
      'href',
      'https://x.com/gabigebis',
    );
    expect(screen.getByRole('link', { name: 'Index' })).toHaveAttribute('aria-current', 'page');
  });

  it('never uses em dashes in visible copy', () => {
    const { container } = renderRoute('/');
    expect(container.textContent).not.toContain(String.fromCharCode(0x2014));
  });

  it('shows a not found page for unknown routes', () => {
    renderRoute('/nope');
    expect(screen.getByRole('heading', { name: 'NOTHING TILES HERE.' })).toBeInTheDocument();
  });
});
