import { useCallback, useEffect, useRef, useState } from 'react';
import type { Recipe } from '@/engine';
import { readStorage, removeStorage, STORAGE_KEYS, writeStorage } from '@/lib/storage';
import { requestSuggestion } from './client';
import { diffRecipes, type RecipeChange } from './schema';

export interface Proposal {
  recipe: Recipe;
  changes: RecipeChange[];
  name?: string;
  reason?: string;
}

type Status = 'idle' | 'loading' | 'error' | 'proposal';

/** State machine for the optional assist: key storage, request, preview, apply. */
export function useAssist(current: Recipe, apply: (recipe: Recipe) => void) {
  const [apiKey, setApiKey] = useState<string>(() => readStorage(STORAGE_KEYS.apiKey) ?? '');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  const saveKey = useCallback((key: string) => {
    const trimmed = key.trim();
    setApiKey(trimmed);
    if (trimmed) writeStorage(STORAGE_KEYS.apiKey, trimmed);
    else removeStorage(STORAGE_KEYS.apiKey);
  }, []);

  const forgetKey = useCallback(() => {
    setApiKey('');
    removeStorage(STORAGE_KEYS.apiKey);
  }, []);

  const suggest = useCallback(
    async (description: string) => {
      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;
      setStatus('loading');
      setError('');
      setProposal(null);
      try {
        const result = await requestSuggestion(description, current, apiKey, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setProposal({ ...result, changes: diffRecipes(current, result.recipe) });
        setStatus('proposal');
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Something went wrong.');
        setStatus('error');
      }
    },
    [current, apiKey],
  );

  const accept = useCallback(() => {
    if (proposal) apply(proposal.recipe);
    setProposal(null);
    setStatus('idle');
  }, [proposal, apply]);

  const discard = useCallback(() => {
    setProposal(null);
    setStatus('idle');
  }, []);

  return {
    apiKey,
    hasKey: apiKey.length > 0,
    status,
    error,
    proposal,
    saveKey,
    forgetKey,
    suggest,
    accept,
    discard,
  };
}
