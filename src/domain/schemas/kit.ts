import { z } from 'zod';
import { SUPPORTED_LANGUAGES } from '@/i18n/languages';
import { ZONE_IDS } from '../zones';
import { CONNECTION_TYPES, ITEM_STATES, ITEM_WHEN } from './map';
import { KNOWN_STACKS, PROJECT_TYPES } from './project';

/** Kit text exists in every supported language (RN 14, 17). */
export const LocalizedText = z.object(
  Object.fromEntries(SUPPORTED_LANGUAGES.map((lng) => [lng, z.string().min(1)])) as Record<
    (typeof SUPPORTED_LANGUAGES)[number],
    z.ZodString
  >,
);
/** Technical names stay as a plain string; translatable names come per language. */
const Name = z.union([z.string().min(1), LocalizedText]);
const Url = z.url();

export { KNOWN_STACKS };

/** RN 15: concepts translated between stacks, in display order. */
export const EQUIVALENCE_CONCEPTS = [
  'orm',
  'migrate',
  'routes',
  'packages',
  'devServer',
  'config',
  'templates',
  'auth',
  'tests',
] as const;

const KitItemSchema = z.object({
  id: z.string().min(1),
  zone: z.enum(ZONE_IDS),
  name: Name,
  state: z.enum(ITEM_STATES),
  when: z.enum(ITEM_WHEN),
  tech: z.string().optional(),
  why: LocalizedText.optional(),
  docs: Url.optional(),
  /** RN 15: the equivalence concept this item stands for, if any. */
  concept: z.enum(EQUIVALENCE_CONCEPTS).optional(),
});

export const KitSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    version: z.string(),
    name: LocalizedText,
    summary: LocalizedText,
    projectTypes: z.array(z.enum(PROJECT_TYPES)).min(1),
    knownStack: z.enum(KNOWN_STACKS).nullable(),
    publicEnvPrefix: z.string().nullable(),
    /** RN 13: pending items asked in the "Onde roda" step. */
    runsOn: z.array(z.string()).min(1),
    dependencyFiles: z.array(z.string().min(1)),
    dependencyMap: z.record(z.string(), z.string()).optional(),
    technologies: z.array(
      z.object({ id: z.string().min(1), name: Name, what: LocalizedText, docs: Url.optional() }),
    ),
    /** The kit's color field is ignored: zone colors come from tokens. */
    zones: z.array(z.object({ id: z.enum(ZONE_IDS), name: LocalizedText })),
    items: z.array(KitItemSchema).min(1),
    connections: z.array(
      z.object({ from: z.string(), to: z.string(), type: z.enum(CONNECTION_TYPES).optional() }),
    ),
    flows: z.array(
      z.object({ id: z.string(), name: LocalizedText, path: z.array(z.string()).min(2) }),
    ),
    pendingOptions: z.record(
      z.string(),
      z
        .array(z.object({ name: Name, recommended: z.boolean().optional(), why: LocalizedText }))
        .min(1),
    ),
    checklist: z.partialRecord(z.enum(ZONE_IDS), z.array(z.string())),
    prepTrail: z.array(
      z.object({
        title: LocalizedText,
        command: z.string().min(1),
        ok: LocalizedText,
        docs: Url.optional(),
      }),
    ),
    folders: z.array(z.object({ path: z.string().min(1), what: LocalizedText })),
    envVars: z.array(
      z.object({
        key: z.string().regex(/^[A-Z][A-Z0-9_]*$/),
        secret: z.boolean(),
        example: z.string().optional(),
        usedIn: z.array(z.string()).min(1),
        what: LocalizedText,
        howToGet: LocalizedText.optional(),
      }),
    ),
    equivalences: z.record(z.string(), z.string()).optional(),
  })
  .superRefine((kit, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
    const items = new Set(kit.items.map((item) => item.id));
    const zones = new Set(kit.zones.map((zone) => zone.id));
    const techs = new Set(kit.technologies.map((tech) => tech.id));
    const links = new Set(kit.connections.map((c) => `${c.from}>${c.to}`));

    if (items.size !== kit.items.length) issue('Duplicate item id');
    for (const item of kit.items) {
      if (!zones.has(item.zone)) issue(`Item ${item.id} uses missing zone ${item.zone}`);
      if (item.tech && !techs.has(item.tech))
        issue(`Item ${item.id} uses missing tech ${item.tech}`);
    }
    for (const c of kit.connections) {
      if (!items.has(c.from) || !items.has(c.to))
        issue(`Connection ${c.from} → ${c.to} uses a missing item`);
    }
    for (const flow of kit.flows) {
      flow.path.slice(1).forEach((to, i) => {
        const from = flow.path[i];
        if (!links.has(`${from}>${to}`)) issue(`Flow ${flow.id} has no connection ${from} → ${to}`);
      });
    }
    for (const [zone, refs] of Object.entries(kit.checklist)) {
      for (const ref of refs ?? []) {
        if (!items.has(ref)) issue(`Checklist ${zone} expects missing item ${ref}`);
      }
    }
    for (const ref of Object.keys(kit.pendingOptions)) {
      if (!items.has(ref)) issue(`Options for missing item ${ref}`);
    }
    // RN 15: every pending item offers options, one recommended to start with.
    for (const item of kit.items.filter((i) => i.state === 'pending')) {
      const options = kit.pendingOptions[item.id] ?? [];
      if (!options.some((option) => option.recommended))
        issue(`Pending item ${item.id} has no recommended option`);
    }
    for (const ref of kit.runsOn) {
      if (kit.items.find((i) => i.id === ref)?.state !== 'pending')
        issue(`runsOn ${ref} is not a pending item`);
    }
    // RN 3: secrets never carry an example value.
    for (const env of kit.envVars) {
      if (env.secret && env.example) issue(`Secret ${env.key} has an example value`);
    }
  });

export type Kit = z.infer<typeof KitSchema>;
export type KitItem = z.infer<typeof KitItemSchema>;
export type KitText = z.infer<typeof LocalizedText>;
export type KitName = z.infer<typeof Name>;
