import NotesContainer from '@/components/NotesContainer'
import styles from '@/Home.module.css'
import {Note} from '@/types/Notes'


export default async function App() {
  let notes: Note[] = []; 

  try {
    const response = await fetch(`http://localhost:3002/notes`, {
      cache: 'no-store' 
    });
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      notes = []; 
    } else {
      const data = await response.json();
      if (Array.isArray(data)) {
        notes = data;
      } else {
        console.error('Fetched data is not an array:', data);
        notes = [];
      }
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
    notes = [];
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Notes</h1>
        
        <NotesContainer initialNotes={notes}/>
      </div>
    </div>
  );
}
