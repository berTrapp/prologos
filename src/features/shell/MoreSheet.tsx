import { Download, FolderOpen, Plus, Rocket, Settings, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Sheet } from '@/components/ui/Sheet';
import { NavLinkItem } from './NavLinkItem';
import { SaveIndicator } from './SaveIndicator';

/** "Mais" on the phone: everything that is not a tab (ux-ui 12). */
export function MoreSheet({
  projectId,
  open,
  onOpenChange,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t('nav.more')}>
      <nav aria-label={t('nav.more')} className="flex flex-col gap-1">
        <NavLinkItem
          to={`/p/${projectId}/exportar`}
          onClick={close}
          icon={<Download />}
          label={t('nav.export')}
          collapsed={false}
        />
        <NavLinkItem
          to={`/p/${projectId}/pronto`}
          onClick={close}
          icon={<Rocket />}
          label={t('nav.ready')}
          collapsed={false}
        />
        <div className="my-2 border-t border-border" />
        <NavLinkItem
          to="/"
          end
          icon={<FolderOpen />}
          label={t('nav.allProjects')}
          collapsed={false}
        />
        <NavLinkItem
          to="/novo"
          onClick={close}
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
