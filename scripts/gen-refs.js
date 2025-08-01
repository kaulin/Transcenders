import { promises as fs } from 'fs';
import path from 'path';
import fg from 'fast-glob';

async function main() {
  const root = process.cwd();
  const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));

  const patterns = pkg.workspaces;
  const dirs = await fg(patterns, { onlyDirectories: true, cwd: root });

  const references = [];
  for (const dir of dirs.sort()) {
    try {
      await fs.access(path.join(root, dir, 'tsconfig.json'));
      references.push({ path: dir });
    } catch {
      // skip packages without tsconfig.json
    }
  }

  const outFile = path.join(root, 'tsconfig.vscode.json');
  const data = { files: [], references };
  await fs.writeFile(outFile, JSON.stringify(data, null, 2) + '\n');

  console.log(`✅  ${outFile} written with ${references.length} references`);
}

main().catch((err) => {
  console.error(`❌  ${err.message}`);
  process.exit(1);
});
