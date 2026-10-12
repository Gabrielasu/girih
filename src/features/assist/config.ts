/**
 * Configuration for the optional Claude assist.
 *
 * ASSIST_MODEL is the only place the model id is set. Model ids change over
 * time: verify this against Anthropic's current model list before releasing
 * (https://platform.claude.com/docs/en/models/overview).
 */
export const ASSIST_MODEL = 'claude-haiku-5-5';

export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
export const ANTHROPIC_VERSION = '2023-06-01';
export const ASSIST_MAX_TOKENS = 400;
export const ASSIST_MAX_PROMPT_LENGTH = 300;
