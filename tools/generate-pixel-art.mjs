// Original project pixel art. Each entry is a separate native 32x32 RGBA PNG.
import {mkdirSync,writeFileSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
const directory='public/assets/prototype';mkdirSync(directory,{recursive:true});
const definitions=new Map();
function art(name,paint){const rectangles=[];const r=(x,y,w,h,color)=>{if(![x,y,w,h].every(Number.isInteger)||x<0||y<0||x+w>32||y+h>32)throw Error(`Out of bounds: ${name}`);rectangles.push({x,y,w,h,color});};paint(r);definitions.set(name,rectangles);}
const palette={dirt:['#6f5740','#463629','#a0835c'],loose:['#55565d','#383f48','#7b7e86'],hard:['#414a53','#293641','#697883'],bedrock:['#303944','#202c36','#546270'],impenetrable:['#252d39','#18212b','#42505c']};
const floorPalette={dirt:'#4b4033',loose:'#41484e',hard:'#3b454d',bedrock:'#35404a',impenetrable:'#303a46'};
function shade(hex,delta){const n=parseInt(hex.slice(1),16);return '#'+[n>>>16,(n>>>8)&255,n&255].map(c=>Math.max(0,Math.min(255,c+delta)).toString(16).padStart(2,'0')).join('');}
for(const [material,[base,dark,light]]of Object.entries(palette)){
 art(`floor-${material}`,r=>{const floor=floorPalette[material];r(0,0,32,32,floor);for(let i=0;i<17;i++)r((i*13+3)%30,(i*7+5)%30,2,1,shade(floor,i%3===0?7:-7));r(0,31,32,1,shade(floor,-9));r(31,0,1,31,shade(floor,-9));});
 art(`wall-top-${material}`,r=>{r(0,0,32,32,base);r(0,0,32,2,light);r(0,2,2,29,light);r(0,30,32,2,dark);r(30,2,2,28,dark);for(let i=0;i<14;i++)r(3+(i*7)%25,3+(i*11)%25,2,1,i%2?light:dark);r(19,8,1,8,dark);r(16,15,4,1,dark);r(16,15,1,5,dark);});
 art(`wall-side-${material}`,r=>{r(0,0,32,32,dark);r(0,0,32,2,light);for(const y of [8,18,28]){r(1,y,30,1,base);r(y%3===0?10:22,y-5,1,5,base);}r(0,31,32,1,'#15212a');r(2,3,27,1,base);});
}
art('floor-grass',r=>{r(0,0,32,32,'#354d3e');for(let i=0;i<22;i++)r((i*11+3)%30,(i*13+4)%30,1,2,i%2?'#4e694c':'#2b3f36');r(0,31,32,1,'#293c32');});
for(const [name,coat]of [['nib','#8b614e'],['moss','#4f8580'],['grub','#ac8d50'],['pip','#79628f']])art(`goblin-${name}`,r=>{
 r(8,28,18,3,'#151e25');r(9,24,5,5,'#44352f');r(20,24,5,5,'#44352f');r(9,16,15,10,coat);r(7,18,4,7,'#83a75e');r(23,18,4,6,'#83a75e');r(9,6,15,13,'#8caf67');r(4,7,6,5,'#8caf67');r(24,7,6,5,'#8caf67');r(6,8,4,2,'#b0c47f');r(24,8,4,2,'#b0c47f');r(12,5,10,3,'#bec17c');r(11,10,4,4,'#e5dcb9');r(20,10,4,4,'#e5dcb9');r(13,11,2,3,'#212c26');r(20,11,2,3,'#212c26');r(15,14,6,3,'#698c51');r(14,18,7,1,'#344c35');r(10,24,14,2,'#5a473b');r(16,24,3,2,'#d6b569');
});
function mushroom(r,x,y,color){r(x+3,y+6,3,7,'#ccc9a2');r(x+1,y+2,8,5,color);r(x,y+5,10,3,color);r(x+3,y+2,2,1,'#d2e2be');r(x+1,y+8,8,1,'#426d61');}
art('plant-tree',r=>{r(7,29,19,2,'#1e312b');r(14,14,5,16,'#78583d');r(15,18,2,10,'#b28b55');r(8,2,15,5,'#6a8c58');r(4,6,24,9,'#53754d');r(2,13,28,9,'#43684a');r(6,21,21,4,'#35553f');r(8,7,7,2,'#83a466');r(4,15,6,2,'#63875a');r(23,12,5,4,'#35553f');});
art('plant-mushroom',r=>{mushroom(r,11,14,'#81bca7');r(8,29,18,2,'#263a33');});
art('plant-grove',r=>{mushroom(r,2,13,'#83bba5');mushroom(r,19,13,'#83bba5');mushroom(r,10,8,'#a7d8b5');});
art('plant-undergrowth',r=>{for(const x of [5,15,24]){r(x,17,2,13,'#38573d');r(x-3,20,3,2,'#6c8a54');r(x+2,22,4,2,'#83a366');r(x-4,25,4,2,'#597e4e');r(x+2,27,4,2,'#6c8a54');}});
for(const ripe of [false,true])art(`plant-farm-${ripe?'ripe':'young'}`,r=>{r(1,15,30,16,'#5a5840');r(2,17,28,1,'#797052');for(const [x,y]of [[2,17],[12,ripe?12:19],[21,17]])mushroom(r,x,y,ripe?'#c8e8a0':'#739f88');});
const table=Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc(bytes){let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function chunk(name,data){const type=Buffer.from(name),length=Buffer.alloc(4),checksum=Buffer.alloc(4);length.writeUInt32BE(data.length);checksum.writeUInt32BE(crc(Buffer.concat([type,data])));return Buffer.concat([length,type,data,checksum]);}
for(const [name,rects]of definitions){const pixels=Buffer.alloc(32*32*4);for(const {x,y,w,h,color}of rects){const rgb=parseInt(color.slice(1),16);for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){const p=(j*32+i)*4;pixels[p]=rgb>>>16;pixels[p+1]=(rgb>>>8)&255;pixels[p+2]=rgb&255;pixels[p+3]=255;}}
 const scanlines=Buffer.alloc(32*(32*4+1));for(let y=0;y<32;y++)pixels.copy(scanlines,y*129+1,y*128,(y+1)*128);const header=Buffer.alloc(13);header.writeUInt32BE(32,0);header.writeUInt32BE(32,4);header[8]=8;header[9]=6;writeFileSync(`${directory}/${name}.png`,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(scanlines)),chunk('IEND',Buffer.alloc(0))]));}
