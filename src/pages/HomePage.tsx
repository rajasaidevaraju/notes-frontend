import ContentContainer from '@/components/ContentContainer';
import ServerIpDisplay from '@/components/ServerIpDisplay';

export default function HomePage() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-muted/40 sm:p-2 md:p-4">
      <div className="w-full rounded-none border-y bg-card p-2 shadow-sm sm:rounded-lg sm:border md:rounded-xl md:p-4">
        <ServerIpDisplay />
        <ContentContainer />
      </div>
    </div>
  );
}
