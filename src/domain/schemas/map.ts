import { z } from 'zod';
import { ZONE_IDS } from '../zones';
import { Id, Text } from './common';

/** RN 1: a zone (parentId null) or a subzone (parentId of a zone). */
export const ZoneSchema = z
  .object({
    id: Id,
    projectId: Id,
    parentId: Id.nullable(),
    /** Set for the nine default zones; their name comes from the translations until renamed. */
    key: z.enum(ZONE_IDS).optional(),
    name: Text(60).optional(),
    color: z.enum(ZONE_IDS),
    order: z.number().int().nonnegative(),
    collapsed: z.boolean(),
  })
  .refine((zone) => zone.key !== undefined || zone.name !== undefined, {
    message: 'A zone needs a default key or a name',
    path: ['name'],
  });

/** RN 13: decided or still to decide ("Ainda não sei"). */
export const ITEM_STATES = ['decided', 'pending'] as const;
/** RN 2: current (Hoje) or future. */
export const ITEM_WHEN = ['now', 'later'] as const;

export const ItemSchema = z.object({
  id: Id,
  projectId: Id,
  /** RN 1: an item lives in exactly one zone or subzone. */
  zoneId: Id,
  name: Text(80),
  description: z.string().max(2000).optional(),
  state: z.enum(ITEM_STATES),
  when: z.enum(ITEM_WHEN),
  /** Option picked for a pending item ("Banco: PostgreSQL"). */
  choice: z.string().max(80).optional(),
  /** Id of the kit item it came from, if any (RN 14). */
  kitRef: z.string().optional(),
  /** Kit technology id, used for "Novo para você" (RN 15). */
  tech: z.string().optional(),
  newForYou: z.boolean(),
  order: z.number().int().nonnegative(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});

/** RN 1: optional connection type. */
export const CONNECTION_TYPES = [
  'uses',
  'depends-on',
  'sends-to',
  'calls',
  'writes-to',
  'reads-from',
  'protects',
  'deploys-to',
  'rendered-by',
] as const;

export const ConnectionSchema = z
  .object({
    id: Id,
    projectId: Id,
    /** RN 1: direction is mandatory. */
    from: Id,
    to: Id,
    type: z.enum(CONNECTION_TYPES).optional(),
  })
  .refine((connection) => connection.from !== connection.to, {
    message: 'A connection links two different items',
    path: ['to'],
  });

/** RN 1: ordered sequence of existing connections. */
export const FlowSchema = z.object({
  id: Id,
  projectId: Id,
  name: Text(80),
  steps: z.array(Id).min(1),
});

export type Zone = z.infer<typeof ZoneSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
export type ConnectionType = NonNullable<Connection['type']>;
export type Flow = z.infer<typeof FlowSchema>;
