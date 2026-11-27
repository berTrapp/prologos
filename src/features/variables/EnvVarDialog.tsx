import { Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Chip } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { isValidEnvKey } from '@/domain/rules/env';
import type { EnvVar } from '@/domain/schemas/env';
import type { EnvActions } from './useEnvActions';
import { useEnvironmentName } from './useEnvironmentName';

/** Where a variable can be used (RN 3); kits use these same words. */
const USED_IN = ['front', 'back', 'app', 'docker'] as const;

type EnvVarDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Editing this variable; adding a new one when absent. */
  envVar?: EnvVar;
  environments: string[];
  defaultEnvironment: string;
  actions: EnvActions;
};

/** Add or edit a variable: key, what it is for, where it is used, secret (RN 3). */
export function EnvVarDialog(props: EnvVarDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={props.envVar ? t('env.dialog.editTitle') : t('env.dialog.addTitle')}
      description={t('env.dialog.description')}
    >
      {props.open ? <EnvVarForm key={props.envVar?.id ?? 'new'} {...props} /> : null}
    </Dialog>
  );
}

function EnvVarForm({
  onOpenChange,
  envVar,
  environments,
  defaultEnvironment,
  actions,
}: EnvVarDialogProps) {
  const { t } = useTranslation();
  const envName = useEnvironmentName();
  const [key, setKey] = useState(envVar?.key ?? '');
  const [description, setDescription] = useState(envVar?.description ?? '');
  const [usedIn, setUsedIn] = useState<string[]>(envVar?.usedIn ?? ['back']);
  const [secret, setSecret] = useState(envVar?.secret ?? false);
  const [value, setValue] = useState(envVar && !envVar.secret ? (envVar.value ?? '') : '');
  const [chosen, setChosen] = useState<string[]>([defaultEnvironment]);
  const [errors, setErrors] = useState<{ key?: string; environments?: string }>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!key.trim()) next.key = t('env.dialog.keyRequired');
    else if (!isValidEnvKey(key.trim())) next.key = t('env.issues.invalid-key');
    if (!envVar && chosen.length === 0) next.environments = t('env.dialog.environmentsRequired');
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const input = { key, description, usedIn, secret, ...(secret ? {} : { value }) };
    if (envVar) actions.update(envVar.id, input);
    else actions.add(input, chosen);
    onOpenChange(false);
  };

  const toggle = (list: string[], item: string) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <Input
        label={t('env.dialog.key')}
        placeholder={t('env.dialog.keyPlaceholder')}
        mono
        value={key}
        maxLength={120}
        error={errors.key}
        autoCapitalize="characters"
        spellCheck={false}
        onChange={(event) => setKey(event.target.value.toUpperCase())}
      />
      <Input
        label={t('env.dialog.what')}
        placeholder={t('env.dialog.whatPlaceholder')}
        value={description}
        maxLength={500}
        onChange={(event) => setDescription(event.target.value)}
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="pb-2 text-[12.5px] font-medium text-text">
          {t('env.dialog.usedIn')}
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {USED_IN.map((side) => (
            <Chip
              key={side}
              pressed={usedIn.includes(side)}
              onClick={() => setUsedIn(toggle(usedIn, side))}
            >
              {t(`env.side.${side}`)}
            </Chip>
          ))}
        </div>
      </fieldset>
      <Switch
        label={t('env.dialog.secret')}
        description={t('env.dialog.secretHint')}
        checked={secret}
        onCheckedChange={setSecret}
      />
      {secret ? null : (
        <Input
          label={t('env.dialog.value')}
          hint={t('env.dialog.valueHint')}
          mono
          value={value}
          maxLength={2000}
          spellCheck={false}
          onChange={(event) => setValue(event.target.value)}
        />
      )}
      {envVar ? null : (
        <fieldset className="flex flex-col">
          <legend className="pb-1 text-[12.5px] font-medium text-text">
            {t('env.dialog.environments')}
          </legend>
          {environments.map((environment) => (
            <Checkbox
              key={environment}
              label={envName(environment)}
              checked={chosen.includes(environment)}
              onCheckedChange={() => setChosen(toggle(chosen, environment))}
            />
          ))}
          {errors.environments ? (
            <p role="alert" className="text-[12px] text-danger">
              {errors.environments}
            </p>
          ) : null}
        </fieldset>
      )}
      <div className="flex items-center gap-2 pt-1">
        {envVar ? (
          <Button
            variant="destructive"
            icon={<Trash2 />}
            onClick={() => {
              void actions.remove(envVar.id, envVar.key);
              onOpenChange(false);
            }}
          >
            {t('env.dialog.delete')}
          </Button>
        ) : null}
        <span className="flex-1" />
        <Button onClick={() => onOpenChange(false)}>{t('ui.cancel')}</Button>
        <Button type="submit" variant="primary">
          {envVar ? t('env.dialog.save') : t('env.dialog.create')}
        </Button>
      </div>
    </form>
  );
}
