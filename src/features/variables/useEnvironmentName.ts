import { useTranslation } from 'react-i18next';
import { DEFAULT_ENVIRONMENTS } from '@/domain/schemas/project';

/** The fixed environments are translated; the ones the person added keep their name. */
export function useEnvironmentName() {
  const { t } = useTranslation();
  return (environment: string) =>
    (DEFAULT_ENVIRONMENTS as readonly string[]).includes(environment)
      ? t(`env.environments.${environment as (typeof DEFAULT_ENVIRONMENTS)[number]}`)
      : environment;
}
