import { parseAdvanced, sliderOptions } from './options.js';
export const pdfEffects=['book','slide','fade','cards','cube','coverflow','flip','creative'];
export function pdfSwiperOptions(config,count,reducedMotion=false){
 const effect=pdfEffects.includes(config.pdfEffect)&&config.pdfEffect!=='book'?config.pdfEffect:'slide';
 const advanced=parseAdvanced(config.advanced);
 // PDF page identity, canvas ownership, and the selected viewing mode belong to the reader.
 const result=sliderOptions({...config,effect,gridRows:1,slidesPerGroup:1,
  advanced:{...advanced,effect,grid:{rows:1},slidesPerGroup:1,zoom:false,autoHeight:false,keyboard:false,cssMode:effect==='slide'?!!advanced.cssMode:false}
 },count,reducedMotion);
 const o=result.options;
 o.initialSlide=Math.max(0,Math.min(count-1,(config.startPage||1)-1));
 o.watchSlidesProgress=true;
 o.loopAddBlankSlides=false;
 for(const bp of Object.values(o.breakpoints||{})){bp.grid={rows:1};bp.slidesPerGroup=1;bp.autoHeight=false;}
 return result;
}
export function pdfPageWindow(current,count,visible=1,loop=false){
 const pages=new Set();
 const length=Math.max(1,Math.min(count,Math.ceil(visible)||1));
 for(let offset=-2;offset<length+3;offset++){
  let index=current+offset;
  if(loop)index=((index%count)+count)%count;
  if(index>=0&&index<count)pages.add(index);
 }
 return pages;
}
