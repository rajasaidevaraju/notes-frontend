import React, { useRef } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tag } from '@/types/Types';
import { LIMITS } from '@/constants';

const MAX_SUGGESTIONS = 12;

export interface TagValue {
  id: number | null;
  name: string;
}

interface TagInputProps {
  id?: string;
  value: TagValue[];
  onChange: (tags: TagValue[]) => void;
  draft: string;
  onDraftChange: (draft: string) => void;
  suggestions: Tag[];
}

const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

const keyOf = (tag: TagValue) => (tag.id === null ? `new:${tag.name.toLowerCase()}` : String(tag.id));

export const withTag = (tags: TagValue[], name: string, known: Tag[]): TagValue[] => {
  const trimmed = name.trim();
  if (!trimmed || tags.some((tag) => sameName(tag.name, trimmed))) return tags;
  const existing = known.find((tag) => sameName(tag.name, trimmed));
  return [...tags, existing ? { id: existing.id, name: existing.name } : { id: null, name: trimmed }];
};

const TagInput: React.FC<TagInputProps> = ({ id, value, onChange, draft, onDraftChange, suggestions }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const atLimit = value.length >= LIMITS.TAGS_PER_ITEM;

  const query = draft.trim().toLowerCase();
  const available = suggestions.filter((tag) => !value.some((v) => v.id === tag.id));
  const matching = available.filter((tag) => tag.name.toLowerCase().includes(query)).slice(0, MAX_SUGGESTIONS);
  const canCreate =
    query !== '' &&
    !suggestions.some((tag) => sameName(tag.name, query)) &&
    !value.some((tag) => sameName(tag.name, query));

  const add = (name: string) => {
    onChange(withTag(value, name, suggestions));
    onDraftChange('');
    inputRef.current?.focus();
  };

  const remove = (tag: TagValue) => onChange(value.filter((v) => keyOf(v) !== keyOf(tag)));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && draft.trim()) {
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
          <Badge key={keyOf(tag)} variant="secondary" className="h-6 gap-0.5 pr-0.5 text-[0.8rem]">
            {tag.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(tag);
              }}
              className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
              aria-label={`Remove tag ${tag.name}`}
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
          name="tag"
          data-1p-ignore
          data-lpignore="true"
          data-bwignore
          data-form-type="other"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
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
          {matching.map((tag) => (
            <Button
              key={tag.id}
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full border border-dashed border-border text-muted-foreground"
              onClick={() => add(tag.name)}
            >
              <PlusIcon />
              {tag.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
