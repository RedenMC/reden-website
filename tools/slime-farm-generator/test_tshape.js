'use strict';
const assert=require('node:assert/strict');
const S=require('./core.js');

function isT(a,b){
  return a.minX<b.minX&&b.maxX<a.maxX&&(a.maxZ+1===b.minZ||b.maxZ+1===a.minZ)||
    a.minZ<b.minZ&&b.maxZ<a.maxZ&&(a.maxX+1===b.minX||b.maxX+1===a.minX);
}
const area=r=>(r.maxX-r.minX+1)*(r.maxZ-r.minZ+1);
function brute(grid,w,h){
  const rectangles=[];
  for(let minZ=0;minZ<h;minZ++)for(let maxZ=minZ;maxZ<h;maxZ++)
    for(let minX=0;minX<w;minX++)for(let maxX=minX;maxX<w;maxX++){
      let good=true;
      for(let z=minZ;z<=maxZ;z++)for(let x=minX;x<=maxX;x++)if(!grid[z*w+x])good=false;
      if(good)rectangles.push({minX,maxX,minZ,maxZ});
    }
  let best=null;
  for(const a of rectangles)for(const b of rectangles)if(isT(a,b)){
    const count=area(a)+area(b),minX=Math.min(a.minX,b.minX),minZ=Math.min(a.minZ,b.minZ);
    if(!best||count>best.count||count===best.count&&(minZ<best.minZ||minZ===best.minZ&&minX<best.minX))best={count,minX,minZ};
  }
  return best;
}
function check(grid,w,h){
  const expected=brute(grid,w,h),actual=S.findTShape(grid.slice(),w,h);
  assert.deepEqual(actual&&{count:actual.count,minX:actual.minX,minZ:actual.minZ},expected,JSON.stringify([...grid]));
  if(actual){
    assert(isT(...actual.rectangles));
    const seen=new Set();
    for(const r of actual.rectangles)for(let z=r.minZ;z<=r.maxZ;z++)for(let x=r.minX;x<=r.maxX;x++){
      assert.equal(grid[z*w+x],1);assert(!seen.has(z*w+x));seen.add(z*w+x);
    }
    assert.equal(seen.size,actual.count);
  }
  return actual;
}

for(let mask=0;mask<512;mask++)check(Uint8Array.from({length:9},(_,i)=>mask>>i&1),3,3);
let state=1;
for(let sample=0;sample<180;sample++){
  const w=4+sample%2,h=4,grid=Uint8Array.from({length:w*h},()=>{
    state=(Math.imul(state,1664525)+1013904223)>>>0;return state%100<(sample%3+1)*30?1:0;
  });
  check(grid,w,h);
}
for(const rows of [['111','010'],['010','111'],['10','11','10'],['01','11','01'],['1111111','0100000','0100000'],['1111111','1111111','0011100','0011100','0011100']]){
  const grid=Uint8Array.from(rows.join(''),Number),r=check(grid,rows[0].length,rows.length);
  assert.equal(r.count,grid.reduce((a,b)=>a+b,0),'complete T, including thick bars and stems');
}
assert.equal(check(Uint8Array.from([1,1,0,1]),2,2),null,'L is not T');
assert.equal(check(new Uint8Array(6).fill(1),6,1),null,'one rectangle does not count as a T');
assert.throws(()=>S.searchChunkCluster('0',64,'nonSlime','tShape'),/不支持/);
for(const [centerX,centerZ] of [[0,0],[31,-47],[-1007,2016]])for(const seed of ['0','-1','9007199254740993'])for(const range of [1,17,48,64]){
  const {grid,n,h,minChunk,minChunkZ}=S.makeGrid(seed,Math.floor((centerX-range)/16),Math.floor((centerX+range)/16),()=>{},Math.floor((centerZ-range)/16),Math.floor((centerZ+range)/16));
  const expected=brute(grid,n,h),actual=S.searchChunkCluster(seed,range,'slime','tShape',()=>{},null,centerX,centerZ);
  assert.equal(actual.found,!!expected);
  if(expected){
    assert.equal(actual.count,expected.count);assert.equal(actual.chunks.minX,expected.minX+minChunk);assert.equal(actual.chunks.minZ,expected.minZ+minChunkZ);
    assert.equal(actual.coordinates.length,actual.count);assert.equal(new Set(actual.coordinates.map(String)).size,actual.count);
    assert(isT(...actual.rectangles));for(const [x,z] of actual.coordinates)assert(S.isSlime(seed,x,z));
  }
}
const full=S.searchChunkCluster('0',4000,'slime','tShape');
assert(full.found&&full.count>=4);assert(isT(...full.rectangles));
for(const [x,z] of full.coordinates)assert(S.isSlime('0',x,z));
console.log(JSON.stringify({exhaustive3x3:512,randomGrids:180,rotationsAndThickT:'PASS',seedComparisons:36,range4000:{count:full.count,chunks:full.chunks,elapsedMs:Math.round(full.elapsedMs)}}));
