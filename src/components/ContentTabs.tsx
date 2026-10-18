import React from 'react';
import { ArchiveIcon, EyeIcon, FileTextIcon, KeyRoundIcon, LockIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useContentStore, ContentTab } from '@/store/contentStore';
import { useContentCountsQuery } from '@/hooks/useContentQuery';

const triggerClass = 'px-1.5 text-[0.8rem] max-sm:[&>svg]:hidden md:px-2.5 md:text-sm';

interface ContentTabsProps {
  onUnlockRequest: (targetTab: ContentTab) => void;
}

const ContentTabs: React.FC<ContentTabsProps> = ({ onUnlockRequest }) => {
  const { activeTab, setActiveTab, hiddenUnlocked } = useContentStore();
  const { data: counts } = useContentCountsQuery();

  const hiddenCount = counts?.hidden;
  const archivedCount = counts?.archived ?? 0;
  const accountsCount = counts?.accounts ?? 0;

  const handleTabChange = (tab: ContentTab) => {
    if (tab === 'hidden' && !hiddenUnlocked) {
      onUnlockRequest(tab);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as ContentTab)}>
      <TabsList aria-label="Notes view switcher" className="w-full md:w-fit">
        <TabsTrigger value="all" title="View regular non-hidden notes" className={triggerClass}>
          <FileTextIcon />
          <span>
            <span className="max-sm:hidden">All </span>Notes
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="hidden"
          title={hiddenUnlocked ? 'View hidden notes' : 'Unlock and view hidden notes'}
          className={triggerClass}
        >
          {hiddenUnlocked ? <EyeIcon /> : <LockIcon />}
          Hidden
          {hiddenCount !== undefined && (
            <Badge variant="secondary" className="h-4.5 min-w-4.5 px-1.5 tabular-nums">
              {hiddenCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="archived" title="View archived notes" className={triggerClass}>
          <ArchiveIcon />
          Archived
          <Badge variant="secondary" className="h-4.5 min-w-4.5 px-1.5 tabular-nums">
            {archivedCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="accounts" title="View saved accounts" className={triggerClass}>
          <KeyRoundIcon />
          Accounts
          <Badge variant="secondary" className="h-4.5 min-w-4.5 px-1.5 tabular-nums">
            {accountsCount}
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default ContentTabs;
