import LanSharingControl from './LanSharingControl';
import { useServerIpQuery } from '@/hooks/useContentQuery';

const ServerIpDisplay = () => {
  const { data, error, isLoading } = useServerIpQuery();
  const serverIp = data?.ip || null;

  const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : '';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/50 p-2 text-sm md:px-4 md:py-3">
      {serverIp && serverIp !== 'Not Found' ? (
        <p className="whitespace-nowrap text-muted-foreground">
          Server IP:{' '}
          <strong className="font-mono font-semibold text-primary">{`${serverIp}${port}`}</strong>
        </p>
      ) : error ? (
        <p className="font-medium text-destructive">Failed to get server IP</p>
      ) : isLoading ? (
        <p className="text-muted-foreground">Loading server IP...</p>
      ) : (
        <p className="text-muted-foreground">Server IP: Not available</p>
      )}
      <LanSharingControl />
    </div>
  );
};

export default ServerIpDisplay;
