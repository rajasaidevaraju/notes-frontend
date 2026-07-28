import styles from '@/Home.module.css';
import LanSharingControl from './LanSharingControl';
import { useServerIpQuery } from '@/hooks/useContentQuery';

const ServerIpDisplay = () => {
  const { data, error, isLoading } = useServerIpQuery();
  const serverIp = data?.ip || null;

  const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : '';

  return (
    <div className={styles.serverInfoContainer}>
      {serverIp && serverIp !== 'Not Found' ? (
        <p className={styles.serverIpText}>
          Server IP: <strong>{`${serverIp}${port}`}</strong>
        </p>
      ) : error ? (
        <p className={styles.errorText}>Failed to get server IP</p>
      ) : isLoading ? (
        <p className={styles.loadingText}>Loading server IP...</p>
      ) : (
        <p className={styles.loadingText}>Server IP: Not available</p>
      )}
      <LanSharingControl />
    </div>
  );
};

export default ServerIpDisplay;
