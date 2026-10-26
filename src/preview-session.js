// One editor-owned PDF session. Never persisted in WordPress configuration.
export function createPreviewSession(){
 let entry=null;
 function clear(){
  const old=entry;entry=null;
  if(!old)return;
  old.closed=true;old.pages.clear();
  for(const task of old.renders)task.cancel();
  Promise.resolve(old.loading.destroy()).catch(()=>{});
 }
 function document(url,create){
  if(entry?.url===url)return entry;
  clear();
  const loading=create();
  const next={url,loading,closed:false,pages:new Map(),renders:new Set(),bytes:0};
  next.promise=loading.promise.catch(error=>{if(entry===next)clear();throw error;});
  entry=next;return next;
 }
 async function page(resource,index){
  if(resource.closed)throw new Error('PDF preview replaced');
  let item=resource.pages.get(index);
  if(item){resource.pages.delete(index);resource.pages.set(index,item);return item.promise;}
  item={bytes:0};
  item.promise=(async()=>{
   const doc=await resource.promise;
   const pdfPage=await doc.getPage(index+1);
   if(resource.closed)throw new Error('PDF preview replaced');
   const size=pdfPage.getViewport({scale:1});
   const viewport=pdfPage.getViewport({scale:Math.min(2,1400/size.height,1100/size.width)});
   const canvas=globalThis.document.createElement('canvas');
   canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
   const render=pdfPage.render({canvasContext:canvas.getContext('2d'),viewport});
   resource.renders.add(render);
   try{await render.promise;}finally{resource.renders.delete(render);}
   if(resource.closed)throw new Error('PDF preview replaced');
   item.bytes=canvas.width*canvas.height*4;resource.bytes+=item.bytes;
   for(const [key,cached] of resource.pages){
    if(resource.pages.size<=12&&resource.bytes<=48*1024*1024)break;
    if(key!==index&&cached.bytes){resource.pages.delete(key);resource.bytes-=cached.bytes;}
   }
   return canvas;
  })().catch(error=>{resource.pages.delete(index);throw error;});
  resource.pages.set(index,item);return item.promise;
 }
 return {document,page,clear};
}
