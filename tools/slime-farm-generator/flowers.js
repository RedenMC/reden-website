/* Exact nearest full-flower plane, constrained by search range, height range and dimensions. */
'use strict';
const SlimeFlowers=(()=>{
  const NAMES=['蒲公英','虞美人','绒球葱','茜草花','红色郁金香','橙色郁金香','白色郁金香','粉色郁金香','滨菊','矢车菊','铃兰','蓝色兰花','粉红花簇','眼眸花','野花'];
  const MODES=[
    {id:'forest',label:'繁花森林经典 11 种',count:11,minProfile:0},
    {id:'classic',label:'经典 12 种（加蓝色兰花）',count:12,minProfile:0},
    {id:'cherry',label:'1.20 起 13 种（加粉红花簇）',count:13,minProfile:6},
    {id:'eyeblossom',label:'1.21.4 起 14 种（加眼眸花）',count:14,minProfile:9},
    {id:'wildflowers',label:'1.21.5 起 15 种（加野花）',count:15,minProfile:10}
  ];
  const MASK_FOREST=(1<<11)-1, MASK_ALL=(1<<12)-1;
  function modesFor(version){const profile=SlimeStructures.VERSION_PROFILES[version];return MODES.filter(item=>profile!==undefined&&profile>=item.minProfile);}
  function targetFor(version,mode){return modesFor(version).find(item=>item.id===mode);}
  function minimumRectangle(grid,width,height,required,progress=()=>{}){
    if(grid.length!==width*height||width<1||height<1)throw new Error('花种网格尺寸无效。');
    const all=grid.reduce((mask,kind)=>mask|(kind?1<<(kind-1):0),0);
    if((all&required)!==required)return {found:false,available:all&required};
    let best=null;
    for(let top=0;top<height;top++){
      const columns=new Uint16Array(width);
      for(let bottom=top;bottom<height;bottom++){
        const rows=bottom-top+1;
        if(best&&rows>best.area)break;
        let union=0;
        for(let x=0,offset=bottom*width;x<width;x++){
          const kind=grid[offset+x];
          if(kind)columns[x]|=1<<(kind-1);
          union|=columns[x];
        }
        if((union&required)!==required)continue;
        const counts=new Uint16Array(NAMES.length);
        let missing=0,left=0;for(let bits=required;bits;bits&=bits-1)missing++;
        for(let right=0;right<width;right++){
          let bits=columns[right]&required;
          while(bits){const bit=bits&-bits,index=31-Math.clz32(bit);if(counts[index]++===0)missing--;bits-=bit;}
          while(missing===0){
            const area=(right-left+1)*rows;
            if(!best||area<best.area||area===best.area&&(top<best.top||top===best.top&&left<best.left))
              best={found:true,left,right,top,bottom,width:right-left+1,height:rows,area};
            bits=columns[left]&required;
            while(bits){const bit=bits&-bits,index=31-Math.clz32(bit);if(--counts[index]===0)missing++;bits-=bit;}
            left++;
          }
        }
      }
      if(top%16===0||top===height-1)progress({phase:'minimize',progress:(top+1)/height});
    }
    return best||{found:false,available:all&required};
  }
  function closer(a,b){return !b||a.distance4<b.distance4||a.distance4===b.distance4&&(a.area<b.area||a.area===b.area&&(a.y<b.y||a.y===b.y&&(a.minZ<b.minZ||a.minZ===b.minZ&&a.minX<b.minX)));}
  // For each top/bottom/right, all covering left edges form an interval. Choose
  // its edge nearest the origin-centred midpoint; enumerating every width is unnecessary.
  function nearestRectangle(grid,width,height,required,{minX=0,minZ=0,centerX=0,centerZ=0,y=64,maxWidth=width,maxHeight=height,anchorWidth=width,anchorHeight=height,incumbent=null}={}){
    let best=incumbent,targetCount=0;for(let bits=required;bits;bits&=bits-1)targetCount++;
    for(let top=0;top<Math.min(anchorHeight,height);top++){
      const columns=new Uint16Array(width);
      for(let bottom=top;bottom<Math.min(height,top+maxHeight);bottom++){
        let union=0;
        for(let x=0;x<width;x++){const kind=grid[bottom*width+x];if(kind)columns[x]|=1<<(kind-1);union|=columns[x];}
        const centerZ2=2*(minZ-centerZ)+top+bottom;
        if((union&required)!==required||best&&centerZ2*centerZ2>best.distance4)continue;
        const counts=new Uint16Array(NAMES.length);let left=0,missing=targetCount,maxLeft=-1;
        for(let right=0;right<width;right++){
          let bits=columns[right]&required;
          while(bits){const bit=bits&-bits,index=31-Math.clz32(bit);if(counts[index]++===0)missing--;bits-=bit;}
          while(missing===0){
            maxLeft=left;bits=columns[left++]&required;
            while(bits){const bit=bits&-bits,index=31-Math.clz32(bit);if(--counts[index]===0)missing++;bits-=bit;}
          }
          const lo=Math.max(0,right-maxWidth+1),hi=Math.min(maxLeft,anchorWidth-1);
          if(lo>hi)continue;
          const x1=Math.max(lo,Math.min(hi,-2*(minX-centerX)-right)),centerX2=2*(minX-centerX)+x1+right;
          const distance4=centerX2*centerX2+centerZ2*centerZ2,area=(right-x1+1)*(bottom-top+1);
          if(best&&(distance4>best.distance4||distance4===best.distance4&&area>best.area))continue;
          const candidate={found:true,left:x1,right,top,bottom,width:right-x1+1,height:bottom-top+1,area,distance4,y,minX:minX+x1,maxX:minX+right,minZ:minZ+top,maxZ:minZ+bottom};
          if(closer(candidate,best))best=candidate;
        }
      }
    }
    return best;
  }
  async function search(engine,params,progress=()=>{}){
    const {seed,version,mode,range=4000,centerX=0,centerZ=0,maxWidth=128,maxHeight=128}=params;
    const yMin=params.yMin??params.y??64,yMax=params.yMax??params.y??80;
    const profile=SlimeStructures.VERSION_PROFILES[version];
    if(profile===undefined)throw new Error('不支持的 Java 版本。');
    if(!Number.isInteger(range)||range<1||range>10800)throw new Error('花种搜索范围必须是 1～10800 格，默认 4000。');
    if(![centerX,centerZ,yMin,yMax].every(Number.isInteger))throw new Error('坐标与 Y 范围必须是整数。');
    if(![maxWidth,maxHeight].every(v=>Number.isInteger(v)&&v>=1&&v<=1024))throw new Error('最大 X、Z 尺寸须为 1～1024 格。');
    if(centerX-range<-30000000||centerX+range>30000000||centerZ-range<-30000000||centerZ+range>30000000)throw new Error('搜索范围超过世界边界。');
    const target=targetFor(version,mode);
    if(!target)throw new Error('所选版本不支持该花种目标。');
    const old=/^1\.(16|17)(\.|$)/.test(version);
    if(yMin<(old?1:-63)||yMax>(old?255:319)||yMin>yMax)throw new Error(`Y 下限须不大于上限，且都在 ${old?'1～255':'−63～319'} 内。`);
    const raw=BigInt(seed),low=Number(BigInt.asUintN(32,raw)),high=Number(BigInt.asUintN(32,raw>>32n));
    if(engine._structure_init(profile,low,high)!==1)throw new Error('种子群系引擎初始化失败。');
    const minX=centerX-range,minZ=centerZ-range,maxX=centerX+range,maxZ=centerZ+range,required=(1<<target.count)-1,tiles=[];
    const axisBound=(a,b)=>a>0?a:b<0?-b:0;
    for(let z=minZ;z<=maxZ;z+=64)for(let x=minX;x<=maxX;x+=64){
      const aw=Math.min(64,maxX-x+1),ah=Math.min(64,maxZ-z+1),lastX=x+aw-1,lastZ=z+ah-1;
      const dx=axisBound(2*(x-centerX),lastX+Math.min(maxX,lastX+maxWidth-1)-2*centerX),dz=axisBound(2*(z-centerZ),lastZ+Math.min(maxZ,lastZ+maxHeight-1)-2*centerZ);
      tiles.push({x,z,aw,ah,width:Math.min(aw+maxWidth-1,maxX-x+1),height:Math.min(ah+maxHeight-1,maxZ-z+1),bound:dx*dx+dz*dz});
    }
    tiles.sort((a,b)=>a.bound-b.bound||a.z-b.z||a.x-b.x);
    let best=null,possible=0,checkedTiles=0,checkedLayers=0;
    for(const tile of tiles){
      if(best&&tile.bound>best.distance4)break;
      const mask=engine._flower_prepare(tile.x,tile.z,tile.width,tile.height,yMin,old?yMin:yMax);
      if(mask<0)throw new Error('候选区域群系读取失败。');
      possible|=mask;
      if((mask&required)===required)for(let y=yMin;y<=(old?yMin:yMax);y++){
        const layerMask=engine._flower_prepared_mask(y);
        if(layerMask<0)throw new Error(`Y${y} 群系筛选失败。`);
        if((layerMask&required)!==required)continue;
        const actual=engine._flower_prepared_layer(y);checkedLayers++;
        if(actual<0)throw new Error(`Y${y} 花种读取失败。`);
        if((actual&required)!==required)continue;
        const grid=new Uint8Array(tile.width*tile.height);
        for(let i=0;i<grid.length;i+=4){const word=engine._flower_layer_word(i/4)>>>0;for(let k=0;k<4&&i+k<grid.length;k++)grid[i+k]=word>>>(8*k)&255;}
        const candidate=nearestRectangle(grid,tile.width,tile.height,required,{minX:tile.x,minZ:tile.z,centerX,centerZ,y,maxWidth,maxHeight,anchorWidth:tile.aw,anchorHeight:tile.ah,incumbent:best});
        if(candidate!==best){
          best=candidate;best.examples=Array(target.count).fill(null);
          for(let z=best.top;z<=best.bottom;z++)for(let x=best.left;x<=best.right;x++){
            const kind=grid[z*tile.width+x];
            if(kind&&kind<=target.count&&!best.examples[kind-1])best.examples[kind-1]={name:NAMES[kind-1],x:tile.x+x,y,z:tile.z+z};
          }
        }
      }
      checkedTiles++;
      if(checkedTiles%8===0)progress({phase:'search',progress:checkedTiles/tiles.length,message:`已筛查 ${checkedTiles} / ${tiles.length} 个区域，精查 ${checkedLayers} 层${best?'；已找到候选，正在确认最近位置':''}。`});
    }
    const common={version,seed:String(seed),mode,targetCount:target.count,range,centerX,centerZ,yMin,yMax,maxWidth,maxHeight,checkedTiles,checkedLayers,totalTiles:tiles.length,exact:true};
    progress({phase:'search',progress:1,message:'范围搜索完成。'});
    return best?{...common,...best,distance:Math.sqrt(best.distance4)/2}:{...common,found:false,missing:NAMES.filter((_,i)=>(required&(1<<i))&&!(possible&(1<<i)))};
  }
  return {NAMES,MODES,MASK_FOREST,MASK_ALL,modesFor,targetFor,minimumRectangle,nearestRectangle,search};
})();
if(typeof module!=='undefined')module.exports=SlimeFlowers;
