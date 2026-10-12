import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';

beforeAll(() => {
  // Engine tests run in the node environment, which has no DOM.
  if (typeof window === 'undefined') return;
  // jsdom does not implement scrolling.
  window.scrollTo = () => undefined;
});

afterEach(() => {
  if (typeof window === 'undefined') return;
  cleanup();
  window.localStorage.clear();
});
