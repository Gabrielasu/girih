import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_RECIPE, encodeRecipe, nextSeed } from '@/engine';
import { loadRecipe, STORAGE_KEYS } from '@/lib/storage';
import { renderRoute } from '@/test/render';

const caption = () => screen.getByTestId('plate-caption');

describe('Studio', () => {
  it('renders the default recipe with all numbered sections', () => {
    renderRoute('/studio');
    expect(caption()).toHaveTextContent('Plate 471 · p4m · Petal · Split · Seed 4471-P4M');
    expect(caption()).toHaveTextContent(/Contrast \d+\.\d:1/);
    for (const label of [
      '01 Grid',
      '02 Symmetry',
      '03 Motif',
      '04 Seed',
      '05 Variations',
      '06 Scale',
      '07 Color',
      '08 Recipe',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole('img', { name: /Live pattern/ })).toBeInTheDocument();
  });

  it('changes symmetry, updates the URL and saves the recipe', async () => {
    const user = userEvent.setup();
    const { router } = renderRoute('/studio');
    const group = screen.getByRole('group', { name: 'Symmetry' });
    await user.click(within(group).getByRole('button', { name: /^p2,/ }));
    expect(within(group).getByRole('button', { name: /^p2,/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(caption()).toHaveTextContent('· p2 ·');
    await waitFor(() => {
      expect(router.state.location.search).toContain('sym=p2');
    });
    expect(loadRecipe()?.symmetry).toBe('p2');
  });

  it('loads a recipe from the URL', () => {
    renderRoute(
      `/studio?${encodeRecipe({ ...DEFAULT_RECIPE, motif: 'kite', harmony: 'triadic', seed: 1234 })}`,
    );
    expect(caption()).toHaveTextContent('Plate 234 · p4m · Kite · Triadic · Seed 1234-P4M');
  });

  it('follows external URL changes such as back and forward', async () => {
    const { router } = renderRoute('/studio');
    await act(async () => {
      await router.navigate(`/studio?${encodeRecipe({ ...DEFAULT_RECIPE, motif: 'dots' })}`);
    });
    expect(caption()).toHaveTextContent('Dots');
  });

  it('updates sliders, harmony and ground', async () => {
    const user = userEvent.setup();
    renderRoute('/studio');
    fireEvent.change(screen.getByRole('slider', { name: 'Tile' }), { target: { value: '200' } });
    expect(screen.getByTestId('recipe-card')).toHaveTextContent('200px');
    fireEvent.change(screen.getByRole('slider', { name: 'Key hue' }), { target: { value: '10' } });
    await user.click(screen.getByRole('button', { name: 'Triadic' }));
    await user.click(screen.getByRole('button', { name: 'Ink ground' }));
    expect(screen.getByRole('button', { name: 'Ink ground' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('recipe-card')).toHaveTextContent('triadic @ 10°');
  });

  it('generates a new seed and adopts a variation', async () => {
    const user = userEvent.setup();
    renderRoute('/studio');
    await user.click(screen.getByRole('button', { name: 'New seed' }));
    const seed = nextSeed(DEFAULT_RECIPE.seed);
    expect(screen.getByTestId('seed-value')).toHaveTextContent(String(seed).padStart(4, '0'));
    const variations = within(screen.getByRole('region', { name: 'Variations' })).getAllByRole(
      'button',
    );
    expect(variations).toHaveLength(6);
    const first = variations[0];
    if (!first) throw new Error('missing variation');
    await user.click(first);
    expect(screen.getByTestId('seed-value')).toHaveTextContent(String(seed + 1));
  });

  it('randomizes', async () => {
    const user = userEvent.setup();
    vi.spyOn(Date, 'now').mockReturnValue(123456);
    renderRoute('/studio');
    const before = screen.getByTestId('recipe-card').textContent;
    await user.click(screen.getByRole('button', { name: 'Randomize' }));
    expect(screen.getByTestId('recipe-card').textContent).not.toBe(before);
    vi.restoreAllMocks();
  });

  it('opens the export menu and closes it with Escape', async () => {
    const user = userEvent.setup();
    renderRoute('/studio');
    const trigger = screen.getByRole('button', { name: 'Export' });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('group', { name: 'Export options' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('group', { name: 'Export options' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('works without an API key: assist is optional and asks for a key on demand', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderRoute('/studio');
    expect(screen.getByText('Optional')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Describe a style/), 'Bauhaus');
    await user.click(screen.getByRole('button', { name: 'Add key' }));
    expect(screen.getByLabelText('Anthropic API key')).toHaveAttribute('type', 'password');
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('previews an assist suggestion and applies it only on confirmation', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(STORAGE_KEYS.apiKey, 'sk-test');
    const text = JSON.stringify({
      grid: 'diamond',
      symmetry: 'p4',
      motif: 'leaf',
      hue: 20,
      harmony: 'triadic',
      ground: 'paper',
      name: 'Autumn',
    });
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ content: [{ type: 'text', text }] })));
    renderRoute('/studio');
    await user.type(screen.getByLabelText(/Describe a style/), 'autumn leaves');
    await user.click(screen.getByRole('button', { name: 'Suggest' }));
    const preview = await screen.findByRole('region', { name: 'Suggested changes' });
    expect(preview).toHaveTextContent('Autumn');
    expect(preview).toHaveTextContent('motif petal to leaf');
    expect(caption()).toHaveTextContent('Petal');
    await user.click(within(preview).getByRole('button', { name: 'Apply' }));
    expect(caption()).toHaveTextContent('Leaf');
    expect(screen.queryByRole('region', { name: 'Suggested changes' })).not.toBeInTheDocument();
    fetchSpy.mockRestore();
  });

  it('saves and removes the API key', async () => {
    const user = userEvent.setup();
    renderRoute('/studio');
    await user.click(screen.getByRole('button', { name: 'Add key' }));
    await user.type(screen.getByLabelText('Anthropic API key'), 'sk-abc');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(window.localStorage.getItem(STORAGE_KEYS.apiKey)).toBe('sk-abc');
    await user.click(screen.getByRole('button', { name: 'Remove saved key' }));
    expect(window.localStorage.getItem(STORAGE_KEYS.apiKey)).toBeNull();
    expect(screen.getByRole('button', { name: 'Add key' })).toBeInTheDocument();
  });
});
