'use strict';
const assert=require('node:assert/strict'),S=require('./core.js'),T=require('./structures.js');
const noop=()=>{};
// Independent block-by-block annulus oracle, with absolute seed coordinates.
function brute(seed,r,cx,cz,excluded=false){
  const width=2*(r+128)+1,x0=cx-r-128,z0=cz-r-128,cache=new Map(),cells=new Uint8Array(width*width);
  const darkX=Math.floor(cx/16)+3,darkZ=Math.floor(cz/16);
  for(let z=0;z<width;z++)for(let x=0;x<width;x++){
    const a=Math.floor((x0+x)/16),b=Math.floor((z0+z)/16),key=a+','+b;
    if(!cache.has(key))cache.set(key,S.isSlime(seed,a,b));
    cells[z*width+x]=cache.get(key)&&!(excluded&&a===darkX&&b===darkZ)?1:0;
  }
  const offsets=[];for(let dz=-128;dz<=128;dz++)for(let dx=-128;dx<=128;dx++)if(dx*dx+dz*dz>576&&dx*dx+dz*dz<=16384)offsets.push(dz*width+dx);
  let max=null,min=null;
  const better=(a,b,sign)=>!b||sign*a.score>sign*b.score||a.score===b.score&&(a.d<b.d||a.d===b.d&&(a.x<b.x||a.x===b.x&&a.z<b.z));
  for(let z=cz-r;z<=cz+r;z++)for(let x=cx-r;x<=cx+r;x++){
    const base=(z-z0)*width+x-x0;let score=0;for(const offset of offsets)score+=cells[base+offset];
    const a={x,z,score,d:(x+.5-cx)**2+(z+.5-cz)**2};if(better(a,max,1))max=a;if(better(a,min,-1))min=a;
  }
  return {max,min,darkX,darkZ};
}
const strip=r=>[r.x,r.z,r.score??r.slimeArea];
for(const [seed,r,cx,cz] of [['0',3,1000,-2007],['-1',17,-15,33],['3',9,32,-65],['0',1,29998000,-29998001]]){
  const expected=brute(seed,r,cx,cz),actual=S.search(seed,r,noop,null,1,cx,cz);
  assert.deepEqual(strip(actual),strip(expected.max));assert.equal(actual.centerX,cx);assert.equal(actual.centerZ,cz);
  for(let z=0;z<actual.gridH;z++)for(let x=0;x<actual.gridN;x++)assert.equal(!!actual.grid[z*actual.gridN+x],S.isSlime(seed,actual.gridMin+x,actual.gridMinZ+z));
  const chunks=new Map();for(let z=Math.floor((cz-r-144)/16);z<=Math.floor((cz+r+144)/16);z++)for(let x=Math.floor((cx-r-144)/16);x<=Math.floor((cx+r+144)/16);x++)chunks.set(x+','+z,new Uint8Array(16).fill(3));
  const least=S.searchLeastSlime(seed,r,noop,{category:'other',y:64,chunks},cx,cz);assert.deepEqual(strip(least),strip(expected.min));
  const dark=brute(seed,r,cx,cz,true);chunks.set(dark.darkX+','+dark.darkZ,new Uint8Array(16).fill(1));
  assert.deepEqual(strip(S.search(seed,r,noop,{y:1,chunks},1,cx,cz)),strip(dark.max));
}
// Geometry is invariant when the search centre and saved boxes move together.
const boxes=[[-19,64,-4,-13,70,4],[40,64,-4,46,70,4],[900,64,900,906,70,908]];
for(const type of ['hut','monument'])for(const [cx,cz] of [[1001,-2007],[-32000,45001]]){
  const shifted=boxes.map(b=>b.map((v,i)=>v+(i===0||i===3?cx:i===2||i===5?cz:0)));
  const a=T.searchSaved(boxes,'0','1.21.10',64,type),b=T.searchSaved(shifted,'0','1.21.10',64,type,noop,cx,cz);
  assert.equal(a.count,b.count);assert.deepEqual([b.x-cx,b.y,b.z-cz],[a.x,a.y,a.z]);assert.equal(a.distanceToCenter,b.distanceToCenter);
  assert.deepEqual(b.structures,shifted.slice(0,2));assert.equal(b.structureCount,2);
}
for(const fn of [()=>S.search('0',10,noop,null,1,.5,0),()=>S.searchLeastSlime('0',10,noop,null,0,29999000),()=>S.searchChunkCluster('0',10,'slime','square',noop,null,NaN,0)])assert.throws(fn,/整数|边界/);
(async()=>{
  // Actual seed scans: compare a wide origin search against its translated narrow window.
  const engine=await require('./structure_engine.js')();
  for(const type of ['hut','monument']){
    const wide=await T.search(engine,'0','1.21.10',4000,type),cx=wide.x,cz=wide.z;
    const near=await T.search(engine,'0','1.21.10',17,type,noop,cx,cz);
    assert(near.found);assert(near.count>=wide.count);assert(Math.abs(near.x-cx)<=17&&Math.abs(near.z-cz)<=17);
    for(const box of near.structures)assert(T.feasibleIntervals(box,near.y,near.z,108000).some(([a,b])=>near.x>=a&&near.x<=b));
  }
  console.log('PASS: nonzero, negative, non-chunk-aligned and distant centres; farm/annulus independent block oracle; imported biome exclusions; saved and real-seed structures; invalid centres.');
})().catch(e=>{console.error(e);process.exitCode=1;});
