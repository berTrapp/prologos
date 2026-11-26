import { useMemo } from 'react';
import type { ExportInput, ExportOptions } from '@/domain/rules/exports/model';
import { useMapModel } from '@/features/map/useMapModel';
import { fixedTranslate } from '@/i18n/fixed-translate';

/** What the generators need, in the interface language (RN 10, 17). */
export function useExportInput(options: ExportOptions): ExportInput | undefined {
  const model = useMapModel();
  const { futures, notes } = options;
  return useMemo(
    () =>
      model
        ? {
            snapshot: model.snapshot,
            kit: model.kit,
            language: model.language,
            t: fixedTranslate(model.language),
            options: { futures, notes },
          }
        : undefined,
    [model, futures, notes],
  );
}
