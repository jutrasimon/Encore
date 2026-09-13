import {tileDetails,tileColor} from './tile-ui.js?v=0.10.5';
let tip,owner,timer;
export function hideTooltip(){clearTimeout(timer);owner?.removeAttribute('aria-describedby');owner=null;if(tip){if(tip.matches(':popover-open'))tip.hidePopover();tip.remove();tip=null;}}
export function installTooltips(root,isBusy=()=>false){
 function show(el){if(!el||isBusy())return;hideTooltip();let tile;try{tile=JSON.parse(el.dataset.tile);}catch{return;}owner=el;tip=document.createElement('aside');tip.id='tile-tooltip';tip.className='punk-tooltip type-'+tileColor(tile);tip.setAttribute('role','tooltip');tip.setAttribute('popover','manual');tip.innerHTML='<span class="tooltip-tape">DANS LE VENTRE DE LA TUILE</span>'+tileDetails(tile,{resolved:el.dataset.resolved==='true'});document.body.append(tip);el.setAttribute('aria-describedby',tip.id);tip.showPopover();const r=el.getBoundingClientRect(),v=window.visualViewport,w=v?.width||innerWidth,h=v?.height||innerHeight,bounds=root.querySelector('.console')?.getBoundingClientRect()||{left:0,top:0,right:w,bottom:h};tip.style.maxWidth=Math.min(w-16,bounds.right-bounds.left-16)+'px';tip.style.maxHeight=Math.min(h-16,bounds.bottom-bounds.top-16)+'px';tip.style.overflowY='auto';const size=tip.getBoundingClientRect();tip.style.left=Math.max(bounds.left+8,Math.min(bounds.right-size.width-8,r.left+r.width/2-size.width/2))+'px';tip.style.top=Math.max(bounds.top+8,Math.min(bounds.bottom-size.height-8,r.top>=size.height+bounds.top+12?r.top-size.height-10:r.bottom+10))+'px';}
 root.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const el=e.target.closest('[data-tile]');if(!el||el===owner)return;clearTimeout(timer);timer=setTimeout(()=>show(el),160);});
 root.addEventListener('pointerout',e=>{const el=e.target.closest('[data-tile]');if(el&&!el.contains(e.relatedTarget)&&!tip?.contains(e.relatedTarget))hideTooltip();});
 root.addEventListener('focusin',e=>{const el=e.target.closest('[data-tile]');if(el)show(el);});
 root.addEventListener('focusout',hideTooltip);
 root.addEventListener('click',hideTooltip,true);
 root.addEventListener('click',e=>{const el=e.target.closest('[data-action=starter-tooltip]');if(el)show(el);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTooltip();});
 document.addEventListener('scroll',e=>{if(!tip?.contains(e.target))hideTooltip();},true);
 window.addEventListener('resize',hideTooltip);
 document.addEventListener('pointermove',e=>{if(owner&&!owner.contains(e.target)&&!tip?.contains(e.target))hideTooltip();});
}
