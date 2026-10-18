import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ClipboardPasteIcon, CopyIcon } from 'lucide-react';
import ErrorMessage from '@/components/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { hoverRevealClass, itemBodyClass, itemCardClass, itemTitleClass } from '@/components/itemCardStyles';
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
    <div className={cn(itemCardClass, 'border-dashed border-primary/60 hover:border-primary')}>
      <ErrorMessage message={internalError} />
      <div className="flex flex-col items-start gap-2.5">
        <h3 className={itemTitleClass}>{clipboardNote.title}</h3>
        <div className={cn('flex w-full flex-wrap gap-1', hoverRevealClass)}>
          <Button
            size="sm"
            onClick={handlePasteClick}
            title="Paste from Clipboard"
            disabled={pasteBoxOpen}
          >
            <ClipboardPasteIcon />
            Paste
          </Button>
          <Button
            variant="outline"
            size={copyFeedback ? 'sm' : 'icon-sm'}
            onClick={handleCopyClick}
            title="Copy Note Content"
            aria-label="Copy Note Content"
          >
            <CopyIcon />
            {copyFeedback && <span>{copyFeedback}</span>}
          </Button>
        </div>
      </div>
      {pasteBoxOpen ? (
        <div className="flex flex-col gap-2">
          <Textarea
            ref={pasteBoxRef}
            value={pasteDraft}
            onChange={(e) => setPasteDraft(e.target.value)}
            onPaste={handlePasteEvent}
            onKeyDown={(e) => e.key === 'Escape' && closePasteBox()}
            placeholder="Paste here: Ctrl+V, or long-press and choose Paste"
            aria-label="Paste clipboard content"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={closePasteBox}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => savePastedText(pasteDraft)}
              disabled={!pasteDraft || updateNoteMutation.isPending}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className={itemBodyClass}>
          {clipboardNote.content || 'Click "Paste" to get content from your clipboard.'}
        </p>
      )}
    </div>
  );
};

export default ClipboardNoteItem;
