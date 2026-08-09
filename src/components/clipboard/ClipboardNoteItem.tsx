import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/Home.module.css';
import noteItemStyles from '@/components/ItemCard.module.css';
import ErrorMessage from '@/components/ErrorMessage';
import { Note } from '@/types/Types';
import { toMessage } from '@/utils/errors';
import { useUpdateNoteMutation } from '@/hooks/useContentQuery';

interface ClipboardNoteItemProps {
  clipboardNote: Note;
}

const ClipboardNoteItem: React.FC<ClipboardNoteItemProps> = ({ clipboardNote }) => {
  const updateNoteMutation = useUpdateNoteMutation();

  const [clipboardPermissionStatus, setClipboardPermissionStatus] =
    useState<PermissionState>('prompt');
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isClipboardAPISupported, setIsClipboardAPISupported] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const contentRef = useRef<HTMLParagraphElement>(null);

  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const clearLater = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    let permissionStatus: PermissionStatus | undefined;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      setIsClipboardAPISupported(true);
      const queryPermission = async () => {
        if (navigator.permissions && navigator.permissions.query) {
          try {
            permissionStatus = await navigator.permissions.query({
              name: 'clipboard-read' as PermissionName,
            });
            setClipboardPermissionStatus(permissionStatus.state);
            permissionStatus.onchange = () => {
              if (permissionStatus) {
                setClipboardPermissionStatus(permissionStatus.state);
              }
            };
          } catch {
            setClipboardPermissionStatus('prompt');
          }
        } else {
          setClipboardPermissionStatus('prompt');
        }
      };
      queryPermission();
    } else {
      setIsClipboardAPISupported(false);
    }

    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  const handlePasteClick = async () => {
    setInternalError(null);
    setCopyFeedback(null);

    if (!isClipboardAPISupported) {
      setInternalError('Clipboard paste is not supported in this browser or environment.');
      return;
    }

    if (clipboardPermissionStatus === 'denied') {
      setInternalError(
        'Clipboard permission denied. Please enable it in your browser settings to paste.'
      );
      return;
    }

    if (!navigator.clipboard?.readText) {
      setInternalError('Clipboard API not supported or permission denied.');
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      await updateNoteMutation.mutateAsync({ ...clipboardNote, content: text });
    } catch (err: unknown) {
      setInternalError(
        `${toMessage(err, 'Failed to read clipboard')}. Ensure you have granted permission.`
      );
    }
  };

  const requestClipboardPermission = async () => {
    setInternalError(null);
    if (!isClipboardAPISupported) {
      setInternalError('Clipboard paste is not supported in this browser or environment.');
      return;
    }
    try {
      await navigator.clipboard.readText();
    } catch (err: unknown) {
      setInternalError(`${toMessage(err, 'Failed to grant clipboard permission')}.`);
    }
  };

  /** Selects the note text as a fallback for browsers without clipboard-write. */
  const selectContent = () => {
    const contentEl = contentRef.current;
    const selection = window.getSelection();
    if (!contentEl || !selection) throw new Error('Text selection is not supported here.');
    const range = document.createRange();
    range.selectNodeContents(contentEl);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleCopyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalError(null);
    setCopyFeedback(null);

    try {
      if (!clipboardNote.content) throw new Error('No content to copy.');

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(clipboardNote.content);
        setCopyFeedback('Copied!');
      } else {
        // Older browsers: leave the text selected so the user can copy manually.
        selectContent();
        setCopyFeedback('Selected!');
      }
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
          {!isClipboardAPISupported ? (
            <p className={noteItemStyles.permissionMessage}>Clipboard paste not supported.</p>
          ) : clipboardPermissionStatus === 'denied' ? (
            <div className={noteItemStyles.permission}>
              <button
                onClick={requestClipboardPermission}
                className={styles.button}
                title="Grant Clipboard Permission"
              >
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1l1-4L16.5 3.5z"></path>
                </svg>
                Grant Permission
              </button>
              <p className={noteItemStyles.permissionMessage}>
                Permission denied. Click to enable clipboard access.
              </p>
            </div>
          ) : (
            <button
              onClick={handlePasteClick}
              className={`${styles.button} ${styles.primaryButton}`}
              title="Paste from Clipboard"
            >
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              Paste
            </button>
          )}

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
      <p ref={contentRef} className={noteItemStyles.noteContent}>
        {clipboardNote.content || 'Click "Paste" to get content from your clipboard.'}
      </p>
    </div>
  );
};

export default ClipboardNoteItem;
