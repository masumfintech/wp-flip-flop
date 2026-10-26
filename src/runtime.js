import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';
import { PageFlip } from 'page-flip';
import { sliderOptions } from './options.js';
import { pdfSwiperOptions, pdfPageWindow } from './pdf-options.js';
import { createPreviewSession } from './preview-session.js';
import './runtime.css';

const mounted=new WeakMap();
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(label,fn,cls='')=>{const b=el('button','wpff-button '+cls,label);b.type='button';b.addEventListener('click',fn);return b;};
function safeUrl(value){if(typeof value!=='string'||!value.trim())return '';try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}}
function status(host,text){const n=el('p','wpff-status',text);n.setAttribute('role','status');host.append(n);return n;}

function slider(host,c) {
 if(!c.slides?.length){status(host,'Add your first slide to see it here.');return ()=>{};}
 const {options,warnings}=sliderOptions(c,c.slides.length,reduced());
 if(warnings.length)host.dispatchEvent(new CustomEvent('wpff:notice',{detail:warnings,bubbles:true}));
 const frame=el('div','wpff-slider swiper');frame.dir=c.rtl?'rtl':'ltr';
 frame.style.height=c.height+'px';
 const wrapper=el('div','swiper-wrapper');frame.append(wrapper);
 c.slides.forEach((s,i)=>{
  const slide=el('div','swiper-slide');slide.dataset.hash='wpff-'+(c.itemId||'slide')+'-'+(i+1);
  const content=el('div','wpff-slide-content swiper-slide-transform');
  const url=safeUrl(s.url);
  if(url){
   const media=el(s.kind==='video'?'video':'img','wpff-media');
   media.src=url;
   if(s.kind==='video'){media.controls=true;media.preload='metadata';media.playsInline=true;}
   else{media.alt=s.alt||'';media.loading=i?'lazy':'eager';}
   if(c.zoom&&s.kind!=='video'){const zoom=el('div','swiper-zoom-container');zoom.append(media);content.append(zoom);}else content.append(media);
  } else content.classList.add('wpff-text-slide');
  if(s.title||s.text||s.link){
   const caption=el('div','wpff-caption');if(c.parallax)caption.dataset.swiperParallax='-120';
   if(s.title)caption.append(el('h3','',s.title));
   if(s.text)caption.append(el('p','',s.text));
   if(safeUrl(s.link)){const a=el('a','wpff-cta',s.button||'Learn more');a.href=safeUrl(s.link);caption.append(a);}
   content.append(caption);
  }
  slide.append(content);wrapper.append(slide);
 });
 if(c.navigation){
  const prev=button('‹',()=>{},'swiper-button-prev'),next=button('›',()=>{},'swiper-button-next');
  prev.setAttribute('aria-label','Previous slide');next.setAttribute('aria-label','Next slide');
  frame.append(prev,next);options.navigation={...(typeof options.navigation==='object'?options.navigation:{}),prevEl:prev,nextEl:next};
 }
 if(c.pagination!=='none'){const p=el('div','swiper-pagination');frame.append(p);options.pagination={...(typeof options.pagination==='object'?options.pagination:{}),el:p,type:c.pagination,clickable:true,dynamicBullets:c.dynamicBullets};}
 if(c.scrollbar){const s=el('div','swiper-scrollbar');frame.append(s);options.scrollbar={...(typeof options.scrollbar==='object'?options.scrollbar:{}),el:s,draggable:true};}
 host.append(frame);
 host.dispatchEvent(new CustomEvent('wpff:before-slider',{bubbles:true,detail:{options,element:frame}}));
 const swiper=new Swiper(frame,options);
 swiper.on('slideChange',()=>frame.querySelectorAll('video').forEach(v=>v.pause()));
 if(c.thumbs){
  const thumbs=el('div','wpff-thumbs');
  const buttons=c.slides.map((s,i)=>{
   const b=button('',()=>swiper.slideToLoop(i));b.setAttribute('aria-label','Go to slide '+(i+1));
   if(safeUrl(s.url)&&s.kind!=='video'){const img=el('img');img.src=safeUrl(s.url);img.alt='';b.append(img);}else b.textContent=String(i+1);
   thumbs.append(b);return b;
  });
  const update=()=>buttons.forEach((b,i)=>b.setAttribute('aria-current',String(i===swiper.realIndex)));
  swiper.on('slideChange',update);update();host.append(thumbs);
 }
 if(options.autoplay){
  let paused=false;const pause=button('Pause slideshow',()=>{paused=!paused;paused?swiper.autoplay.stop():swiper.autoplay.start();pause.textContent=paused?'Play slideshow':'Pause slideshow';},'wpff-playback');host.append(pause);
  frame.addEventListener('focusin',()=>{swiper.autoplay.stop();paused=true;pause.textContent='Play slideshow';});
 }
 host.dispatchEvent(new CustomEvent('wpff:ready',{bubbles:true,detail:{type:'slider',instance:swiper}}));
 return ()=>swiper.destroy(true,true);
}

