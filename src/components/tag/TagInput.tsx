import React, { useRef } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LIMITS } from '@/constants';

const MAX_SUGGESTIONS = 12;

interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  draft: string;
  onDraftChange: (draft: string) => void;
  /** Existing tag names offered as one-tap suggestions. */
  suggestions: string[];
}

const sameTag = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

// Adds `name` unless an equal tag is already present; reuses an existing tag's casing.
export const withTag = (tags: string[], name: string, known: string[]): string[] => {
  const trimmed = name.trim();
  if (!trimmed || tags.some((tag) => sameTag(tag, trimmed))) return tags;
  return [...tags, known.find((tag) => sameTag(tag, trimmed)) ?? trimmed];
};

const TagInput: React.FC<TagInputProps> = ({ id, value, onChange, draft, onDraftChange, suggestions }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const atLimit = value.length >= LIMITS.TAGS_PER_ITEM;

  const query = draft.trim().toLowerCase();
  const available = suggestions.filter((name) => !value.some((tag) => sameTag(tag, name)));
  const matching = available.filter((name) => name.toLowerCase().includes(query)).slice(0, MAX_SUGGESTIONS);
  const canCreate = query !== '' && !suggestions.some((name) => sameTag(name, query));

  const add = (name: string) => {
    onChange(withTag(value, name, suggestions));
    onDraftChange('');
    inputRef.current?.focus();
  };

  const remove = (name: string) => onChange(value.filter((tag) => tag !== name));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && draft.trim()) {
      e.preventDefault();
      if (!atLimit) add(draft);
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex min-h-8 w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-input px-2 py-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="h-6 gap-0.5 pr-0.5 text-[0.8rem]">
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(tag);
              }}
              className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
              aria-label={`Remove tag ${tag}`}
            >
              <XIcon className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          id={id}
          // Next to a password field, browsers treat a plain text input as a username box.
          type="search"
          name="account-tag"
          data-1p-ignore
          data-lpignore="true"
          data-bwignore
          data-form-type="other"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value.replace(',', ''))}
          onKeyDown={handleKeyDown}
          maxLength={LIMITS.TAG_NAME}
          placeholder={atLimit ? 'Tag limit reached' : value.length ? 'Add another…' : 'e.g. Email, Work'}
          disabled={atLimit}
          enterKeyHint="enter"
          autoComplete="off"
          className="h-6 min-w-24 flex-1 appearance-none bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm [&::-webkit-search-cancel-button]:appearance-none"
        />
      </div>

      {!atLimit && (matching.length > 0 || canCreate) && (
        <div className="flex flex-wrap gap-1.5" aria-label="Tag suggestions">
          {canCreate && (
            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => add(draft)}>
              <PlusIcon />
              Create “{draft.trim()}”
            </Button>
          )}
          {matching.map((name) => (
            <Button
              key={name}
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full border border-dashed border-border text-muted-foreground"
              onClick={() => add(name)}
            >
              <PlusIcon />
              {name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
