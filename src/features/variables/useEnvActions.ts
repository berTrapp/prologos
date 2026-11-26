import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { projectStore } from '@/app/services';
import {
  addEnvVar,
  addEnvironment,
  kitEnvVars,
  updateEnvVar,
  type EnvVarInput,
} from '@/domain/rules/env';
import { applyImport, type ImportContext, type ImportRow } from '@/domain/rules/env-import';
import type { Kit } from '@/domain/schemas/kit';
import type { ProjectSnapshot } from '@/domain/schemas/snapshot';
import type { Language } from '@/i18n/languages';
import { notify } from '@/lib/notify';

const store = () => projectStore.getState();
const newId = () => crypto.randomUUID();
const apply = (rule: (snapshot: ProjectSnapshot) => ProjectSnapshot) => {
  const current = store().snapshot;
  if (!current) return;
  const next = rule(current);
  if (next !== current) store().change(() => next);
};

/** Variable edits: undoable, saved by the project store, never with a secret value (RN 3). */
export function useEnvActions() {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      add(input: EnvVarInput, environments: string[]) {
        apply((s) => addEnvVar(s, input, environments, newId));
      },
      update(envVarId: string, input: EnvVarInput) {
        const current = store().snapshot;
        if (!current) return;
        const before = current.envVars.find((v) => v.id === envVarId);
        const { snapshot, valueDiscarded } = updateEnvVar(current, envVarId, input);
        store().change(() => snapshot);
        // ux-ui 14: marking a secret says what happened to the value.
        if (before && !before.secret && input.secret) {
          notify.success(t('env.toast.secret', { key: input.key }), {
            ...(valueDiscarded ? { description: t('env.toast.secretDiscarded') } : {}),
          });
        }
      },
      async remove(envVarId: string, key: string) {
        const entry = await store().moveToTrash('envVar', envVarId, key);
        if (!entry) return;
        notify.success(t('env.toast.removed'), {
          action: { label: t('toast.undo'), onClick: () => void store().restoreFromTrash(entry) },
        });
      },
      addEnvironment(name: string) {
        apply((s) => addEnvironment(s, name));
      },
      addKitVars(kit: Kit, language: Language) {
        const current = store().snapshot;
        if (!current) return;
        const vars = kitEnvVars(
          kit,
          language,
          current.project.id,
          current.project.environments,
          newId,
        );
        store().change(() => ({ ...current, envVars: [...current.envVars, ...vars] }));
        notify.success(t('env.toast.kitAdded', { count: kit.envVars.length }));
      },
      /** RN 3, ux-ui 14: every imported value is dropped; the toast sums it up. */
      importRows(
        rows: ImportRow[],
        context: Pick<ImportContext, 'environments' | 'destination' | 'clientSide'>,
        describe: (key: string) => string | undefined,
      ) {
        const current = store().snapshot;
        if (!current) return;
        const result = applyImport(current, rows, context, newId, describe);
        store().change(() => result.snapshot);
        notify.success(
          t('env.toast.imported', { added: rows.length - result.ignored, ignored: result.ignored }),
        );
      },
    }),
    [t],
  );
}

export type EnvActions = ReturnType<typeof useEnvActions>;
