'use strict';
const assert=require('node:assert/strict');
const createEngine=require('./structure_engine.js');
global.SlimeStructures=require('./structures.js');
const flowers=require('./flowers.js');

function brute(grid,w,h,required){
  let best=null;
  for(let top=0;top<h;top++)for(let bottom=top;bottom<h;bottom++)
    for(let left=0;left<w;left++)for(let right=left;right<w;right++){
      let mask=0;for(let z=top;z<=bottom;z++)for(let x=left;x<=right;x++){
        const kind=grid[z*w+x];if(kind)mask|=1<<(kind-1);
      }
      if((mask&required)!==required)continue;
      const area=(bottom-top+1)*(right-left+1);
      if(!best||area<best.area||area===best.area&&(top<best.top||top===best.top&&left<best.left))best={area,top,bottom,left,right};
    }
  return best;
}

(async()=>{
  let state=1;
  for(let sample=0;sample<70;sample++){
    const w=5,h=4,grid=new Uint8Array(w*h);
    for(let i=0;i<grid.length;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;grid[i]=state%13;}
    for(const mask of [flowers.MASK_FOREST,flowers.MASK_ALL,(1<<15)-1]){
      const expected=brute(grid,w,h,mask),actual=flowers.minimumRectangle(grid,w,h,mask);
      assert.equal(actual.found,!!expected);
      if(expected)for(const key of ['area','top','bottom','left','right'])assert.equal(actual[key],expected[key],key);
    }
  }
  const complete=new Uint8Array(Array.from({length:15},(_,i)=>i+1));
  assert.equal(flowers.minimumRectangle(complete,15,1,(1<<15)-1).area,15);
  assert.deepEqual(flowers.modesFor('1.19.4').map(m=>m.count),[11,12]);
  assert.deepEqual(flowers.modesFor('1.20.6').map(m=>m.count),[11,12,13]);
  assert.deepEqual(flowers.modesFor('1.21.4').map(m=>m.count),[11,12,13,14]);
  assert.deepEqual(flowers.modesFor('1.21.10').map(m=>m.count),[11,12,13,14,15]);
  const engine=await createEngine();
  assert.equal(engine._structure_init(0,0,0),1);
  for(const [x,z,kind] of [[0,0,6],[1,1,6],[-100,230,9],[1024,-2048,7],[-512,-1000,11],[42,21,4]])
    assert.equal(engine._flower_noise_at(x,64,z),kind,`legacy ${x},${z}`);
  assert.equal(engine._flower_noise_at(0,64,0),engine._flower_noise_at(0,100,0),'legacy pattern is 2D');
  assert.equal(engine._structure_init(12,0,0),1);
  assert.notEqual(engine._flower_noise_at(0,64,0),engine._flower_noise_at(0,100,0),'modern pattern includes Y');
  const modern=engine._flower_noise_at(-1270,64,-4700);
  assert.equal(engine._structure_init(12,1,0),1);
  assert.equal(engine._flower_noise_at(-1270,64,-4700),modern,'flower pattern must not depend on world seed');
  assert.equal(engine._structure_init(12,0,0),1);
  assert.equal(engine._flower_biome_at(-1096,64,-4936),132);
  assert.equal(engine._flower_scan_row(-1096,64,-4936,1),1);
  assert.equal(engine._flower_result_word(0)&255,engine._flower_noise_at(-1096,64,-4936));
  for(const [profile,x,z,kind] of [[6,-703,-5488,13],[9,-2928,-5776,14],[10,-5999,-6000,15]]){
    assert.equal(engine._structure_init(profile,0,0),1);assert.equal(engine._flower_scan_row(x,64,z,1),1);
    assert.equal(engine._flower_result_word(0)&255,kind);
    assert.equal(engine._structure_init(profile-1,0,0),1);assert.equal(engine._flower_scan_row(x,64,z,1),1);
    assert.notEqual(engine._flower_result_word(0)&255,kind);
  }
  const found=await flowers.search(engine,{seed:'0',version:'1.21.10',centerX:-2672,centerZ:-296,range:128,y:64,mode:'forest'});
  assert.equal(found.found,true);assert(found.width<=128&&found.height<=128);assert.equal(found.examples.length,11);
  const all=await flowers.search(engine,{seed:'0',version:'1.21.10',centerX:-2672,centerZ:-296,range:512,y:64,mode:'classic',maxWidth:512,maxHeight:512});
  assert.equal(all.found,true);assert.equal(all.examples.length,12);
  assert.equal(all.examples[11].name,'蓝色兰花');
  const absent=await flowers.search(engine,{seed:'0',version:'1.21.10',centerX:0,centerZ:0,range:16,y:64,mode:'classic'});
  assert.equal(absent.found,false);assert.ok(absent.missing.includes('蓝色兰花'));
  console.log('flower tests passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
