import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';

/** RN 3: a new environment beyond development, staging and production. */
export function EnvironmentDialog({
  open,
  onOpenChange,
  existing,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing: string[];
  onCreate: (name: string) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError(t('env.environmentDialog.nameRequired'));
    if (existing.some((e) => e.toLowerCase() === trimmed.toLowerCase()))
      return setError(t('env.environmentDialog.exists'));
    onCreate(trimmed);
    setName('');
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('env.environmentDialog.title')}
      description={t('env.environmentDialog.description')}
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <Input
          label={t('env.environmentDialog.name')}
          placeholder={t('env.environmentDialog.placeholder')}
          value={name}
          maxLength={40}
          error={error}
          onChange={(event) => {
            setName(event.target.value);
            setError(undefined);
          }}
        />
        <div className="flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)}>{t('ui.cancel')}</Button>
          <Button type="submit" variant="primary">
            {t('env.environmentDialog.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
