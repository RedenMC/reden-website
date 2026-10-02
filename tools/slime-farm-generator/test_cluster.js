'use strict';
const assert=require('assert'),path=require('path'),fs=require('fs');
const {pathToFileURL}=require('url');
const S=require('./core.js');
const B=require('./biomes.js');

function brute(seed,range,target,shape,biomes=null,centerX=0,centerZ=0){
  const lo=Math.floor((centerX-range)/16),hi=Math.floor((centerX+range)/16),zlo=Math.floor((centerZ-range)/16),zhi=Math.floor((centerZ+range)/16),n=hi-lo+1,h=zhi-zlo+1;
  const codes={desert:1,snowy:2,other:3};
  const cells=Array.from({length:h},(_,z)=>Array.from({length:n},(_,x)=>{
    const cx=lo+x,cz=zlo+z,correct=S.isSlime(seed,cx,cz)===(target==='slime');
    return correct&&(target==='slime'||biomes.chunks.get(cx+','+cz)?.every(v=>v===codes[biomes.category])===true);
  }));
  if(shape==='unrestricted'){
    const seen=new Set();let best=0;
    for(let z=0;z<h;z++)for(let x=0;x<n;x++){
      const start=z*n+x;if(!cells[z][x]||seen.has(start))continue;
      const q=[start];seen.add(start);
      for(let k=0;k<q.length;k++){
        const i=q[k],cx=i%n,cz=Math.floor(i/n);
        for(const [xx,zz] of [[cx-1,cz],[cx+1,cz],[cx,cz-1],[cx,cz+1]]){
          const j=zz*n+xx;
          if(xx>=0&&zz>=0&&xx<n&&zz<h&&cells[zz][xx]&&!seen.has(j)){seen.add(j);q.push(j);}
        }
      }
      best=Math.max(best,q.length);
    }
    return best;
  }
  let best=0;
  for(let z1=0;z1<h;z1++)for(let z2=z1;z2<h;z2++)for(let x1=0;x1<n;x1++)for(let x2=x1;x2<n;x2++){
    if(shape==='square'&&x2-x1!==z2-z1)continue;
    let good=true;
    for(let z=z1;z<=z2&&good;z++)for(let x=x1;x<=x2;x++)if(!cells[z][x]){good=false;break;}
    if(good)best=Math.max(best,(x2-x1+1)*(z2-z1+1));
  }
  return best;
}

function bruteAnnulus(seed,range,biomes){
  const wanted={desert:1,snowy:2,other:3}[biomes.category];let best=Infinity,winner=null;
  for(let z=-range;z<=range;z++)for(let x=-range;x<=range;x++){
    let slime=0,valid=true;
    for(let dz=-128;dz<=128&&valid;dz++)for(let dx=-128;dx<=128;dx++){
      const d2=dx*dx+dz*dz;if(d2<=24*24||d2>128*128)continue;
      const wx=x+dx,wz=z+dz,cx=Math.floor(wx/16),cz=Math.floor(wz/16);
      if(S.isSlime(seed,cx,cz)){slime++;continue;}
      const cells=biomes.chunks.get(cx+','+cz);
      if(!cells||cells[((wz&15)>>2)*4+((wx&15)>>2)]!==wanted){valid=false;break;}
    }
    if(valid&&slime<best){best=slime;winner=[x,z];}
  }
  return winner?best:null;
}

