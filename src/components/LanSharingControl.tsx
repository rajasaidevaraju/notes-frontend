import React from 'react';
import { toast } from 'sonner';
import { Share2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useLanStatusQuery,
  useEnableLanMutation,
  useDisableLanMutation,
} from '@/hooks/useContentQuery';

const LanSharingControl: React.FC = () => {
  const { data: status } = useLanStatusQuery();
  const enableMutation = useEnableLanMutation();
  const disableMutation = useDisableLanMutation();

  const loading = enableMutation.isPending || disableMutation.isPending;

  const handleEnable = async () => {
    try {
      await enableMutation.mutateAsync();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'A network error occurred.');
    }
  };

  const handleDisable = async () => {
    try {
      await disableMutation.mutateAsync();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'A network error occurred.');
    }
  };

  if (!status) return null;

  return (
    <div className="flex items-center gap-2.5 whitespace-nowrap">
      {status.enabled ? (
        <>
          <span className="text-muted-foreground">
            LAN Active:{' '}
            <strong className="font-mono font-semibold text-primary">
              ({Math.ceil(status.remainingMs / 60000)}m)
            </strong>
          </span>
          {status.canManage && (
            <div className="flex gap-1.5">
              <Button size="sm" variant="secondary" onClick={handleEnable} disabled={loading}>
                Reset
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDisable} disabled={loading}>
                Disable
              </Button>
            </div>
          )}
        </>
      ) : (
        status.canManage && (
          <Button
            size="sm"
            onClick={handleEnable}
            disabled={loading}
            title="Share on LAN (15m)"
            aria-label="Share on LAN (15 minutes)"
          >
            <Share2Icon className="md:hidden" />
            <span className="max-md:hidden">Share on LAN (15m)</span>
          </Button>
        )
      )}
    </div>
  );
};

export default LanSharingControl;
