import NotesContainer from '@/components/NotesContainer'
import styles from '@/Home.module.css'
import {Note} from '@/types/Notes'


export default async function App() {
  let notes: Note[] = [];
  let initialError: string | null = null;

  try {
    const response = await fetch(`http://localhost:3002/notes`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        initialError = 'Error: Notes endpoint not found (404).';
      } else if (response.status === 500) {
        initialError = 'Error: Server encountered an issue (500). Please try again later.';
      } else {
        initialError = `Error fetching notes: HTTP status ${response.status}.`;
      }
      console.error(initialError);
      notes = [];
    } else {
      const data = await response.json();
      if (Array.isArray(data)) {
        notes = data;
      } else {
        initialError = 'Error: Fetched data is not in the expected array format.';
        console.error(initialError, data);
        notes = [];
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      initialError = 'Error: Request timed out.';
    } else {
      initialError = `Error fetching notes: ${error.message || 'Network error occurred.'}`;
    }
    console.error(initialError, error);
    notes = [];
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Notes</h1>
        
        <NotesContainer initialNotes={notes} initialError={initialError} />
      </div>
    </div>
  );
}
