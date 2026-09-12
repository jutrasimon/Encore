import {StatIcon} from './stat-icon.js?v=0.10.1';
// Compact, code-native functional symbols; all names remain visible alongside them.
const paths={
 charge:'M8 3V1h8v2M6 3h12v19H6zM9 8h6m-3-3v6M9 16h6',
 focus:'M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
 info:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M12 11v6m0-10v.1',
 settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
 guitar:'M13 3l8 8m-5-8 5 5M15 6 8 13m4-3-2-1-3 1-1 3-3 1-1 4 4 4 4-1 1-3 3-1 1-3-1-2M7 16h.01',
 mic:'M15 3a4 4 0 0 1 6 6l-5 5-6-6zM11 9l4 4-9 9-4-4zM13 5l6 6',
 pick:'M3 7c0-6 18-6 18 0 0 7-7 15-9 15S3 14 3 7zM9 7h6',
 boot:'M5 3h8v10l7 3v5H3v-9h2zM5 6h5M5 9h5M3 18h17',
 flame:'M12 2c2 6 8 8 8 13a8 8 0 0 1-16 0c0-4 3-6 4-8 0 5 3 4 4-5zM12 14l-2 4h4z',
 duck:'M16 4a4 4 0 0 1 4 4l3 1-4 2v4c0 5-7 8-12 5-4-2-5-6-4-9l7 2 3-3a4 4 0 0 1 3-6zM17 7h.01M6 15l4 2',
 cloud:'M6 19a5 5 0 0 1-1-10 7 7 0 0 1 13-2 6 6 0 0 1 0 12zM7 22h2m5 0h3',
 cup:'M4 7h16l-3 15H7zM3 7h18M9 7l2-5h6M9 12h6',
 worm:'M4 4c8-7 18 3 10 9s-14-1-8-4 18 1 12 11M6 4h.01',
 choir:'M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6M4 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4M20 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4M7 21v-7a5 5 0 0 1 10 0v7M1 21v-5h4m14 0h4v5',
 note:'M9 18V5l11-3v13M9 8l11-3M9 18c0 4-7 4-7 1s7-4 7-1M20 15c0 4-7 4-7 1s7-4 7-1',
 pedal:'M5 3h14v19H5zM8 13h8v6H8zM9 7h.01M15 7h.01',
 repeat:'M20 8A9 9 0 0 0 4 6L2 9m0-6v6h6M4 16a9 9 0 0 0 16 2l2-3m0 6v-6h-6',
 bomb:'M18 8a8 8 0 1 1-3-2l2-3 3 3zM19 3l2-2M7 12l2-2',
 amp:'M3 3h18v19H3zM3 8h18M7 5h.01M11 5h.01M12 11a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
 bolt:'M13 2 3 14h8l-1 8 11-14h-8z',
 bag:'M4 8h16v14H4zM8 8V3h8v5M4 13h16M10 12v4h4v-4',
 star:'m12 2 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z',
 user:'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M4 22v-3a8 8 0 0 1 16 0v3',
 sound:'M3 9h4l5-5v16l-5-5H3zM16 8c3 2 3 6 0 8M19 4c6 5 6 11 0 16',
 empty:'M6 12h12',close:'M5 5l14 14M19 5 5 19',arrow:'M5 12h14m-6-6 6 6-6 6'
};
export function icon(name){const stat={star:'quality',bolt:'energy',choir:'fans'}[name];if(stat)return StatIcon(stat,20,'currentColor');return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="${paths[name]||paths.star}"/></svg>`;}
