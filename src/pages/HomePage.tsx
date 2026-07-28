import ContentContainer from '@/components/ContentContainer';
import styles from '@/Home.module.css';
import ServerIpDisplay from '@/components/ServerIpDisplay';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <ServerIpDisplay />
        <ContentContainer />
      </div>
    </div>
  );
}
