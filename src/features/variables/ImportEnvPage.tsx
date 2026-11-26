import { ArrowLeft, Lock, LockOpen, TriangleAlert, Upload } from 'lucide-react';
import { useId, useMemo, useState, type ChangeEvent, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { ChoiceCard, ChoiceGroup } from '@/components/ui/ChoiceCard';
import { IconButton } from '@/components/ui/IconButton';
import { Textarea } from '@/components/ui/Textarea';
import { parseDotenv } from '@/domain/rules/dotenv';
import {
  classifyImport,
  rowFor,
  type ImportContext,
  type ImportDestination,
  type ImportRow,
} from '@/domain/rules/env-import';
import { kitText } from '@/domain/rules/kit';
import { useMapModel } from '@/features/map/useMapModel';
import { badgeForState } from '@/lib/status-variants';
import { cn } from '@/lib/utils';
import { useEnvActions } from './useEnvActions';
import { useEnvironmentName } from './useEnvironmentName';

const statusBadge = {
  new: badgeForState('import', 'new'),
  update: badgeForState('import', 'update'),
  same: badgeForState('import', 'same'),
  invalid: badgeForState('import', 'invalid'),
};
const neutralBadge = badgeForState('import', 'same');
const warningBadge = badgeForState('import', 'conflict');

/**
 * Paste a .env or send the file; the preview classifies, warns and lets the person choose.
 * Values live only in this screen's memory and are dropped on import (RN 3).
 */
export function ImportEnvPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const model = useMapModel();
  const actions = useEnvActions();
  const envName = useEnvironmentName();
  const fileId = useId();
  const [text, setText] = useState('');
  const [fileError, setFileError] = useState(false);
  const [destination, setDestination] = useState<ImportDestination>(
    model?.kit?.publicEnvPrefix ? 'client' : 'server',
  );
  const [environments, setEnvironments] = useState<string[]>(['development']);
  // The person's choices in the preview, by key.
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [secrets, setSecrets] = useState<Record<string, boolean>>({});

  const prefix = model?.kit?.publicEnvPrefix ?? null;
  const clientSide = model?.kit?.projectTypes.includes('mobile') ? 'app' : 'front';
  const context: ImportContext | undefined = model
    ? {
        existing: model.snapshot.envVars,
        environments,
        destination: prefix ? destination : 'server',
        clientSide,
        publicPrefix: prefix,
        kitSecrets: new Set(model.kit?.envVars.filter((v) => v.secret).map((v) => v.key)),
      }
    : undefined;

  const rows = useMemo<ImportRow[]>(() => {
    if (!context || !text.trim()) return [];
    return classifyImport(parseDotenv(text), context).map((row) => {
      if (row.status === 'invalid') return row;
      const secret = secrets[row.key] ?? row.secret;
      const base =
        secret === row.secret ? row : rowFor(row.line, row.key, row.value, secret, context);
      return { ...base, selected: picked[row.key] ?? base.selected };
    });
    // context is rebuilt each render from these values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, destination, environments, picked, secrets, model]);

  if (!model || !context) return null;
  const { project } = model.snapshot;

  const valid = rows.filter((r) => r.status !== 'invalid');
  const chosen = rows.filter((r) => r.selected && r.status !== 'invalid' && r.status !== 'same');
  const count = (status: ImportRow['status']) => rows.filter((r) => r.status === status).length;
  const warned = rows.filter((r) => r.warnings.length > 0).length;

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setText(await file.text());
      setFileError(false);
    } catch {
      setFileError(true);
    }
  };
  const describe = (key: string) => {
    const source = model.kit?.envVars.find((v) => v.key === key);
    return source ? kitText(source.what, model.language) : undefined;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Button asChild variant="quiet" size="compact" className="-ml-2 self-start">
          <Link to={`/p/${project.id}/variaveis`}>
            <ArrowLeft aria-hidden />
            {t('env.importPage.back')}
          </Link>
        </Button>
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-text tablet:text-[32px]">
          {t('env.importPage.title')}
        </h1>
        <p className="max-w-2xl text-[15px] text-muted">{t('env.importPage.lead')}</p>
      </div>

      <div className="grid items-start gap-5 desktop:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card className="flex flex-col gap-6">
          {prefix ? (
            <ChoiceGroup<ImportDestination>
              label={t('env.importPage.destination')}
              value={destination}
              columns={2}
              onValueChange={setDestination}
            >
              <ChoiceCard
                value="client"
                title={t('env.importPage.client', { side: clientSide })}
                description={t('env.importPage.clientBody', {
                  where: t(`env.importPage.where.${clientSide}`),
                  prefix,
                })}
              />
              <ChoiceCard
                value="server"
                title={t('env.importPage.server')}
                description={t('env.importPage.serverBody')}
              />
            </ChoiceGroup>
          ) : null}

          <fieldset className="flex flex-col gap-2">
            <legend className="pb-2 text-[13.5px] font-semibold text-text">
              {t('env.importPage.environments')}
            </legend>
            <div className="flex flex-wrap gap-x-5">
              {project.environments.map((environment) => (
                <Checkbox
                  key={environment}
                  label={envName(environment)}
                  checked={environments.includes(environment)}
                  onCheckedChange={(checked) =>
                    setEnvironments(
                      checked
                        ? [...environments, environment]
                        : environments.filter((e) => e !== environment),
                    )
                  }
                />
              ))}
            </div>
          </fieldset>

          <div
            className="flex flex-col gap-2"
            onDragOver={(event: DragEvent) => event.preventDefault()}
            onDrop={(event: DragEvent) => {
              event.preventDefault();
              void readFile(event.dataTransfer.files[0]);
            }}
          >
            <Textarea
              label={t('env.importPage.content')}
              placeholder={t('env.importPage.placeholder')}
              mono
              rows={10}
              spellCheck={false}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor={fileId}
                className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-inner border border-dashed border-border-strong px-4 text-[13px] text-muted hover:text-text focus-within:outline-2 focus-within:outline-ring"
              >
                <Upload aria-hidden className="size-4" />
                {t('env.importPage.drop')}
                <span className="text-text underline">{t('env.importPage.choose')}</span>
                <input
                  id={fileId}
                  type="file"
                  accept=".env,text/plain"
                  className="sr-only"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    void readFile(event.target.files?.[0])
                  }
                />
              </label>
              {text ? (
                <Button size="compact" onClick={() => setText('')}>
                  {t('env.importPage.clear')}
                </Button>
              ) : null}
            </div>
            {fileError ? (
              <p role="alert" className="text-[12px] text-danger">
                {t('env.importPage.fileError')}
              </p>
            ) : null}
          </div>
        </Card>

        <Card padding="none" className="flex flex-col">
          <header className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3.5">
            <span className="mr-1 font-mono text-[11.5px] tracking-[0.14em] text-faint uppercase">
              {t('env.importPage.preview')}
            </span>
            <Badge {...neutralBadge}>{t('env.importPage.read', { count: valid.length })}</Badge>
            <Badge {...statusBadge.new}>{t('env.importPage.new', { count: count('new') })}</Badge>
            <Badge {...statusBadge.update}>
              {t('env.importPage.update', { count: count('update') })}
            </Badge>
            <Badge {...warningBadge}>{t('env.importPage.warnings', { count: warned })}</Badge>
          </header>
          {rows.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13.5px] text-muted">
              {t('env.importPage.emptyPreview')}
            </p>
          ) : (
            <ul className="flex flex-col">
              {rows.map((row) => (
                <li
                  key={`${row.line}-${row.key}`}
                  className="flex flex-col gap-1.5 border-b border-border px-5 py-3"
                >
                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      label={
                        <span className="sr-only">
                          {t('env.importPage.select', { key: row.key })}
                        </span>
                      }
                      checked={row.selected}
                      disabled={row.status === 'invalid' || row.status === 'same'}
                      onCheckedChange={(checked) => setPicked({ ...picked, [row.key]: checked })}
                    />
                    <span
                      className={cn(
                        'min-w-0 truncate font-mono text-[13px]',
                        row.selected ? 'text-text' : 'text-muted',
                      )}
                    >
                      {row.key}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-faint">
                      {row.secret ? (
                        <>
                          <span aria-hidden>••••••••</span>
                          <span className="sr-only">{t('env.importPage.masked')}</span>
                        </>
                      ) : (
                        row.value
                      )}
                    </span>
                    {row.status === 'invalid' ? null : (
                      <IconButton
                        label={
                          row.secret
                            ? t('env.lock.unmark', { key: row.key })
                            : t('env.lock.mark', { key: row.key })
                        }
                        icon={row.secret ? <Lock /> : <LockOpen />}
                        aria-pressed={row.secret}
                        className={row.secret ? 'text-danger' : 'text-faint'}
                        onClick={() => setSecrets({ ...secrets, [row.key]: !row.secret })}
                      />
                    )}
                    <Badge {...statusBadge[row.status]}>{t(`status.import.${row.status}`)}</Badge>
                  </div>
                  {row.warnings.map((warning) => (
                    <p
                      key={warning}
                      className={cn(
                        'flex items-start gap-1.5 pl-[30px] text-[12.5px]',
                        warning === 'secret-on-client' ? 'text-danger' : 'text-warning',
                      )}
                    >
                      <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                      {t(`env.importPage.warning.${warning}`, {
                        side: clientSide,
                        prefix: prefix ?? '',
                      })}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          )}
          <footer className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <span className="text-[13px] text-muted">
              {t('env.importPage.selected', {
                selected: chosen.length,
                total: valid.length,
                envs: t('env.importPage.envs', { count: environments.length }),
              })}
            </span>
            <Button
              variant="primary"
              disabled={chosen.length === 0 || environments.length === 0}
              onClick={() => {
                actions.importRows(rows, context, describe);
                navigate(`/p/${project.id}/variaveis`);
              }}
            >
              {t('env.importPage.submit', { count: chosen.length })}
            </Button>
          </footer>
        </Card>
      </div>
    </div>
  );
}
