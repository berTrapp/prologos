import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { workspaceStore } from '@/app/services';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useUi } from '@/features/shell/ui-store';

/**
 * Temporary way to create a project (phase 3). Phase 4 replaces it with the guided start;
 * until then the type stays "Ainda não sei", a valid answer (RN 13).
 */
export function NewProjectDialog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const open = useUi((s) => s.newProjectOpen);
  const setOpen = useUi((s) => s.setNewProjectOpen);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const reset = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setName('');
      setGoal('');
      setError(undefined);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(t('newProject.nameRequired'));
      return;
    }
    setBusy(true);
    try {
      const id = await workspaceStore
        .getState()
        .createProject({ name: name.trim(), goal: goal.trim() || undefined, type: 'unknown' });
      reset(false);
      // ux-ui 14: the new project opens on screen, so no toast is needed.
      navigate(`/p/${id}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={reset}
      title={t('newProject.title')}
      description={t('newProject.description')}
    >
      <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-5" noValidate>
        <Input
          label={t('newProject.name')}
          placeholder={t('newProject.namePlaceholder')}
          value={name}
          maxLength={120}
          error={error}
          onChange={(event) => {
            setName(event.target.value);
            if (error) setError(undefined);
          }}
        />
        <Input
          label={t('newProject.goal')}
          placeholder={t('newProject.goalPlaceholder')}
          value={goal}
          maxLength={240}
          onChange={(event) => setGoal(event.target.value)}
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button onClick={() => reset(false)}>{t('ui.cancel')}</Button>
          <Button
            type="submit"
            variant="primary"
            loading={busy}
            loadingText={t('newProject.creating')}
          >
            {t('newProject.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
