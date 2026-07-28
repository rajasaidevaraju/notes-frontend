import React, { useState, useEffect } from 'react';
import styles from '@/Home.module.css';
import noteItemStyles from './NoteItem.module.css';
import ErrorMessage from './ErrorMessage';
import { Note } from '@/types/Types';
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
  const contentRef = React.useRef<HTMLParagraphElement>(null);

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
      await updateNoteMutation.mutateAsync({
        ...clipboardNote,
        content: text,
      });
      setInternalError(null);
    } catch (err: unknown) {
      let message = 'Failed to read clipboard. Ensure you have granted permission.';
      if (err instanceof Error) {
        message = `Failed to read clipboard: ${err.message}. Ensure you have granted permission.`;
      }
      setInternalError(message);
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
      let message = 'Failed to grant clipboard permission.';
      if (err instanceof Error) {
        message = `Failed to grant clipboard permission: ${err.message}.`;
      }
      setInternalError(message);
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalError(null);
    setCopyFeedback(null);

    try {
      if (!clipboardNote?.content) {
        throw new Error('No content available to select from clipboard note.');
      }
      const contentEl = contentRef.current;
      const selection = window.getSelection();
      if (!contentEl || !selection) {
        throw new Error('Text selection is not supported in this environment.');
      }
      const range = document.createRange();
      range.selectNodeContents(contentEl);
      selection.removeAllRanges();
      selection.addRange(range);

      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      }

      if (copied) {
        selection.removeAllRanges();
        setCopyFeedback('Copied!');
      } else {
        setCopyFeedback('Selected!');
      }
      setTimeout(() => setCopyFeedback(null), 3000);
    } catch (err: unknown) {
      let message = 'Failed to select content';
      if (err instanceof Error) {
        message = `${message}: ${err.message}`;
      }
      setInternalError(message);
      setTimeout(() => setInternalError(null), 3000);
    }
  };

  if (!clipboardNote) {
    return null;
  }

  return (
    <div className={`${noteItemStyles.noteItem} ${noteItemStyles.clipboardNoteItem}`}>
      {internalError && <ErrorMessage message={internalError} />}
      <div className={noteItemStyles.noteHeader}>
        <h3 className={noteItemStyles.noteTitle}>{clipboardNote.title}</h3>
        <div className={noteItemStyles.buttonGroup}>
          {!isClipboardAPISupported ? (
            <p className={noteItemStyles.permissionMessage}>
              Clipboard paste not supported.
            </p>
          ) : clipboardPermissionStatus === 'denied' ? (
            <div className={noteItemStyles.permission}>
              <button
                onClick={requestClipboardPermission}
                className={`${styles.button}`}
                title="Grant Clipboard Permission"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              Paste
            </button>
          )}

          <button
            onClick={handleSelectClick}
            className={`${styles.button} ${styles.pinButton}`}
            title="Select Note Content"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8V6a2 2 0 0 1 2-2h2"></path>
              <path d="M16 4h2a2 2 0 0 1 2 2v2"></path>
              <path d="M20 16v2a2 2 0 0 1-2 2h-2"></path>
              <path d="M8 20H6a2 2 0 0 1-2-2v-2"></path>
              <path d="M8 12h8"></path>
            </svg>
            {copyFeedback && <span style={{ marginLeft: '0.3rem' }}>{copyFeedback}</span>}
          </button>
        </div>
      </div>
      <p ref={contentRef} className={noteItemStyles.noteContent}>
        {clipboardNote.content ? clipboardNote.content : 'Click "Paste" to get content from your clipboard.'}
      </p>
    </div>
  );
};

export default ClipboardNoteItem;