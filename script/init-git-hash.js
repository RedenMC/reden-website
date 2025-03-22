import fs from 'fs';
import { execSync } from 'node:child_process';

const hash = execSync('git rev-parse --short HEAD').toString().trim();
fs.writeFileSync('assets/hash.json', `"${hash}-dev"`);
console.log('🎉[Reden] Initialized version info');
// write git commit hook
fs.writeFileSync(
  '.git/hooks/pre-commit',
  `#!/bin/sh
env node script/fix-i18n.js
`,
);
execSync('chmod +x .git/hooks/pre-commit');
console.log('🎉[Reden] Initialized pre-commit hook');
