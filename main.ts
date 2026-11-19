// main.ts — hands in the Leonida Ledger guide (Node 22, standard library only).
//
// The entry is this repository's app/ folder: plain static files a browser opens at
// app/index.html, with the trophy data in app/data/trophies.json. This program copies app/
// and screenshots/ to the output directory and writes dossier.json there with the kit's
// buildDossier, so the judge gets the screenshots, the first-load budget and the source outline.
//
// Paths come from this file's own URL, never the working directory, so the program behaves the
// same in the grader's container and on a laptop. Outside the grader, MAKEFUN_OUTPUT_DIR stands
// in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// vendor/makefun-frontend.ts is the kit's copy and must stay byte-identical: the scorer rebuilds
// dossier.json with its own copy and compares the two files byte for byte.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repositoryRoot = fileURLToPath(new URL('.', import.meta.url));
const outputRoot = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps, mirrored from the kit so a too-large entry fails here first.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function copyGuideFiles(sourceDir, targetDir) {
  if (!existsSync(sourceDir)) return;
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

function countEntries(dir) {
  let total = 0;
  for (const entry of readdirSync(dir)) {
    total += 1;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) total += countEntries(full);
  }
  return total;
}

function main() {
  mkdirSync(outputRoot, { recursive: true });

  copyGuideFiles(join(repositoryRoot, 'app'), join(outputRoot, 'app'));
  copyGuideFiles(join(repositoryRoot, 'screenshots'), join(outputRoot, 'screenshots'));

  const appEntries = countEntries(join(outputRoot, 'app'));
  if (appEntries > DOSSIER_CAPS.app_max_files) {
    throw new Error(`app/ holds ${appEntries} files and directories, over the ${DOSSIER_CAPS.app_max_files} cap`);
  }

  const dossier = buildDossier(outputRoot, DOSSIER_CAPS);
  writeFileSync(join(outputRoot, 'dossier.json'), dossier);
}

main();
