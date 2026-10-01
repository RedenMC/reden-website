'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context=vm.createContext({console,performance,Uint8Array,Uint16Array,Uint32Array,BigInt,Map,Set});
for(const file of ['core.js','browser_compute.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),context);
async function main(){
 const run=(code)=>vm.runInContext(code,context);
 for(const kind of ['farm','cluster']){
  const params={seed:'-1',range:16384,centerX:17,centerZ:-19,target:'slime',shape:'rectangle'};
  context.params=params;context.kind=kind;
  const cpu=await run('SlimeLocalCompute.run(kind,{...params,compute:"cpu"})');
  const auto=await run('SlimeLocalCompute.run(kind,{...params,compute:"auto"})');
  assert.equal(cpu.execution.backend,'cpu');assert.equal(auto.execution.backend,'cpu');assert.match(auto.execution.fallbackReason,/WebGPU/);
  const clean=r=>{const {elapsedMs,execution,...rest}=r;return rest;};assert.deepEqual(clean(cpu),clean(auto));
  await assert.rejects(run('SlimeLocalCompute.run(kind,{...params,compute:"gpu"})'),/WebGPU/);
 }
 await assert.rejects(run('SlimeLocalCompute.run("farm",{seed:"0",range:108001})'),/范围/);
 await assert.rejects(run('SlimeLocalCompute.run("farm",{seed:"0",range:10,centerX:29999000})'),/范围/);
 assert.throws(()=>run('SlimeFarm.withGrid({seed:"0"},()=>SlimeFarm.makeGrid("1",0,1))'),/不一致/);
 assert.equal(run('SlimeFarm.makeGrid("1",0,1).grid.length'),4);
 for(const file of ['browser_compute.js','core.js'])assert.doesNotMatch(fs.readFileSync(__dirname+'/'+file,'utf8'),/\bfetch\s*\(|XMLHttpRequest|WebSocket/);
 console.log('PASS CPU/automatic fallback equivalence; forced GPU error; bounds; stale grid cleanup; no network APIs');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
