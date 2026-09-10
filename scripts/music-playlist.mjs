import {readdir,writeFile} from 'node:fs/promises';
const folder=new URL('../dist/audio/music/',import.meta.url);
const tracks=(await readdir(folder,{withFileTypes:true})).filter(f=>f.isFile()&&/\.(mp3|ogg|wav|m4a)$/i.test(f.name)).map(f=>f.name).sort();
await writeFile(new URL('../dist/music-playlist.js',import.meta.url),'// Generated from dist/audio/music/ at deployment.\nexport const PLAYLIST='+JSON.stringify(tracks)+';\n');
console.log(`Music playlist: ${tracks.length} track(s)`);
