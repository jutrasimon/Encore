// Source atlas is preserved unchanged. Each viewBox frames one transparent sticker.
const boxes={
 guitar:[31,10,254,289],voice:[348,15,212,282],pick:[627,55,228,227],
 boot:[31,299,255,261],lighter:[366,284,150,284],duck:[627,311,234,246],
 smoke:[55,561,215,289],cup:[362,555,178,281],refrain:[611,572,248,259],
 choir:[11,856,298,250],last:[351,834,191,294],solo:[609,827,259,301],
 note:[62,1116,201,293],pedal:[328,1131,228,264],encore:[618,1133,231,236],
 kamikaze:[13,1393,295,358],amp:[324,1430,251,289],feedback:[616,1413,251,317]
};
export function sticker(kind){const box=boxes[kind];return box?`<svg class="sticker" viewBox="${box.join(' ')}" aria-hidden="true" focusable="false"><image href="./art/punk-stickers-v1.png" width="887" height="1774"/></svg>`:'';}
