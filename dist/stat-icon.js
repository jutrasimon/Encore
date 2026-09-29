// Original alpha masks, optically normalized in CSS. Labels stay available when used alone.
const labels={quality:'Qualité',energy:'Énergie',fans:'Fans'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function StatIcon(type,size=20,color='#fff3d3'){
 if(!labels[type])throw new TypeError('Unknown statistic: '+type);
 return `<span class="stat-icon stat-icon-${type}" role="img" aria-label="${labels[type]}" style="--stat-size:${Math.max(1,Number(size)||20)}px;--stat-color:${esc(color)}"></span>`;
}
