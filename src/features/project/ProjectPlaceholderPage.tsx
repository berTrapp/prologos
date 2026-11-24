import { ClipboardCheck, KeyRound, Map } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProject } from '@/app/services';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/features/shell/PageHeader';
import { DataNotice } from './DataNotice';

const PAGES = {
  map: {
    icon: <Map />,
    nav: 'nav.map',
    title: 'projectPage.mapTitle',
    body: 'projectPage.mapBody',
  },
  checklist: {
    icon: <ClipboardCheck />,
    nav: 'nav.checklist',
    title: 'projectPage.checklistTitle',
    body: 'projectPage.checklistBody',
  },
  variables: {
    icon: <KeyRound />,
    nav: 'nav.variables',
    title: 'projectPage.variablesTitle',
    body: 'projectPage.variablesBody',
  },
} as const;

/** Project pages before their phases (5, 6, 7) fill them in. */
export function ProjectPlaceholderPage({ page }: { page: keyof typeof PAGES }) {
  const { t } = useTranslation();
  const name = useProject((s) => s.snapshot?.project.name);
  const config = PAGES[page];
  return (
    <>
      <PageHeader
        title={page === 'map' ? name : t(config.nav)}
        subtitle={page === 'map' ? undefined : name}
      />
      <DataNotice />
      <div className="rounded-card border border-dashed border-border-strong">
        <EmptyState icon={config.icon} title={t(config.title)} description={t(config.body)} />
      </div>
    </>
  );
}
