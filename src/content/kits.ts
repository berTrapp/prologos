import { KitSchema, type Kit } from '@/domain/schemas/kit';

/** RN 14: the curated kits, in the order the guided start shows them. */
export const KIT_ORDER = [
  'laravel-react',
  'node-react',
  'spring-react',
  'dotnet-react',
  'django',
  'react-native',
  'flutter',
  'static-astro',
] as const;

const files = import.meta.glob<unknown>('./kits/*.json', { eager: true, import: 'default' });

/** Every kit, validated by the schema. Imported only by lazy routes, so it stays out of the first load. */
export const KITS: readonly Kit[] = KIT_ORDER.map((id) => {
  const data = files[`./kits/${id}.json`];
  if (!data) throw new Error(`Missing kit ${id}`);
  return KitSchema.parse(data);
});

export function findKit(id: string | undefined): Kit | undefined {
  return id ? KITS.find((kit) => kit.id === id) : undefined;
}
