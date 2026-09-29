// Preserve live controls, focus and scroll positions when only state changes.
const anchors=['console','grid-wrap','grid','meters','bandmates','navigation','choice-detail','tile-gallery','resolution-top','resolution-tally','resolution-caption'];
const key=node=>node.nodeType===1?(node.id||['data-screen','data-stat','data-charge','data-scroll'].map(k=>node.hasAttribute(k)?k+':'+node.getAttribute(k):'').find(Boolean)||(node.dataset.action?['action',node.dataset.action,node.dataset.id||node.dataset.kind||node.dataset.index||node.dataset.view||''].join(':'):'')||anchors.find(k=>node.classList.contains(k))||''):'';
const compatible=(a,b)=>a.nodeType===b.nodeType&&a.nodeName===b.nodeName&&key(a)===key(b);
function patch(current,next){
 if(current.nodeType!==1){if(current.nodeValue!==next.nodeValue)current.nodeValue=next.nodeValue;return;}
 for(const attribute of [...current.attributes])if(!next.hasAttribute(attribute.name))current.removeAttribute(attribute.name);
 for(const attribute of next.attributes)if(current.getAttribute(attribute.name)!==attribute.value)current.setAttribute(attribute.name,attribute.value);
 const remaining=[...current.childNodes];let cursor=current.firstChild;
 for(const child of [...next.childNodes]){
  const match=remaining.find(node=>compatible(node,child));
  if(match){remaining.splice(remaining.indexOf(match),1);if(match!==cursor)current.insertBefore(match,cursor);patch(match,child);cursor=match.nextSibling;}
  else{const added=child.cloneNode(true);current.insertBefore(added,cursor);}
 }
 remaining.forEach(node=>node.remove());
}
export function mountScreen(root,html,preserveDialog=false){
 const template=root.cloneNode(false);template.innerHTML=html;
 // Dialogs are restored by the app, including their current inspection content.
 const dialog=root.querySelector('#details');
 if(preserveDialog&&dialog?.open)template.querySelector('#details').replaceWith(dialog.cloneNode(true));
 else dialog?.remove();
 patch(root,template);
}

export class ScreenMotion{
 constructor(root,enabled){this.root=root;this.enabled=enabled;this.key=null;this.animations=[];}
 capture(key){
  const changed=this.key!==key;this.key=key;
  if(!changed)return null;
  this.animations.forEach(a=>a.cancel());this.animations=[];
  const board=this.root.querySelector('.grid-wrap');
  return {board:board?.getBoundingClientRect(),tiles:board?.textContent};
 }
 settle(before){
  if(this.root.querySelector('.resolution-mode')||!before||!this.enabled()||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const animate=(node,frames,duration=240)=>{if(node?.animate)this.animations.push(node.animate(frames,{duration,easing:'cubic-bezier(.2,.75,.25,1)'}));};
  const body=this.root.querySelector('.screen-body');
  const board=this.root.querySelector('.grid-wrap'),r=board?.getBoundingClientRect(),old=before.board;
  const shared=r?.width&&old?.width&&before.tiles===board.textContent;
  if(shared){for(const child of body.children)if(child!==board)animate(child,[{opacity:.4},{opacity:1}]);}
  else animate(body,[{opacity:.45,transform:'translateY(7px)'},{opacity:1,transform:'none'}]);
  animate(this.root.querySelector('.action-slot'),[{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'none'}],280);
  if(shared){
   board.style.transformOrigin='top left';
   animate(board,[{transform:`translate(${old.x-r.x}px,${old.y-r.y}px) scale(${old.width/r.width},${old.height/r.height})`},{transform:'none'}],300);
  }
 }
}
