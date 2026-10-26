import { build } from 'esbuild';
import { mkdir, copyFile, readFile, writeFile, cp, rm } from 'node:fs/promises';
await mkdir('assets', { recursive: true });
await build({ entryPoints: { runtime:'src/runtime.js', admin:'src/admin.js', block:'src/block.js' }, bundle:true, minify:true, sourcemap:false, outdir:'assets', target:['es2022'], format:'iife', legalComments:'eof' });
await build({ entryPoints:['node_modules/pdfjs-dist/build/pdf.mjs'], bundle:true, minify:true, outfile:'assets/pdf.js', format:'esm', target:['es2022'], banner:{js:'/*! PDF.js: bundled and minified for wp-flipflop; upstream source and license: THIRD-PARTY-NOTICES.txt. */'} });
await copyFile('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','assets/pdf.worker.js');
// Use .js for ES modules: many shared hosts serve .mjs as text/plain.
for(const file of ['assets/pdf.mjs','assets/pdf.worker.mjs'])await rm(file,{force:true});
for(const dir of ['cmaps','standard_fonts','wasm','iccs'])await cp('node_modules/pdfjs-dist/'+dir,'assets/'+dir,{recursive:true});
// This viewer never runs PDF document JavaScript or loads PDF.js's sandbox.
// Do not ship the unused QuickJS executable or its generated loader.
for(const file of ['assets/wasm/quickjs-eval.js','assets/wasm/quickjs-eval.wasm'])await rm(file,{force:true});
let notices = await readFile('docs/THIRD-PARTY-SOURCES.md', 'utf8');
for (const [name,file] of [['swiper','LICENSE'],['pdfjs-dist','LICENSE'],['page-flip','LICENSE']]) {
 const pkg=JSON.parse(await readFile('node_modules/'+name+'/package.json','utf8'));
 notices += '\n## '+name+' '+pkg.version+'\n\n'+await readFile('node_modules/'+name+'/'+file,'utf8')+'\n';
}
await writeFile('THIRD-PARTY-NOTICES.txt',notices);
console.log('Built local slider, page-flip, PDF engine and worker assets.');
