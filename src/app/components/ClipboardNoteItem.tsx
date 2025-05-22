'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/Home.module.css';
import ErrorMessage from './ErrorMessage';
import { Note } from '@/types/Notes';

interface ClipboardNoteItemProps {
  note: Note;
  onPaste: (content: string) => Promise<void>; 
}

const ClipboardNoteItem: React.FC<ClipboardNoteItemProps> = ({ note, onPaste }) => {
  const [clipboardPermissionStatus, setClipboardPermissionStatus] = useState<PermissionState>('prompt');
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isClipboardAPISupported, setIsClipboardAPISupported] = useState(false); // State to track if Clipboard API is supported

  useEffect(() => {
    let permissionStatus: PermissionStatus | undefined;

    // Check if navigator.clipboard is available before querying permissions
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      setIsClipboardAPISupported(true); // Clipboard API is supported on the client
      const queryPermission = async () => {
        if (navigator.permissions && navigator.permissions.query) {
          try {
            permissionStatus = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
            setClipboardPermissionStatus(permissionStatus.state);
            permissionStatus.onchange = () => {
              if (permissionStatus) {
                setClipboardPermissionStatus(permissionStatus.state);
              }
            };
          } catch (err) {
            console.warn('Clipboard permission query not supported or failed:', err);
            setClipboardPermissionStatus('prompt'); 
          }
        } else {
          console.warn('navigator.permissions.query not supported.');
          setClipboardPermissionStatus('prompt'); 
        }
      };
      queryPermission();
    } else {
      setIsClipboardAPISupported(false); // Clipboard API not supported
      setInternalError('Clipboard paste is not supported in this browser or environment (e.g., non-HTTPS or restricted iframe).');
    }

    // Cleanup function to remove the event listener
    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  const handlePasteClick = async () => {
    setInternalError(null); 

    if (!isClipboardAPISupported) {
      setInternalError('Clipboard paste is not supported in this browser or environment.');
      return;
    }

    if (clipboardPermissionStatus === 'denied') {
      setInternalError('Clipboard permission denied. Please enable it in your browser settings to paste.');
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        await onPaste(text);
      } else {
        setInternalError('Clipboard is empty. Nothing to paste.');
      }
    } catch (err: any) {
      setInternalError(`Failed to read clipboard: ${err.message}. Ensure you have granted permission.`);
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
    } catch (err: any) {
      setInternalError(`Failed to grant clipboard permission: ${err.message}.`);
    }
  };

  return (
    <div className={`${styles.noteItem} ${styles.clipboardNote}`}>
      {internalError && <ErrorMessage message={internalError} />} 
      <div className={styles.noteHeader}>
        <h3 className={styles.noteTitle}>{note.title}</h3>
        <div className={styles.buttonGroup}>
          {!isClipboardAPISupported ? (
            <p className={styles.permissionMessage}>
              Clipboard paste not supported.
            </p>
          ) : clipboardPermissionStatus === 'denied' ? (
            <div className={styles.permission}>
              <button
                onClick={requestClipboardPermission}
                className={`${styles.button} ${styles.secondaryButton}`}
                title="Grant Clipboard Permission"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                  <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1l1-4L16.5 3.5z"></path>
                </svg>
                Grant Permission
              </button>
              <p className={styles.permissionMessage}>
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
        </div>
      </div>
      <p className={styles.noteContent}>
        {note.content ? note.content : 'Click "Paste" to get content from your clipboard.'}
      </p>
    </div>
  );
};

export default ClipboardNoteItem;
