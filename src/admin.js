import { parseAdvanced } from './options.js';
import { pdfSwiperOptions } from './pdf-options.js';
import './admin.css';
const {__}=wp.i18n;
const root=document.getElementById('wpff-admin'),hidden=document.getElementById('wpff-config');
const c=structuredClone(window.wpffAdmin.config);
c.pdfEffect ||= 'book';
let currentTab='',device='desktop',timer,previewHost,notice,previewCenter,lastPreview='',previewPage=0,lastPdf='',lastStart;
const previewSession=window.WPFlipFlop.createPreviewSession();
window.addEventListener('pagehide',()=>previewSession.clear());
const effects=[['book','Flipbook','Turn pages like a book'],['slide','Slide','Swipe between PDF pages'],['fade','Fade','Crossfade each page'],['cards','Cards','Stack pages as cards'],['cube','Cube','Rotate between pages'],['coverflow','Coverflow','Browse a page carousel'],['flip','Flip','Flip one page at a time'],['creative','Creative','Layered page transitions']];
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=__(text,'masum-flipflop-pdf-reader');return n;};
const btn=(label,fn,cls='')=>{const n=el('button',cls,label);n.type='button';n.addEventListener('click',fn);return n;};
function settings(){
 const common={
  Reader:[['startPage','Starting page',1],...(c.pdfEffect==='book'?[['navigation','Show navigation buttons']]:[]),['keyboard','Keyboard navigation'],['fullscreen','Fullscreen button'],['thumbnails','Page thumbnails'],['search','Text search'],['download','Download button'],['display','Display mode',['inline','lightbox']]],
  Style:[['height','Viewer height (px)',200,1600],['background','Background','color'],['accent','Accent color','color']]
 };
 return c.pdfEffect==='book'?{
  Book:[['bookLayout','Page layout',['auto','single','spread']],['showCover','Show book cover'],['shadows','Page shadows'],['bookSpeed','Page-turn speed (ms)',100,3000]],...common
 }:{
  Layout:[['direction','Direction',['horizontal','vertical']],['slidesPerView','Desktop pages',1,12],['tabletSlides','Tablet pages',1,12],['mobileSlides','Mobile pages',1,12],['spaceBetween','Page spacing',0,200],['speed','Transition speed (ms)',0,5000],['centeredSlides','Center active page'],['rtl','Right-to-left slider']],
  Controls:[['navigation','Show slider buttons'],['showDots','Show pagination dots'],['pagination','Pagination style',['none','bullets','fraction','progressbar']],['dynamicBullets','Dynamic bullets'],['scrollbar','Draggable scrollbar'],['mousewheel','Mousewheel navigation'],['allowTouchMove','Touch and drag'],['freeMode','Free scrolling']],
  Playback:[['autoplay','Autoplay'],['delay','Delay (ms)',500,60000],['pauseOnHover','Pause on hover'],['loop','Loop pages'],['rewind','Rewind at the end']],
  ...common,Advanced:[]
 };
}
function sync(){hidden.value=JSON.stringify(c);clearTimeout(timer);timer=setTimeout(preview,400);}
function preview(){
 if(!previewHost)return;
 notice.textContent='';
 try{
  parseAdvanced(c.advanced);
  const signature=JSON.stringify(c);if(signature===lastPreview)return;
  if(lastPdf!==c.pdfUrl||lastStart!==c.startPage)previewPage=c.startPage||1;
  else{const input=previewHost.querySelector('.wpff-page-input');if(input)previewPage=Number(input.value)||previewPage;}
  lastPdf=c.pdfUrl;lastStart=c.startPage;lastPreview=signature;
  window.WPFlipFlop.mount(previewHost,{...c,startPage:previewPage,itemId:wpffAdmin.id,title:document.getElementById('title')?.value||'Your PDF'},previewSession);
 }catch(error){notice.textContent=error.message;}
}
function choosePdf(){
 const frame=wp.media({title:'Choose your PDF',button:{text:'Use this PDF'},library:{type:'application/pdf'},multiple:false});
 frame.on('select',()=>{
  const x=frame.state().get('selection').first().toJSON();
  c.type='flipbook';c.pdfId=x.id;c.pdfUrl=x.url;c.pdfName=x.title||x.filename;c.startPage=1;sync();render();
 });frame.open();
}
function field([key,label,type,max]){
 const row=el('label','wpff-field');row.append(el('span','',label));
 let input;
 if(Array.isArray(type)){input=el('select');for(const value of type){const option=el('option','',value[0].toUpperCase()+value.slice(1));option.value=value;input.append(option);}input.value=c[key];}
 else{input=el('input');input.type=type==='color'?'color':typeof type==='number'?'number':'checkbox';if(input.type==='checkbox')input.checked=key==='showDots'?c.pagination==='bullets':c[key];else input.value=c[key];if(input.type==='number'){input.min=type;if(max!==undefined)input.max=max;input.step=1;}}
 input.setAttribute('aria-label',label);
 input.addEventListener('input',()=>{if(key==='showDots'){c.pagination=input.checked?'bullets':'none';sync();render();return;}c[key]=input.type==='checkbox'?input.checked:input.type==='number'?Math.max(Number(input.min),Math.min(input.max===''?Infinity:Number(input.max),Number(input.value))):input.value;sync();if(key==='pagination')render();});
 row.append(input);if(input.type==='checkbox')row.classList.add('wpff-toggle');return row;
}
function contentPanel(){
 const panel=el('aside','wpff-content');panel.append(el('h3','','PDF document'));
 const card=el('div','wpff-pdf-card');
 card.append(el('span','wpff-pdf-icon','PDF'),el('strong','',c.pdfName||'Choose your document'),el('p','wpff-pdf-summary',c.pdfId?'Ready to render PDF pages':'Every page becomes a page in your viewer.'));
 card.append(btn(c.pdfId?'Replace PDF':'Select PDF',choosePdf,'button button-primary'));panel.append(card);
 panel.append(el('p','wpff-hint','Switch effects above to display this same PDF as a flipbook, sliding pages, a fade, or a stack of cards.'));
 if(c.type==='slider')panel.append(el('p','wpff-hint','This older item contains media slides. Select a PDF to replace them with PDF pages.'));
 const steps=el('ol','wpff-pdf-steps');for(const step of ['Select your PDF','Choose a page effect','Customize and preview','Publish and embed'])steps.append(el('li','',step));panel.append(steps);
 return panel;
}
function settingsPanel(){
 const panel=el('aside','wpff-settings');panel.append(el('h3','','Settings'));
 const tabs=settings();if(!tabs[currentTab])currentTab=Object.keys(tabs)[0];
 const nav=el('div','wpff-settings-tabs');nav.setAttribute('role','tablist');
 for(const name of Object.keys(tabs)){const b=btn(name,()=>{currentTab=name;render();},name===currentTab?'nav-tab nav-tab-active':'nav-tab');b.setAttribute('role','tab');b.setAttribute('aria-selected',String(name===currentTab));nav.append(b);}panel.append(nav);
 if(currentTab==='Advanced'){
  panel.append(el('p','wpff-hint','Additional Swiper JSON options for the PDF page viewer. The selected effect, page order, and PDF canvas rendering are managed by the reader.'));
  const area=el('textarea','wpff-json');area.rows=14;area.spellcheck=false;area.setAttribute('aria-label','Advanced Swiper options');
  area.value=typeof c.advanced==='string'?c.advanced:JSON.stringify(c.advanced||{},null,2);
  area.addEventListener('input',()=>{c.advanced=area.value;sync();});panel.append(area);
 }else for(const def of tabs[currentTab])panel.append(field(def));
 if(currentTab==='Layout'&&['fade','cards','cube','flip','creative'].includes(c.pdfEffect))panel.append(el('p','wpff-hint','This effect displays one PDF page at a time. Slide and Coverflow also support multiple pages.'));
 if(currentTab==='Reader')panel.append(el('p','wpff-hint','Search needs selectable PDF text. Download visibility does not restrict access to the PDF file.'));
 return panel;
}
function render(){
 clearTimeout(timer);if(previewCenter)previewCenter.remove();root.replaceChildren();
 const top=el('div','wpff-builder-top'),intro=el('div');
 intro.append(el('h2','','Page effect'),el('p','','Select a PDF below, then choose how its pages are displayed.'));top.append(intro);root.append(top);
 const choices=el('div','wpff-pdf-effects');choices.setAttribute('role','group');choices.setAttribute('aria-label','PDF page effect');
 for(const [value,label,description] of effects){
  const b=btn('',()=>{c.pdfEffect=value;currentTab='';sync();render();},'wpff-effect-card'+(c.pdfEffect===value?' active':''));
  b.dataset.effect=value;b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(c.pdfEffect===value));
  
  b.append(el('strong','',label),el('span','wpff-effect-description',description));choices.append(b);
 }root.append(choices);
 const workspace=el('div','wpff-workspace');workspace.append(contentPanel());
 const center=previewCenter||el('main','wpff-preview-area');
 if(!previewCenter){const bar=el('div','wpff-preview-bar');bar.append(el('span','','Preview'));
 const devices=el('div','wpff-devices');for(const name of ['desktop','tablet','mobile']){const control=btn(name,()=>{device=name;render();},device===name?'button button-small active':'button button-small');control.setAttribute('aria-pressed',String(device===name));devices.append(control);}bar.append(devices);center.append(bar);
 const canvas=el('div','wpff-preview-canvas'),viewport=el('div','wpff-preview-viewport');viewport.dataset.device=device;previewHost=el('div');viewport.append(previewHost);canvas.append(viewport);center.append(canvas);
 notice=el('p','wpff-preview-notice');notice.setAttribute('role','status');center.append(notice,el('p','wpff-preview-note','These are the pages of your PDF, rendered directly in the viewer.'));
 previewCenter=center;
 }
 center.querySelector('.wpff-preview-viewport').dataset.device=device;
 center.querySelectorAll('.wpff-devices button').forEach(button=>{const active=button.textContent.toLowerCase()===device;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
 workspace.append(center,settingsPanel());root.append(workspace);
 const footer=el('div','wpff-admin-footer');footer.append(el('span','','Save with Publish or Update, then embed your PDF viewer.'));
 const copy=btn('Copy shortcode',async()=>{const text='[wp_flipflop id="'+wpffAdmin.id+'"]';try{await navigator.clipboard.writeText(text);copy.textContent='Copied!';}catch{notice.textContent=text;}},'button button-secondary');footer.append(copy);root.append(footer);
 hidden.value=JSON.stringify(c);requestAnimationFrame(preview);
}
document.getElementById('post')?.addEventListener('submit',e=>{
 try{c.advanced=parseAdvanced(c.advanced);if(c.pdfEffect!=='book')pdfSwiperOptions(c,2000);hidden.value=JSON.stringify(c);}
 catch(error){e.preventDefault();notice.textContent=error.message;notice.scrollIntoView({block:'center'});}
});
root.addEventListener('wpff:notice',e=>{if(notice)notice.textContent=e.detail.join(' ');});
root.addEventListener('wpff:ready',e=>{const summary=root.querySelector('.wpff-pdf-summary');if(summary&&e.detail.pageCount)summary.textContent=e.detail.pageCount+' PDF pages · '+(effects.find(x=>x[0]===c.pdfEffect)?.[1]||'Flipbook');});
render();
