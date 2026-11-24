// Copies the JSON block of each docs/kits/<id>.md into src/content/kits/<id>.json (RN 14).
// The docs stay the source of truth; a test checks both are identical.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const docs = 'docs/kits';
const out = 'src/content/kits';

for (const file of readdirSync(docs).filter((f) => f.endsWith('.md'))) {
  const block = /```json\n([\s\S]*?)```/.exec(readFileSync(join(docs, file), 'utf8'))?.[1];
  if (!block) throw new Error(`No JSON block in ${file}`);
  const kit = JSON.parse(block);
  writeFileSync(join(out, `${kit.id}.json`), `${JSON.stringify(kit, null, 2)}\n`);
  console.log(`${file} → ${kit.id}.json`);
}
