import styles from '@/Home.module.css';
import os from 'os';

const ServerIpDisplay = async () => {
  let serverIp: string | null = null;
  let error: string | null = null;

  try {
    const networkInterfaces = os.networkInterfaces();
    let foundIp = 'Not Found';

    for (const interfaceName in networkInterfaces) {
      const networkInterface = networkInterfaces[interfaceName];
      if (networkInterface) {
        for (const alias of networkInterface) {
          if (alias.family === 'IPv4' && !alias.internal) {
            foundIp = alias.address;
            break;
          }
        }
      }
      if (foundIp !== 'Not Found') {
        break;
      }
    }
    serverIp = foundIp;

  } catch (e: any) {
    console.error('Failed to get server IP on Next.js server:', e);
    error = `Failed to get server IP: ${e.message}`;
  }

  return (
    <div className={styles.serverInfoContainer}>
      {serverIp && serverIp !== 'Not Found' ? (
        <p className={styles.serverIpText}>Next.js Server IP: <strong>{serverIp}</strong></p>
      ) : error ? (
        <p className={styles.errorText}>{error}</p>
      ) : (
        <p className={styles.loadingText}>Next.js Server IP: Not available</p>
      )}
    </div>
  );
};

export default ServerIpDisplay;