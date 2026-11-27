import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import { useMapUi } from './map-ui-store';
import type { MapModel } from './useMapModel';
import { useNextStepText } from './useNextStepText';

/** The next step, always visible at the top of the map (ux-ui 3, 13.9 highlight card). */
export function NextStepBar({
  model,
  stacked = false,
  className,
}: {
  model: MapModel;
  /** Phone: the label above and the text wrapping, like a card (ux-ui 12). */
  stacked?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const select = useMapUi((s) => s.select);
  const setDrawing = useMapUi((s) => s.setDrawing);
  const navigate = useNavigate();
  const next = useNextStepText(model);
  const { text, pending } = next;
  // Drawing a flow is desktop editing (ux-ui 12): on the phone that step is only shown.
  const target = stacked && next.target?.kind === 'flow' ? undefined : next.target;
  const content = stacked ? (
    <>
      <span className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-accent">{t('map.next.label')}</span>
        <span className="text-[12.5px] text-muted">{pending}</span>
      </span>
      <span className="text-[15px] leading-snug text-text">{text}</span>
    </>
  ) : (
    <>
      <span className="shrink-0 text-[13px] font-semibold text-accent">{t('map.next.label')}</span>
      <span className="min-w-0 flex-1 truncate text-[13.5px] text-text">{text}</span>
      <span className="shrink-0 text-[12.5px] text-muted">{pending}</span>
    </>
  );
  const classes = cn(
    'flex min-w-0 rounded-inner bg-accent/7 px-3.5 text-left inset-ring inset-ring-accent/30',
    stacked ? 'flex-col gap-1 py-3' : 'min-h-10 items-center gap-3',
    className,
  );
  // The bar always leads somewhere: the item to decide, the trail, or a new flow.
  const go = () => {
    if (target?.kind === 'item') select({ kind: 'item', id: target.id });
    if (target?.kind === 'checklist') void navigate(`/p/${model.snapshot.project.id}/checklist`);
    if (target?.kind === 'flow') setDrawing([]);
  };
  return target ? (
    <button
      type="button"
      className={cn(
        classes,
        'transition-shadow duration-(--duration-fast) hover:inset-ring-accent/50 focus-visible:outline-2 focus-visible:outline-ring',
      )}
      onClick={go}
    >
      {content}
    </button>
  ) : (
    <div className={classes}>{content}</div>
  );
}
