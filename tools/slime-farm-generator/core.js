/* 生电刷怪场专用投影生成器 — 独立计算内核，无外部依赖。 */
'use strict';
const SlimeFarm = (() => {
  const APP_VERSION = '1.12.3';
  const INNER = 24, OUTER = 128, GLASS = 160, WIDTH = 321;
  const MASK48 = (1n << 48n) - 1n, MULT = 0x5deece66dn;
  const SALT = 987234911n, LONG_MIN = -(1n << 63n), LONG_MAX = (1n << 63n)-1n;
  const DYES = ['white','orange','magenta','light_blue','yellow','lime','pink','gray','light_gray','cyan','purple','blue','brown','green','red','black'];
  const DYE_NAMES = ['白','橙','品红','淡蓝','黄','黄绿','粉','灰','淡灰','青','紫','蓝','棕','绿','红','黑'];
  const DYE_RGB = ['#e9eeee','#f0a342','#c56ab1','#8dbbdd','#e7d759','#8bc768','#efacc7','#666e73','#afb8bb','#4899a6','#8656ae','#445baa','#805c42','#5d8142','#b85151','#33383d'];
  function versionAtLeast(version, minimum) {
    const a=version.split('.').map(Number),b=minimum.split('.').map(Number);
    for(let i=0;i<Math.max(a.length,b.length);i++){if((a[i]||0)!==(b[i]||0))return (a[i]||0)>(b[i]||0);}
    return true;
  }
  const MATERIALS=[{id:'air',label:'空气',group:'空气',min:'1.16',color:'#172231'},
    {id:'glass',label:'普通玻璃',group:'玻璃',min:'1.16',color:'#41657d'}];
  DYES.forEach((d,i)=>MATERIALS.push({id:d+'_stained_glass',label:DYE_NAMES[i]+'色染色玻璃',group:'染色玻璃',min:'1.16',color:DYE_RGB[i]}));
  for(const [id,label,min] of [
    ['oak','橡树','1.16'],['spruce','云杉','1.16'],['birch','白桦','1.16'],['jungle','丛林','1.16'],['acacia','金合欢','1.16'],['dark_oak','深色橡树','1.16'],
    ['azalea','杜鹃','1.17'],['flowering_azalea','盛开的杜鹃','1.17'],['mangrove','红树','1.19'],['cherry','樱花','1.20'],['pale_oak','苍白橡树','1.21.4'],
    ['red_poplar','红杨树','26.3'],['orange_poplar','橙杨树','26.3'],['yellow_poplar','黄杨树','26.3']
  ])MATERIALS.push({id:id+'_leaves',label:label+'树叶',group:'树叶',min,color:'#57966a'});
  const slabGroups=[
    ['1.16','oak spruce birch jungle acacia dark_oak crimson warped stone smooth_stone sandstone cut_sandstone cobblestone brick stone_brick nether_brick quartz smooth_quartz purpur prismarine prismarine_brick dark_prismarine red_sandstone cut_red_sandstone red_nether_brick end_stone_brick mossy_cobblestone mossy_stone_brick granite polished_granite diorite polished_diorite andesite polished_andesite blackstone polished_blackstone polished_blackstone_brick'],
    ['1.17','cobbled_deepslate polished_deepslate deepslate_brick deepslate_tile cut_copper exposed_cut_copper weathered_cut_copper oxidized_cut_copper waxed_cut_copper waxed_exposed_cut_copper waxed_weathered_cut_copper waxed_oxidized_cut_copper'],
    ['1.19','mangrove mud_brick'],['1.20','cherry bamboo bamboo_mosaic'],['1.21','tuff polished_tuff tuff_brick'],['1.21.4','pale_oak resin_brick'],['26.3','poplar']
  ];
  const SLAB_NAMES={oak:'橡木',spruce:'云杉木',birch:'白桦木',jungle:'丛林木',acacia:'金合欢木',dark_oak:'深色橡木',crimson:'绯红木',warped:'诡异木',stone:'石质',smooth_stone:'平滑石',sandstone:'砂岩',cut_sandstone:'切制砂岩',cobblestone:'圆石',brick:'红砖',stone_brick:'石砖',nether_brick:'下界砖',quartz:'石英',smooth_quartz:'平滑石英',purpur:'紫珀',prismarine:'海晶石',prismarine_brick:'海晶石砖',dark_prismarine:'暗海晶石',red_sandstone:'红砂岩',cut_red_sandstone:'切制红砂岩',red_nether_brick:'红色下界砖',end_stone_brick:'末地石砖',mossy_cobblestone:'苔石',mossy_stone_brick:'苔石砖',granite:'花岗岩',polished_granite:'磨制花岗岩',diorite:'闪长岩',polished_diorite:'磨制闪长岩',andesite:'安山岩',polished_andesite:'磨制安山岩',blackstone:'黑石',polished_blackstone:'磨制黑石',polished_blackstone_brick:'磨制黑石砖',cobbled_deepslate:'深板岩圆石',polished_deepslate:'磨制深板岩',deepslate_brick:'深板岩砖',deepslate_tile:'深板岩瓦',cut_copper:'切制铜',exposed_cut_copper:'斑驳切制铜',weathered_cut_copper:'锈蚀切制铜',oxidized_cut_copper:'氧化切制铜',waxed_cut_copper:'涂蜡切制铜',waxed_exposed_cut_copper:'涂蜡斑驳切制铜',waxed_weathered_cut_copper:'涂蜡锈蚀切制铜',waxed_oxidized_cut_copper:'涂蜡氧化切制铜',mangrove:'红树木',mud_brick:'泥砖',cherry:'樱花木',bamboo:'竹',bamboo_mosaic:'竹马赛克',tuff:'凝灰岩',polished_tuff:'磨制凝灰岩',tuff_brick:'凝灰岩砖',pale_oak:'苍白橡木',resin_brick:'树脂砖',poplar:'杨木'};
  for(const [min,ids] of slabGroups)for(const id of ids.split(' '))MATERIALS.push({id:id+'_slab',label:SLAB_NAMES[id]+'下半砖',group:'下半砖',min,color:'#9da8a8'});
  for(const group of ['wool','concrete'])DYES.forEach((d,i)=>MATERIALS.push({id:d+'_'+group+'_slab',label:DYE_NAMES[i]+'色'+(group==='wool'?'羊毛':'混凝土')+'下半砖',group:'下半砖',min:'26.3',color:DYE_RGB[i]}));
  function material(id,version) {
    const m=MATERIALS.find(x=>x.id===id);
    if(!m||!versionAtLeast(version,m.min))throw new Error(`Java ${version} 不支持所选填充方块 ${id}。`);
    return m;
  }
  function materialState(id,version) {
    const m=material(id,version);
    if(m.id==='air')return ['minecraft:air'];
    return ['minecraft:'+m.id,m.group==='树叶'?{distance:'7',persistent:'true',waterlogged:'false'}:m.group==='下半砖'?{type:'bottom',waterlogged:'false'}:undefined];
  }
  // world_version values read from Mojang's version.json in each released server jar.
  const DATA_VERSIONS={
    '1.16':2566,'1.16.1':2567,'1.16.2':2578,'1.16.3':2580,'1.16.4':2584,'1.16.5':2586,
    '1.17':2724,'1.17.1':2730,'1.18':2860,'1.18.1':2865,'1.18.2':2975,
    '1.19':3105,'1.19.1':3117,'1.19.2':3120,'1.19.3':3218,'1.19.4':3337,
    '1.20':3463,'1.20.1':3465,'1.20.2':3578,'1.20.3':3698,'1.20.4':3700,'1.20.5':3837,'1.20.6':3839,
    '1.21':3953,'1.21.1':3955,'1.21.2':4080,'1.21.3':4082,'1.21.4':4189,'1.21.5':4325,
    '1.21.6':4435,'1.21.7':4438,'1.21.8':4440,'1.21.9':4554,'1.21.10':4556,'1.21.11':4671,
    '26.1':4786,'26.2':4903,'26.3':5023
  };
  function dataVersion(version){if(!Object.hasOwn(DATA_VERSIONS,version))throw new Error(`不支持的目标 Java 版本：${version}`);return DATA_VERSIONS[version];}
  function parseSeed(raw) {
    const s = String(raw).trim();
    if (!s) throw new Error('请先输入世界种子。');
    if (/^[+-]?\d+$/.test(s)) {
      const n = BigInt(s);
      if (n < LONG_MIN || n > LONG_MAX) throw new Error('数字种子超出 Java 有符号 64 位范围，请粘贴 /seed 的完整结果。');
      return {seed:n.toString(), text:false, original:s};
    }
    let h = 0;
    for (let i=0; i<s.length; i++) h = (Math.imul(h,31) + s.charCodeAt(i)) | 0;
    return {seed:String(h), text:true, original:s};
  }
  function isSlime(seed, cx, cz) {
    // Casts intentionally match Java: x*x*4987142 overflows as int,
    // whereas (long)(z*z)*4392871 is a 64-bit product.
    let v = BigInt(seed) + BigInt(Math.imul(Math.imul(cx,cx),4987142))
      + BigInt(Math.imul(cx,5947611)) + BigInt(Math.imul(cz,cz))*4392871n
      + BigInt(Math.imul(cz,389711));
    let state = (v ^ SALT ^ MULT) & MASK48;
    let bits, val;
    do {
      state = (state * MULT + 11n) & MASK48;
      bits = Number(state >> 17n); val = bits % 10;
    } while (bits - val + 9 > 2147483647);
    return val === 0;
  }
  const inAnnulus = (dx,dz) => dx*dx+dz*dz > INNER*INNER && dx*dx+dz*dz <= OUTER*OUTER;
  const portalAt = (x,z) => ((x + 2*z) & 3) === 2;
  function biomeBlock(data,x,y,z) {
    if(!data||data.y!==y)return {known:false,excluded:false,snow:false};
    for(const b of data.boxes||[])if(x>=b[0]&&x<=b[3]&&y>=b[1]&&y<=b[4]&&z>=b[2]&&z<=b[5])return {known:true,excluded:true,snow:false};
    const cells=data.chunks?.get(Math.floor(x/16)+','+Math.floor(z/16));
    if(!cells)return {known:false,excluded:false,snow:false};
    const value=cells[((z&15)>>2)*4+((x&15)>>2)];
    return {known:true,excluded:value===1,snow:value===2};
  }
  function orientChunks(chunks) {
    const axes=new Map(),groups=[],seen=new Set();
    for(const key of chunks.keys()) {
      if(seen.has(key))continue;
      const group=[],queue=[key];seen.add(key);
      for(let i=0;i<queue.length;i++) {
        const current=queue[i], [cx,cz]=current.split(',').map(Number);group.push(current);
        for(const next of [`${cx+1},${cz}`,`${cx-1},${cz}`,`${cx},${cz+1}`,`${cx},${cz-1}`])
          if(chunks.has(next)&&!seen.has(next)){seen.add(next);queue.push(next);}
      }
      let xEdges=0,zEdges=0;
      for(const member of group) {
        const [cx,cz]=member.split(',').map(Number);
        if(chunks.has(`${cx+1},${cz}`))xEdges++;
        if(chunks.has(`${cx},${cz+1}`))zEdges++;
      }
      // Stripes run perpendicular to the dominant direction of adjacent chunks.
      const axis=xEdges>zEdges?'z':'x';
      for(const member of group)axes.set(member,axis);
      groups.push({axis,chunks:group.length,xEdges,zEdges});
    }
    return {axes,groups};
  }
  let kernelCache;
  function kernels() {
    if (kernelCache) return kernelCache;
    const size=17*17, weights=new Uint16Array(256*size), upper=new Uint16Array(size),lower=new Uint16Array(size).fill(65535);
    const points=[];
    for(let dz=-128;dz<=128;dz++) for(let dx=-128;dx<=128;dx++) if(inAnnulus(dx,dz)) points.push([dx,dz]);
    for(let pz=0;pz<16;pz++) for(let px=0;px<16;px++) {
      const start=(pz*16+px)*size;
      for (const [dx,dz] of points) weights[start+((pz+dz)>>4)*17+((px+dx)>>4)+144]++;
      for(let i=0;i<size;i++) {if(weights[start+i]>upper[i])upper[i]=weights[start+i];if(weights[start+i]<lower[i])lower[i]=weights[start+i];}
    }
    kernelCache={weights,upper,lower,size,area:points.length,points};
    return kernelCache;
  }
  function makeGrid(seed,minChunk,maxChunk,onProgress=()=>{}) {
    const n=maxChunk-minChunk+1, grid=new Uint8Array(n*n), b=BigInt(seed);
    // Cache the coordinate-dependent 32/64 bit arithmetic for every row/column.
    const xs=[],zs=[];
    for(let i=0;i<n;i++) {
      const c=minChunk+i;
      xs.push(BigInt(Math.imul(Math.imul(c,c),4987142))+BigInt(Math.imul(c,5947611)));
      zs.push(BigInt(Math.imul(c,c))*4392871n+BigInt(Math.imul(c,389711)));
    }
    for(let z=0;z<n;z++) {
      for(let x=0;x<n;x++) {
        let s=(b+xs[x]+zs[z])^SALT^MULT, bits,val;
        s &= MASK48;
        do {s=(s*MULT+11n)&MASK48;bits=Number(s>>17n);val=bits%10;} while(bits-val+9>2147483647);
        grid[z*n+x]=val===0?1:0;
      }
      if((z&31)===0) onProgress({phase:'grid',progress:0.05+0.25*z/n,message:`计算史莱姆区块：${z+1} / ${n} 行`});
    }
    return {grid,minChunk,maxChunk,n};
  }
  // Search chunk-aligned shapes inside the block-coordinate square [-range,range].
  // A chunk is included when its block area intersects that square.
  function searchChunkCluster(seed,range,target='slime',shape='square',onProgress=()=>{},biomeData=null){
    if(!Number.isInteger(range)||range<1||range>108000)throw new Error('搜索范围必须是 1～108000 的整数。');
    if(!['slime','nonSlime'].includes(target))throw new Error('未知区块种类。');
    if(!['square','rectangle','unrestricted'].includes(shape)||target==='nonSlime'&&shape==='unrestricted')throw new Error('此区块种类不支持所选形状。');
    const started=performance.now(),minChunk=Math.floor(-range/16),maxChunk=Math.floor(range/16);
    const {grid,n}=makeGrid(seed,minChunk,maxChunk,onProgress),wanted=target==='slime'?1:0;
    let biome=null;
    if(target==='nonSlime'){
      const codes={desert:1,snowy:2,other:3},required=codes[biomeData?.category];
      if(!required||!(biomeData.chunks instanceof Map)||!Number.isInteger(biomeData.y))throw new Error('无史莱姆区块群系搜索需要先导入计划刷怪高度的主世界存档群系。');
      let nonSlime=0,known=0,matched=0;
      for(const v of grid)if(v===0)nonSlime++;
      for(const [key,cells] of biomeData.chunks){
        const [cx,cz]=key.split(',').map(Number),x=cx-minChunk,z=cz-minChunk;
        if(x<0||z<0||x>=n||z>=n||cells?.length!==16)continue;
        const i=z*n+x;if(grid[i]!==0)continue;
        let complete=true,match=true;
        for(const code of cells){if(code===0)complete=false;if(code!==required)match=false;}
        if(complete)known++;
        if(match){grid[i]=3;matched++;}
      }
      for(let i=0;i<grid.length;i++)grid[i]=grid[i]===3?0:2;
      biome={category:biomeData.category,y:biomeData.y,nonSlime,known,matched,unknown:nonSlime-known,complete:known===nonSlime,importedChunks:biomeData.read??biomeData.chunks.size};
    }
    let best={count:0,minX:0,maxX:0,minZ:0,maxZ:0},bestCells=null;
    const better=(count,x1,z1,x2,z2)=>count>best.count||count===best.count&&(z1<best.minZ||z1===best.minZ&&x1<best.minX);
    if(shape==='square'){
      let previous=new Uint16Array(n+1),current=new Uint16Array(n+1);
      for(let z=0;z<n;z++){
        const row=z*n;
        for(let x=0;x<n;x++)if(grid[row+x]===wanted){
          const side=1+Math.min(previous[x],previous[x+1],current[x]);current[x+1]=side;
          const count=side*side,x1=x-side+1,z1=z-side+1;
          if(better(count,x1,z1,x,z))best={count,minX:x1,maxX:x,minZ:z1,maxZ:z};
        }else current[x+1]=0;
        [previous,current]=[current,previous];
        if((z&127)===0)onProgress({phase:'shape',progress:.3+.7*z/n,message:`检查正方形：${z+1} / ${n} 行`});
      }
    }else if(shape==='rectangle'){
      const heights=new Uint16Array(n),stack=new Int32Array(n+1);
      for(let z=0;z<n;z++){
        const row=z*n;
        for(let x=0;x<n;x++)heights[x]=grid[row+x]===wanted?heights[x]+1:0;
        let size=0;
        for(let x=0;x<=n;x++){
          const height=x===n?0:heights[x];
          while(size&&heights[stack[size-1]]>height){
            const last=stack[--size],h=heights[last],x1=size?stack[size-1]+1:0,count=h*(x-x1),z1=z-h+1;
            if(better(count,x1,z1,x-1,z))best={count,minX:x1,maxX:x-1,minZ:z1,maxZ:z};
          }
          stack[size++]=x;
        }
        if((z&127)===0)onProgress({phase:'shape',progress:.3+.7*z/n,message:`检查矩形：${z+1} / ${n} 行`});
      }
    }else{
      for(let z=0;z<n;z++){
        for(let x=0;x<n;x++){
          const start=z*n+x;if(grid[start]!==wanted)continue;
          const queue=[start];grid[start]=2;
          let minX=x,maxX=x,minZ=z,maxZ=z;
          for(let head=0;head<queue.length;head++){
            const i=queue[head],cx=i%n,cz=Math.floor(i/n);
            if(cx<minX)minX=cx;if(cx>maxX)maxX=cx;if(cz<minZ)minZ=cz;if(cz>maxZ)maxZ=cz;
            if(cx>0&&grid[i-1]===wanted){grid[i-1]=2;queue.push(i-1);}
            if(cx+1<n&&grid[i+1]===wanted){grid[i+1]=2;queue.push(i+1);}
            if(cz>0&&grid[i-n]===wanted){grid[i-n]=2;queue.push(i-n);}
            if(cz+1<n&&grid[i+n]===wanted){grid[i+n]=2;queue.push(i+n);}
          }
          if(better(queue.length,minX,minZ,maxX,maxZ)){
            best={count:queue.length,minX,maxX,minZ,maxZ};bestCells=queue.slice();
          }
        }
        if((z&127)===0)onProgress({phase:'shape',progress:.3+.7*z/n,message:`检查连通区域：${z+1} / ${n} 行`});
      }
    }
    if(!best.count)return {seed:String(seed),range,target,shape,gridChunks:n*n,found:false,biome,elapsedMs:performance.now()-started};
    const coordinates=bestCells?.map(i=>[minChunk+i%n,minChunk+Math.floor(i/n)]).sort((a,b)=>a[1]-b[1]||a[0]-b[0])??null;
    const chunks={minX:minChunk+best.minX,maxX:minChunk+best.maxX,minZ:minChunk+best.minZ,maxZ:minChunk+best.maxZ};
    return {seed:String(seed),range,target,shape,gridChunks:n*n,found:true,count:best.count,width:best.maxX-best.minX+1,height:best.maxZ-best.minZ+1,chunks,blocks:{minX:chunks.minX*16,maxX:chunks.maxX*16+15,minZ:chunks.minZ*16,maxZ:chunks.maxZ*16+15},coordinates,biome,elapsedMs:performance.now()-started};
  }
  function search(seed,range,onProgress=()=>{},biomeData=null,spawnY=1) {
    if(!Number.isInteger(range)||range<1||range>108000) throw new Error('搜索范围必须是 1～108000 的整数（默认 4000）。');
    const t0=performance.now();
    onProgress({phase:'kernel',progress:0.01,message:'建立逐格圆环权重与严格上界…'});
    const k=kernels(), cmin=Math.floor(-range/16), cmax=Math.floor(range/16), cn=cmax-cmin+1;
    const g=makeGrid(seed,cmin-10,cmax+10,onProgress);
    const n=cn*cn;
    const offsets=[], values=[];
    for(let i=0;i<289;i++) if(k.upper[i]) {offsets.push((Math.floor(i/17)-8)*g.n+(i%17-8));values.push(k.upper[i]);}
    const activeBiome=biomeData?.chunks instanceof Map&&biomeData.y===spawnY?biomeData:null;
    const darkChunks=new Set();if(activeBiome)for(const [key,cells] of activeBiome.chunks)if(cells.includes(1))darkChunks.add(key);
    const boxes=(activeBiome?.boxes||[]).filter(b=>spawnY>=b[1]&&spawnY<=b[4]);
    function assess(x,z,details=false){
      if(!activeBiome)return details?{excluded:0,unknown:0,known:0}:0;
      let excluded=0,unknown=0,known=0;
      for(const [dx,dz] of k.points){
        const wx=x+dx,wz=z+dz,cx=Math.floor(wx/16),cz=Math.floor(wz/16);
        if(!g.grid[(cz-g.minChunk)*g.n+cx-g.minChunk])continue;
        if(boxes.some(b=>wx>=b[0]&&wx<=b[3]&&wz>=b[2]&&wz<=b[5])){excluded++;continue;}
        const cells=activeBiome.chunks.get(cx+','+cz);
        if(!cells){unknown++;continue;}
        known++;
        if(cells[((wz&15)>>2)*4+((wx&15)>>2)]===1)excluded++;
      }
      return details?{excluded,unknown,known}:excluded;
    }
    function nearExcluded(x,z){
      if(!activeBiome)return false;
      for(const b of boxes)if(x+128>=b[0]&&x-128<=b[3]&&z+128>=b[2]&&z-128<=b[5])return true;
      const cx=Math.floor(x/16),cz=Math.floor(z/16);
      for(let dz=-8;dz<=8;dz++)for(let dx=-8;dx<=8;dx++)if(darkChunks.has((cx+dx)+','+(cz+dz)))return true;
      return false;
    }
    function centerScore(tx,tz){
      const base=(tz+10)*g.n+tx+10,relevant=[];
      for(let j=0;j<289;j++)if(g.grid[base+(Math.floor(j/17)-8)*g.n+j%17-8])relevant.push(j);
      const px=(cmin+tx)*16,pz=(cmin+tz)*16;
      const x=Math.max(-range,Math.min(range,px+8)),z=Math.max(-range,Math.min(range,pz+8));
      const start=((z-pz)*16+x-px)*289;let score=0;
      for(const j of relevant)score+=k.weights[start+j];
      return score-(nearExcluded(x,z)?assess(x,z):0);
    }
    // A deterministic sample supplies only a pruning threshold; every possible winner
    // is still checked below with admissible upper bounds.
    let threshold=0;
    for(let iz=0;iz<Math.min(64,cn);iz++)for(let ix=0;ix<Math.min(64,cn);ix++){
      const tx=Math.floor((cn-1)*ix/Math.max(1,Math.min(64,cn)-1));
      const tz=Math.floor((cn-1)*iz/Math.max(1,Math.min(64,cn)-1));
      threshold=Math.max(threshold,centerScore(tx,tz));
    }
    let best=threshold-1,bx=0,bz=0,bestDistance=Infinity,ties=0,refined=0,evaluated=0;
    const columns=new Uint16Array(g.n);
    for(let row=2;row<=18;row++)for(let x=0;x<g.n;x++)columns[x]+=g.grid[row*g.n+x];
    for(let band=0;band<cn;band+=16){
      const candidates=[];
      for(let tz=band;tz<Math.min(cn,band+16);tz++){
        if(tz>0){const leaving=(tz+1)*g.n,entering=(tz+18)*g.n;for(let x=0;x<g.n;x++)columns[x]+=g.grid[entering+x]-g.grid[leaving+x];}
        let slimeCount=0;for(let x=2;x<=18;x++)slimeCount+=columns[x];
        for(let tx=0;tx<cn;tx++){
          if(tx>0)slimeCount+=columns[tx+18]-columns[tx+1];
          if(slimeCount*256<best)continue;
          const base=(tz+10)*g.n+tx+10;let bound=0;
          for(let j=0;j<offsets.length;j++)bound+=g.grid[base+offsets[j]]*values[j];
          if(bound>=best)candidates.push({tx,tz,bound});
        }
      }
      candidates.sort((a,b)=>b.bound-a.bound||a.tz-b.tz||a.tx-b.tx);
      for(const {tx,tz,bound} of candidates){
        if(bound<best)break;
        const base=(tz+10)*g.n+tx+10,relevant=[];
        for(let j=0;j<289;j++)if(g.grid[base+(Math.floor(j/17)-8)*g.n+j%17-8])relevant.push(j);
        const originX=(cmin+tx)*16,originZ=(cmin+tz)*16;
        for(let pz=0;pz<16;pz++){
          const z=originZ+pz;if(z < -range||z>range)continue;
          for(let px=0;px<16;px++){
            const x=originX+px;if(x < -range||x>range)continue;
            const start=(pz*16+px)*289;let score=0;
            for(const j of relevant)score+=k.weights[start+j];
            evaluated++;
            if(score<best)continue;
            if(nearExcluded(x,z))score-=assess(x,z);
            const dist=(x+0.5)**2+(z+0.5)**2;
            if(score>best){best=score;bx=x;bz=z;bestDistance=dist;ties=1;}
            else if(score===best){ties++;if(dist<bestDistance||(dist===bestDistance&&(x<bx||(x===bx&&z<bz)))){bx=x;bz=z;bestDistance=dist;}}
          }
        }
        refined++;
      }
      onProgress({phase:'bound',progress:0.30+0.68*Math.min(cn,band+16)/cn,message:`校验区块行 ${Math.min(cn,band+16)} / ${cn}；当前面积 ${best.toLocaleString()} 格`,best,x:bx,z:bz,refined});
    }
    const biome=assess(bx,bz,true);
    const elapsedMs=performance.now()-t0;
    onProgress({phase:'complete',progress:1,message:'完成：所选范围内的全部挂机方块中心已精确求优。'});
    return {seed:String(seed),range,x:bx,z:bz,score:best,ties,exact:true,refined,evaluated,
      totalCenters:(2*range+1)**2,totalTiles:n,remainingUpper:0,elapsedMs,kernelArea:k.area,
      biome:{used:!!activeBiome,excludedAtBest:biome.excluded,unknownAtBest:biome.unknown,knownAtBest:biome.known,importedChunks:activeBiome?.read??0},
      grid:g.grid,gridMin:g.minChunk,gridMax:g.maxChunk,gridN:g.n};
  }
  function searchLeastSlime(seed,range,onProgress=()=>{},biomeData=null){
    if(!Number.isInteger(range)||range<1||range>108000)throw new Error('搜索范围必须是 1～108000 的整数。');
    const started=performance.now(),k=kernels(),cmin=Math.floor(-range/16),cmax=Math.floor(range/16),cn=cmax-cmin+1;
    const g=makeGrid(seed,cmin-10,cmax+10,onProgress),grid=g.grid,n=g.n;
    const codes={desert:1,snowy:2,other:3},required=codes[biomeData?.category];
    if(!required||!(biomeData.chunks instanceof Map))throw new Error('刷怪范围内搜索需要先导入计划刷怪高度的主世界存档群系。');
    const invalid=new Uint8Array(grid.length);invalid.fill(1);
    for(let i=0;i<grid.length;i++)if(grid[i])invalid[i]=0;
    for(const [key,cells] of biomeData.chunks){
      if(cells?.length!==16||!cells.every(v=>v===required))continue;
      const [cx,cz]=key.split(',').map(Number),ix=cx-g.minChunk,iz=cz-g.minChunk;
      if(ix>=0&&ix<n&&iz>=0&&iz<n)invalid[iz*n+ix]=0;
    }
    // Four disjoint rectangles of chunks always lie entirely in the annulus,
    // for every possible block-centre offset within a candidate chunk.
    const rects=[[-3,3,-6,-3],[-3,3,3,6],[-5,-4,-4,4],[4,5,-4,4]];
    for(const [x1,x2,z1,z2] of rects)for(let dz=z1;dz<=z2;dz++)for(let dx=x1;dx<=x2;dx++){
      if(k.lower[(dz+8)*17+dx+8]!==256)throw new Error('内部下界无效。');
    }
    const lowerOffsets=[];
    for(let j=0;j<289;j++)if(k.lower[j])lowerOffsets.push([Math.floor(j/17)-8,j%17-8,j,k.lower[j]]);
    let best=Infinity,bx=0,bz=0,bestDistance=Infinity,ties=0,refined=0,evaluated=0;
    function scoreAt(x,z){
      const cx=Math.floor(x/16),cz=Math.floor(z/16),base=(cz-g.minChunk)*n+cx-g.minChunk;
      const start=((z-cz*16)*16+x-cx*16)*289;let score=0;
      for(let j=0;j<289;j++)if(grid[base+(Math.floor(j/17)-8)*n+j%17-8])score+=k.weights[start+j];
      return score;
    }
    function eligible(x,z){
      const cx=Math.floor(x/16),cz=Math.floor(z/16),base=(cz-g.minChunk)*n+cx-g.minChunk;
      for(const [x1,x2,z1,z2] of rects)for(let dz=z1;dz<=z2;dz++)for(let dx=x1;dx<=x2;dx++)if(invalid[base+dz*n+dx])return false;
      for(const [dx,dz] of k.points){
        const wx=x+dx,wz=z+dz,cx=Math.floor(wx/16),cz=Math.floor(wz/16);
        const i=(cz-g.minChunk)*n+cx-g.minChunk;
        if(grid[i])continue;
        const cells=biomeData.chunks.get(cx+','+cz);
        if(!cells||cells[((wz&15)>>2)*4+((wx&15)>>2)]!==required)return false;
      }
      return true;
    }
    const sampleN=Math.min(64,cn);
    for(let iz=0;iz<sampleN;iz++)for(let ix=0;ix<sampleN;ix++){
      const tx=Math.floor((cn-1)*ix/Math.max(1,sampleN-1)),tz=Math.floor((cn-1)*iz/Math.max(1,sampleN-1));
      const x=Math.max(-range,Math.min(range,(cmin+tx)*16+8)),z=Math.max(-range,Math.min(range,(cmin+tz)*16+8));
      if(eligible(x,z)){const score=scoreAt(x,z);if(score<best){best=score;bx=x;bz=z;}}
    }
    const cols=rects.map(()=>new Uint16Array(n));
    const badCols=rects.map(()=>new Uint16Array(n));
    for(let r=0;r<rects.length;r++){
      const [, ,z1,z2]=rects[r];
      for(let dz=z1;dz<=z2;dz++)for(let x=0;x<n;x++){cols[r][x]+=grid[(10+dz)*n+x];badCols[r][x]+=invalid[(10+dz)*n+x];}
    }
    for(let tz=0;tz<cn;tz++){
      if(tz)for(let r=0;r<rects.length;r++){
        const [, ,z1,z2]=rects[r],leaving=(tz-1+10+z1)*n,entering=(tz+10+z2)*n,column=cols[r];
        for(let x=0;x<n;x++){column[x]+=grid[entering+x]-grid[leaving+x];badCols[r][x]+=invalid[entering+x]-invalid[leaving+x];}
      }
      const sums=new Int32Array(rects.length);
      const badSums=new Int32Array(rects.length);
      for(let r=0;r<rects.length;r++){
        const [x1,x2]=rects[r];for(let dx=x1;dx<=x2;dx++){sums[r]+=cols[r][10+dx];badSums[r]+=badCols[r][10+dx];}
      }
      for(let tx=0;tx<cn;tx++){
        if(tx)for(let r=0;r<rects.length;r++){
          const [x1,x2]=rects[r];sums[r]+=cols[r][tx+10+x2]-cols[r][tx+9+x1];badSums[r]+=badCols[r][tx+10+x2]-badCols[r][tx+9+x1];
        }
        if(badSums[0]+badSums[1]+badSums[2]+badSums[3])continue;
        if(256*(sums[0]+sums[1]+sums[2]+sums[3])>best)continue;
        const base=(tz+10)*n+tx+10;let lower=0;
        for(const [dz,dx,,weight] of lowerOffsets){lower+=grid[base+dz*n+dx]*weight;if(lower>best)break;}
        if(lower>best)continue;
        const relevant=[];
        for(let j=0;j<289;j++)if(grid[base+(Math.floor(j/17)-8)*n+j%17-8])relevant.push(j);
        const originX=(cmin+tx)*16,originZ=(cmin+tz)*16;
        for(let pz=0;pz<16;pz++){
          const z=originZ+pz;if(z < -range||z>range)continue;
          for(let px=0;px<16;px++){
            const x=originX+px;if(x < -range||x>range)continue;
            const start=(pz*16+px)*289;let score=0;
            for(const j of relevant){score+=k.weights[start+j];if(score>best)break;}
            evaluated++;if(score>best||!eligible(x,z))continue;
            const dist=(x+0.5)**2+(z+0.5)**2;
            if(score<best){best=score;bx=x;bz=z;bestDistance=dist;ties=1;}
            else{ties++;if(dist<bestDistance||(dist===bestDistance&&(x<bx||(x===bx&&z<bz)))){bx=x;bz=z;bestDistance=dist;}}
          }
        }
        refined++;
      }
      if((tz&31)===0)onProgress({phase:'minimum',progress:.3+.7*tz/cn,message:`检查挂机点所在区块行 ${tz+1} / ${cn}；当前最少 ${best} 格`});
    }
    if(!ties)return {seed:String(seed),range,found:false,kernelArea:k.area,exact:true,refined,evaluated,totalCenters:(2*range+1)**2,totalTiles:cn*cn,elapsedMs:performance.now()-started};
    onProgress({phase:'complete',progress:1,message:'完成：已用严格下界校验所有挂机方块。'});
    return {seed:String(seed),range,found:true,x:bx,z:bz,slimeArea:best,kernelArea:k.area,ties,exact:true,refined,evaluated,totalCenters:(2*range+1)**2,totalTiles:cn*cn,elapsedMs:performance.now()-started};
  }
  function layout(seed,px,pz,type='checker',biomeData=null,spawnY=1,topWalk=false) {
    if(!['checker','stripe','uncut','theory'].includes(type)) throw new Error('未知投影类型');
    if(!Number.isInteger(px)||!Number.isInteger(pz)) throw new Error('挂机点方块 X、Z 必须是整数。');
    const minX=px-160,minZ=pz-160,n=WIDTH*WIDTH;
    const base=new Uint8Array(n),top=new Uint8Array(n),cache=new Map(),chunks=new Map();
    let geometricArea=0,unknownSpawnArea=0;
    const slime=(x,z)=>{const cx=Math.floor(x/16),cz=Math.floor(z/16),key=cx+','+cz;if(!cache.has(key))cache.set(key,isSlime(seed,cx,cz));return cache.get(key);};
    // Palette: 0 air, 1 glass, 2 obsidian, 3 magma, 4 portal(axis=x),
    // 5 composter, 6 slab, 7 portal(axis=z).
    for(let z=0;z<WIDTH;z++) for(let x=0;x<WIDTH;x++) {
      const dx=x-160,dz=z-160,idx=z*WIDTH+x,d2=dx*dx+dz*dz,wx=minX+x,wz=minZ+z;
      if(d2<=25600)base[idx]=1;
      if(d2>576&&d2<=16384&&slime(wx,wz)) {
        geometricArea++;const biome=biomeBlock(biomeData,wx,spawnY,wz);
        if(!biome.excluded){
          if(biomeData&&!biome.known)unknownSpawnArea++;
          base[idx]=2;if(type==='checker'&&portalAt(wx,wz))top[idx]=4;
          const key=Math.floor(wx/16)+','+Math.floor(wz/16);chunks.set(key,(chunks.get(key)||0)+1);
        }
      }
    }
    const floorArea=Array.from(base).filter(v=>v===2).length;
    const {axes,groups}=orientChunks(chunks);
    const axisAt=(x,z)=>axes.get(Math.floor((minX+x)/16)+','+Math.floor((minZ+z)/16));
    // A line runs along X at fixed Z, or along Z at fixed X.
    const pos=(axis,line,along)=>axis==='x'?line*WIDTH+along:along*WIDTH+line;
    const scan=(axis,fn)=>{
      for(let line=0;line<WIDTH;line++) {
        let along=0;
        while(along<WIDTH) {
          const idx=pos(axis,line,along),x=idx%WIDTH,z=Math.floor(idx/WIDTH);
          if(base[idx]!==2||axisAt(x,z)!==axis){along++;continue;}
          const start=along;
          while(along<WIDTH) {
            const j=pos(axis,line,along),xx=j%WIDTH,zz=Math.floor(j/WIDTH);
            if(base[j]!==2||axisAt(xx,zz)!==axis)break;
            along++;
          }
          fn(axis,line,start,along);
        }
      }
    };
    // 8-neighbour dilation of the UNION; shared chunk borders never get magma.
    if(type!=='uncut')for(let z=1;z<WIDTH-1;z++) for(let x=1;x<WIDTH-1;x++) if(base[z*WIDTH+x]===2) {
      for(let dz=-1;dz<=1;dz++) for(let dx=-1;dx<=1;dx++) {
        const j=(z+dz)*WIDTH+x+dx;if(base[j]!==2)base[j]=3;
      }
    }
    let layers=[base,top],pillars=0,gaps=0,theory=null,walkHeatmap=null,spawnWalkHeatmap=null;
    if(type==='stripe')for(const axis of ['x','z'])scan(axis,(direction,line,start,end)=>{
      const worldLine=(direction==='x'?minZ:minX)+line;
      if((worldLine&1)!==0)return;
      const portal=direction==='x'?4:7;
      for(let at=start;at<end;) {
        const remaining=end-at,span=remaining<=21?remaining:Math.min(21,remaining-3);
        for(let step=0;step<span;step++)top[pos(direction,line,at+step)]=portal;
        at+=span;
        if(at<end){gaps++;at++;}
      }
    });
    if(type==='uncut') {
      const middle1=new Uint8Array(n),middle2=new Uint8Array(n),cap=new Uint8Array(n),roof=new Uint8Array(n);
      for(const axis of ['x','z'])scan(axis,(direction,line,start,end)=>{
          // A one-block clipped edge cannot form the vanilla minimum two-block opening.
          if(end-start===1){for(const a of [top,middle1,middle2])a[pos(direction,line,start)]=2;return;}
          // A vanilla frame is at most 23 blocks wide, leaving at most 21 portal blocks.
          for(let at=start;at<end;) {
            const remaining=end-at,span=remaining<=21?remaining:Math.min(21,remaining-3);
            if(at>0)for(const a of [top,middle1,middle2])a[pos(direction,line,at-1)]=2;
            for(let step=0;step<span;step++)for(const a of [top,middle1,middle2])a[pos(direction,line,at+step)]=direction==='x'?4:7;
            at+=span;
            if(at<end){for(const a of [top,middle1,middle2])a[pos(direction,line,at)]=2;pillars++;at++;}
            else if(at<WIDTH)for(const a of [top,middle1,middle2])a[pos(direction,line,at)]=2;
          }
      });
      for(let z=0;z<WIDTH;z++)for(let x=0;x<WIDTH;x++)if(base[z*WIDTH+x]===2){
        cap[z*WIDTH+x]=2;
        if(topWalk)for(let dz=-5;dz<=5;dz++)for(let dx=-5;dx<=5;dx++){
          const xx=x+dx,zz=z+dz;if(xx>=0&&zz>=0&&xx<WIDTH&&zz<WIDTH)roof[zz*WIDTH+xx]=6;
        }
      }
      if(!topWalk)for(let i=0;i<n;i++){
        if(middle2[i]===2)cap[i]=2;
        if(cap[i]===2)roof[i]=6;
      }
      layers=[base,top,middle1,middle2,cap,roof];
    }
    if(type==='theory'){
      // EntityType.SLIME is 2.04 blocks wide before Slime scales it by
      // 0.255 * size. Natural spawn centres are at X/Z + 0.5, so both size 2
      // (width 1.0404) and size 4 (width 2.0808) intersect a 3x3 block area.
      // A portal in that area invokes NetherPortalBlock.entityInside.
      const floor=[];
      for(let i=0;i<n;i++)if(base[i]===2){
        floor.push(i);
        const wx=minX+i%WIDTH,wz=minZ+Math.floor(i/WIDTH);
        if(portalAt(wx,wz))top[i]=4;
      }
      const touchesPortal=i=>{
        const x=i%WIDTH,z=Math.floor(i/WIDTH);
        for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
          const xx=x+dx,zz=z+dz;
          if(xx>=0&&zz>=0&&xx<WIDTH&&zz<WIDTH&&top[zz*WIDTH+xx]===4)return true;
        }
        return false;
      };
      let edgePatches=0;
      for(const i of floor)if(!touchesPortal(i)){top[i]=4;edgePatches++;}
      let portals=0,directSmall=0,uncovered=0;
      for(const i of floor){
        if(top[i]===4){portals++;directSmall++;}
        if(!touchesPortal(i))uncovered++;
      }
      if(uncovered)throw new Error('理论版门块未覆盖所有中、大型史莱姆生成格。');

      // NaturalSpawner makes three horizontal pack walks from a random start
      // in each eligible chunk. Each starts with 1..4 attempts; X/Z advance
      // by nextInt(6)-nextInt(6), while Y stays fixed.
      const step=new Float64Array(11);
      for(let d=-5;d<=5;d++)step[d+5]=(6-Math.abs(d))/36;
      const kernels=[null];let previous=new Float64Array([1]);
      for(let k=1;k<=4;k++){
        const next=new Float64Array(previous.length+10);
        for(let i=0;i<previous.length;i++)for(let j=0;j<11;j++)next[i+j]+=previous[i]*step[j];
        kernels.push(next);previous=next;
      }
      const minStartX=(Math.floor(px/16)-8)*16,maxStartX=(Math.floor(px/16)+9)*16;
      const minStartZ=(Math.floor(pz/16)-8)*16,maxStartZ=(Math.floor(pz/16)+9)*16;
      const axis=(origin,minStart,maxStart)=>kernels.map((kernel,k)=>{
        if(!k)return null;const result=new Float64Array(WIDTH);
        for(let p=0;p<WIDTH;p++)for(let j=0;j<kernel.length;j++){
          const source=origin+p-(j-5*k);
          if(source>=minStart&&source<maxStart)result[p]+=kernel[j];
        }
        return result;
      });
      const axisX=axis(minX,minStartX,maxStartX),axisZ=axis(minZ,minStartZ,maxStartZ);
      spawnWalkHeatmap=new Float32Array(n);walkHeatmap=new Uint16Array(n);
      for(let z=0;z<WIDTH;z++)for(let x=0;x<WIDTH;x++){
        let visits=0;for(let k=1;k<=4;k++)visits+=(5-k)/4*axisX[k][x]*axisZ[k][z];
        spawnWalkHeatmap[z*WIDTH+x]=3*visits/256;
      }

      // Heightmap penalty depends on the START column, not the final attempt.
      // Convolve actual portal start cells with the same walk kernels.
      const portalStart=new Uint8Array(n),portalVisits=new Float64Array(n),row=new Float64Array(n);
      for(const i of floor){
        const x=minX+i%WIDTH,z=minZ+Math.floor(i/WIDTH);
        if(top[i]===4&&x>=minStartX&&x<maxStartX&&z>=minStartZ&&z<maxStartZ)portalStart[i]=1;
      }
      for(let k=1;k<=4;k++){
        const kernel=kernels[k],radius=5*k,multiplier=3*(5-k)/(4*256);
        for(let z=0;z<WIDTH;z++)for(let x=0;x<WIDTH;x++){
          let value=0;
          for(let j=0;j<kernel.length;j++){
            const xx=x+radius-j;
            if(xx>=0&&xx<WIDTH)value+=kernel[j]*portalStart[z*WIDTH+xx];
          }
          row[z*WIDTH+x]=value;
        }
        for(let z=0;z<WIDTH;z++)for(let x=0;x<WIDTH;x++){
          let value=0;
          for(let j=0;j<kernel.length;j++){
            const zz=z+radius-j;
            if(zz>=0&&zz<WIDTH)value+=kernel[j]*row[zz*WIDTH+x];
          }
          portalVisits[z*WIDTH+x]+=multiplier*value;
        }
      }
      let rawWeight=0;
      for(const i of floor){
        const visits=spawnWalkHeatmap[i],fromPortal=Math.min(visits,portalVisits[i]);
        rawWeight+=visits/2-fromPortal/6;
        walkHeatmap[i]=top[i]===4?2:1;
      }
      const rawRate=rawWeight/100,ballsPerHour=rawRate*(13/3)*72000;
      theory={period:4,phase:2,portals,edgePatches,rawRate,meanTicks:null,highDifficultyMeanTicks:null,meanCapTicks:null,capFactor:null,highDifficultyCapFactor:null,ballsPerHour,highDifficultyBallsPerHour:rawRate*(17/3)*72000,immediateSmallMedium:floor.length?directSmall/floor.length:0,immediateLarge:floor.length?1:0,magmaFirstFraction:null,candidates:1,nonPortalSpawnCells:uncovered,spawnWalkUnit:'expected horizontal spawn-position attempts per block per tick before Y and mob checks',contactHeatUnit:'1 = size-2/4 portal contact; 2 = size-1/2/4 portal contact',model:'checker portal layout plus edge patches where needed; size-2 width 1.0404 and size-4 width 2.0808 both intersect 3x3 block cells at centered natural spawn; size-1 width 0.5202 intersects own block only; horizontal pack-walk convolution for portal START columns; LC chance 1/2 at non-portal starts and 1/3 at portal starts; 1/10 assumed slime-list share; vanilla slime rule 1/10; natural slime sizes 1/2/4 with local-difficulty probabilities; conditional full collection and working portal blocks; small-slime lifetime and 70-mob-cap reduction are not yet quantified; no global yield optimum proof'};
    }
    top[160*WIDTH+160]=5;
    const counts={air:0,glass:0,obsidian:0,magma:0,portal:0,composter:0,slab:0},names=[...Object.keys(counts),'portal'];
    for(const a of layers)for(const v of a)counts[names[v]]++;
    let snowRisk=0,unknownBiome=0;
    if(biomeData?.y===spawnY)for(let i=0;i<n;i++)if(base[i]!==0){const status=biomeBlock(biomeData,minX+i%WIDTH,spawnY,minZ+Math.floor(i/WIDTH));if(status.snow)snowRisk++;if(!status.known)unknownBiome++;}
    return {seed:String(seed),px,pz,minX,minZ,width:WIDTH,base,top,layers,type,topWalk:type==='uncut'?!!topWalk:null,theory,walkHeatmap,spawnWalkHeatmap,floorArea,geometricArea,unknownSpawnArea,pillars,gaps,groups,counts,snowRisk,unknownBiome,
      chunks:Array.from(chunks,([key,area])=>{const [x,z]=key.split(',').map(Number);return {x,z,area,axis:type==='checker'?'x':axes.get(key)};}).sort((a,b)=>b.area-a.area||a.z-b.z||a.x-b.x)};
  }
  class NBT {
    constructor(){this.parts=[];this.length=0;this.encoder=new TextEncoder();}
    bytes(b){this.parts.push(b);this.length+=b.length;}
    n(bytes,fn,v){const a=new Uint8Array(bytes),d=new DataView(a.buffer);d[fn](0,v,false);this.bytes(a);}
    byte(v){this.n(1,'setUint8',v);}
    int(v){this.n(4,'setInt32',v);}
    long(v){this.n(8,'setBigInt64',BigInt.asIntN(64,BigInt(v)));}
    string(s){const a=this.encoder.encode(s);if(a.length>65535)throw new Error('NBT 文本过长');this.n(2,'setUint16',a.length);this.bytes(a);}
    tag(type,name){this.byte(type);this.string(name);}
    i(name,v){this.tag(3,name);this.int(v);}
    l(name,v){this.tag(4,name);this.long(v);}
    s(name,v){this.tag(8,name);this.string(v);}
    compound(name,fn){this.tag(10,name);fn();this.byte(0);}
    vec(name,x,y,z){this.compound(name,()=>{this.i('x',x);this.i('y',y);this.i('z',z);});}
    emptyList(name,type=10){this.tag(9,name);this.byte(type);this.int(0);}
    result(){const a=new Uint8Array(this.length);let p=0;for(const b of this.parts){a.set(b,p);p+=b.length;}return a;}
  }
  function packIndices(array,paletteSize) {
    const bits=Math.max(2,Math.ceil(Math.log2(paletteSize))),words=new BigUint64Array(Math.ceil(array.length*bits/64));
    for(let i=0;i<array.length;i++) {
      const pos=i*bits,w=Math.floor(pos/64),offset=pos%64,value=BigInt(array[i]);
      words[w]|=value<<BigInt(offset);
      if(offset+bits>64)words[w+1]|=value>>BigInt(64-offset);
    }
    return words;
  }
  function netherPortalRange(layout,baseY) {
    if(!Number.isInteger(baseY))throw new Error('地板 Y 坐标必须是整数。');
    let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity,count=0;
    for(const layer of layout.layers)for(let i=0;i<layer.length;i++)if(layer[i]===4||layer[i]===7){
      const x=Math.floor((layout.minX+i%WIDTH)/8),z=Math.floor((layout.minZ+Math.floor(i/WIDTH))/8);
      minX=Math.min(minX,x);maxX=Math.max(maxX,x);minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z);count++;
    }
    if(!count)return {portalBlockCount:0,common:null};
    const common={minX:maxX-16,maxX:minX+16,minZ:maxZ-16,maxZ:minZ+16};
    return {portalBlockCount:count,overworldPortalY:{min:baseY+1,max:baseY+(layout.type==='uncut'?3:1)},
      scaledTarget:{minX,maxX,minZ,maxZ},searchRadiusXZ:16,ySearch:'不设固定 Y 半径；须位于地狱维度可放置传送门的高度，选最近门时计入 Y 距离。',
      common:common.minX<=common.maxX&&common.minZ<=common.maxZ?common:null,
      meaning:'所有投影门块按方块坐标缩放后的目标点，都能在水平 16 格范围内搜索到的地狱门块候选区；Y 不缩放并参与三维最近门选择。实体进入位置、现有门和目的地门形状会改变实际出口。'};
  }
  function roofState(id,version) {
    const selected=material(id,version);
    if(!['空气','玻璃','染色玻璃','下半砖'].includes(selected.group))throw new Error('不切门顶层只支持空气、玻璃或下半砖。');
    return materialState(id,version);
  }
  function schematic(layout,version='1.21.10',baseY=0,fillMaterial='glass',roofMaterial='smooth_stone_slab') {
    const old=/^1\.(16|17)(\.|$)/.test(version),minY=old?0:-64;
    if(!Number.isInteger(baseY)||baseY<minY||baseY>38) throw new Error(`这个版本的地板 Y 坐标请填写 ${minY}～38 的整数；门块 Y=地板 Y+1，刷怪脚部必须低于 40。`);
    if(layout.type==='theory'&&baseY!==minY)throw new Error(`理论效率版须把地板放在该版本的最低高度 Y${minY}。`);
    if(layout.type==='uncut'&&!layout.topWalk&&material(roofMaterial,version).group!=='下半砖')throw new Error('不需要顶部游走时，顶框上方只能使用下半砖。');
    const semantic=[['minecraft:air'],materialState(fillMaterial,version),['minecraft:obsidian'],['minecraft:magma_block'],['minecraft:nether_portal',{axis:'x'}],['minecraft:composter',{level:'0'}],layout.type==='uncut'?roofState(roofMaterial,version):['minecraft:smooth_stone_slab',{type:'bottom',waterlogged:'false'}],['minecraft:nether_portal',{axis:'z'}]];
    const palette=[],indices=new Map(),remap=semantic.map(state=>{const key=JSON.stringify(state);if(!indices.has(key)){indices.set(key,palette.length);palette.push(state);}return indices.get(key);});
    const all=new Uint8Array(layout.base.length*layout.layers.length);layout.layers.forEach((layer,i)=>{for(let j=0;j<layer.length;j++)all[i*layer.length+j]=remap[layer[j]];});
    const n=new NBT(),time=Date.now(),totalBlocks=all.length-all.reduce((count,v)=>count+(v===remap[0]),0);
    n.compound('',()=>{
      n.i('Version',5);n.i('MinecraftDataVersion',dataVersion(version));
      n.compound('Metadata',()=>{
        n.s('Name',`大史莱姆农场_${{checker:'棋盘门',stripe:'长条门',uncut:'不切门',theory:'理论最高效率试用'}[layout.type]}_X${layout.px}_Z${layout.pz}`);
        n.s('Author','生电刷怪场专用投影生成器');
        n.s('Description',`目标 Java ${version};类型=${layout.type};顶部游走=${layout.topWalk===null?'不适用':layout.topWalk?'是':'否'};Y${baseY}填充=minecraft:${fillMaterial};顶层=minecraft:${roofMaterial};连通区方向按相邻史莱姆区块选择 X/Z;DataVersion=${dataVersion(version)};种子=${layout.seed};投影原点=${layout.minX},${baseY},${layout.minZ};P水平=${layout.px+0.5},${layout.pz+0.5};地板Y=${baseY};门块Y=${baseY+1};24<水平欧氏距离<=128;单层几何面积。`);
        n.l('TimeCreated',time);n.l('TimeModified',time);n.i('TotalBlocks',totalBlocks);n.i('TotalVolume',all.length);n.i('RegionCount',1);n.vec('EnclosingSize',WIDTH,layout.layers.length,WIDTH);
      });
      n.compound('Regions',()=>n.compound('农场总图',()=>{
        n.vec('Position',0,0,0);n.vec('Size',WIDTH,layout.layers.length,WIDTH);
        n.tag(9,'BlockStatePalette');n.byte(10);n.int(palette.length);
        for(const [name,props] of palette){n.s('Name',name);if(props)n.compound('Properties',()=>{for(const [key,val] of Object.entries(props))n.s(key,val);});n.byte(0);}
        n.tag(12,'BlockStates');const words=packIndices(all,palette.length);n.int(words.length);for(const word of words)n.long(word);
        n.emptyList('TileEntities');n.emptyList('Entities');n.emptyList('PendingBlockTicks');n.emptyList('PendingFluidTicks');
      }));
    });
    return n.result();
  }
  function gzipStored(bytes) {
    // Standards-compliant gzip fallback using uncompressed DEFLATE blocks.
    const blocks=Math.ceil(bytes.length/65535)||1,out=new Uint8Array(10+bytes.length+blocks*5+8);
    out.set([31,139,8,0,0,0,0,0,0,255]);let pos=10,off=0;
    for(let b=0;b<blocks;b++) {const len=Math.min(65535,bytes.length-off);out[pos++]=(b===blocks-1)?1:0;out[pos++]=len&255;out[pos++]=len>>8;out[pos++]=(~len)&255;out[pos++]=((~len)>>8)&255;out.set(bytes.subarray(off,off+len),pos);pos+=len;off+=len;}
    let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
    const d=new DataView(out.buffer);d.setUint32(pos,(crc^0xffffffff)>>>0,true);d.setUint32(pos+4,bytes.length>>>0,true);return out;
  }
  async function gzip(bytes) {
    if(typeof CompressionStream!=='undefined') {try {return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());}catch(e){/* offline fallback */}}
    return gzipStored(bytes);
  }
  function report(result,l,version,baseY,fillMaterial='glass',roofMaterial='smooth_stone_slab') {
    if(l.type==='theory'&&baseY!==(/^1\.(16|17)(\.|$)/.test(version)?0:-64))throw new Error('理论效率版的地板高度必须是所选版本的世界最低处。');
    const complete=result.exact;
    const chosen=material(fillMaterial,version);
    const {glass:fillCount,slab:roofCount,...otherCounts}=l.counts;
    const roof=l.type==='uncut'?material(roofMaterial,version):null;
    if(roof)roofState(roofMaterial,version);
    if(roof&&!l.topWalk&&roof.group!=='下半砖')throw new Error('不需要顶部游走时，顶框上方只能使用下半砖。');
    return {program:'生电刷怪场专用投影生成器',appVersion:APP_VERSION,targetJavaVersion:version,
      search:{seed:l.seed,range:result.range??null,scope:'挂机方块坐标 X/Z∈[-R,R]，完整圆允许伸出搜索方框',
        optimum:complete?(result.biome?.used?'在搜索范围内按存档已知禁刷群系求最大；缺失群系暂按可刷计':'在搜索范围内按史莱姆区块几何面积求最大；未校验禁刷群系'):'手动选点，未声明最优',
        totalCenters:result.totalCenters??null,evaluated:result.evaluated??null,refinedTiles:result.refined??null,
        tiedMaximumCenters:result.ties??null,elapsedMs:result.elapsedMs??null},
      position:{afkBlock:{x:l.px,y:baseY+1,z:l.pz},horizontalPlayerCenter:{x:l.px+0.5,z:l.pz+0.5},
        litematicaOrigin:{x:l.minX,y:baseY,z:l.minZ},rotation:'NONE',mirror:'NONE',size:{x:WIDTH,y:l.layers.length,z:WIDTH}},
      netherPortal:netherPortalRange(l,baseY),
      geometry:{distance:'Euclidean horizontal block-center distance',rule:'24² < dx²+dz² <= 128²',
        fillRule:'dx²+dz² <= 160², excluding obsidian and magma',
        magmaRule:l.type==='uncut'?'none':'8-neighbour dilation of union(obsidian), minus obsidian',
        portalRule:l.type==='checker'?'on obsidian only; ((worldX+2*worldZ)&3)==2; axis=x':l.type==='theory'?'checker portals plus edge patches; every eligible size-2/4 spawn cell has a portal in its 3x3 block area; axis=x':l.type==='stripe'?'stripes follow each chunk component X/Z axis; alternate perpendicular world lines; max 21 portal blocks, air gap after longer spans':l.topWalk?'3-high portals follow each chunk component X/Z axis; max 21 interior portal blocks in a 23-wide frame, obsidian pillar after longer spans; top obsidian; roof extends 5 blocks':'3-high portals follow each chunk component X/Z axis; max 21 interior portal blocks in a 23-wide frame, obsidian pillar after longer spans; slabs only above all top obsidian including outside pillars',baseY,portalY:baseY+1,topWalk:l.topWalk},
      farmType:l.type,theoreticalSpawnFloorArea:l.floorArea,geometricSpawnFloorArea:l.geometricArea,
      biomeCoverage:{imported:!!result.biome?.used,excludedSpawnBlocks:l.geometricArea-l.floorArea,unknownSpawnBlocks:l.unknownSpawnArea,potentialSnowBlocks:l.snowRisk,unknownProjectionBlocks:l.unknownBiome,importedChunks:result.biome?.importedChunks??0},
      portalPillars:l.pillars,portalAirGaps:l.gaps,orientationGroups:l.type==='checker'||l.type==='theory'?null:l.groups,
      theoryEfficiency:l.type==='theory'?{...l.theory,unit:'conditional slimeballs/hour if every floor portal remains valid, every slime transfers, and all descendants are collected in Nether; not measured output'}:null,
      fillMaterial:{id:'minecraft:'+chosen.id,label:chosen.label,count:fillCount,state:materialState(fillMaterial,version)[1]||{}},
      roofMaterial:roof?{id:'minecraft:'+roof.id,label:roof.label,count:roofCount,state:roofState(roofMaterial,version)[1]||{}}:null,
      counts:{...otherCounts,fillMaterial:fillCount,roofMaterial:roofCount},slimeChunks:l.chunks,
      litematic:{formatVersion:5,minecraftDataVersion:dataVersion(version),note:'数据版本来自目标 Java 正式版服务端 version.json。'},
      limitations:['最大值指单层候选面积，不等于每小时产量。','存档未覆盖的群系暂按可刷计；需完整覆盖才能确认实际世界的最大值。',l.type==='theory'?'理论版尚未可靠量化小型史莱姆的滞留时间和 70 怪物上限的影响；条件试算不等于实际产量，也不证明全局最高效率。':'未过滤地形、世界出生点、其他玩家、怪物上限和模拟距离。','P 为挂机方块水平中心；按需求忽略玩家与刷怪脚部的微小高差。',l.type==='uncut'?'不切门版提供目标门框与门块布局，不提供施工设备或地狱侧处理系统。':'切门版提供成品门块布局，不提供切门设备或地狱侧处理系统。',...(l.type==='theory'?[`理论版采用棋盘门布局，并在必要的边缘格补门；每个可刷怪地板格周围 3×3 范围内至少有一个门块，中、大型史莱姆自然生成时即可碰到门。`,'每小时粘液球条件试算假设门块稳定存在、史莱姆成功传送且地狱侧全部收集；未经过切门存活或游戏内产量验收。']:[]),...(l.type==='uncut'&&roofMaterial==='air'?['不切门版顶层填充选择空气会留下可刷怪的黑曜石表面；满足刷怪条件时，黑曜石上面会刷怪，需另行防刷怪。']:[]),'没有宣称已在每个游戏版本里实机测试。']};
  }
  return {APP_VERSION,INNER,OUTER,GLASS,WIDTH,MATERIALS,DATA_VERSIONS,material,materialState,roofState,biomeBlock,netherPortalRange,parseSeed,isSlime,inAnnulus,portalAt,orientChunks,kernels,makeGrid,searchChunkCluster,searchLeastSlime,search,layout,schematic,gzip,gzipStored,report,packIndices};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=SlimeFarm;
if(typeof self!=='undefined')self.SlimeFarm=SlimeFarm;



