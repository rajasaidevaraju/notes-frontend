// components/NoteItem.tsx
import React, { useState} from 'react';
import ErrorMessage from './ErrorMessage';
import styles from '@/Home.module.css';
import noteItemStyles from './NoteItem.module.css';
import { Note } from '@/types/Notes';
import Modal from './Modal';
import EditNoteFormModal from './EditNoteForm';
import PinForm from './PinForm';
import { useNotesStore } from '../store/notesStore';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onToggleSelect: () => void;
  isSelectingMode: boolean;
}

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  isSelected,
  onToggleSelect,
  isSelectingMode
}) => {
  const { updateNoteApi, deleteNoteApi, clearSelectedNotes,unhideNoteApi} = useNotesStore();

  const [itemError, setItemError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelectingMode) {
      onToggleSelect();
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
    setItemError(null);
    clearSelectedNotes();
    setCopyFeedback(null);
  };

  const handleUpdateFromModal = async (updatedNote:Note) => {
    setItemError(null);

    try {
      await updateNoteApi(updatedNote);
    } catch (err: unknown) {
      let message = "Failed to update note";
      if (err instanceof Error) {
        message = `${message}: ${err.message}`;
      }
      setItemError(message);
      throw err;
    }
  };


  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setItemError(null);
    try {
      await deleteNoteApi(note.id);
      setIsDeleteModalOpen(false);
    } catch (err: unknown) {
      setIsDeleteModalOpen(false);
      let message = "Failed to delete note";
      if (err instanceof Error) {
        message = `${message}: ${err.message}`;
      }
      setItemError(message);
    }
  };

  const handleTogglePin = async () => {
    setItemError(null);
    try {
      await updateNoteApi({...note,pinned:!note.pinned});
    } catch (err: unknown) {
      let message = "Failed to toggle pin";
      if (err instanceof Error) {
        message = `${message}: ${err.message}`;
      }
      setItemError(message);
    }
  };

  const handleHideToggle=async()=>{
    setItemError(null);
    try {
      if(note.hidden){
        setIsPinModalOpen(true);
      }else{
        await updateNoteApi({...note,hidden:true});
      }
    } catch (err: unknown) {
        let message = "Failed to toggle pin";
        if (err instanceof Error) {
          message = `${message}: ${err.message}`;
        }
        setItemError(message);
      }
  }

  const unhideNote = async (pin:string) => {
    setItemError(null);
    try {
      await unhideNoteApi(note.id,pin);
    } catch (err: unknown) {
        let message = "Failed to unhide";
        if (err instanceof Error) {
          message = `${message}: ${err.message}`;
        }
        setItemError(message);
      }
  }
      
  const handleCopyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setItemError(null);
    setCopyFeedback(null);

    try {
      if (navigator.clipboard && note.content) {
        await navigator.clipboard.writeText(note.content);
        setCopyFeedback('Copied!');
        setTimeout(() => setCopyFeedback(null), 2000);
      } else {
        throw new Error('Clipboard API not supported or no content to copy.');
      }
    } catch (err: unknown) {
      let message = 'Failed to copy content';
      if (err instanceof Error) {
        message = `${message}: ${err.message}`;
      }
      setItemError(message);
      setTimeout(() => setItemError(null), 3000);
    }
  };

  return (
    <div
      className={`${noteItemStyles.noteItem} ${note.pinned ? noteItemStyles.pinnedNote : ''} ${isSelected ? noteItemStyles.selectedNote : ''}`}
      onClick={handleClick}
    >
      {itemError && <ErrorMessage message={itemError} />}

      <>
        <div className={noteItemStyles.noteHeader}>
          <h3 className={noteItemStyles.noteTitle}>{truncateText(note.title, 50)}</h3>
          {isSelectingMode ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className={noteItemStyles.multiSelectCheckbox}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className={noteItemStyles.buttonGroup}>
              <button
                onClick={handleTogglePin}
                className={`${styles.button}`}
                title={note.pinned ? 'Unpin' : 'Pin'}
              >
                {note.pinned ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="currentColor" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4l-8 8-2 6 6-2 8-8z"></path> <path d="M8 16l8-8"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                    <path d="M12 17V22" />
                    <path d="M7 10V17L12 22L17 17V10" />
                    <path d="M17 10H7V5H17V10Z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleEditClick}
                className={`${styles.button}`}
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1l1-4l9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={handleDeleteClick}
                className={`${styles.button}`}
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
              <button
                onClick={handleCopyClick}
                className={`${styles.button}`}
                title="Copy Content"
              >
              <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>

                {copyFeedback && <span style={{ marginLeft: '0.3rem' }}>{copyFeedback}</span>}
              </button>
              <button
                onClick={()=>handleHideToggle()}
                className={`${styles.button} ${styles.hideButton}`}
                title={note.hidden ? 'Un-Hide' : 'Hide'}
              >
              {note.hidden ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4.5C17.25 4.5 21.75 8 21.75 12s-4.5 7.5-9.75 7.5S2.25 16 2.25 12 6.75 4.5 12 4.5z"></path> <circle cx="12" cy="12" r="3"></circle>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4.5C17.25 4.5 21.75 8 21.75 12s-4.5 7.5-9.75 7.5S2.25 16 2.25 12 6.75 4.5 12 4.5z"></path> <path d="M3 3l18 18"></path> <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
              </button>
            </div>
          )}
        </div>
        <p className={noteItemStyles.noteContent}>{note.content || 'No content'}</p>
      </>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className={styles.form}>
          <p className={styles.modalBodyText}>Are you sure you want to delete this note?</p>
          <div className={styles.buttonGroup}>
            <button
              onClick={confirmDelete}
              className={`${styles.button} ${styles.deleteButton}`}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className={`${styles.button}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <EditNoteFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        note = {note}
        onUpdateNote={handleUpdateFromModal}
      />
      <Modal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} title="Enter Pin">
        <PinForm 
            onClose={() => setIsPinModalOpen(false)}
            onSubmitPin={(pin)=>unhideNote(pin)}
            isOpen={isPinModalOpen}
        ></PinForm>
      </Modal>  
    </div>
  );
};

export default NoteItem;