import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_RECIPE } from '@/engine';
import { AssistRequestError, requestSuggestion } from '../client';
import { ASSIST_MODEL } from '../config';
import { AssistParseError, diffRecipes, extractJson, parseSuggestion } from '../schema';

const VALID = {
  grid: 'brick',
  symmetry: 'pmm',
  motif: 'wave',
  hue: 13,
  harmony: 'complement',
  ground: 'ink',
  tile: 95,
  name: 'Paris Tide',
  reason: 'Salmon and teal on a dark ground.',
};

const reply = (text: string, status = 200) =>
  vi
    .fn<typeof fetch>()
    .mockResolvedValue(
      new Response(JSON.stringify({ content: [{ type: 'text', text }] }), { status }),
    );

describe('schema', () => {
  it('extracts JSON from fenced or chatty replies', () => {
    expect(extractJson('Sure!\n```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(() => extractJson('no json')).toThrow(AssistParseError);
    expect(() => extractJson('{oops}')).toThrow(/not valid JSON/);
  });

  it('validates and normalises a suggestion, keeping the seed', () => {
    const out = parseSuggestion(JSON.stringify(VALID), DEFAULT_RECIPE);
    expect(out.recipe).toEqual({
      ...DEFAULT_RECIPE,
      grid: 'brick',
      symmetry: 'pmm',
      motif: 'wave',
      hue: 15,
      harmony: 'complement',
      ground: 'ink',
      tile: 100,
    });
    expect(out.name).toBe('Paris Tide');
    expect(out.reason).toContain('teal');
  });

  it('rejects unknown enum values and out of range numbers', () => {
    expect(() =>
      parseSuggestion(JSON.stringify({ ...VALID, motif: 'star' }), DEFAULT_RECIPE),
    ).toThrow(/motif/);
    expect(() => parseSuggestion(JSON.stringify({ ...VALID, tile: 9000 }), DEFAULT_RECIPE)).toThrow(
      /tile/,
    );
    const missing: Partial<typeof VALID> = { ...VALID };
    delete missing.grid;
    expect(() => parseSuggestion(JSON.stringify(missing), DEFAULT_RECIPE)).toThrow(/grid/);
  });

  it('lists changed fields', () => {
    const changes = diffRecipes(DEFAULT_RECIPE, { ...DEFAULT_RECIPE, hue: 10, seed: 1 });
    expect(changes).toEqual([{ key: 'hue', from: '230', to: '10' }]);
  });
});

describe('requestSuggestion', () => {
  it('calls the Messages API directly with the browser access header', async () => {
    const fetchImpl = reply(JSON.stringify(VALID));
    const out = await requestSuggestion('1920s Paris', DEFAULT_RECIPE, ' sk-test ', { fetchImpl });
    expect(out.recipe.motif).toBe('wave');
    const [url, init] = fetchImpl.mock.calls[0] ?? [];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    const headers = init?.headers as Record<string, string>;
    expect(headers['x-api-key']).toBe('sk-test');
    expect(headers['anthropic-dangerous-direct-browser-access']).toBe('true');
    expect(headers['anthropic-version']).toBe('2023-06-01');
    const body = JSON.parse(init?.body as string) as {
      model: string;
      messages: { content: string }[];
    };
    expect(body.model).toBe(ASSIST_MODEL);
    expect(body.messages[0]?.content).toContain('1920s Paris');
  });

  it('requires a description and a key', async () => {
    await expect(requestSuggestion('  ', DEFAULT_RECIPE, 'k')).rejects.toThrow(/Describe/);
    await expect(requestSuggestion('x', DEFAULT_RECIPE, '')).rejects.toThrow(/API key/);
  });

  it('maps HTTP errors to friendly messages without leaking the key', async () => {
    for (const [status, pattern] of [
      [401, /rejected/],
      [429, /Rate limited/],
      [503, /unavailable/],
      [400, /HTTP 400/],
    ] as const) {
      const err = await requestSuggestion('x', DEFAULT_RECIPE, 'sk-secret', {
        fetchImpl: reply('', status),
      }).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(AssistRequestError);
      expect((err as Error).message).toMatch(pattern);
      expect((err as Error).message).not.toContain('sk-secret');
    }
  });

  it('reports network failures and rethrows aborts', async () => {
    const failing = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(
      requestSuggestion('x', DEFAULT_RECIPE, 'k', { fetchImpl: failing }),
    ).rejects.toThrow(/Could not reach/);
    const aborting = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new DOMException('aborted', 'AbortError'));
    await expect(
      requestSuggestion('x', DEFAULT_RECIPE, 'k', { fetchImpl: aborting }),
    ).rejects.toThrow('aborted');
  });

  it('rejects invalid recipes from the model', async () => {
    await expect(
      requestSuggestion('x', DEFAULT_RECIPE, 'k', { fetchImpl: reply('{"grid":"hex"}') }),
    ).rejects.toThrow(AssistParseError);
  });
});
