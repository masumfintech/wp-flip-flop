import assert from 'node:assert/strict';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { zipSync, unzipSync } from 'fflate';

const files = {};
const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const main = await readFile('wp-flipflop.php', 'utf8');
const readme = await readFile('readme.txt', 'utf8');
assert.equal(main.match(/\* Version: (.+)/)[1].trim(), version);
assert.equal(main.match(/define\( 'WPFF_VERSION', '([^']+)'/)[1], version);
assert.equal(readme.match(/^Stable tag: (.+)$/m)[1].trim(), version);
assert.ok(readme.includes('Contributors: mas7890'));
assert.ok(readme.split('== Description ==')[0].trim().split(/\r?\n/).at(-1).length <= 150);

async function add(file) {
  files['masum-flipflop-pdf-reader/' + file] = new Uint8Array(await readFile(file));
}
async function directory(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = dir + '/' + entry.name;
    if (entry.isDirectory()) await directory(file);
    else if (entry.isFile()) await add(file);
    else throw new Error('Unexpected non-file entry: ' + file);
  }
}
// Include editable source and build tools. Local test sites, screenshots,
// development test harnesses, dependencies, and previous releases stay out.
for (const dir of ['assets', 'includes', 'src', 'scripts']) await directory(dir);
for (const file of ['wp-flipflop.php', 'readme.txt', 'README.md', 'LICENSE', 'THIRD-PARTY-NOTICES.txt', 'package.json', 'package-lock.json', 'docs/SWIPER-OPTIONS.md', 'docs/THIRD-PARTY-SOURCES.md']) await add(file);
const zip = zipSync(files, { level: 6 });
const extracted = unzipSync(zip);
for (const [name, content] of Object.entries(files)) assert.deepEqual(extracted[name], content, name);
assert.ok(!Object.keys(extracted).some(name => /(^|\/)(node_modules|\.tmp|\.git|dist|tests)(\/|$)/.test(name)));
assert.ok(!Object.keys(extracted).some(name => /assets\/pdf(?:\.worker)?\.mjs$/.test(name)));
await mkdir('dist', { recursive: true });
await writeFile('dist/masum-flipflop-pdf-reader.zip', zip);
await writeFile('dist/masum-flipflop-pdf-reader-' + version + '.zip', zip);
const hash = createHash('sha256').update(zip).digest('hex');
await writeFile('dist/masum-flipflop-pdf-reader-' + version + '.sha256', hash + '  masum-flipflop-pdf-reader-' + version + '.zip\n');
console.log('Verified ' + Object.keys(files).length + ' files; ' + (zip.length / 1024 / 1024).toFixed(2) + ' MiB.');
console.log('Created dist/masum-flipflop-pdf-reader-' + version + '.zip\nSHA-256: ' + hash);
