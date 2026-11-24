import { FolderOpen, Plus, Settings, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Sheet } from '@/components/ui/Sheet';
import { NavLinkItem } from './NavLinkItem';
import { SaveIndicator } from './SaveIndicator';
import { useUi } from './ui-store';

/** "Mais" on the phone: everything that is not a tab (ux-ui 12). */
export function MoreSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const openNewProject = useUi((s) => s.setNewProjectOpen);
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t('nav.more')}>
      <nav aria-label={t('nav.more')} className="flex flex-col gap-1">
        <NavLinkItem
          to="/"
          end
          icon={<FolderOpen />}
          label={t('nav.allProjects')}
          collapsed={false}
        />
        <NavLinkItem
          onClick={() => {
            close();
            openNewProject(true);
          }}
          icon={<Plus />}
          label={t('nav.newProject')}
          collapsed={false}
        />
        <NavLinkItem
          to="/lixeira"
          onClick={close}
          icon={<Trash2 />}
          label={t('nav.trash')}
          collapsed={false}
        />
        <NavLinkItem
          to="/configuracoes"
          icon={<Settings />}
          label={t('nav.settings')}
          collapsed={false}
        />
      </nav>
      <div className="mt-4 border-t border-border pt-4">
        <SaveIndicator />
      </div>
    </Sheet>
  );
}
