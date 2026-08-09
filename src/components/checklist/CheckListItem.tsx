import React from 'react';
import { Checklist } from '@/types/Types';
import EditChecklistForm from './EditChecklistForm';
import ChecklistView from './ChecklistView';
import ViewChecklistModal from './ViewChecklistModal';
import ItemCard from '@/components/ItemCard';
import { useItemCard } from '@/components/useItemCard';
import { useUpdateChecklistMutation, useDeleteChecklistMutation } from '@/hooks/useContentQuery';

interface CheckListItemProps {
  checklist: Checklist;
  isSelected: boolean;
  onToggleSelect: () => void;
  isSelectingMode: boolean;
}

const CheckListItem: React.FC<CheckListItemProps> = ({
  checklist,
  isSelected,
  onToggleSelect,
  isSelectingMode,
}) => {
  const updateChecklistMutation = useUpdateChecklistMutation();
  const deleteChecklistMutation = useDeleteChecklistMutation();

  const card = useItemCard({
    item: checklist,
    updateItem: (changes) => updateChecklistMutation.mutateAsync({ ...checklist, ...changes }),
    deleteItem: () => deleteChecklistMutation.mutateAsync(checklist.id),
    copyText: () =>
      checklist.items.map((i) => `${i.checked ? '[x]' : '[ ]'} ${i.content}`).join('\n'),
  });

  return (
    <ItemCard
      item={checklist}
      card={card}
      isSelected={isSelected}
      onToggleSelect={onToggleSelect}
      isSelectingMode={isSelectingMode}
      modals={
        <>
          <ViewChecklistModal
            isOpen={card.isViewModalOpen}
            onClose={card.closeView}
            checklist={checklist}
          />
          <EditChecklistForm
            isOpen={card.isEditModalOpen}
            onClose={card.closeEdit}
            checklist={checklist}
          />
        </>
      }
    >
      <ChecklistView
        checklist={checklist}
        isMinimized={card.minimized}
        onReadMore={card.openView}
      />
    </ItemCard>
  );
};

export default CheckListItem;
