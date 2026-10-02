'use strict';
// DOM execution with canvas/resize stubs and Node workers. This is not a browser test.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {Worker}=require('node:worker_threads');
const {JSDOM,VirtualConsole}=require(process.env.JSDOM_MODULE||'jsdom');
const file=process.argv.find(v=>v.endsWith('.html'))||path.join(__dirname,'../生电农场专用投影生成器.html');
const errors=[],workers=new Set(),sent=[],virtualConsole=new VirtualConsole();
virtualConsole.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync(file,'utf8'),{runScripts:'dangerously',virtualConsole,beforeParse(w){
  w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;
  w.ResizeObserver=class{observe(){} disconnect(){}};
  w.HTMLElement.prototype.getBoundingClientRect=()=>({x:0,y:0,width:800,height:500,top:0,left:0,right:800,bottom:500});
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({createImageData:(width,height)=>({data:new Uint8ClampedArray(width*height*4)})},{get:(obj,key)=>key in obj?obj[key]:()=>{},set:(obj,key,v)=>(obj[key]=v,true)});
  const blobs=new Map();let next=0;w.Blob=Blob;
  w.URL.createObjectURL=blob=>{const url='blob:test-'+next++;blobs.set(url,blob);return url;};
  w.URL.revokeObjectURL=url=>blobs.delete(url);
  w.Worker=class{
    constructor(url){
      this.ready=blobs.get(url).text().then(source=>{
        const worker=new Worker('const {parentPort}=require("node:worker_threads"); const self=globalThis; self.postMessage=d=>parentPort.postMessage(d); parentPort.on("message",data=>self.onmessage({data}));\n'+source,{eval:true});
        workers.add(worker);worker.on('message',data=>this.onmessage?.({data}));worker.on('error',e=>{errors.push(e.message);this.onerror?.({message:e.message,preventDefault(){}});});return worker;
      });
    }
    postMessage(data){sent.push(data);this.ready.then(worker=>worker.postMessage(data));}
    terminate(){this.ready.then(worker=>{workers.delete(worker);worker.terminate();});}
  };
}});
const w=dom.window,$=id=>w.document.getElementById(id);
const change=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new w.Event('change',{bubbles:true}));};
async function until(predicate){const deadline=Date.now()+10000;while(!predicate()){assert(Date.now()<deadline,'UI result timeout');await new Promise(r=>setTimeout(r,10));}}
(async()=>{
  if(process.argv.includes('--expect-broken')){
    assert(errors.some(e=>e.includes('SlimeFlowers is not defined')),JSON.stringify(errors));
    assert.equal($('toolMode').onchange,null);assert.equal($('clusterSearchBtn').onclick,null);
    console.log('Reproduced original failure: SlimeFlowers is not defined; mode and search handlers were never attached.');return;
  }
  assert.deepEqual(errors,[],'whole-document startup');assert(w.SlimeFarmUI);
  for(const id of ['toolMode','flowerVersion','flowerMode'])assert.equal(typeof $(id).onchange,'function',id);
  for(const id of ['searchBtn','stopBtn','manualBtn','exportBtn','localBtn','overviewBtn','reportBtn','guideBtn','copyOriginBtn','pngBtn','clusterSearchBtn','structureSearchBtn','flowerSearchBtn'])assert.equal(typeof $(id).onclick,'function',id);
  $('seed').value='0';$('range').value='17';$('searchBtn').click();
  await until(()=>w.SlimeFarmUI.result!==null);assert.equal(w.SlimeFarmUI.result.score,4832);assert(!$('exportBtn').disabled);
  for(const prefix of ['center','clusterCenter','structureCenter','flowerCenter'])for(const axis of ['X','Z'])assert.equal($(prefix+axis).value,'0');
  $('centerX').value='31';$('centerZ').value='-47';$('centerX').dispatchEvent(new w.Event('input'));assert($('exportBtn').disabled);
  $('searchBtn').click();assert($('centerX').disabled);
  await until(()=>!$('searchBtn').disabled);assert.equal(w.SlimeFarmUI.result.centerX,31);assert.equal(w.SlimeFarmUI.result.centerZ,-47);
  assert(Math.abs(w.SlimeFarmUI.result.x-31)<=17&&Math.abs(w.SlimeFarmUI.result.z+47)<=17);$('overviewBtn').click();
  assert.equal(w.eval('camera.x'),31.5);assert.equal(w.eval('camera.z'),-46.5);
  change('toolMode','slime');assert(!$('clusterPage').classList.contains('hidden'));
  const tshape=w.document.querySelector('[name=clusterShape][value=tShape]');tshape.click();assert(tshape.checked);
  $('clusterSeed').value='0';$('clusterRange').value='4000';$('clusterSearchBtn').click();
  await until(()=>$('clusterStatus').textContent.includes('搜索完成'));
  assert.equal($('clusterCount').textContent,'6');assert($('clusterProof').textContent.includes('两个相接矩形'));
  $('clusterCenterX').value='31';$('clusterCenterZ').value='-47';$('clusterRange').value='64';$('clusterSearchBtn').click();assert($('clusterCenterZ').disabled);
  await until(()=>$('clusterStatus').textContent.includes('搜索完成'));assert.equal(sent.at(-1).centerX,31);assert.equal(sent.at(-1).centerZ,-47);assert(!$('clusterCenterZ').disabled);
  change('toolMode','nonSlime');assert($('tShapeChoice').classList.contains('hidden'));assert(w.document.querySelector('[name=clusterShape][value=square]').checked);
  // Synthetic imported biome coverage: tests parameter transport, not MCA parsing.
  $('clusterBiome').value='other';$('clusterRange').value='3';
  w.eval('clusterBiomes={y:Number(document.getElementById("clusterBiomeY").value),read:625,chunks:new Map(),snowChunks:new Set(),boxes:[]}; for(let z=-15;z<=10;z++)for(let x=-10;x<=15;x++)clusterBiomes.chunks.set(x+","+z,new Uint8Array(16).fill(3));');
  for(const shape of ['square','spawnRange']){
    w.document.querySelector('[name=clusterShape][value='+shape+']').click();$('clusterSearchBtn').click();
    await until(()=>$('clusterStatus').textContent.includes('搜索完成'));assert.equal(sent.at(-1).centerX,31);assert.equal(sent.at(-1).centerZ,-47);assert(!$('clusterCenterX').disabled);
    const result=w.eval('clusterResult');assert(result.found);if(shape==='spawnRange')assert(Math.abs(result.x-31)<=3&&Math.abs(result.z+47)<=3);
  }
  for(const mode of ['hut','monument']){
    change('toolMode',mode);$('structureSeed').value='0';$('structureRange').value='17';$('structureCenterX').value='-1007';$('structureCenterZ').value='2016';$('structureSearchBtn').click();assert($('structureCenterX').disabled);
    await until(()=>$('structureStatus').textContent.includes('搜索完成'));assert.equal(sent.at(-1).centerX,-1007);assert.equal(sent.at(-1).centerZ,2016);assert(!$('structureCenterX').disabled);assert($('structureProof').textContent.includes('搜索中心 X -1007 / Z 2016'));
  }
  change('toolMode','flower');assert(!$('flowerPage').classList.contains('hidden'));assert.equal($('flowerMode').options.length,5);
  change('flowerVersion','1.19.4');assert.equal($('flowerMode').options.length,2);
  change('flowerVersion','1.21.10');change('flowerMode','forest');
  assert.equal($('flowerRange').value,'4000');assert.equal($('flowerRange').max,'10800');
  $('flowerSeed').value='0';$('flowerRange').value='16';$('flowerMaxWidth').value='128';$('flowerMaxHeight').value='128';$('flowerYMin').value='64';$('flowerYMax').value='65';$('flowerSearchBtn').click();
  await until(()=>$('flowerStatus').textContent.includes('搜索完成'));
  assert.equal($('flowerArea').textContent,'未找到');assert(!$('flowerYMax').disabled);
  const reference=await w.eval('SlimeFlowers').search(await require('./structure_engine.js')(),{seed:'0',version:'1.21.10',mode:'forest',centerX:-2672,centerZ:-296,range:128,yMin:64,yMax:64,maxWidth:128,maxHeight:128});
  assert(reference.found);w.showFlower(reference);assert.equal($('flowerArea').textContent.replace(/,/g,''),String(reference.area));assert.equal($('flowerCount').textContent,'11');assert($('flowerHeight').textContent.includes('Y 64'));
  $('flowerCenterX').value='-2672';$('flowerCenterZ').value='-296';$('flowerRange').value='128';$('flowerYMax').value='64';$('flowerSearchBtn').click();assert($('flowerCenterX').disabled);
  await until(()=>$('flowerStatus').textContent.includes('搜索完成'));assert.equal($('flowerArea').textContent.replace(/,/g,''),String(reference.area));assert.equal(sent.at(-1).centerX,-2672);assert($('flowerProof').textContent.includes('搜索中心 X -2672 / Z -296'));
  $('flowerCenterZ').value='';$('flowerCenterZ').dispatchEvent(new w.Event('input'));const messages=sent.length;$('flowerSearchBtn').click();assert.equal(sent.length,messages);assert($('flowerError').textContent.includes('整数搜索中心'));$('flowerCenterZ').value='-296';
  $('flowerRange').value='10800';$('flowerSearchBtn').click();$('flowerStopBtn').click();assert(!$('flowerSearchBtn').disabled);assert($('flowerStatus').textContent.includes('已停止搜索'));
  $('flowerYMin').value='-63';change('flowerVersion','1.17.1');assert.equal($('flowerYMin').value,'1');assert.equal($('flowerYMax').max,'255');
  $('yueyueButton').click();assert.equal($('yueyueGreeting').textContent,'你好呀！');
  assert.deepEqual(errors,[]);
  console.log('PASS: full HTML startup, all main button handlers, farm search, mode/radio clicks, T search, version options, flower search, Yueyue click. DOM/Node-worker integration only; canvas mocked, no real browser.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{for(const worker of workers)worker.terminate();w.close();});
