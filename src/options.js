export const blockedKeys = new Set(['__proto__','prototype','constructor','on','onAny','el','nextEl','prevEl','control','swiper','slides','renderExternal','renderSlide','renderBullet','renderCustom','renderFraction','renderProgressbar','injectStyles','injectStylesUrls','url','modules','createElements','init']);
export function parseAdvanced(value) {
 const result = typeof value === 'string' ? JSON.parse(value || '{}') : value || {};
 if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('Advanced options must be a JSON object.');
 if (JSON.stringify(result).length > 32000) throw new Error('Advanced options exceed 32 KB.');
 function check(v, depth=0) {
  if(depth>8)throw new Error('Advanced options are nested too deeply.');
  if(v && typeof v==='object')for(const [k,x] of Object.entries(v)){if(blockedKeys.has(k))throw new Error('Unsupported property: '+k);check(x,depth+1);}
  else if(typeof v==='string'&&(v.length>2000||v.includes('<')))throw new Error('Unsupported value in advanced options.');
 }
 check(result); return result;
}
export function merge(target, source) {
 for(const [key,value] of Object.entries(source)) {
  if(blockedKeys.has(key))throw new Error('Unsupported property: '+key);
  if(value && typeof value==='object' && !Array.isArray(value))target[key]=merge(target[key] && typeof target[key]==='object' ? {...target[key]} : {},value);
  else target[key]=value;
 }
 return target;
}
export function sliderOptions(c, count, reducedMotion=false) {
 const warnings=[];
 const o=merge({
  effect:c.effect, direction:c.direction, slidesPerView:c.slidesPerView,
  slidesPerGroup:c.slidesPerGroup, spaceBetween:c.spaceBetween, speed:c.speed,
  loop:c.loop, rewind:c.rewind, centeredSlides:c.centeredSlides, autoHeight:c.autoHeight,
  grid:{rows:c.gridRows,fill:'row'}, allowTouchMove:c.allowTouchMove,
  keyboard:{enabled:c.keyboard,onlyInViewport:true}, mousewheel:c.mousewheel?{forceToAxis:true,releaseOnEdges:true}:false,
  freeMode:c.freeMode, zoom:c.zoom, cssMode:c.cssMode, parallax:c.parallax,
  hashNavigation:c.hashNavigation?{watchState:true}:false,
  autoplay:c.autoplay?{delay:c.delay,pauseOnMouseEnter:c.pauseOnHover,disableOnInteraction:true}:false,
  breakpointsBase:'container',
  breakpoints:{0:{slidesPerView:c.mobileSlides},640:{slidesPerView:c.tabletSlides},1024:{slidesPerView:c.slidesPerView}},
  a11y:{enabled:true}, watchOverflow:true,
  creativeEffect:{prev:{shadow:true,translate:['-20%',0,-1]},next:{translate:['100%',0,0]}}
 },parseAdvanced(c.advanced));
 if(['fade','cube','flip','cards','creative'].includes(o.effect)){
  if(o.slidesPerView!==1||o.grid?.rows>1)warnings.push('This effect uses one slide per view.');
  o.slidesPerView=1; o.slidesPerGroup=1; o.grid={rows:1};
  for(const bp of Object.values(o.breakpoints||{})){bp.slidesPerView=1;bp.slidesPerGroup=1;bp.grid={rows:1};}
 }
 for(const bp of Object.values(o.breakpoints||{})){if('loop' in bp || 'effect' in bp)throw new Error('Set loop and effect outside breakpoints.');}
 const views=Math.max(Number(o.slidesPerView)||1,...Object.values(o.breakpoints||{}).map(x=>Number(x.slidesPerView)||1));
 if(o.loop && count<views+(Number(o.slidesPerGroup)||1)){o.loop=false;warnings.push('Loop needs more slides for this layout; it is disabled.');}
 if(o.loop)o.rewind=false;
 if(reducedMotion){o.speed=0;o.autoplay=false;}
 // Virtual slide strings and external selectors require trusted developer hooks.
 if(o.virtual)throw new Error('Virtual slides require the wpff:before-slider developer hook.');
 return {options:o,warnings};
}
