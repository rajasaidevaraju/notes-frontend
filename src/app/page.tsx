import NotesContainer from '@/components/NotesContainer'
import styles from '@/Home.module.css'
import {Note} from '@/types/Notes'



export default async function App() {

  const data = await fetch(`http://localhost:3002/notes`);
 
  const notes: Note[] = await data.json();


  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Notes</h1>
        
        <NotesContainer initialNotes={notes}/>
      </div>
    </div>
  );
}