import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { GUIDED_STEPS } from './guided-store';

/** Eyebrow, title and lead of a step. The title takes focus when the step changes. */
export function StepHeader({
  index,
  title,
  lead,
}: {
  index: number;
  title: ReactNode;
  lead: ReactNode;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  useEffect(() => {
    // The page opens ready; focus moves only when the person changes step (ux-ui 9).
    if (first.current) {
      first.current = false;
      return;
    }
    ref.current?.focus();
  }, [index]);

  return (
    <header className="flex flex-col gap-2">
      <p className="font-mono text-[11.5px] tracking-[0.14em] text-faint uppercase">
        {t('newProject.stepOf', { current: index + 1, total: GUIDED_STEPS.length })}
      </p>
      <h1
        ref={ref}
        tabIndex={-1}
        className="text-[24px] leading-tight font-semibold tracking-tight text-text outline-none desktop:text-[28px]"
      >
        {title}
      </h1>
      <p className="text-[15px] leading-relaxed text-muted">{lead}</p>
    </header>
  );
}
