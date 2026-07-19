'use client';

import { useEffect, useState } from 'react';
import styles from '@/Home.module.css';
import LanSharingControl from './LanSharingControl';

const ServerIpDisplay = () => {
  const [serverIp, setServerIp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchIp = async () => {
      try {
        const res = await fetch('/api/server-ip');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setServerIp(data.ip || null);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? `Failed to get server IP: ${e.message}` : 'Failed to get server IP');
        }
      }
    };

    fetchIp();
    window.addEventListener('focus', fetchIp);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', fetchIp);
    };
  }, []);

  const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : '';

  return (
    <div className={styles.serverInfoContainer}>
      {serverIp && serverIp !== 'Not Found' ? (
        <p className={styles.serverIpText}>Server IP: <strong>{`${serverIp}${port}`}</strong></p>
      ) : error ? (
        <p className={styles.errorText}>{error}</p>
      ) : (
        <p className={styles.loadingText}>Server IP: Not available</p>
      )}
      <LanSharingControl />
    </div>
  );
};

export default ServerIpDisplay;
