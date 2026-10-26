const {registerBlockType}=wp.blocks;
const {createElement:h,useEffect,useState}=wp.element;
const {SelectControl,Placeholder,Spinner,Notice}=wp.components;
const {useBlockProps}=wp.blockEditor;
const {__}=wp.i18n;
registerBlockType('wp-flipflop/viewer',{
 apiVersion:3,title:__('Masum FlipFlop PDF Reader','masum-flipflop-pdf-reader'),description:__('Display a published PDF viewer.','masum-flipflop-pdf-reader'),icon:'book-alt',category:'media',
 attributes:{itemId:{type:'number',default:0}},
 edit({attributes,setAttributes}){
  const [items,setItems]=useState(null),[error,setError]=useState('');
  useEffect(()=>{let active=true;(async()=>{let all=[],page=1;while(true){const batch=await wp.apiFetch({path:'/wp/v2/wpff_item?status=publish&per_page=100&page='+page+'&_fields=id,title'});all.push(...batch);if(batch.length<100)break;page++;}if(active)setItems(all);})().catch(()=>{if(active)setError(__('Could not load items. Check your connection and reload the editor.','masum-flipflop-pdf-reader'));});return()=>{active=false;};},[]);
  return h('div',useBlockProps(),h(Placeholder,{icon:'book-alt',label:__('Masum FlipFlop PDF Reader','masum-flipflop-pdf-reader'),instructions:__('Choose a published PDF viewer.','masum-flipflop-pdf-reader')},
   error?h(Notice,{status:'error',isDismissible:false},error):items===null?h(Spinner):h(SelectControl,{label:__('Published item','masum-flipflop-pdf-reader'),value:attributes.itemId,options:[{label:__('Select an item…','masum-flipflop-pdf-reader'),value:0},...items.map(x=>({label:x.title.raw||x.title.rendered.replace(/<[^>]*>/g,''),value:x.id}))],onChange:value=>setAttributes({itemId:Number(value)})}),
   attributes.itemId?h('p',null,'[wp_flipflop id="'+attributes.itemId+'"]'):null,
   h('p',null,__('Create and preview items under Masum FlipFlop PDF Reader in the dashboard. The viewer appears on the published page.','masum-flipflop-pdf-reader'))));
 },save(){return null;}
});