writeFileSync(`${directory}/manifest.json`,JSON.stringify({tileSize:32,assets:[...definitions.keys()].map(id=>({id,file:`${id}.png`,width:32,height:32})),provenance:'Original procedural pixel art for Goblin Grotto; see ASSETS-LICENSE.md.'},null,2)+'\n');
writeFileSync('public/art-preview.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Goblin Grotto — 32×32 art</title><style>body{font:14px system-ui;background:#142125;color:#d4dec9;padding:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px}figure{margin:0;padding:16px;background:#253438;border:1px solid #43584b}img{width:96px;height:96px;image-rendering:pixelated;background:repeating-conic-gradient(#293c3e 0% 25%,#1c2c2d 0% 50%) 50% / 16px 16px}figcaption{margin-top:10px;font-size:12px}</style></head><body><h1>32×32 native pixel art</h1><p>Each floor, wall top, wall side, goblin and plant is a separate 32×32 PNG. Shown at 3× here. The goblins below are legacy placeholders; the live game uses the <a href="goblin-preview.html">owner-supplied directional base</a>.</p><main>${[...definitions.keys()].map(id=>`<figure><img src="assets/prototype/${id}.png" width="32" height="32" alt="${id}"><figcaption>${id}<br>32×32 px</figcaption></figure>`).join('')}</main></body></html>`);
console.log(`Generated ${definitions.size} original 32×32 sprites.`);
