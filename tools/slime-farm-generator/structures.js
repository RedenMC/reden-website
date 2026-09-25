/* Seed-only swamp hut / ocean monument search, with exact integer AFK geometry. */
'use strict';
const SlimeStructures=(()=>{
  const VERSION_PROFILES={
    '1.16':0,'1.16.1':0,'1.16.2':1,'1.16.3':1,'1.16.4':1,'1.16.5':1,
    '1.17':2,'1.17.1':2,'1.18':3,'1.18.1':3,'1.18.2':3,
    '1.19':4,'1.19.1':4,'1.19.2':4,'1.19.3':5,'1.19.4':5,
    '1.20':6,'1.20.1':6,'1.20.2':6,'1.20.3':6,'1.20.4':6,'1.20.5':6,'1.20.6':6,
    '1.21':7,'1.21.1':7,'1.21.2':8,'1.21.3':8,'1.21.4':9,'1.21.5':10,
    '1.21.6':11,'1.21.7':11,'1.21.8':11,'1.21.9':12,'1.21.10':12,'1.21.11':13,
    '26.1':14,'26.2':15,'26.3':16
  };
  const OUTER2=128*128,INNER2=24*24;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const floorSqrt=v=>Math.floor(Math.sqrt(v));
  const distanceToInterval=(v,a,b)=>v<a?a-v:v>b?v-b:0;
  const farthestFromInterval=(v,a,b)=>Math.max(Math.abs(v-a),Math.abs(v-b));
  function feasibleIntervals(box,y,z,range){
    const farY=farthestFromInterval(y,box[1],box[4]),farZ=farthestFromInterval(z,box[2],box[5]);
    const remaining=OUTER2-farY*farY-farZ*farZ;
    if(remaining<0)return [];
    const radius=floorSqrt(remaining),left=Math.max(-range,box[3]-radius),right=Math.min(range,box[0]+radius);
    if(left>right)return [];
    const nearY=distanceToInterval(y,box[1],box[4]),nearZ=distanceToInterval(z,box[2],box[5]);
    const innerRemaining=INNER2-nearY*nearY-nearZ*nearZ;
    if(innerRemaining<0)return [[left,right]];
    const gap=floorSqrt(innerRemaining),a=Math.min(right,box[0]-gap-1),b=Math.max(left,box[3]+gap+1),out=[];
    if(left<=a)out.push([left,a]);
    if(b<=right)out.push([b,right]);
    return out;
  }
  function pairCanOverlap(a,b){
    return Math.max(a[3]-128,b[3]-128)<=Math.min(a[0]+128,b[0]+128)&&
      Math.max(a[5]-128,b[5]-128)<=Math.min(a[2]+128,b[2]+128)&&
      Math.max(a[4]-128,b[4]-128)<=Math.min(a[1]+128,b[1]+128);
  }
  function groupsOf(boxes){
    const parent=boxes.map((_,i)=>i),find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
    const bins=new Map(),cell=256;
    for(let i=0;i<boxes.length;i++){
      const b=boxes[i],x1=Math.floor((b[3]-128)/cell),x2=Math.floor((b[0]+128)/cell),z1=Math.floor((b[5]-128)/cell),z2=Math.floor((b[2]+128)/cell);
      for(let z=z1;z<=z2;z++)for(let x=x1;x<=x2;x++){
        const key=x+','+z,list=bins.get(key)||[];
        for(const j of list)if(pairCanOverlap(b,boxes[j])){const pi=find(i),pj=find(j);if(pi!==pj)parent[pi]=pj;}
        list.push(i);bins.set(key,list);
      }
    }
    const groups=new Map();for(let i=0;i<boxes.length;i++){const root=find(i),list=groups.get(root)||[];list.push(boxes[i]);groups.set(root,list);}
    return [...groups.values()];
  }
  function groupDistanceBound(group){
    let best=Infinity;
    for(const b of group){
      const dx=distanceToInterval(0,b[0]-128,b[3]+128),dy=distanceToInterval(0,b[1]-128,b[4]+128),dz=distanceToInterval(0,b[2]-128,b[5]+128);
      best=Math.min(best,dx*dx+dy*dy+dz*dz);
    }
    return best;
  }
  function bestAtGroup(group,range,yMin,yMax,best){
    let lo=Math.max(yMin,Math.min(...group.map(b=>b[1]-128))),hi=Math.min(yMax,Math.max(...group.map(b=>b[4]+128)));
    for(let y=lo;y<=hi;y++){
      const spans=[];
      for(const b of group){
        const farY=farthestFromInterval(y,b[1],b[4]),remaining=OUTER2-farY*farY;
        if(remaining<0)continue;
        const radius=floorSqrt(remaining),left=Math.max(-range,b[5]-radius),right=Math.min(range,b[2]+radius);
        if(left<=right)spans.push([left,right]);
      }
      spans.sort((a,b)=>a[0]-b[0]);
      let cursor=-Infinity;
      for(const [start,end] of spans){
        const from=Math.max(start,cursor+1);
        if(from>end)continue;
        cursor=Math.max(cursor,end);
        for(let z=from;z<=end;z++){
          const events=[];
          for(const b of group)for(const [left,right] of feasibleIntervals(b,y,z,range)){events.push([left,1],[right+1,-1]);}
          if(!events.length)continue;
          events.sort((a,b)=>a[0]-b[0]);
          let count=0,at=events[0][0];
          for(let i=0;i<events.length;){
            const x=events[i][0];
            if(count>0&&x>at){
              const px=clamp(0,at,x-1),distance2=px*px+y*y+z*z;
              if(count>best.count||count===best.count&&(distance2<best.distance2||distance2===best.distance2&&(px<best.x||px===best.x&&(y<best.y||y===best.y&&z<best.z)))){
                best={count,x:px,y,z,distance2};
              }
            }
            while(i<events.length&&events[i][0]===x)count+=events[i++][1];
            at=x;
          }
        }
      }
    }
    return best;
  }
  async function search(engine,seed,version,range,type,onProgress=()=>{}){
    const profile=VERSION_PROFILES[version];if(profile===undefined)throw new Error('该 Java 版本尚无对应的种子结构配置。');
    if(!Number.isInteger(range)||range<1||range>108000)throw new Error('搜索范围必须是 1～108000 的整数。');
    if(!['hut','monument'].includes(type))throw new Error('未知结构类型。');
    const bits=BigInt.asUintN(64,BigInt(seed)),low=Number(bits&0xffffffffn),high=Number((bits>>32n)&0xffffffffn);
    if(!engine._structure_init(profile,low,high))throw new Error('种子结构引擎初始化失败。');
    const started=performance.now(),id=type==='hut'?3:8,margin=256,regionMin=Math.floor((-range-margin)/512)-1,regionMax=Math.floor((range+margin)/512)+1,boxes=[];
    for(let z=regionMin;z<=regionMax;z++){
      const count=engine._structure_scan_row(id,z,regionMin,regionMax);
      if(count<0)throw new Error('结构搜索范围超过引擎限制。');
      for(let i=0;i<count;i++){
        const b=Array.from({length:6},(_,j)=>engine._structure_result_at(i*6+j));
        if(b[3]<-range-128||b[0]>range+128||b[5]<-range-128||b[2]>range+128)continue;
        boxes.push(b);
      }
      if((z-regionMin)%4===0)onProgress({progress:.65*(z-regionMin+1)/(regionMax-regionMin+1),message:`按种子核验结构：${z-regionMin+1} / ${regionMax-regionMin+1} 行`});
    }
    return optimizeBoxes(boxes,seed,version,range,type,onProgress,started,'seed');
  }
  function optimizeBoxes(boxes,seed,version,range,type,onProgress,started,source){
    const groups=groupsOf(boxes);groups.sort((a,b)=>b.length-a.length||groupDistanceBound(a)-groupDistanceBound(b));
    const yMin=/^1\.(16|17)(\.|$)/.test(version)?0:-64,yMax=yMin===0?255:319;
    let best={count:0,x:0,y:0,z:0,distance2:Infinity};
    for(let i=0;i<groups.length;i++){
      const group=groups[i];
      if(group.length<best.count)continue;
      if(group.length===best.count&&groupDistanceBound(group)>best.distance2)continue;
      best=bestAtGroup(group,range,yMin,yMax,best);
      if((i&15)===0)onProgress({progress:(source==='seed'?.65:0)+(source==='seed'?.35:1)*(i+1)/Math.max(1,groups.length),message:`优化三维挂机点：${i+1} / ${groups.length} 组`});
    }
    const selected=best.count?boxes.filter(b=>{
      const f=feasibleIntervals(b,best.y,best.z,range);return f.some(([a,c])=>best.x>=a&&best.x<=c);
    }):[];
    return {type,seed:String(seed),version,range,found:best.count>0,count:best.count,
      x:best.x,y:best.y,z:best.z,distanceToOrigin:best.count?Math.sqrt(best.distance2):null,
      structures:selected,structureCount:boxes.length,groups:groups.length,
      geometryExact:true,source,elapsedMs:performance.now()-started};
  }
  function searchSaved(savedBoxes,seed,version,range,type,onProgress=()=>{}){
    if(!Number.isInteger(range)||range<1||range>108000)throw new Error('搜索范围必须是 1～108000 的整数。');
    if(!['hut','monument'].includes(type))throw new Error('未知结构类型。');
    const boxes=savedBoxes.filter(b=>Array.isArray(b)&&b.length===6&&b.every(Number.isInteger)&&b[0]<=b[3]&&b[1]<=b[4]&&b[2]<=b[5]&&
      b[3]>=-range-128&&b[0]<=range+128&&b[5]>=-range-128&&b[2]<=range+128);
    return optimizeBoxes(boxes,seed,version,range,type,onProgress,performance.now(),'save');
  }
  return {VERSION_PROFILES,feasibleIntervals,groupsOf,bestAtGroup,search,searchSaved};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=SlimeStructures;
