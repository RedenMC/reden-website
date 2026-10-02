'use strict';
const assert=require('node:assert/strict');
global.SlimeStructures=require('./structures.js');
const F=require('./flowers.js'),createEngine=require('./structure_engine.js');
const key=r=>r&&[r.distance4,r.area,r.y,r.minZ,r.minX];
const better=(a,b)=>!b||key(a).some((v,i)=>v<key(b)[i]&&key(a).slice(0,i).every((q,j)=>q===key(b)[j]));
function brute(grid,w,h,required,o){
  let best=null;
  for(let top=0;top<o.anchorHeight;top++)for(let bottom=top;bottom<Math.min(h,top+o.maxHeight);bottom++)
    for(let left=0;left<o.anchorWidth;left++)for(let right=left;right<Math.min(w,left+o.maxWidth);right++){
      let mask=0;for(let z=top;z<=bottom;z++)for(let x=left;x<=right;x++){const k=grid[z*w+x];if(k)mask|=1<<(k-1);}
      if((mask&required)!==required)continue;
      const minX=o.minX+left,minZ=o.minZ+top,maxX=o.minX+right,maxZ=o.minZ+bottom;
      const r={minX,minZ,maxX,maxZ,y:o.y,distance4:(minX+maxX-2*(o.centerX??0))**2+(minZ+maxZ-2*(o.centerZ??0))**2,area:(right-left+1)*(bottom-top+1)};
      if(better(r,best))best=r;
    }
  return best;
}
let random=1;
for(let t=0;t<400;t++){
  const w=5,h=4,grid=Uint8Array.from({length:w*h},()=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random%4;});
  const o={minX:t%9-5,minZ:t%7-3,centerX:t%3?t%11-5:0,centerZ:t%3?t%13-6:0,y:64,maxWidth:1+t%5,maxHeight:1+t%4,anchorWidth:1+t%5,anchorHeight:1+(t*3)%4};
  assert.deepEqual(key(F.nearestRectangle(grid,w,h,7,o)),key(brute(grid,w,h,7,o)),JSON.stringify(o));
}
function fakeEngine(cells){
  let box,layer;
  const mask=y=>{let result=0;for(let z=0;z<box.h;z++)for(let x=0;x<box.w;x++){const k=cells.get([box.x+x,y,box.z+z].join(','));if(k)result|=1<<(k-1);}return result;};
  return {_structure_init:()=>1,_flower_prepare(x,z,w,h,yMin,yMax){box={x,z,w,h};let bits=0;for(let y=yMin;y<=yMax;y++)bits|=mask(y);return bits;},_flower_prepared_mask:mask,
    _flower_prepared_layer(y){layer=Uint8Array.from({length:box.w*box.h},(_,i)=>cells.get([box.x+i%box.w,y,box.z+Math.floor(i/box.w)].join(','))||0);return mask(y);},
    _flower_layer_word(i){let word=0;for(let k=0;k<4;k++)word|=(layer[4*i+k]||0)<<(8*k);return word;}};
}
(async()=>{
  const cells=new Map();for(let i=0;i<11;i++){cells.set([30+i,64,0].join(','),i+1);cells.set([-5+i,65,0].join(','),i+1);}
  const p={seed:'0',version:'1.21.10',range:64,yMin:64,yMax:65,maxWidth:11,maxHeight:1,mode:'forest'};
  const r=await F.search(fakeEngine(cells),p);assert(r.found);assert.equal(r.y,65);assert.equal(r.distance,0);assert.equal(r.area,11);assert.equal(r.minX,-5);assert(r.examples.every(Boolean));
  const moved=await F.search(fakeEngine(cells),{...p,centerX:35,centerZ:2});assert(moved.found);assert.equal(moved.y,64);assert.equal(moved.distance,2);assert.equal(moved.minX,30);
  const shiftedCells=new Map([...cells].map(([key,v])=>{const [x,y,z]=key.split(',').map(Number);return [[x-1007,y,z+2001].join(','),v];}));
  const shifted=await F.search(fakeEngine(shiftedCells),{...p,centerX:-1007,centerZ:2001});assert.equal(shifted.distance,0);assert.equal(shifted.y,65);assert.equal(shifted.minX,-1012);assert.equal(shifted.minZ,2001);
  const largest=await F.search(fakeEngine(cells),{...p,range:10800});assert(largest.found);assert.equal(largest.distance,0);assert.equal(largest.y,65);
  assert.equal((await F.search(fakeEngine(cells),{...p,yMax:64})).distance,35);
  assert.equal((await F.search(fakeEngine(cells),{...p,maxWidth:10})).found,false);
  await assert.rejects(F.search(fakeEngine(cells),{...p,range:10801}),/10800/);
  await assert.rejects(F.search(fakeEngine(cells),{...p,yMin:66}),/下限/);
  const e=await createEngine();let compared=0;
  for(const profile of [0,2,6,9,10,12])for(const [x,z,y] of [[-2691,-305,64],[-703,-5488,64],[-2928,-5776,64],[-5999,-6000,64],[31,-33,profile<=2?1:-61]]){
    e._structure_init(profile,0,0);const w=17,h=13,mask=e._flower_prepare(x,z,w,h,y,y+2);assert(mask>=0);
    for(let yy=y;yy<=y+2;yy++){
      const coarse=e._flower_prepared_mask(yy),actual=e._flower_prepared_layer(yy);assert.equal(actual&coarse,actual);assert.equal(actual&mask,actual);
      const grid=Uint8Array.from({length:w*h},(_,i)=>e._flower_layer_word(i>>2)>>>((i%4)*8)&255);
      for(let zz=0;zz<h;zz++){
        assert.equal(e._flower_scan_row(x,yy,z+zz,w),1);
        for(let xx=0;xx<w;xx++){assert.equal(grid[zz*w+xx],e._flower_result_word(xx>>2)>>>((xx%4)*8)&255,`${profile} ${x+xx} ${yy} ${z+zz}`);compared++;}
      }
    }
  }
  console.log(JSON.stringify({nearestRectangleOracle:400,crossTileAndYRange:'PASS',sizeAndRangeBounds:'PASS',cachedBiomeComparisons:compared}));
})().catch(e=>{console.error(e);process.exitCode=1;});
