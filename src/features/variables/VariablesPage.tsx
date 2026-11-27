import { KeyRound, Lock, LockOpen, Plus, TriangleAlert, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { InlineAlert } from '@/components/ui/InlineAlert';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { envSummary, envType, validateEnvVars, type EnvIssue } from '@/domain/rules/env';
import { kitText } from '@/domain/rules/kit';
import { envHowToGet } from '@/domain/rules/kit-lookup';
import type { EnvVar } from '@/domain/schemas/env';
import { useMapModel } from '@/features/map/useMapModel';
import { DataNotice } from '@/features/project/DataNotice';
import { PageHeader } from '@/features/shell/PageHeader';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { usePersistentState } from '@/hooks/usePersistentState';
import { badgeForState } from '@/lib/status-variants';
import { cn } from '@/lib/utils';
import { EnvironmentDialog } from './EnvironmentDialog';
import { EnvVarDialog } from './EnvVarDialog';
import { useEnvActions, type EnvActions } from './useEnvActions';
import { useEnvironmentName } from './useEnvironmentName';

const typeBadge = {
  secret: badgeForState('variable', 'secret'),
  public: badgeForState('variable', 'public'),
  config: badgeForState('variable', 'config'),
};

/** What the project needs in each environment, without ever keeping a secret (RN 3). */
export function VariablesPage() {
  const { t } = useTranslation();
  const model = useMapModel();
  const actions = useEnvActions();
  const envName = useEnvironmentName();
  const phone = useBreakpoint() === 'phone';
  const projectId = model?.snapshot.project.id ?? '';
  const [environment, setEnvironment] = usePersistentState(
    `prologos.envTab.${projectId}`,
    'development',
  );
  const [editing, setEditing] = useState<EnvVar | 'new'>();
  const [environmentOpen, setEnvironmentOpen] = useState(false);

  const vars = useMemo(
    () =>
      (model?.snapshot.envVars ?? [])
        .filter((v) => v.environment === environment)
        .sort((a, b) => a.key.localeCompare(b.key)),
    [model, environment],
  );
  if (!model) return null;

  const { project } = model.snapshot;
  const current = project.environments.includes(environment) ? environment : 'development';
  const prefix = model.kit?.publicEnvPrefix ?? null;
  const issues = validateEnvVars(vars, prefix);
  const summary = envSummary(vars, prefix);
  const howToGet = (key: string) => {
    const hint = envHowToGet(model.snapshot, model.kit, key);
    return hint ? kitText(hint, model.language) : undefined;
  };
  const issueText = (issue: EnvIssue) => t(`env.issues.${issue}`, { prefix: prefix ?? '' });

  const importLink = (
    <Button asChild icon={<Upload />}>
      <Link to={`/p/${project.id}/variaveis/importar`}>{t('env.import')}</Link>
    </Button>
  );

  return (
    <>
      <PageHeader
        title={t('env.title')}
        subtitle={t('env.lead')}
        action={
          <div className="flex gap-2">
            {importLink}
            <Button variant="primary" icon={<Plus />} onClick={() => setEditing('new')}>
              {t('env.add')}
            </Button>
          </div>
        }
        phoneAction={
          <IconButton label={t('env.add')} icon={<Plus />} onClick={() => setEditing('new')} />
        }
      />
      <DataNotice />
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="max-w-full overflow-x-auto">
            <SegmentedControl<string>
              label={t('env.environments.label')}
              value={current}
              onValueChange={setEnvironment}
              options={project.environments.map((e) => ({ value: e, label: envName(e) }))}
            />
          </div>
          <Button size="compact" icon={<Plus />} onClick={() => setEnvironmentOpen(true)}>
            {t('env.addEnvironment')}
          </Button>
          <div className="flex flex-wrap items-center gap-3 tablet:ml-auto">
            {model.kit ? (
              <Chip>{`${project.name} · ${kitText(model.kit.name, model.language)}`}</Chip>
            ) : null}
            <span className="text-[13px] text-muted">
              {[
                t('env.summary_vars', { count: summary.count }),
                t('env.summary_secrets', { count: summary.secrets }),
                t('env.summary_warnings', { count: summary.warnings }),
              ].join(' · ')}
            </span>
          </div>
        </div>
        {phone ? <div className="flex">{importLink}</div> : null}

        {vars.length === 0 ? (
          <div className="rounded-card border border-dashed border-border-strong">
            <EmptyState
              icon={<KeyRound />}
              title={t('env.empty.title')}
              description={t('env.empty.body')}
              actions={
                model.kit && model.snapshot.envVars.length === 0 ? (
                  <Button
                    onClick={() => model.kit && actions.addKitVars(model.kit, model.language)}
                  >
                    {t('env.empty.kit')}
                  </Button>
                ) : (
                  importLink
                )
              }
            />
          </div>
        ) : phone ? (
          <ul className="flex flex-col gap-3">
            {vars.map((envVar) => (
              <li key={envVar.id}>
                <VarCard
                  envVar={envVar}
                  type={envType(envVar, prefix)}
                  hint={howToGet(envVar.key)}
                  problems={(issues.get(envVar.id) ?? []).map(issueText)}
                  onEdit={() => setEditing(envVar)}
                  actions={actions}
                />
              </li>
            ))}
          </ul>
        ) : (
          <Card padding="none" className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12.5px] text-muted">
                  <th className="px-6 py-3 font-normal">{t('env.columns.key')}</th>
                  <th className="px-3 py-3 font-normal">{t('env.columns.what')}</th>
                  <th className="px-3 py-3 font-normal">{t('env.columns.usedIn')}</th>
                  <th className="px-3 py-3 font-normal">{t('env.columns.type')}</th>
                  <th className="w-16 px-3 py-3">
                    <span className="sr-only">{t('env.dialog.secret')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {vars.map((envVar) => {
                  const type = envType(envVar, prefix);
                  const problems = (issues.get(envVar.id) ?? []).map(issueText);
                  const hint = howToGet(envVar.key);
                  return (
                    <tr key={envVar.id} className="border-t border-border align-middle">
                      <td className="px-6 py-3.5">
                        <Button
                          variant="quiet"
                          size="compact"
                          aria-label={t('env.edit', { key: envVar.key })}
                          className="-ml-2 font-mono text-[13px] font-normal text-text"
                          onClick={() => setEditing(envVar)}
                        >
                          {envVar.key}
                        </Button>
                      </td>
                      <td className="max-w-[360px] px-3 py-3.5 text-[13.5px] text-text">
                        <Description
                          description={envVar.description}
                          hint={hint}
                          problems={problems}
                        />
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {envVar.usedIn.map((side) => (
                            <Chip key={side}>{t(`env.side.${side}`, { defaultValue: side })}</Chip>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge {...typeBadge[type]}>{t(`status.variable.${type}`)}</Badge>
                      </td>
                      <td className="px-3 py-3.5">
                        <SecretToggle envVar={envVar} actions={actions} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}

        {prefix ? (
          <InlineAlert variant="info">{t('env.publicNote', { prefix })}</InlineAlert>
        ) : null}
      </div>

      <EnvVarDialog
        open={editing !== undefined}
        onOpenChange={(open) => (open ? undefined : setEditing(undefined))}
        {...(editing && editing !== 'new' ? { envVar: editing } : {})}
        environments={project.environments}
        defaultEnvironment={current}
        actions={actions}
      />
      <EnvironmentDialog
        open={environmentOpen}
        onOpenChange={setEnvironmentOpen}
        existing={project.environments}
        onCreate={(name) => {
          actions.addEnvironment(name);
          setEnvironment(name);
        }}
      />
    </>
  );
}

function Description({
  description,
  hint,
  problems,
}: {
  description?: string;
  hint?: string;
  problems: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      {description ? <span>{description}</span> : null}
      {hint ? (
        <span className="flex items-start gap-1.5 text-[12.5px] text-muted">
          <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          {hint}
        </span>
      ) : null}
      {problems.map((problem) => (
        <span key={problem} className="flex items-start gap-1.5 text-[12.5px] text-danger">
          <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          {problem}
        </span>
      ))}
    </div>
  );
}

/** The lock marks a secret; turning it on drops any stored value (RN 3). */
function SecretToggle({ envVar, actions }: { envVar: EnvVar; actions: EnvActions }) {
  const { t } = useTranslation();
  const { key, description, usedIn, secret } = envVar;
  return (
    <IconButton
      label={secret ? t('env.lock.unmark', { key }) : t('env.lock.mark', { key })}
      icon={secret ? <Lock /> : <LockOpen />}
      aria-pressed={secret}
      className={cn(secret ? 'text-danger' : 'text-faint')}
      onClick={() =>
        actions.update(envVar.id, {
          key,
          ...(description ? { description } : {}),
          usedIn,
          secret: !secret,
          ...(!envVar.secret && envVar.value ? { value: envVar.value } : {}),
        })
      }
    />
  );
}

function VarCard({
  envVar,
  type,
  hint,
  problems,
  onEdit,
  actions,
}: {
  envVar: EnvVar;
  type: keyof typeof typeBadge;
  hint?: string;
  problems: string[];
  onEdit: () => void;
  actions: EnvActions;
}) {
  const { t } = useTranslation();
  return (
    <Card className="flex items-start gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="quiet"
            size="compact"
            aria-label={t('env.edit', { key: envVar.key })}
            className="-ml-2 font-mono text-[15px] font-normal text-text"
            onClick={onEdit}
          >
            {envVar.key}
          </Button>
          <Badge {...typeBadge[type]}>{t(`status.variable.${type}`)}</Badge>
        </div>
        <div className="text-[15px] text-text">
          <Description description={envVar.description} hint={hint} problems={problems} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {envVar.usedIn.map((side) => (
            <Chip key={side}>{t(`env.side.${side}`, { defaultValue: side })}</Chip>
          ))}
        </div>
      </div>
      <SecretToggle envVar={envVar} actions={actions} />
    </Card>
  );
}
