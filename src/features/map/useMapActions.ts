import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { projectStore } from '@/app/services';
import {
  addItem,
  addZone,
  chooseOption,
  connect,
  placeItem,
  revertItem,
  setCollapsed,
  setConnectionType,
  updateItem,
  updateZone,
  type ItemPatch,
  type NewItem,
  type NewZone,
  type ZonePatch,
} from '@/domain/rules/edit';
import { setNotApplicable, setPrepStep } from '@/domain/rules/checklist';
import { addFlow, removeFlow, renameFlow, restoreFlow } from '@/domain/rules/flows';
import {
  addNote,
  addRisk,
  removeNote,
  removeRisk,
  restoreNote,
  restoreRisk,
  setRiskResolved,
} from '@/domain/rules/notes';
import type { ConnectionType } from '@/domain/schemas/map';
import type { Severity } from '@/domain/schemas/notes';
import type { ProjectSnapshot } from '@/domain/schemas/snapshot';
import { notify } from '@/lib/notify';
import { useMapUi } from './map-ui-store';

const store = () => projectStore.getState();
/** Runs a domain rule on the current project and records it as one undoable change. */
const apply = (rule: (snapshot: ProjectSnapshot) => ProjectSnapshot) => {
  const current = store().snapshot;
  if (!current) return;
  const next = rule(current);
  if (next !== current) store().change(() => next);
};
const newId = () => crypto.randomUUID();

/** Every edit of the map: optimistic, undoable and saved by the project store (ux-ui 7, 8). */
export function useMapActions() {
  const { t } = useTranslation();
  const select = useMapUi((s) => s.select);

  /** RN 11, ux-ui 14: deleting goes to the trash, with Desfazer in the toast. */
  const trash = async (kind: 'item' | 'zone' | 'connection', id: string, label: string) => {
    const entry = await store().moveToTrash(kind, id, label);
    if (!entry) return;
    select(null);
    notify.success(t(`map.toast.removed.${kind}`, { name: label }), {
      action: { label: t('toast.undo'), onClick: () => void store().restoreFromTrash(entry) },
    });
  };

  return useMemo(
    () => ({
      addItem(input: Omit<NewItem, 'id'>, fromSuggestion = false) {
        const id = newId();
        apply((s) => addItem(s, { ...input, id }));
        select({ kind: 'item', id });
        if (fromSuggestion) notify.success(t('map.toast.itemAdded'));
        return id;
      },
      updateItem(itemId: string, patch: ItemPatch) {
        apply((s) => updateItem(s, itemId, patch));
      },
      /** RN 13, ux-ui 14: "Banco: PostgreSQL" with Desfazer. */
      chooseOption(itemId: string, choice: string, itemName: string) {
        const previous = store().snapshot?.items.find((item) => item.id === itemId);
        if (!previous) return;
        apply((s) => chooseOption(s, itemId, choice));
        notify.success(t('map.toast.optionChosen', { name: itemName, choice }), {
          action: { label: t('toast.undo'), onClick: () => apply((s) => revertItem(s, previous)) },
        });
      },
      placeItem(itemId: string, zoneId: string, index: number) {
        apply((s) => placeItem(s, itemId, zoneId, index));
      },
      removeItem: (itemId: string, label: string) => trash('item', itemId, label),
      addZone(input: Omit<NewZone, 'id'>) {
        const id = newId();
        apply((s) => addZone(s, { ...input, id }));
        select({ kind: 'zone', id });
        return id;
      },
      updateZone(zoneId: string, patch: ZonePatch) {
        apply((s) => updateZone(s, zoneId, patch));
      },
      setCollapsed(zoneIds: string[], collapsed: boolean) {
        apply((s) => setCollapsed(s, zoneIds, collapsed));
      },
      removeZone: (zoneId: string, label: string) => trash('zone', zoneId, label),
      connect(from: string, to: string, type?: ConnectionType) {
        const id = newId();
        apply((s) => connect(s, { id, from, to, ...(type ? { type } : {}) }));
        return id;
      },
      setConnectionType(connectionId: string, type: ConnectionType | undefined) {
        apply((s) => setConnectionType(s, connectionId, type));
      },
      removeConnection: (connectionId: string, label: string) =>
        trash('connection', connectionId, label),
      addFlow(name: string, steps: string[]) {
        const id = newId();
        apply((s) => addFlow(s, { id, name, steps }));
        return id;
      },
      renameFlow(flowId: string, name: string) {
        apply((s) => renameFlow(s, flowId, name));
      },
      removeFlow(flowId: string) {
        const snapshot = store().snapshot;
        const index = snapshot?.flows.findIndex((flow) => flow.id === flowId) ?? -1;
        const flow = snapshot?.flows[index];
        if (!flow) return;
        apply((s) => removeFlow(s, flowId).snapshot);
        notify.success(t('map.toast.flowRemoved', { name: flow.name }), {
          action: {
            label: t('toast.undo'),
            onClick: () => apply((s) => restoreFlow(s, flow, index)),
          },
        });
      },
      addNote(itemId: string, text: string) {
        apply((s) => addNote(s, { id: newId(), itemId, text, now: Date.now() }));
      },
      addRisk(itemId: string, text: string, severity: Severity) {
        apply((s) => addRisk(s, { id: newId(), itemId, text, severity, now: Date.now() }));
      },
      resolveRisk(riskId: string) {
        apply((s) => setRiskResolved(s, riskId, true));
        notify.success(t('map.toast.riskResolved'), {
          action: {
            label: t('toast.undo'),
            onClick: () => apply((s) => setRiskResolved(s, riskId, false)),
          },
        });
      },
      removeNote(noteId: string) {
        const note = store().snapshot?.notes.find((n) => n.id === noteId);
        if (!note) return;
        apply((s) => removeNote(s, noteId));
        notify.success(t('map.toast.noteRemoved'), {
          action: { label: t('toast.undo'), onClick: () => apply((s) => restoreNote(s, note)) },
        });
      },
      removeRisk(riskId: string) {
        const risk = store().snapshot?.risks.find((r) => r.id === riskId);
        if (!risk) return;
        apply((s) => removeRisk(s, riskId));
        notify.success(t('map.toast.riskRemoved'), {
          action: { label: t('toast.undo'), onClick: () => apply((s) => restoreRisk(s, risk)) },
        });
      },
      /** RN 5, ux-ui 14: "Não se aplica" with Desfazer; reconsidering needs no toast. */
      setNotApplicable(expectationId: string, reason: string | undefined, name: string) {
        const previous = store().snapshot?.checklist.find((row) => row.id === expectationId)
          ?.notApplicable?.reason;
        apply((s) => setNotApplicable(s, expectationId, reason));
        if (reason) {
          notify.success(t('checklist.toast.notApplicable', { name }), {
            action: {
              label: t('toast.undo'),
              onClick: () => apply((s) => setNotApplicable(s, expectationId, previous)),
            },
          });
        }
      },
      /** RN 15: a step of "Preparar o ambiente"; no toast (ux-ui 14). */
      setPrepStep(index: number, done: boolean) {
        apply((s) => setPrepStep(s, index, done));
      },
      setView(view: 'today' | 'complete') {
        store().change((draft) => {
          draft.project.view = view;
          return undefined;
        });
      },
    }),
    // `trash` and every action only close over t and select.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, select],
  );
}

export type MapActions = ReturnType<typeof useMapActions>;
