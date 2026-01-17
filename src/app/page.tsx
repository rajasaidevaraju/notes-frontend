import ContentContainer from '@/components/ContentContainer'
import styles from '@/Home.module.css'
import { UnifiedContent } from '@/types/Types'
import ServerIpDisplay from '@/components/ServerIpDisplay'
import { headers } from 'next/headers';

export default async function App() {
  let content: UnifiedContent[] = [];
  let initialError: string | null = null;
  const apiURL = process.env.API_URL;

  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const userAgent = headersList.get('user-agent');

  try {
    const response = await fetch(`${apiURL}/content`, {
      cache: 'no-store',
      headers: {
        'x-forwarded-for': forwardedFor || '',
        'user-agent': userAgent || ''
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        initialError = 'Error: Content endpoint not found (404).';
      } else if (response.status === 500) {
        initialError = 'Error: Server encountered an issue (500). Please try again later.';
      } else {
        initialError = `Error fetching content: HTTP status ${response.status}.`;
      }
      console.error(initialError);
      content = [];
    } else {
      const data = await response.json();
      if (Array.isArray(data)) {
        content = data;
      } else {
        initialError = 'Error: Fetched data is not in the expected array format.';
        console.error(initialError, data);
        content = [];
      }
    }
  } catch (error: unknown) {
    initialError = "failed to fetch content"
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        initialError = 'Error: Request timed out.';
      } else {
        initialError = `Error fetching content: ${error.message || 'Network error occurred.'}`;
      }
      content = [];
    }
    console.error(initialError, error);
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>All Content</h1>
        <ServerIpDisplay></ServerIpDisplay>
        <ContentContainer initialNotes={content} initialError={initialError} />
      </div>
    </div>
  );
}
