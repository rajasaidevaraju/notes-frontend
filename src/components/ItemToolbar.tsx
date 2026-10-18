import React from 'react';
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CopyIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  EyeOffIcon,
  Maximize2Icon,
  Minimize2Icon,
  PencilIcon,
  PinIcon,
  SquarePlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { hoverRevealClass } from './itemCardStyles';

interface ItemToolbarProps {
  pinned: boolean;
  hidden: boolean;
  archived: boolean;
  minimized: boolean;
  copyFeedback: string | null;
  onTogglePin: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onAdd?: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
  onToggleHide?: (e: React.MouseEvent) => void;
  onToggleArchive?: (e: React.MouseEvent) => void;
  onToggleMinimize: (e: React.MouseEvent) => void;
}

interface ItemAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}

const buildActions = (props: ItemToolbarProps): ItemAction[] => {
  const { pinned, hidden, archived, minimized } = props;

  return [
    {
      key: 'pin',
      label: pinned ? 'Unpin' : 'Pin',
      onClick: props.onTogglePin,
      icon: <PinIcon className={cn(pinned && 'fill-current')} />,
    },
    ...(props.onToggleArchive
      ? [{
          key: 'archive',
          label: archived ? 'Unarchive' : 'Archive',
          onClick: props.onToggleArchive,
          icon: archived ? <ArchiveRestoreIcon /> : <ArchiveIcon />,
        }]
      : []),
    ...(props.onAdd
      ? [{ key: 'add', label: 'Add Entry', onClick: props.onAdd, icon: <SquarePlusIcon /> }]
      : []),
    { key: 'edit', label: 'Edit', onClick: props.onEdit, icon: <PencilIcon /> },
    { key: 'delete', label: 'Delete', onClick: props.onDelete, danger: true, icon: <Trash2Icon /> },
    { key: 'copy', label: 'Copy Content', onClick: props.onCopy, icon: <CopyIcon /> },
    ...(props.onToggleHide
      ? [{
          key: 'hide',
          label: hidden ? 'Un-Hide' : 'Hide',
          onClick: props.onToggleHide,
          icon: hidden ? <EyeIcon /> : <EyeOffIcon />,
        }]
      : []),
    {
      key: 'minimize',
      label: minimized ? 'Expand' : 'Minimize',
      onClick: props.onToggleMinimize,
      icon: minimized ? <Maximize2Icon /> : <Minimize2Icon />,
    },
  ];
};

const ItemToolbar: React.FC<ItemToolbarProps> = (props) => (
  <div className={cn('hidden w-full flex-wrap gap-1 pointer-fine:md:flex', hoverRevealClass)}>
    {buildActions(props).map((action) => {
      const showFeedback = action.key === 'copy' && props.copyFeedback;
      return (
        <Button
          key={action.key}
          variant="outline"
          size={showFeedback ? 'sm' : 'icon-sm'}
          onClick={action.onClick}
          className={cn(
            'text-muted-foreground',
            action.danger && 'hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive'
          )}
          title={action.label}
          aria-label={action.label}
        >
          {action.icon}
          {showFeedback && <span>{props.copyFeedback}</span>}
        </Button>
      );
    })}
  </div>
);

export const ItemActionsMenu: React.FC<ItemToolbarProps & { title: string }> = ({ title, ...props }) => {
  const actions = buildActions(props);
  const regular = actions.filter((a) => !a.danger);
  const danger = actions.filter((a) => a.danger);
  const primary = actions.find((a) => a.key === (props.onAdd ? 'add' : 'edit'))!;

  return (
    <div className="flex shrink-0 items-center gap-1 pointer-fine:md:hidden">
      {props.copyFeedback && (
        <span className="text-xs text-muted-foreground">{props.copyFeedback}</span>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={primary.onClick}
        title={primary.label}
        aria-label={primary.label}
      >
        {primary.icon}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              title="More options"
              aria-label="More options"
              onClick={(e) => e.stopPropagation()}
            />
          }
        >
          <EllipsisVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate">{title}</DropdownMenuLabel>
            {regular.map((action) => (
              <DropdownMenuItem key={action.key} onClick={action.onClick} className="py-2">
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {danger.map((action) => (
            <DropdownMenuItem
              key={action.key}
              variant="destructive"
              onClick={action.onClick}
              className="py-2"
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ItemToolbar;
