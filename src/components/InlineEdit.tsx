import React, { useEffect, useRef, useState } from 'react';

interface InlineEditProps {
  value: string;
  onChange: (value: string) => void;
  /** Rendered in place of the input while not editing. */
  children: React.ReactNode;
  displayAs?: 'heading' | 'inline';
  displayClassName: string;
  inputClassName: string;
  tooltip: string;
  placeholder?: string;
  maxLength?: number;
  ariaLabel?: string;
}

/**
 * Click-to-edit text: shows `children`, swaps to a focused input on click, and
 * commits on blur, Enter or Escape. Used for both the modal titles and the
 * tracker's unit chip, which differ only in markup.
 */
const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onChange,
  children,
  displayAs = 'inline',
  displayClassName,
  inputClassName,
  tooltip,
  placeholder,
  maxLength,
  ariaLabel,
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
            setEditing(false);
          }
        }}
        className={inputClassName}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
      />
    );
  }

  const Tag = displayAs === 'heading' ? 'h2' : 'span';
  return (
    <Tag className={displayClassName} onClick={() => setEditing(true)} title={tooltip}>
      {children}
    </Tag>
  );
};

export default InlineEdit;