(async()=>{
  assert.equal(B.clusterCategory('minecraft:desert'),1);
  assert.equal(B.clusterCategory('minecraft:snowy_plains'),2);
  assert.equal(B.clusterCategory(2),1);
  assert.equal(B.clusterCategory(12),2);
  assert.equal(B.clusterCategory('minecraft:plains'),3);
  for(const [centerX,centerZ] of [[0,0],[31,-47],[-1007,2016]])for(const seed of ['0','-1','9007199254740993'])for(const range of [1,17,48,64])for(const target of ['slime','nonSlime'])for(const shape of target==='slime'?['square','rectangle','unrestricted']:['square','rectangle']){
    const lo=Math.floor((centerX-range)/16),hi=Math.floor((centerX+range)/16),zlo=Math.floor((centerZ-range)/16),zhi=Math.floor((centerZ+range)/16),chunks=new Map();
    for(let z=zlo;z<=zhi;z++)for(let x=lo;x<=hi;x++)chunks.set(x+','+z,new Uint8Array(16).fill(3));
    const biomes=target==='nonSlime'?{category:'other',y:64,chunks}:null;
    const actual=S.searchChunkCluster(seed,range,target,shape,()=>{},biomes,centerX,centerZ);
    assert.equal(actual.count||0,brute(seed,range,target,shape,biomes,centerX,centerZ),`${seed} ${range} ${target} ${shape}`);
    if(actual.found){assert(actual.chunks.minX>=lo&&actual.chunks.maxX<=hi&&actual.chunks.minZ>=zlo&&actual.chunks.maxZ<=zhi);assert.equal(actual.blocks.minX,actual.chunks.minX*16);assert.equal(actual.blocks.maxZ,actual.chunks.maxZ*16+15);}
  }
  assert.throws(()=>S.searchChunkCluster('0',64,'nonSlime','square'),/导入/);
  const mixed=new Map([['0,0',new Uint8Array(16).fill(1)],['1,0',new Uint8Array(16).fill(1)],['0,1',new Uint8Array(16).fill(2)],['1,1',new Uint8Array(16).fill(2)],['2,0',new Uint8Array(16).fill(3)],['3,0',new Uint8Array(16).fill(1)]]);
  mixed.get('3,0')[0]=2;
  for(const category of ['desert','snowy','other'])for(const shape of ['square','rectangle']){
    const biomes={category,y:64,chunks:mixed},actual=S.searchChunkCluster('0',64,'nonSlime',shape,()=>{},biomes);
    assert.equal(actual.count||0,brute('0',64,'nonSlime',shape,biomes));assert.equal(actual.biome.complete,false);
  }
  const ringChunks=new Map();for(let z=-10;z<=10;z++)for(let x=-10;x<=10;x++)ringChunks.set(x+','+z,new Uint8Array(16).fill(3));
  const ringBiomes={category:'other',y:64,chunks:ringChunks};
  for(const range of [1,17]){
    const actual=S.searchLeastSlime('0',range,()=>{},ringBiomes);
    assert.equal(actual.slimeArea,bruteAnnulus('0',range,ringBiomes));
    assert(actual.exact&&actual.found);
  }
  ringChunks.get('4,0')[0]=1;
  assert.equal(S.searchLeastSlime('0',1,()=>{},ringBiomes).found,false);
  ringChunks.delete('4,0');
  assert.equal(S.searchLeastSlime('0',1,()=>{},ringBiomes).found,false);
  if(process.argv.includes('--core-only')){console.log('cluster and annulus brute force: PASS (browser checks skipped)');return;}
  const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
  const executable=['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
  const browser=await chromium.launch({headless:true,...(executable?{executablePath:executable}:{})});
  try{
    const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../生电农场专用投影生成器.html')).href);
    await page.selectOption('#toolMode','slime');
    assert(await page.locator('#farmPage').isHidden());
    assert(await page.locator('[name=clusterShape][value=unrestricted]').isVisible());
    assert(await page.locator('[name=clusterShape][value=tShape]').isVisible());
    assert(await page.locator('#clusterImportZone').isVisible());
    await page.fill('#clusterSeed','0');await page.fill('#clusterRange','64');
    await page.locator('[name=clusterShape][value=unrestricted]').check();
    await page.click('#clusterSearchBtn');
    await page.waitForFunction(()=>document.querySelector('#clusterStatus').textContent.includes('搜索完成'));
    assert.equal(await page.locator('#clusterCount').innerText(),'2');
    assert((await page.locator('#clusterRisk').innerText()).includes('未导入存档'));
    await page.evaluate(()=>{clusterBiomes={chunks:new Map([['0,0',new Uint8Array(16)]]),snowChunks:new Set(['0,0']),boxes:[[0,-64,0,15,64,15]]};showClusterRisks({found:true,shape:'square',chunks:{minX:0,maxX:0,minZ:0,maxZ:0}});});
    assert((await page.locator('#clusterRisk').innerText()).includes('古城'));
    assert((await page.locator('#clusterRisk').innerText()).includes('降雪'));
    assert(await page.locator('#exportBtn').isHidden());
    await page.locator('[name=clusterShape][value=tShape]').check();
    await page.selectOption('#toolMode','nonSlime');
    assert(await page.locator('#unrestrictedChoice').isHidden());
    assert(await page.locator('#tShapeChoice').isHidden());
    assert(await page.locator('#spawnRangeChoice').isVisible());
    assert(await page.locator('[name=clusterShape][value=square]').isChecked());
    assert(await page.locator('#clusterBiomeFields').isVisible());
    assert((await page.locator('#clusterBiomeFields').innerText()).includes('史莱姆区块会略微降低其他怪效率'));
    await page.click('#clusterSearchBtn');
    assert((await page.locator('#clusterError').innerText()).includes('导入'));
    await page.locator('#clusterWorldFiles').setInputFiles([path.join(__dirname,'level.dat'),path.join(__dirname,'r.0.0.mca')]);
    await page.waitForFunction(()=>document.querySelector('#clusterBiomeStatus').textContent.includes('已读取 5 个区块'));
    assert(await page.evaluate(()=>clusterBiomes.snowChunks.has('0,1')));
    await page.click('#clusterSearchBtn');
    await page.waitForFunction(()=>document.querySelector('#clusterStatus').textContent.includes('搜索完成'));
    assert.equal(await page.locator('#clusterCount').innerText(),'1');
    assert((await page.locator('#clusterProof').innerText()).includes('未覆盖区块未参与比较'));
    await page.selectOption('#clusterBiome','desert');
    await page.click('#clusterSearchBtn');
    await page.waitForFunction(()=>document.querySelector('#clusterStatus').textContent.includes('搜索完成'));
    assert.equal(await page.locator('#clusterCount').innerText(),'1');
    await page.selectOption('#clusterBiome','snowy');
    await page.click('#clusterSearchBtn');
    await page.waitForFunction(()=>document.querySelector('#clusterStatus').textContent.includes('搜索完成'));
    assert.equal(await page.locator('#clusterCount').innerText(),'1');
    await page.locator('[name=clusterShape][value=rectangle]').check();
    await page.click('#clusterSearchBtn');
    await page.waitForFunction(()=>document.querySelector('#clusterStatus').textContent.includes('搜索完成'));
    assert.equal(await page.locator('#clusterCount').innerText(),'2');
    await page.locator('[name=clusterShape][value=spawnRange]').check();
    await page.click('#clusterSearchBtn');
    await page.waitForFunction(()=>document.querySelector('#clusterStatus').textContent.includes('搜索完成'));
    assert((await page.locator('#clusterSpawnResult').innerText()).includes('没有找到'));
    assert(await page.locator('#clusterGeometry').isHidden());
    await page.selectOption('#toolMode','slime');
    assert(await page.locator('#spawnRangeChoice').isHidden());
    assert(await page.locator('#clusterBiomeFields').isVisible());
    await page.selectOption('#toolMode','nonSlime');
    await page.screenshot({path:path.join(__dirname,'cluster_preview.png'),fullPage:true});
    await page.fill('#clusterBiomeY','80');
    await page.click('#clusterSearchBtn');
    assert((await page.locator('#clusterError').innerText()).includes('导入'));
    await page.fill('#clusterBiomeY','64');
    await page.selectOption('#toolMode','farm');
    assert(await page.locator('#farmPage').isVisible());
    assert.deepEqual(errors,[]);
    console.log('cluster brute force and browser mode/search: PASS');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
