import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/Home.module.css';
import noteItemStyles from '@/components/ItemCard.module.css';
import ErrorMessage from '@/components/ErrorMessage';
import { Note } from '@/types/Types';
import { toMessage } from '@/utils/errors';
import { canReadClipboard, copyToClipboard } from '@/utils/clipboard';
import { useUpdateNoteMutation } from '@/hooks/useContentQuery';

interface ClipboardNoteItemProps {
  clipboardNote: Note;
}

const ClipboardNoteItem: React.FC<ClipboardNoteItemProps> = ({ clipboardNote }) => {
  const updateNoteMutation = useUpdateNoteMutation();

  const [internalError, setInternalError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [pasteBoxOpen, setPasteBoxOpen] = useState(false);
  const [pasteDraft, setPasteDraft] = useState('');
  const pasteBoxRef = useRef<HTMLTextAreaElement>(null);

  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const clearLater = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    if (pasteBoxOpen) pasteBoxRef.current?.focus();
  }, [pasteBoxOpen]);

  const savePastedText = async (text: string) => {
    try {
      await updateNoteMutation.mutateAsync({ ...clipboardNote, content: text });
      setPasteBoxOpen(false);
      setPasteDraft('');
    } catch (err: unknown) {
      setInternalError(toMessage(err, 'Failed to save pasted content'));
    }
  };

  const handlePasteClick = async () => {
    setInternalError(null);
    setCopyFeedback(null);

    if (canReadClipboard()) {
      try {
        const text = await navigator.clipboard.readText();
        await updateNoteMutation.mutateAsync({ ...clipboardNote, content: text });
        return;
      } catch {
        // Permission denied or unsupported; fall through to the paste box.
      }
    }
    setPasteBoxOpen(true);
  };

  const handlePasteEvent = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (!text) return;
    e.preventDefault();
    savePastedText(text);
  };

  const closePasteBox = () => {
    setPasteBoxOpen(false);
    setPasteDraft('');
  };

  const handleCopyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalError(null);
    setCopyFeedback(null);

    try {
      if (!clipboardNote.content) throw new Error('No content to copy.');
      await copyToClipboard(clipboardNote.content);
      setCopyFeedback('Copied!');
      clearLater(() => setCopyFeedback(null), 3000);
    } catch (err: unknown) {
      setInternalError(toMessage(err, 'Failed to copy content'));
      clearLater(() => setInternalError(null), 3000);
    }
  };

  return (
    <div className={`${noteItemStyles.noteItem} ${noteItemStyles.clipboardNoteItem}`}>
      <ErrorMessage message={internalError} />
      <div className={noteItemStyles.noteHeader}>
        <h3 className={noteItemStyles.noteTitle}>{clipboardNote.title}</h3>
        <div className={noteItemStyles.toolbarGroup}>
          <button
            onClick={handlePasteClick}
            className={`${styles.button} ${styles.primaryButton}`}
            title="Paste from Clipboard"
            disabled={pasteBoxOpen}
          >
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            Paste
          </button>

          <button
            onClick={handleCopyClick}
            className={`${styles.button} ${styles.pinButton}`}
            title="Copy Note Content"
          >
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {copyFeedback && <span className={noteItemStyles.copyFeedback}>{copyFeedback}</span>}
          </button>
        </div>
      </div>
      {pasteBoxOpen ? (
        <div className={noteItemStyles.pasteBox}>
          <textarea
            ref={pasteBoxRef}
            className={styles.formTextarea}
            value={pasteDraft}
            onChange={(e) => setPasteDraft(e.target.value)}
            onPaste={handlePasteEvent}
            onKeyDown={(e) => e.key === 'Escape' && closePasteBox()}
            placeholder="Paste here: Ctrl+V, or long-press and choose Paste"
            aria-label="Paste clipboard content"
          />
          <div className={noteItemStyles.pasteBoxActions}>
            <button onClick={closePasteBox} className={styles.button}>
              Cancel
            </button>
            <button
              onClick={() => savePastedText(pasteDraft)}
              className={`${styles.button} ${styles.primaryButton}`}
              disabled={!pasteDraft || updateNoteMutation.isPending}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className={noteItemStyles.noteContent}>
          {clipboardNote.content || 'Click "Paste" to get content from your clipboard.'}
        </p>
      )}
    </div>
  );
};

export default ClipboardNoteItem;
