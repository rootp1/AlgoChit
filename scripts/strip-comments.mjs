#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { fileURLToPath } from 'url';
import { parse } from '@babel/parser';
import generate from '@babel/generator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const extsCode = ['.ts', '.tsx', '.js', '.jsx'];
const extsCss = ['.css'];
const extsTeal = ['.teal'];

const listFiles = async () => {
  const patterns = [
    '**/*.{ts,tsx,js,jsx,css,teal}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/.git/**',
  ];
  return fg(patterns, { cwd: repoRoot, absolute: true, dot: true });
};

const stripJsTsComments = (code, filename) => {
  const isTS = filename.endsWith('.ts') || filename.endsWith('.tsx');
  const isTSX = filename.endsWith('.tsx');
  const isJSX = filename.endsWith('.jsx') || filename.endsWith('.tsx');

  const ast = parse(code, {
    sourceType: 'module',
    plugins: [
      isTS ? 'typescript' : null,
      isJSX ? 'jsx' : null,
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      'decorators-legacy',
      'dynamicImport',
      'importMeta',
      'topLevelAwait',
    ].filter(Boolean),
    allowReturnOutsideFunction: true,
    errorRecovery: true,
  });

  const gen = (generate.default || generate);
  const output = gen(ast, {
    comments: false,
    retainLines: false,
    compact: false,
    jsescOption: { minimal: true },
  }, code);

  return output.code;
};

const stripCssComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '');

const stripTealComments = (code) => code.split('\n').map(line => {
  const idx = line.indexOf('//');
  if (idx >= 0) return line.slice(0, idx).trimEnd();
  return line;
}).join('\n');

const processFile = async (file) => {
  const ext = path.extname(file);
  const code = fs.readFileSync(file, 'utf8');
  let out;

  try {
    if (extsCode.includes(ext)) out = stripJsTsComments(code, file);
    else if (extsCss.includes(ext)) out = stripCssComments(code);
    else if (extsTeal.includes(ext)) out = stripTealComments(code);

    if (out !== undefined && out !== code) {
      fs.writeFileSync(file, out, 'utf8');
      return { file, changed: true };
    }
    return { file, changed: false };
  } catch (e) {
    return { file, error: e.message };
  }
};

const main = async () => {
  const files = await listFiles();
  let changed = 0, errors = 0;

  for (const f of files) {
    const res = await processFile(f);
    if (res.changed) changed++;
    if (res.error) {
      errors++;
      console.error('Error processing', path.relative(repoRoot, res.file), '-', res.error);
    }
  }

  console.log(`Processed ${files.length} files. Comments removed from ${changed}. Errors: ${errors}.`);
  if (errors > 0) process.exitCode = 1;
};

main().catch((e) => { console.error(e); process.exit(1); });
