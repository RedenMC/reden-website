'use strict';
const assert=require('node:assert/strict'),Farm=require('./core.js');
global.SlimeFarm=Farm;
const Compute=require('./browser_compute.js');
const clean=r=>{const {elapsedMs,execution,...rest}=r;return rest;};
function feed(seed,range,shape,rows,biomes=null,centerX=17,centerZ=-19,target='slime'){
 const scan=Farm.chunkRowScan(seed,range,target,shape,biomes,centerX,centerZ),b=scan.bounds;
 for(let z=b.zmin;z<=b.zmax;z+=rows)scan.consume(Farm.makeGrid(seed,b.cmin,b.cmax,()=>{},z,Math.min(b.zmax,z+rows-1)));
 return scan.finish();
}
async function main(){
 let comparisons=0;
 for(const seed of ['0','-1','9007199254740993'])for(const range of [1,80,257])for(const shape of ['square','rectangle'])for(const rows of [1,3,16]){
  assert.deepEqual(clean(feed(seed,range,shape,rows)),clean(Farm.searchChunkCluster(seed,range,'slime',shape,()=>{},null,17,-19)));comparisons++;
 }
 const chunks=new Map(),b=Farm.searchBounds(257,17,-19);
 for(let z=b.zmin;z<=b.zmax;z++)for(let x=b.cmin;x<=b.cmax;x++)if((x+z)%5)chunks.set(x+','+z,new Uint8Array(16).fill((x-z)%3?1:0));
 const biomes={chunks,category:'desert',y:64};
 for(const shape of ['square','rectangle'])assert.deepEqual(clean(feed('0',257,shape,3,biomes,17,-19,'nonSlime')),clean(Farm.searchChunkCluster('0',257,'nonSlime',shape,()=>{},biomes,17,-19)));
 for(const shape of ['square','rectangle']){
  const params={seed:'0',range:4000,target:'slime',shape,centerX:17,centerZ:-19,compute:'cpu'};
  const actual=await Compute.run('cluster',params);
  assert.deepEqual(clean(actual),clean(Farm.searchChunkCluster('0',4000,'slime',shape,()=>{},null,17,-19)));
  assert.equal(actual.execution.strategy,'row-stream');assert(actual.execution.peakGridCells<actual.gridChunks);
 }
 const whole=Farm.chunkRowScan('0',Farm.MAX_STREAM_RANGE,'slime','rectangle');
 assert(whole.stateBytes<32*1024*1024);assert.throws(()=>whole.finish(),/尚未完成/);
 assert.throws(()=>whole.consume({grid:new Uint8Array(1),n:1,h:1,minChunk:0,maxChunk:0,minChunkZ:0}),/顺序/);
 assert.throws(()=>Farm.chunkRowScan('0',Farm.MAX_STREAM_RANGE,'slime','square',null,1,0),/范围/);
 assert.throws(()=>Farm.chunkRowScan('0',10,'slime','tShape'),/仅支持/);
 // Cross the former Uint16 height limit without storing a tall grid.
 const tall=Farm.chunkRowScan('0',560000,'slime','rectangle'),tb=tall.bounds;
 const line=new Uint8Array(tall.n);line[0]=1;
 for(let z=tb.zmin;z<=tb.zmax;z++)tall.consume({grid:line,n:tall.n,h:1,minChunk:tb.cmin,maxChunk:tb.cmax,minChunkZ:z});
 const result=tall.finish();assert.equal(result.height,tall.h);assert(result.height>65535);assert.equal(result.width,1);
 console.log(JSON.stringify({streamGridComparisons:comparisons,biomeAndBatchBoundaries:'PASS',wholeWorldStateBytes:whole.stateBytes,heightOverflow:'PASS'}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
