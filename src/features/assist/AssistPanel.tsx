import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/Button';
import { MonoLabel } from '@/components/MonoLabel';
import type { Recipe } from '@/engine';
import { ASSIST_MAX_PROMPT_LENGTH } from './config';
import styles from './AssistPanel.module.css';
import { useAssist } from './useAssist';

interface AssistPanelProps {
  recipe: Recipe;
  onApply: (recipe: Recipe) => void;
}

const FIELD_LABELS: Record<string, string> = {
  grid: 'grid',
  symmetry: 'symmetry',
  motif: 'motif',
  hue: 'hue',
  harmony: 'harmony',
  ground: 'ground',
  tile: 'tile',
  rotation: 'rotation',
  line: 'line',
};

/**
 * Optional Claude assist. Nothing here is required to use Girih: without a
 * key the panel only offers to add one. Suggestions are previewed as a list
 * of changes and applied only when the user confirms.
 */
export function AssistPanel({ recipe, onApply }: AssistPanelProps) {
  const assist = useAssist(recipe, onApply);
  const [description, setDescription] = useState('');
  const [editingKey, setEditingKey] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const ids = { describe: useId(), key: useId(), keyHelp: useId(), label: useId() };
  const loading = assist.status === 'loading';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!assist.hasKey) {
      setEditingKey(true);
      return;
    }
    if (description.trim()) void assist.suggest(description);
  };

  const onSaveKey = (e: FormEvent) => {
    e.preventDefault();
    assist.saveKey(keyDraft);
    setKeyDraft('');
    setEditingKey(false);
  };

  return (
    <section className={styles.panel} aria-labelledby={ids.label}>
      <MonoLabel id={ids.label} aside={<span className={styles.badge}>Optional</span>}>
        Assist
      </MonoLabel>
      <form onSubmit={onSubmit} className={styles.keyForm}>
        <label htmlFor={ids.describe} className={styles.hint}>
          Describe a style and Claude suggests settings. Requires your own API key.
        </label>
        <div className={styles.field}>
          <input
            id={ids.describe}
            type="text"
            className={styles.input}
            placeholder="1920s Paris, salmon and teal"
            maxLength={ASSIST_MAX_PROMPT_LENGTH}
            value={description}
            onChange={(e) => {
              setDescription(e.currentTarget.value);
            }}
          />
          <Button type="submit" size="sm" className={styles.fieldButton} disabled={loading}>
            {assist.hasKey ? (loading ? 'Working' : 'Suggest') : 'Add key'}
          </Button>
        </div>
      </form>

      {editingKey && (
        <form onSubmit={onSaveKey} className={styles.keyForm}>
          <label htmlFor={ids.key} className={styles.keyLabel}>
            Anthropic API key
          </label>
          <div className={styles.field}>
            <input
              id={ids.key}
              type="password"
              autoComplete="off"
              spellCheck={false}
              className={styles.input}
              placeholder="sk-ant-..."
              aria-describedby={ids.keyHelp}
              value={keyDraft}
              onChange={(e) => {
                setKeyDraft(e.currentTarget.value);
              }}
            />
            <Button
              type="submit"
              size="sm"
              variant="ink"
              className={styles.fieldButton}
              disabled={!keyDraft.trim()}
            >
              Save
            </Button>
          </div>
          <p id={ids.keyHelp} className={styles.small}>
            Stored only in this browser and sent only to api.anthropic.com.
          </p>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => {
              setEditingKey(false);
            }}
          >
            Cancel
          </button>
        </form>
      )}

      {assist.hasKey && !editingKey && (
        <button type="button" className={styles.textButton} onClick={assist.forgetKey}>
          Remove saved key
        </button>
      )}

      <div aria-live="polite">
        {loading && <p className={styles.small}>Asking Claude for a recipe.</p>}
        {assist.status === 'error' && (
          <p role="alert" className={styles.error}>
            {assist.error}
          </p>
        )}
      </div>

      {assist.proposal && (
        <div className={styles.proposal} role="region" aria-label="Suggested changes">
          <div className={styles.proposalHead}>
            <span className={styles.proposalName}>{assist.proposal.name ?? 'Suggestion'}</span>
            {assist.proposal.reason && (
              <span className={styles.small}>{assist.proposal.reason}</span>
            )}
          </div>
          {assist.proposal.changes.length > 0 ? (
            <ul className={styles.changes}>
              {assist.proposal.changes.map((c) => (
                <li key={c.key}>
                  {FIELD_LABELS[c.key] ?? c.key} {c.from} <span className={styles.arrow}>to</span>{' '}
                  {c.to}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.changes}>Matches the current pattern.</p>
          )}
          <div className={styles.actions}>
            <Button variant="blue" size="sm" onClick={assist.accept}>
              Apply
            </Button>
            <Button size="sm" onClick={assist.discard}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