let pdfModule;
function pdfEngine(){
 if(!pdfModule){
  const base=window.wpffRuntime?.baseUrl||new URL('./assets/',location.href).href;
  const version=window.wpffRuntime?.version;
  const suffix=version?'?ver='+encodeURIComponent(version):'';
  pdfModule=import(/* @vite-ignore */ base+'pdf.js'+suffix).then(pdf=>{
   pdf.GlobalWorkerOptions.workerSrc=base+'pdf.worker.js'+suffix;
   return pdf;
  }).catch(error=>{pdfModule=undefined;throw error;});
 }
 return pdfModule;
}
function book(host,c,previewSession) {
 let previewResource;
 let disposed=false,loadingTask,doc,flip,current=0,zoom=1,queue=Promise.resolve(),searchToken=0,observer,onKey,pdfSwiper;
 const isSwiper=!!c.pdfEffect&&c.pdfEffect!=='book';
 let wantedPages=new Set();
 const tasks=new Set(),cache=new Map(),pageNodes=[];
 const message=status(host,'Loading your PDF…');
 const cleanup=()=>{disposed=true;searchToken++;observer?.disconnect();if(onKey)host.removeEventListener('keydown',onKey);for(const t of tasks)t.cancel();flip?.destroy();if(!previewSession)loadingTask?.destroy();};
 const url=safeUrl(c.pdfUrl);
 if(!url){message.textContent='Select a PDF to preview its pages.';return cleanup;}
 const fallback=el('a','wpff-fallback','Open PDF');fallback.href=url;fallback.target='_blank';fallback.rel='noopener';host.append(fallback);
 async function start(){
  const pdf=await pdfEngine();if(disposed)return;
  const base=window.wpffRuntime?.baseUrl||new URL('./assets/',location.href).href;
  const load=()=>pdf.getDocument({url,cMapUrl:base+'cmaps/',cMapPacked:true,standardFontDataUrl:base+'standard_fonts/',wasmUrl:base+'wasm/',iccUrl:base+'iccs/',isEvalSupported:false});
  if(previewSession){previewResource=previewSession.document(url,load);loadingTask=previewResource.loading;}else loadingTask=load();
  loadingTask.onPassword=()=>{message.textContent='This PDF is password protected. Open the PDF directly or upload an unlocked copy.';loadingTask.destroy();};
  loadingTask.onProgress=({loaded,total})=>{if(total&&!disposed)message.textContent='Loading PDF · '+Math.round(loaded/total*100)+'%';};
  doc=await (previewResource?.promise||loadingTask.promise);if(disposed)return;
  const first=await doc.getPage(1);if(disposed)return;
  const viewport=first.getViewport({scale:1}),ratio=viewport.width/viewport.height;
  message.remove();fallback.remove();
  const toolbar=el('div','wpff-toolbar');toolbar.setAttribute('role','toolbar');toolbar.setAttribute('aria-label','PDF controls');
  const body=el('div','wpff-book-body'),stage=el('div','wpff-book-stage'),surface=el('div','wpff-book-surface');
  const bookNode=el('div','wpff-book');surface.append(bookNode);stage.append(surface);body.append(stage);
  stage.style.minHeight=c.height+'px';
  const announce=el('span','wpff-page-status');announce.setAttribute('aria-live','polite');
  const pageInput=el('input','wpff-page-input');pageInput.type='number';pageInput.min='1';pageInput.max=String(doc.numPages);pageInput.setAttribute('aria-label','Go to page');
  const go=index=>{const n=Math.max(0,Math.min(doc.numPages-1,index));if(Number.isFinite(n))flip.turnToPage(n);};
  const prev=button('←',()=>reduced()?flip.turnToPrevPage():flip.flipPrev());prev.setAttribute('aria-label','Previous page');
  const next=button('→',()=>reduced()?flip.turnToNextPage():flip.flipNext());next.setAttribute('aria-label','Next page');
  pageInput.addEventListener('change',()=>go(Number(pageInput.value)-1));
  toolbar.append(prev,pageInput,announce,next);prev.hidden=c.navigation===false;next.hidden=c.navigation===false;
  const setZoom=delta=>{zoom=Math.min(2,Math.max(1,zoom+delta));surface.style.transform='scale('+zoom+')';surface.style.transformOrigin='top left';stage.style.overflow=zoom>1?'auto':'hidden';};
  toolbar.append(button('−',()=>setZoom(-.25)),button('+',()=>setZoom(.25)));
  toolbar.children[4].setAttribute('aria-label','Zoom out');toolbar.children[5].setAttribute('aria-label','Zoom in');
  const firstButton=button('First',()=>go(0)),lastButton=button('Last',()=>go(doc.numPages-1));
  firstButton.hidden=c.navigation===false;lastButton.hidden=c.navigation===false;toolbar.append(firstButton,lastButton);
  if(c.fullscreen&&host.requestFullscreen)toolbar.append(button('Fullscreen',()=>{const p=document.fullscreenElement?document.exitFullscreen():host.requestFullscreen();p?.catch(()=>{});}));
  if(c.download){const download=el('a','wpff-button','Download');download.href=url;download.download='';download.target='_blank';download.rel='noopener';toolbar.append(download);}
  const panels=el('div','wpff-book-panels');
  host.append(toolbar,panels,body);
  for(let i=0;i<doc.numPages;i++){
   const page=el('div','wpff-book-page');page.setAttribute('aria-label','Page '+(i+1));
   const canvas=el('canvas');canvas.setAttribute('role','img');canvas.setAttribute('aria-label','PDF page '+(i+1));
   const number=el('span','wpff-page-label',String(i+1));page.append(canvas,number);pageNodes.push(page);bookNode.append(page);
  }
  current=Math.min(doc.numPages-1,Math.max(0,(c.startPage||1)-1));
  function renderPage(index){
   if(disposed||index<0||index>=doc.numPages||cache.has(index))return;
   cache.set(index,'queued');
   queue=queue.then(async()=>{
    if(disposed||!wantedPages.has(index)){cache.delete(index);return;}
    if(previewResource){
     const bitmap=await previewSession.page(previewResource,index);if(disposed)return;
     const canvas=pageNodes[index].querySelector('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;canvas.getContext('2d').drawImage(bitmap,0,0);cache.set(index,'ready');return;
    }
    const page=await doc.getPage(index+1);if(disposed)return;
    const canvas=pageNodes[index].querySelector('canvas');
    const v=page.getViewport({scale:1});
    const scale=Math.min(2,1400/v.height,1100/v.width);
    const view=page.getViewport({scale});
    canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);
    const task=page.render({canvasContext:canvas.getContext('2d'),viewport:view});tasks.add(task);
    try{await task.promise;cache.set(index,'ready');if(!wantedPages.has(index)){canvas.width=0;canvas.height=0;cache.delete(index);}}finally{tasks.delete(task);page.cleanup();}
   }).catch(error=>{cache.delete(index);if(!disposed)pageNodes[index].querySelector('.wpff-page-label').textContent='Page '+(index+1)+' could not render';});
  }
  function update(){
   if(disposed||!flip)return;
   current=flip.getCurrentPageIndex();pageInput.value=String(current+1);announce.textContent='/ '+doc.numPages;
   const wrapping=!!(pdfSwiper?.params.loop||pdfSwiper?.params.rewind);
   prev.disabled=!wrapping&&(pdfSwiper?pdfSwiper.isBeginning:current===0);
   next.disabled=!wrapping&&(pdfSwiper?pdfSwiper.isEnd:current>=doc.numPages-(flip.getOrientation()==='landscape'?2:1));
   const visible=pdfSwiper?(pdfSwiper.params.slidesPerView==='auto'?pdfSwiper.slidesPerViewDynamic():Number(pdfSwiper.params.slidesPerView)||1):2;
   wantedPages=pdfPageWindow(current,doc.numPages,visible,!!pdfSwiper?.params.loop);
   for(const slide of pdfSwiper?.visibleSlides||[]){const i=Number(slide.dataset.pdfPage);if(Number.isInteger(i))wantedPages.add(i);}
   for(const [i,state] of cache){if(!wantedPages.has(i)&&state==='ready'){const canvas=pageNodes[i].querySelector('canvas');canvas.width=0;canvas.height=0;cache.delete(i);}}
   renderPage(current);
   for(const index of wantedPages)renderPage(index);
  }
  const height=Math.max(200,c.height-20),width=Math.round(height*ratio);
  if(isSwiper){
   bookNode.className='wpff-pdf-swiper swiper';bookNode.dataset.effect=c.pdfEffect;bookNode.dir=c.rtl?'rtl':'ltr';
   bookNode.style.height=height+'px';bookNode.style.setProperty('--wpff-page-ratio',String(ratio));
   const wrapper=el('div','swiper-wrapper');
   pageNodes.forEach((page,i)=>{
    const slide=el('div','swiper-slide');slide.dataset.pdfPage=String(i);slide.dataset.hash='wpff-'+(c.itemId||'pdf')+'-page-'+(i+1);
    slide.append(page);wrapper.append(slide);
   });
   bookNode.append(wrapper);
   const {options,warnings}=pdfSwiperOptions(c,doc.numPages,reduced());
   if(warnings.length)host.dispatchEvent(new CustomEvent('wpff:notice',{detail:warnings,bubbles:true}));
   options.navigation=false;
   if(c.pagination!=='none'){
    const pagination=el('div','swiper-pagination');bookNode.append(pagination);
    options.pagination={...(typeof options.pagination==='object'?options.pagination:{}),el:pagination,type:c.pagination||'fraction',clickable:true,dynamicBullets:c.dynamicBullets};
   }else options.pagination=false;
   if(c.scrollbar){const scrollbar=el('div','swiper-scrollbar');bookNode.append(scrollbar);options.scrollbar={el:scrollbar,draggable:true};}else options.scrollbar=false;
   host.dispatchEvent(new CustomEvent('wpff:before-slider',{bubbles:true,detail:{options,element:bookNode,source:'pdf'}}));
   pdfSwiper=new Swiper(bookNode,options);
   const jump=index=>pdfSwiper.params.loop?pdfSwiper.slideToLoop(index,reduced()?0:pdfSwiper.params.speed):pdfSwiper.slideTo(index,reduced()?0:pdfSwiper.params.speed);
   flip={getCurrentPageIndex:()=>pdfSwiper.realIndex,getOrientation:()=> 'portrait',
    turnToPage:jump,turnToPrevPage:()=>pdfSwiper.slidePrev(0),turnToNextPage:()=>pdfSwiper.slideNext(0),
    flipPrev:()=>pdfSwiper.slidePrev(),flipNext:()=>pdfSwiper.slideNext(),update:()=>pdfSwiper.update(),destroy:()=>pdfSwiper.destroy(true,true)};
   pdfSwiper.on('slideChange',update);pdfSwiper.on('resize',update);pdfSwiper.on('transitionEnd',update);update();
   if(options.autoplay){
    const pause=button('Pause autoplay',()=>{if(pdfSwiper.autoplay.running){pdfSwiper.autoplay.stop();pause.textContent='Play autoplay';}else{pdfSwiper.autoplay.start();pause.textContent='Pause autoplay';}});
    toolbar.append(pause);
   }
  }else{
  flip=new PageFlip(bookNode,{width,height,size:'stretch',minWidth:c.bookLayout==='spread'?120:Math.min(width,240),maxWidth:width,minHeight:160,maxHeight:height,startPage:current,
   drawShadow:c.shadows,flippingTime:reduced()?1:c.bookSpeed,usePortrait:c.bookLayout!=='spread',showCover:c.showCover,
   autoSize:true,mobileScrollSupport:true,maxShadowOpacity:.25,showPageCorners:!reduced()});
  if(c.bookLayout==='single')surface.style.maxWidth=width+'px';
  flip.on('flip',update);flip.on('init',update);flip.loadFromHTML(pageNodes);update();
  }
  observer=new ResizeObserver(()=>{if(!disposed)flip.update();});observer.observe(stage);
  host.tabIndex=0;
  onKey=e=>{if(disposed||!c.keyboard)return;if(/INPUT|TEXTAREA|BUTTON|A/.test(e.target.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();flip.turnToNextPage();}if(e.key==='ArrowLeft'){e.preventDefault();flip.turnToPrevPage();}};host.addEventListener('keydown',onKey);
  if(c.thumbnails){
   const thumbsPanel=el('div','wpff-page-picker');thumbsPanel.hidden=true;
   const drawThumbs=async()=>{
    thumbsPanel.replaceChildren();
    const start=Math.max(0,current-5),end=Math.min(doc.numPages,start+12);
    for(let i=start;i<end;i++){
     const b=button('Page '+(i+1),()=>go(i));const canvas=el('canvas');b.prepend(canvas);thumbsPanel.append(b);
     const page=await doc.getPage(i+1);if(disposed||thumbsPanel.hidden)return;
     const v=page.getViewport({scale:1});const view=page.getViewport({scale:80/v.width});canvas.width=view.width;canvas.height=view.height;
     const task=page.render({canvasContext:canvas.getContext('2d'),viewport:view});tasks.add(task);
     try{await task.promise;}finally{tasks.delete(task);}
    }
   };
   toolbar.append(button('Thumbnails',()=>{thumbsPanel.hidden=!thumbsPanel.hidden;if(!thumbsPanel.hidden)drawThumbs().catch(()=>{});}));
   panels.append(thumbsPanel);
  }
  const outline=await doc.getOutline();if(disposed)return;
  if(outline?.length){
   const toc=el('div','wpff-toc');toc.hidden=true;
   const addOutline=(items,depth=0)=>{for(const entry of items){
    const b=button(entry.title,async()=>{try{const dest=typeof entry.dest==='string'?await doc.getDestination(entry.dest):entry.dest;if(dest){const index=typeof dest[0]==='number'?dest[0]:await doc.getPageIndex(dest[0]);if(!disposed)go(index);}}catch{}});
    b.style.marginLeft=Math.min(depth,5)*12+'px';toc.append(b);if(entry.items)addOutline(entry.items,depth+1);
   }};addOutline(outline);panels.append(toc);toolbar.append(button('Contents',()=>toc.hidden=!toc.hidden));
  }
  if(c.search){
   const search=el('form','wpff-search');search.hidden=true;
   const input=el('input');input.type='search';input.placeholder='Search this PDF';input.setAttribute('aria-label','Search PDF text');
   const results=el('div','wpff-search-results');results.setAttribute('aria-live','polite');
   const submit=button('Search',()=>search.requestSubmit());search.append(input,submit,results);panels.append(search);
   toolbar.append(button('Find',()=>{search.hidden=!search.hidden;if(!search.hidden)input.focus();}));
   search.addEventListener('submit',async e=>{
    e.preventDefault();const token=++searchToken;const query=input.value.trim().toLowerCase();results.replaceChildren();if(!query)return;
    let matches=0;const progress=el('p','','Searching…');results.append(progress);
    try{for(let i=0;i<doc.numPages;i++){
     if(disposed||token!==searchToken)return;
     const page=await doc.getPage(i+1);const text=await page.getTextContent();
     if(disposed||token!==searchToken)return;
     if(text.items.map(x=>x.str||'').join(' ').toLowerCase().includes(query)){matches++;results.append(button('Page '+(i+1),()=>go(i)));}
     progress.textContent='Searching page '+(i+1)+' of '+doc.numPages;
    }progress.textContent=matches?matches+' matching pages':'No matching text. Scanned PDFs may need OCR.';}catch{progress.textContent='Search could not finish.';}
   });
  }
  host.dispatchEvent(new CustomEvent('wpff:ready',{bubbles:true,detail:{type:'flipbook',mode:c.pdfEffect||'book',source:'pdf',pageCount:doc.numPages,instance:pdfSwiper||flip}}));
 }
 start().catch(error=>{if(disposed)return;message.textContent='Unable to display this PDF. '+(error?.message||'Try opening the original file.');if(!message.isConnected)host.prepend(message);if(!fallback.isConnected)host.append(fallback);});
 return cleanup;
}
export function mount(host,config,previewSession) {
 mounted.get(host)?.();host.replaceChildren();host.classList.add('wpff-viewer');
 host.style.setProperty('--wpff-accent',config.accent||'#e36a3b');host.style.setProperty('--wpff-bg',config.background||'#f1f0eb');
 let destroy=()=>{};
 try{
  if(config.type==='flipbook'&&config.display==='lightbox'){
   const cover=button('Open '+(config.title||config.pdfName||'flipbook'),()=>{
    const dialog=el('dialog','wpff-dialog'),target=el('div','wpff-viewer');
    const close=button('Close',()=>dialog.close());dialog.append(close,target);document.body.append(dialog);
    mount(target,{...config,display:'inline'},previewSession);
    dialog.addEventListener('close',()=>{unmount(target);dialog.remove();cover.focus();},{once:true});dialog.showModal();close.focus();
    destroy=()=>{unmount(target);dialog.remove();};
   },'wpff-cover');host.append(cover);
  }else destroy=config.type==='flipbook'?book(host,config,previewSession):slider(host,config);
 }catch(error){status(host,error.message);}
 mounted.set(host,()=>destroy());
}
export function unmount(host){mounted.get(host)?.();mounted.delete(host);host.replaceChildren();}
function init(root=document){root.querySelectorAll('.wpff-root:not([data-wpff-mounted])').forEach(root=>{root.dataset.wpffMounted='true';try{mount(root.querySelector('.wpff-mount'),JSON.parse(root.querySelector('.wpff-data').textContent));}catch{status(root,'This viewer could not load.');}});}
window.WPFlipFlop={mount,unmount,init,createPreviewSession};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init());else init();
