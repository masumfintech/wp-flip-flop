import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
const pkg=JSON.parse(await readFile('node_modules/swiper/package.json','utf8'));
const core=await readFile('node_modules/swiper/types/options.d.ts','utf8');
const keys=new Set([...core.matchAll(/^    (\w+)\??:/gm)].map(x=>x[1]));
for(const dir of await readdir('node_modules/swiper/modules',{withFileTypes:true})){
 if(!dir.isDirectory())continue;
 try{
  const text=await readFile('node_modules/swiper/modules/'+dir.name+'/'+dir.name+'.d.ts','utf8');
  const block=text.match(/interface SwiperOptions \{([\s\S]*?)\n    \}/)?.[1]||'';
  for(const match of block.matchAll(/^        (\w+)\??:/gm))keys.add(match[1]);
 }catch{}
}
const ui=new Set(['direction','slidesPerView','slidesPerGroup','spaceBetween','speed','loop','rewind','centeredSlides','autoHeight','effect','grid','allowTouchMove','keyboard','mousewheel','freeMode','zoom','cssMode','parallax','hashNavigation','autoplay','breakpoints','navigation','pagination','scrollbar']);
const hooks=new Set(['on','onAny','modules','init','virtual','controller','thumbs','el']);
const elementOnly=new Set(['injectStyles','injectStylesUrls','eventsPrefix']);
let out='# Swiper option coverage\n\nBundled Swiper '+pkg.version+'. Generated from its TypeScript declarations. This inventory identifies an access path, not proof that every option combination has been tested.\n\n';
out+='Common options have visual fields; additional JSON-compatible parameters use Advanced. Functions and instance references use the trusted wpff:before-slider hook. Internal navigation elements are owned by the plugin. Nested protected keys remain rejected. Options requiring a particular slide markup may require a custom integration.\n\n';
out+='| Swiper parameter | Access in wp-flipflop |\n| --- | --- |\n';
for(const key of [...keys].sort()){
 const mode=elementOnly.has(key)?'Swiper Element only; not used by this renderer':hooks.has(key)?'Trusted developer hook / plugin-managed':ui.has(key)?'Visual controls; nested data options through Advanced':'Advanced JSON for serializable values; hook for functions';
 out+='| `'+key+'` | '+mode+' |\n';
}
await mkdir('docs',{recursive:true});await writeFile('docs/SWIPER-OPTIONS.md',out);
console.log('Documented '+keys.size+' Swiper parameters.');
