import type { Recipe } from '@/engine';
import {
  ANTHROPIC_API_URL,
  ANTHROPIC_VERSION,
  ASSIST_MAX_PROMPT_LENGTH,
  ASSIST_MAX_TOKENS,
  ASSIST_MODEL,
} from './config';
import { SYSTEM_PROMPT } from './prompt';
import { parseSuggestion } from './schema';

export class AssistRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'AssistRequestError';
  }
}

interface MessagesResponse {
  content?: { type: string; text?: string }[];
}

function messageForStatus(status: number): string {
  if (status === 401 || status === 403) return 'The API key was rejected. Check it and try again.';
  if (status === 429) return 'Rate limited by the Anthropic API. Wait a moment and try again.';
  if (status >= 500) return 'The Anthropic API is unavailable right now. Try again later.';
  return `The request failed (HTTP ${status}).`;
}

/**
 * Asks Claude for a recipe matching `description`. Calls the Messages API
 * straight from the browser with the user's own key. The key is sent only
 * in the x-api-key header and is never logged or included in errors.
 */
export async function requestSuggestion(
  description: string,
  current: Recipe,
  apiKey: string,
  { signal, fetchImpl = fetch }: { signal?: AbortSignal; fetchImpl?: typeof fetch } = {},
) {
  const prompt = description.trim().slice(0, ASSIST_MAX_PROMPT_LENGTH);
  if (!prompt) throw new AssistRequestError('Describe a style first.');
  if (!apiKey.trim()) throw new AssistRequestError('Add your Anthropic API key first.');

  let res: Response;
  try {
    res = await fetchImpl(ANTHROPIC_API_URL, {
      method: 'POST',
      signal: signal ?? null,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: ASSIST_MODEL,
        max_tokens: ASSIST_MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Style: ${prompt}` }],
      }),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new AssistRequestError('Could not reach the Anthropic API. Check your connection.');
  }

  if (!res.ok) throw new AssistRequestError(messageForStatus(res.status), res.status);

  const body = (await res.json()) as MessagesResponse;
  const text = (body.content ?? [])
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('\n');
  return parseSuggestion(text, current);
}
