

const TEMPLATE_BASE64='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';

/* SPDX-License-Identifier: AGPL-3.0-only */

/** Typed, big-endian Java NBT. Long tags never pass through JavaScript Number. */

export const tag = (type, value) => [type, value];

export const compound = value => tag(10, value);

export const list = (type, value = []) => tag(9, [type, value]);

export const value = (obj, key) => obj[key]?.[1];

const decoder = new TextDecoder('utf-8', {fatal: true});

const encoder = new TextEncoder();

const MAX_LENGTH = 16_777_216;



export function decodeNBT(bytes) {

  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  let at = 0;

  function need(n) { if (n < 0 || at + n > data.length) throw new Error('NBT 文件不完整。'); }

  function num(size, method) { need(size); const n = view[method](at, false); at += size; return n; }

  function str() { const n = num(2, 'getUint16'); need(n); const s = decoder.decode(data.subarray(at, at + n)); at += n; return s; }

  function length() { const n = num(4, 'getInt32'); if (n < 0 || n > MAX_LENGTH) throw new Error('NBT 数组长度超限。'); return n; }

  function payload(type, depth = 0) {

    if (depth > 100) throw new Error('NBT 嵌套过深。');

    switch (type) {

      case 1: return num(1, 'getInt8');

      case 2: return num(2, 'getInt16');

      case 3: return num(4, 'getInt32');

      case 4: return num(8, 'getBigInt64');

      case 5: return num(4, 'getFloat32');

      case 6: return num(8, 'getFloat64');

      case 7: { const n = length(); need(n); const r = Array.from(data.subarray(at, at + n), x => x > 127 ? x - 256 : x); at += n; return r; }

      case 8: return str();

      case 9: { const sub = num(1, 'getUint8'), n = length(); if (sub === 0 && n) throw new Error('NBT 列表类型无效。'); return [sub, Array.from({length:n}, () => payload(sub, depth + 1))]; }

      case 10: {

        const out = Object.create(null);

        while (true) { const sub = num(1, 'getUint8'); if (!sub) return out; const key = str(); if (Object.hasOwn(out, key)) throw new Error('NBT 包含重复标签。'); out[key] = tag(sub, payload(sub, depth + 1)); }

      }

      case 11: { const n = length(); return Array.from({length:n}, () => num(4, 'getInt32')); }

      case 12: { const n = length(); return Array.from({length:n}, () => num(8, 'getBigInt64')); }

      default: throw new Error(`未知 NBT 类型：${type}`);

    }

  }

  const type = num(1, 'getUint8');

  if (type !== 10) throw new Error('投影 NBT 根标签须为 Compound。');

  const name = str(), root = payload(type);

  if (at !== data.length) throw new Error('NBT 尾部存在额外数据。');

  return {name, root};

}



export function encodeNBT(root, name = '') {

  let data = new Uint8Array(65536), view = new DataView(data.buffer), at = 0;

  function reserve(n) {

    if (at + n <= data.length) return;

    let size = data.length; while (size < at + n) size *= 2;

    const newer = new Uint8Array(size); newer.set(data); data = newer; view = new DataView(data.buffer);

  }

  function num(n, size, method) { reserve(size); view[method](at, n, false); at += size; }

  function str(s) { const bytes = encoder.encode(s); if (bytes.length > 65535) throw new Error('NBT 字符串过长。'); num(bytes.length, 2, 'setUint16'); reserve(bytes.length); data.set(bytes, at); at += bytes.length; }

  function payload(type, p) {

    switch (type) {

      case 1: num(p, 1, 'setInt8'); break;

      case 2: num(p, 2, 'setInt16'); break;

      case 3: num(p, 4, 'setInt32'); break;

      case 4: num(BigInt.asIntN(64, BigInt(p)), 8, 'setBigInt64'); break;

      case 5: num(p, 4, 'setFloat32'); break;

      case 6: num(p, 8, 'setFloat64'); break;

      case 7: num(p.length, 4, 'setInt32'); for (const n of p) num(n, 1, 'setInt8'); break;

      case 8: str(p); break;

      case 9: num(p[0], 1, 'setUint8'); num(p[1].length, 4, 'setInt32'); for (const t of p[1]) payload(p[0], t); break;

      case 10:

        for (const [key, [t, v]] of Object.entries(p)) { num(t, 1, 'setUint8'); str(key); payload(t, v); }

        num(0, 1, 'setUint8'); break;

      case 11: num(p.length, 4, 'setInt32'); for (const n of p) num(n, 4, 'setInt32'); break;

      case 12: num(p.length, 4, 'setInt32'); for (const n of p) num(BigInt.asIntN(64, BigInt(n)), 8, 'setBigInt64'); break;

      default: throw new Error(`不能写入 NBT 类型 ${type}`);

    }

  }

  num(10, 1, 'setUint8'); str(name); payload(10, root);

  return data.slice(0, at);

}



export async function inflate(bytes) {

  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return bytes;

  if (typeof DecompressionStream === 'undefined') throw new Error('浏览器不支持本地解压，请使用新版 Chrome、Edge 或 Firefox。');

  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());

}

export async function deflate(bytes) {

  if (typeof CompressionStream === 'undefined') throw new Error('浏览器不支持本地压缩，请使用新版 Chrome、Edge 或 Firefox。');

  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());

}

export function cloneTag(obj) { return structuredClone(obj); }

export function unwrap([type, p]) {

  if (type === 10) return Object.fromEntries(Object.entries(p).map(([k,v]) => [k,unwrap(v)]));

  if (type === 9) return p[1].map(v => unwrap([p[0],v]));

  return p;

}



/* SPDX-License-Identifier: AGPL-3.0-only */



export const CONSTANTS = Object.freeze({

  step:42.2, stepTenths:422, limit:13504, maxTNT:320, rowSize:10,

  corePayloadRows:2, maxRepeats:7, propulsionPerBank:10, propulsionTotal:20,

  templateHash:'900be1434d843523f4dbaaa4e55b4fc5bdd7a7423670e1f2ef064dc70f1864e4',

  cutY:34, pivotX:13.5, pivotZ:5.5,

});

export const VALIDATION = Object.freeze({

  gameTested:false,

  direction:'1.21.10 实测：原东翼推动珍珠向 +X，原南翼向 +Z；已修正旧版两翼数量对调。',

  rotation:'珍珠矫正不旋转。负 Z 使用侧移信号塔，避开 TNT 与珍珠；代表组合已通过 1.21.10 实测，未逐一验证所有输入组合。',

  distance:'42.2 格/TNT 是用户提供的标称换算，未进行射程标定。',

});

const NS='minecraft:', TNT=NS+'tnt', GLASS=NS+'glass';

const DIRS=['north','east','south','west'];

const VECTORS={north:[0,-1],east:[1,0],south:[0,1],west:[-1,0]};

const key = p => p.join(',');

const fromKey = k => k.split(',').map(Number);

const stateKey = s => s.Name + '[' + Object.entries(s.Properties||{}).sort().map(([k,v])=>`${k}=${v}`).join(',') + ']';

const clone = x => structuredClone(x);

function demand(ok, message) { if (!ok) throw new Error(message); }



/** Decimal input is kept as a rational until after nearest-TNT rounding. Ties go away from zero. */

export function parseDisplacement(input) {

  const text=String(input).trim();

  demand(text.length>0 && text.length<=80, '请输入位移数值。');

  const m=/^([+-]?)(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d{1,2}))?$/.exec(text);

  demand(m, '位移只能是有限十进制数，例如 -100、422 或 84.4。');

  const integer=m[2]||'0', fraction=m[3]??m[4]??'', exponent=Number(m[5]||0);

  demand(integer.length+fraction.length<=40 && Math.abs(exponent)<=30, '数值精度超出支持范围。');

  let n=BigInt(integer+fraction), d=10n**BigInt(fraction.length);

  if (exponent>=0) n*=10n**BigInt(exponent); else d*=10n**BigInt(-exponent);

  if (m[1]==='-') n=-n;

  demand(20n*(n<0n?-n:n)<(2n*BigInt(CONSTANTS.maxTNT)+1n)*422n*d, `取整后超过两组阵列容量：每轴最多 ${CONSTANTS.maxTNT} 个射程 TNT，标称位移 ${CONSTANTS.limit} 格。`);

  return {n,d,text,number:Number(n)/Number(d)};

}

export function nearestTNT(input) {

  const r=parseDisplacement(input), a=r.n<0n?-r.n:r.n;

  const q=422n*r.d, count=Number((20n*a+q)/(2n*q));

  return count===0?0:(r.n<0n?-count:count);

}

export function exactDistance(count) {

  const n=count*422;

  return `${n<0?'-':''}${Math.floor(Math.abs(n)/10)}.${Math.abs(n)%10}`;

}

export function rotationFor(nx,nz) {

  if(nx>=0&&nz>=0) return 0;

  if(nx<0&&nz>=0) return 1;

  if(nx<=0&&nz<0) return 2;

  return 3;

}

export function rotateVector(x,z,q) {

  for(let i=0;i<((q%4)+4)%4;i++) [x,z]=[-z,x];

  return [x===0?0:x,z===0?0:z];

}

export function makeLegacyPlan(dx,dz,options={}) {

  const x=parseDisplacement(dx),z=parseDisplacement(dz), nx=nearestTNT(dx),nz=nearestTNT(dz);

  const q=rotationFor(nx,nz);

  const [sourceX,sourceZ]=rotateVector(nx,nz,4-q);

  demand(sourceX>=0&&sourceZ>=0,'内部方向换算错误。');

  // Native Minecraft 1.21.10: east bank supplies +X, south bank supplies +Z.

  // Fixed propulsion rows position the payload and are excluded from range.

  const coreCapacity=CONSTANTS.corePayloadRows*CONSTANTS.rowSize;

  const eastRepeats=Math.ceil(Math.max(0,sourceX-coreCapacity)/(2*CONSTANTS.rowSize));

  const southRepeats=Math.ceil(Math.max(0,sourceZ-coreCapacity)/(2*CONSTANTS.rowSize));

  demand(eastRepeats<=CONSTANTS.maxRepeats&&southRepeats<=CONSTANTS.maxRepeats,'延展模块数量超限。');

  const pivotX=options.pivotX??CONSTANTS.pivotX, pivotZ=options.pivotZ??CONSTANTS.pivotZ;

  demand(Number.isFinite(pivotX)&&Number.isFinite(pivotZ),'旋转中心无效。');

  const rows = (n,repeats) => ({

    tnt:n,fullRows:Math.floor(n/10),partial:n%10,activeRows:Math.ceil(n/10),

    propulsionTNT:CONSTANTS.propulsionPerBank,totalTNT:n+CONSTANTS.propulsionPerBank,

    restoredGlassTNT:Math.min(n,coreCapacity),payloadRows:CONSTANTS.corePayloadRows+2*repeats,

    payloadCapacity:coreCapacity+2*CONSTANTS.rowSize*repeats,repeats,

  });

  return {

    generatorVersion:'0.3.0',countingModel:'fixed-propulsion-plus-variable-pearl-payload',

    requested:{x:x.number,z:z.number,textX:x.text,textZ:z.text},

    // x/z and total remain the signed-axis / unsigned-sum PAYLOAD counts.

    // structureTotal includes the twenty fixed propulsion TNT for material accounting.

    counts:{x:nx,z:nz,total:Math.abs(nx)+Math.abs(nz),

      propulsion:CONSTANTS.propulsionTotal,structureTotal:Math.abs(nx)+Math.abs(nz)+CONSTANTS.propulsionTotal},

    predicted:{x:nx*422/10,z:nz*422/10,textX:exactDistance(nx),textZ:exactDistance(nz)},

    error:{x:nx*422/10-x.number,z:nz*422/10-z.number},

    quarterTurns:q,degrees:q*90,pivot:{x:pivotX,z:pivotZ},cutY:CONSTANTS.cutY,

    canonical:{x:sourceX,z:sourceZ},

    banks:{east:rows(sourceX,eastRepeats),south:rows(sourceZ,southRepeats)},

    originalSize:{x:29+4*eastRepeats,y:101,z:21+4*southRepeats},

    zero:!nx&&!nz,needsExperimentalConsent:q!==0,

    verification:{arithmetic:'exact-decimal',structure:'not-yet-built',gameTested:false,designRuntimeTested:true,runtimeVersion:'1.21.10',runtimeScope:'representative TNT transport, firing and repeat tests; not exact landing calibration'},

    warnings:[VALIDATION.direction,VALIDATION.distance,...(q?[VALIDATION.rotation]:[])],

  };

}



export function rotateState(s,q) {

  q=((q%4)+4)%4;

  if(!q) return clone(s);

  const out=clone(s),p=s.Properties||{}, r={};

  const direction=d=>DIRS.includes(d)?DIRS[(DIRS.indexOf(d)+q)%4]:d;

  for(const [k,v] of Object.entries(p)) {

    let a=k,b=v;

    if(DIRS.includes(k)) a=direction(k);

    if(k==='facing'||k==='horizontal_facing') b=direction(v);

    if(k==='axis'&&q%2) b=v==='x'?'z':v==='z'?'x':v;

    if(k==='rotation') b=String((Number(v)+q*4)%16);

    if(k==='orientation') b=v.split('_').map(direction).join('_');

    if(k==='shape') {

      if(v==='north_south'||v==='east_west') b=q%2?(v==='north_south'?'east_west':'north_south'):v;

      else if(v.startsWith('ascending_')) b='ascending_'+direction(v.slice(10));

      else if(/^(north|south)_(east|west)$/.test(v)) {

        const set=new Set(v.split('_').map(direction));

        b=(set.has('north')?'north':'south')+'_'+(set.has('east')?'east':'west');

      }

    }

    r[a]=b;

  }

  if(Object.hasOwn(s,'Properties')) out.Properties=r;

  return out;

}

export function rotatePoint(p,q,pivot={x:13.5,z:5.5}) {

  const [x,z]=rotateVector(p[0]+.5-pivot.x,p[2]+.5-pivot.z,q);

  const a=x+pivot.x-.5,b=z+pivot.z-.5;

  demand(Math.abs(a-Math.round(a))<1e-9&&Math.abs(b-Math.round(b))<1e-9,'该旋转中心不能保持整数方块坐标。');

  return [Math.round(a),p[1],Math.round(b)];

}



function unpackRegion(name,r) {

  const size=unwrap(r.Size),position=unwrap(r.Position),sx=Math.abs(size.x),sy=Math.abs(size.y),sz=Math.abs(size.z);

  demand(sx*sy*sz<=8_000_000,'模板子区域体积过大。');

  const offset=['x','y','z'].map(a=>position[a]+Math.min(0,size[a]+1));

  const palette=value(r,'BlockStatePalette')[1].map(p=>unwrap(compound(p)));

  const bits=Math.max(2,Math.ceil(Math.log2(palette.length))), mask=(1n<<BigInt(bits))-1n;

  const words=value(r,'BlockStates').map(w=>BigInt.asUintN(64,w));

  demand(words.length>=Math.ceil(sx*sy*sz*bits/64),'模板方块数组长度不足。');

  const blocks=new Map();

  for(let i=0;i<sx*sy*sz;i++) {

    const bit=i*bits,index=Math.floor(bit/64),shift=bit%64;

    let n=words[index]>>BigInt(shift);

    if(shift+bits>64) n|=words[index+1]<<BigInt(64-shift);

    const state=palette[Number(n&mask)]; demand(state,'模板调色板索引无效。');

    if(state.Name===NS+'air') continue;

    const p=[i%sx+offset[0],Math.floor(i/(sx*sz))+offset[1],Math.floor(i/sx)%sz+offset[2]];

    blocks.set(key(p),{p,state,sourceRegion:name});

  }

  for(const t of value(r,'TileEntities')?.[1]||[]) {

    const p=['x','y','z'].map((a,i)=>value(t,a)+offset[i]);

    const block=blocks.get(key(p)); demand(block,'方块实体没有对应方块。');

    block.tile=cloneTag(t);

  }

  for(const label of ['Entities','PendingBlockTicks','PendingFluidTicks'])

    demand(!value(r,label)?.[1]?.length,`此专用模板暂不支持非空 ${label}，不会静默丢弃。`);

  return {name,size,position,blocks,palette};

}

export async function loadTemplate(bytes) {

  const {root}=decodeNBT(await inflate(bytes));

  const regions=new Map(Object.entries(value(root,'Regions')).map(([name,[type,r]])=>{

    demand(type===10,'区域标签格式错误。'); return [name,unpackRegion(name,r)];

  }));

  demand(regions.has('5')&&regions.has('4')&&regions.has('2'),'需要本项目附带的珍珠炮样机。');

  const base=regions.get('5'), east=regions.get('4'), south=regions.get('2');

  demand(base.size.x===28&&base.size.y===101&&base.size.z===20&&base.position.x===0&&base.position.y===0&&base.position.z===0,'核心区域尺寸或原点不匹配。');

  demand(east.size.x===4&&east.position.x===28&&east.position.z===0&&east.position.y===0&&east.size.y===101,'X 延展模块不匹配。');

  demand(south.size.z===4&&south.position.z===20&&south.position.x===0&&south.position.y===0&&south.size.y===101,'Z 延展模块不匹配。');

  const blockAt=p=>base.blocks.get(key(p))?.state.Name;

  for(let z=5;z<=14;z++) {

    demand(blockAt([22,92,z])===TNT,'核心东翼的工作排不匹配。');

    for(const x of [24,26]) demand(blockAt([x,92,z])===NS+'white_stained_glass','核心东翼玻璃占位排不匹配。');

  }

  for(let x=4;x<=13;x++) {

    demand(blockAt([x,92,14])===TNT,'核心南翼的工作排不匹配。');

    for(const z of [16,18]) demand(blockAt([x,92,z])===NS+'white_stained_glass','核心南翼玻璃占位排不匹配。');

  }

  for(const reg of [east,south]) demand([...reg.blocks.values()].filter(b=>b.state.Name===TNT).length===20,'重复模块须包含两排、共 20 个 TNT。');

  const largeDoc=decodeNBT(await inflate(Uint8Array.from(atob(LARGE_TEMPLATE_BASE64),c=>c.charCodeAt(0))));

  const [largeName,[,largeNBT]]=Object.entries(value(largeDoc.root,'Regions'))[0];

  const large=unpackRegion(largeName,largeNBT);

  return {root,regions,base,east,south,large,originalBytes:bytes,

    sourceDataVersion:value(root,'MinecraftDataVersion'),author:value(value(root,'Metadata'),'Author')||'Yisibite'};

}

function appendRegion(out,reg,dx=0,dz=0,label=reg.name) {

  for(const block of reg.blocks.values()) {

    const p=[block.p[0]+dx,block.p[1],block.p[2]+dz],k=key(p);

    demand(!out.has(k),`模板重复区域重叠：${k}`);

    out.set(k,{...block,p,state:clone(block.state),tile:block.tile?cloneTag(block.tile):undefined,sourceRegion:label});

  }

}

/** Slot coordinates are an explicit whitelist; guide/support glass is never restored. */

function bankRow(wing,row) {

  demand(wing==='east'||wing==='south','未知工作翼。');

  return {

    positions:Array.from({length:10},(_,i)=>wing==='east'?[row,92,14-i]:[4+i,92,row]),

    coral:wing==='east'?[row,92,15]:[3,92,row],

  };

}

function checkCoral(blocks,wing,coral) {

  const state=blocks.get(key(coral))?.state;

  demand(state?.Name===NS+'dead_fire_coral_wall_fan'&&state.Properties?.facing===(wing==='east'?'north':'east'),

    'TNT 排的珊瑚扇缺失或朝向不匹配。');

}

function trimBank(blocks,wing,count,repeats) {

  const propulsionRow=wing==='east'?22:14;

  const propulsion=bankRow(wing,propulsionRow);

  checkCoral(blocks,wing,propulsion.coral);

  // Never pass the propulsion row through the payload trimming loop, even for a zero axis.

  for(const p of propulsion.positions) {

    const b=blocks.get(key(p));demand(b?.state.Name===TNT,'首排推进 TNT 缺失。');

    b.tntRole='propulsion';b.bank=wing;

  }

  const tntState=clone(blocks.get(key(propulsion.positions[0])).state);

  const restoredRows=wing==='east'?[24,26]:[16,18];

  const rows=[...restoredRows,...Array.from({length:repeats*2},(_,i)=>(wing==='east'?28:20)+i*2)];

  let remaining=count;

  const detail=[{wing,row:propulsionRow,role:'propulsion',restoredFromGlass:false,kept:10,replaced:0,

    ...propulsion,order:'near-coral-first'}];

  for(const row of rows) {

    const keep=Math.min(10,remaining);remaining-=keep;

    const {positions,coral}=bankRow(wing,row),restoredFromGlass=restoredRows.includes(row);

    checkCoral(blocks,wing,coral);

    positions.forEach((p,i)=>{

      const b=blocks.get(key(p));

      demand(b?.state.Name===(restoredFromGlass?NS+'white_stained_glass':TNT),

        '射程阵列的原始方块与样机不匹配。');

      // Retain a coral-connected prefix; the far end is replaced first.

      // Reinstated TNT inherit the original TNT block state, including unstable=false.

      if(i<keep) b.state=clone(restoredFromGlass?tntState:b.state);

      else b.state={Name:GLASS};

      b.tntRole='pearl';b.bank=wing;

    });

    detail.push({wing,row,role:'pearl',restoredFromGlass,kept:keep,replaced:10-keep,coral,positions,order:'near-coral-first'});

  }

  demand(remaining===0,'射程阵列容量不足。');

  return detail;

}

const isFixedTower=p=>p[1]>=34&&p[0]>=12&&p[0]<=14&&p[2]>=0&&p[2]<=1;

const isFixed=p=>p[1]<34||isFixedTower(p);

const isWire=b=>b?.state.Name===NS+'redstone_wire';

const wireState={Name:NS+'redstone_wire',Properties:{north:'none',east:'none',south:'none',west:'none',power:'0'}};



/** Same-height dust routing. This checks connectivity/power only; it does not simulate block-update order. */

function connectUpperInput(blocks,plan) {

  if(!plan.quarterTurns) return {added:0,path:[],minPower:11,checked:true};

  const source=plan.signalSource??[13,97,1], start=plan.signalStart??[13,97,2];

  demand(blocks.get(key(source))?.state.Name===NS+'redstone_block','原信号塔输出已丢失。');

  const trunk=new Set([[13,97,2],[13,97,3],[14,97,3],[15,97,3],[16,97,3],[15,97,4]].map(p=>key(rotatePoint(p,plan.quarterTurns,plan.pivot))));

  for(const k of trunk) demand(isWire(blocks.get(k)),'转向后的输入线不完整。');

  const inputLoads=new Set([[17,97,3],[15,97,5]].map(p=>key(rotatePoint(p,plan.quarterTurns,plan.pivot))));

  const passive=new Set([NS+'black_stained_glass',NS+'white_stained_glass',GLASS]);

  const trunkEntry=key(rotatePoint([13,97,2],plan.quarterTurns,plan.pivot));

  function allowed(p) {

    const k=key(p),current=blocks.get(k);

    if(trunk.has(k)) return !plan.signalSource||k===trunkEntry;

    if(current) return false;

    if(p[0]<3||p[0]>23||p[2]<-5||p[2]>15) return false;

    const below=blocks.get(key([p[0],96,p[2]]));

    if(below&&!passive.has(below.state.Name)) return false;

    const above=blocks.get(key([p[0],98,p[2]]));

    if(above&&!passive.has(above.state.Name)) return false;

    for(const [dx,dz] of Object.values(VECTORS)) {

      const q=[p[0]+dx,97,p[2]+dz],n=blocks.get(key(q));

      if(plan.quarterTurns===3&&trunk.has(key(q))&&key(q)!==trunkEntry)return false;

      if(n&&key(q)!==key(source)&&!trunk.has(key(q))&&!inputLoads.has(key(q))&&!passive.has(n.state.Name)) return false;

    }

    return true;

  }

  const starts=plan.signalSource?

    [start,...Object.values(VECTORS).map(([dx,dz])=>[source[0]+dx,97,source[2]+dz])].filter(allowed):[start];

  demand(starts.length&&allowed(starts[0]),'信号塔出线口被转向结构占用。');

  const queue=starts,prev=new Map(starts.map(p=>[key(p),null])); let end=null;

  for(let head=0;head<queue.length;head++) {

    const p=queue[head];

    if(trunk.has(key(p))&&(!plan.signalSource||key(p)===trunkEntry)) { end=p; break; }

    for(const [dx,dz] of Object.values(VECTORS)) {

      const n=[p[0]+dx,97,p[2]+dz],k=key(n);

      if(!prev.has(k)&&allowed(n)) { prev.set(k,key(p)); queue.push(n); }

    }

  }

  demand(end,'没有找到不接触其他元件的上层输入接线，已停止导出。');

  const path=[]; for(let k=key(end);k!==null;k=prev.get(k)) path.push(fromKey(k)); path.reverse();

  let added=0;

  for(const p of path) {

    if(!blocks.has(key(p))) { blocks.set(key(p),{p,state:clone(wireState),sourceRegion:'rotation-bridge'}); added++; }

    const below=[p[0],96,p[2]];

    if(!blocks.has(key(below))) { blocks.set(key(below),{p:below,state:{Name:NS+'black_stained_glass'},sourceRegion:'rotation-bridge'}); added++; }

  }

  // Compute strength from the unchanged source, without adding repeaters or claiming timing equivalence.

  const distances=new Map(),todo=[];

  for(const [dx,dz] of Object.values(VECTORS)) {

    const p=[source[0]+dx,97,source[2]+dz];

    if(isWire(blocks.get(key(p)))) {distances.set(key(p),1);todo.push(p);}

  }

  for(let i=0;i<todo.length;i++) {

    const p=todo[i],d=distances.get(key(p));

    for(const [dx,dz] of Object.values(VECTORS)) {

      const n=[p[0]+dx,97,p[2]+dz],k=key(n);

      if(isWire(blocks.get(k))&&!distances.has(k)) {distances.set(k,d+1);todo.push(n);}

    }

  }

  const loads=[[16,97,3],[15,97,4]].map(p=>rotatePoint(p,plan.quarterTurns,plan.pivot));

  const minPower=Math.min(...loads.map(p=>16-(distances.get(key(p))??Infinity)));

  demand(minPower>=1,'接线后的信号强度不足，已停止导出。');

  const affected=new Set([...path.map(key),...trunk]);

  for(const k of affected) {

    const b=blocks.get(k); if(!isWire(b)) continue;

    const props={...b.state.Properties};

    for(const [dir,[dx,dz]] of Object.entries(VECTORS)) {

      const n=blocks.get(key([b.p[0]+dx,97,b.p[2]+dz]));

      const connected=isWire(n)||n?.state.Name===NS+'redstone_block'||n?.state.Name===NS+'gray_concrete';

      props[dir]=connected?'side':'none';

    }

    const sides=DIRS.filter(d=>props[d]!=='none');

    if(sides.length===1) props[DIRS[(DIRS.indexOf(sides[0])+2)%4]]='side';

    if(sides.length===0) for(const d of DIRS) props[d]='side';

    props.power=String(Math.max(0,16-(distances.get(k)??16)));

    b.state={...b.state,Properties:props};

  }

  return {added,path,minPower,checked:true,limitation:'静态接线与信号强度检查，不包含游戏刻内更新顺序。'};

}



export function buildLegacyCannon(template,dx,dz,options={}) {

  const plan=makeLegacyPlan(dx,dz,options);

  demand(!plan.zero,'两轴都取整为 0 TNT，无有效发射位移；无需生成珍珠炮。');

  const canonical=new Map(); appendRegion(canonical,template.base);

  for(let i=0;i<plan.banks.east.repeats;i++) appendRegion(canonical,template.east,i*4,0,`east-${i+1}`);

  for(let i=0;i<plan.banks.south.repeats;i++) appendRegion(canonical,template.south,0,i*4,`south-${i+1}`);

  const rows=[...trimBank(canonical,'east',plan.canonical.x,plan.banks.east.repeats),...trimBank(canonical,'south',plan.canonical.z,plan.banks.south.repeats)];

  if(options.__v7Target)assembleV7Arrays(template,canonical,plan,rows,options.__v7Target);

  let blocks,bridge,relayTurns=0,collisionExamples=[],signalBypass=null;

  if(plan.quarterTurns>=2) {

    signalBypass=assembleNegativeZ(canonical,plan);

    blocks=signalBypass.blocks;

    bridge=connectUpperInput(blocks,plan);

    for(const b of canonical.values())if(b.p[1]<34) {

      const tower=b.p[1]>=9&&b.p[0]>=12&&b.p[0]<=14&&b.p[2]>=0&&b.p[2]<=1;

      if(!tower)demand(stateKey(blocks.get(key(b.p))?.state)===stateKey(b.state),'Pearl correction changed.');

    }

  } else {

  const upperRotated=new Map();

  for(const b of canonical.values()) if(!isFixed(b.p)) {

    const p=rotatePoint(b.p,plan.quarterTurns,plan.pivot),k=key(p);

    demand(!upperRotated.has(k),`上部方块重叠：${k}`);

    upperRotated.set(k,{...clone(b),p,state:rotateState(b.state,plan.quarterTurns)});

  }

  // The first signal-tower relay intersects the rotated glass guide in two cells

  // for 180/270 degrees. Try rigid quarter-turns of that COMPLETE isolated relay

  // around its own unchanged signal-column axis. Never delete the colliding glass

  // or overwrite a piston. Input and output column coordinates remain unchanged.

  const inRelay=p=>isFixedTower(p)&&p[1]>=38&&p[1]<=44;

  blocks=null;relayTurns=null;collisionExamples=[];

  for(const relayQ of [0,1,2,3]) {

    const candidate=new Map(upperRotated); let conflict=false;

    for(const b of canonical.values()) if(isFixed(b.p)) {

      const move=inRelay(b.p),p=move?rotatePoint(b.p,relayQ,{x:13.5,z:1.5}):b.p,k=key(p);

      if(candidate.has(k)) {conflict=true;collisionExamples.push({at:p,relayTurns:relayQ});break;}

      candidate.set(k,{...clone(b),p,state:move?rotateState(b.state,relayQ):clone(b.state)});

    }

    if(!conflict) {blocks=candidate;relayTurns=relayQ;break;}

  }

  demand(blocks,'上层、矫正结构或信号塔互相碰撞，已停止导出。');

  bridge=connectUpperInput(blocks,plan);

  for(const b of canonical.values()) if(isFixed(b.p)) {

    const move=inRelay(b.p),p=move?rotatePoint(b.p,relayTurns,{x:13.5,z:1.5}):b.p;

    const state=move?rotateState(b.state,relayTurns):b.state;

    const after=blocks.get(key(p));

    demand(after&&stateKey(after.state)===stateKey(state),'固定结构或完整中继被意外改写。');

    demand(JSON.stringify(after.tile??null)===JSON.stringify(b.tile??null),'固定方块实体发生改变。');

  }

  // Entry and exit of the moved relay must stay in the original central column.

  for(const y of [37,38,44,45]) {

    const k=key([13,y,1]);

    demand(stateKey(blocks.get(k).state)===stateKey(canonical.get(k).state),'中继输入或输出柱错位。');

  }

  }

  const actualTNT=[...blocks.values()].filter(b=>b.state.Name===TNT).length;

  const propulsionTNT=[...blocks.values()].filter(b=>b.state.Name===TNT&&b.tntRole==='propulsion').length;

  const payloadTNT=[...blocks.values()].filter(b=>b.state.Name===TNT&&b.tntRole==='pearl').length;

  demand(propulsionTNT===plan.counts.propulsion,'首排推进 TNT 被意外裁减。');

  demand(payloadTNT===plan.counts.total,'射程 TNT 数量与计划不一致。');

  demand(actualTNT===plan.counts.structureTotal&&actualTNT===propulsionTNT+payloadTNT,'投影 TNT 总数与计划不一致。');

  for(const row of rows.filter(r=>r.role==='propulsion'))for(const p of row.positions) {

    const original=canonical.get(key(p)),after=blocks.get(key(rotatePoint(p,plan.quarterTurns,plan.pivot)));

    demand(after&&stateKey(after.state)===stateKey(rotateState(original.state,plan.quarterTurns)),

      '首排推进 TNT 的方块状态被改写。');

  }

  const materials={};for(const b of blocks.values())materials[b.state.Name]=(materials[b.state.Name]||0)+1;

  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];

  for(const b of blocks.values()) for(let i=0;i<3;i++){min[i]=Math.min(min[i],b.p[i]);max[i]=Math.max(max[i],b.p[i]);}

  plan.verification.structure='passed-static-checks';

  plan.verification.gameTested=false;

  plan.structure={nonAir:blocks.size,tnt:actualTNT,propulsionTNT,payloadTNT,bounds:{min,max,size:max.map((v,i)=>v-min[i]+1)},bridge,

    fixedLower:!signalBypass,correctionUnrotated:true,signalBypass:signalBypass?{shiftX:signalBypass.shift,towerRotationDegrees:signalBypass.towerTurns*90,bottomPath:signalBypass.bottomPath,tapPath:signalBypass.tapPath}:null,fixedTower:!signalBypass&&relayTurns===0,relayRotationDegrees:relayTurns*90,avoidedCollisions:collisionExamples,

    reserveGlassPreserved:false,reserveGlassReused:true,

    restoredGlassTNT:rows.filter(r=>r.restoredFromGlass).reduce((sum,r)=>sum+r.kept,0),

    propulsionRowsPreserved:true,sourceDataVersion:template.sourceDataVersion};

  return {plan,blocks,canonical,rows,materials,template};

}



// Minecraft Java .litematic generator: relocate the in-game redstone signal tower.

// This edits virtual block coordinates only; the pearl correction stays unrotated.

function assembleNegativeZ(canonical,plan) {

  const blocks=new Map(),shift=plan.quarterTurns===2?3:-6,towerTurns=plan.quarterTurns===2?2:0,changes=[];

  const tower=p=>p[1]>=9&&p[0]>=12&&p[0]<=14&&p[2]>=0&&p[2]<=1;

  const tap=p=>p[0]===14&&p[2]===1&&(p[1]===28||p[1]===29);

  function put(p,state,sourceRegion='signal-bypass',extra={}) {

    const k=key(p),old=blocks.get(k);

    demand(!old,`Signal bypass overlaps ${k}: ${old?.state.Name}`);

    blocks.set(k,{...extra,p,state:clone(state),sourceRegion});

  }

  for(const b of canonical.values()) {

    if(tower(b.p)) {

      const moved=rotatePoint(b.p,towerTurns,{x:13.5,z:1.5});moved[0]+=shift;

      put(moved,rotateState(b.state,towerTurns),'relocated-signal-tower',b);

      if(tap(b.p))put(b.p,b.state,b.sourceRegion,b);

      continue;

    }

    const fixed=b.p[1]<34,p=fixed?b.p:rotatePoint(b.p,plan.quarterTurns,plan.pivot);

    put(p,fixed?b.state:rotateState(b.state,plan.quarterTurns),b.sourceRegion,b);

  }

  function dustPath(path,powered=false) {

    for(let i=0;i<path.length;i++) {

      const p=path[i],s=clone(wireState),previous=path[i-1],next=path[i+1];

      for(const n of [previous,next].filter(Boolean))for(const [dir,[dx,dz]] of Object.entries(VECTORS))

        if(n[0]-p[0]===dx&&n[2]-p[2]===dz)s.Properties[dir]='side';

      const sides=DIRS.filter(d=>s.Properties[d]!=='none');

      if(sides.length===1)s.Properties[DIRS[(DIRS.indexOf(sides[0])+2)%4]]='side';

      s.Properties.power=String(powered?15-i:0);

      const old=blocks.get(key(p));

      if(old){demand(isWire(old),'Signal tap is not dust.');old.state=s;}else put(p,s);

      const below=[p[0],p[1]-1,p[2]];

      if(!blocks.has(key(below)))put(below,{Name:NS+'black_stained_glass'});

    }

  }

  // Feed the relocated activator rail, preserving its neighbor-update trigger.

  const bottomPath=shift>0?[[15,10,3],[15,10,2]]:[[15,10,3],[15,10,2],[15,10,1],[15,10,0],[15,10,-1],

    ...Array.from({length:15-(14+shift)},(_,i)=>[14-i,10,-1]),[14+shift,10,0]];

  dustPath(bottomPath,true);

  // Original Y29 output also drives the fixed pearl-correction timer.

  const tapPath=shift>0?[[15,29,1],[14,29,1]]:Array.from({length:1-shift},(_,i)=>[14+shift+i,29,1]);

  dustPath(tapPath);

  const tapState=blocks.get('14,29,1').state.Properties;

  tapState.east=shift>0?'side':'none';tapState.west=shift>0?'none':'side';tapState.north='none';tapState.south='side';

  plan.signalSource=[13+shift,97,1];plan.signalStart=[13+shift,97,shift>0?0:2];

  return {blocks,shift,towerTurns,bottomPath,tapPath,changes};

}



function pointCompound(p) {return compound({x:tag(3,p[0]),y:tag(3,p[1]),z:tag(3,p[2])});}

function makeRegion(blocks,min,size) {

  const pal=[{Name:NS+'air'}],lookup=new Map([[stateKey(pal[0]),0]]),placements=[];

  for(const b of blocks) {

    const s=stateKey(b.state); if(!lookup.has(s)){lookup.set(s,pal.length);pal.push(b.state);}

    const p=b.p.map((v,i)=>v-min[i]);

    const index=(p[1]*size[2]+p[2])*size[0]+p[0]; placements.push([index,lookup.get(s)]);

  }

  const bits=Math.max(2,Math.ceil(Math.log2(pal.length))),count=size[0]*size[1]*size[2];

  const words=Array(Math.ceil(count*bits/64)).fill(0n);

  for(const [index,palette] of placements) {

    const bit=index*bits,wi=Math.floor(bit/64),shift=bit%64,n=BigInt(palette);

    words[wi]|=n<<BigInt(shift);

    if(shift+bits>64)words[wi+1]|=n>>BigInt(64-shift);

  }

  const palette=pal.map(s=>{

    const c={Name:tag(8,s.Name)};

    if(s.Properties)c.Properties=compound(Object.fromEntries(Object.entries(s.Properties).map(([k,v])=>[k,tag(8,v)])));

    return c;

  });

  const tiles=blocks.filter(b=>b.tile).map(b=>{

    const t=cloneTag(b.tile); ['x','y','z'].forEach((a,i)=>t[a]=tag(3,b.p[i]-min[i])); return t;

  });

  return compound({Position:pointCompound(min),Size:pointCompound(size),BlockStatePalette:list(10,palette),

    BlockStates:tag(12,words.map(w=>BigInt.asIntN(64,w))),TileEntities:list(10,tiles),

    Entities:list(10),PendingBlockTicks:list(10),PendingFluidTicks:list(10)});

}

export function toNBTRoot(result,options={}) {

  const {blocks,plan,template}=result;

  const sourceVersion=template.sourceDataVersion, dataVersion=options.dataVersion??sourceVersion;

  demand(Number.isInteger(dataVersion)&&dataVersion>0&&dataVersion<=2147483647,'MinecraftDataVersion 必须为正的 32 位整数。');

  const lower=[],upper=[];

  for(const b of blocks.values())(b.p[1]<34?lower:upper).push(b);

  // Non-overlapping Y ranges avoid an air volume in one subregion erasing another.

  // Keep source-relative coordinates; negative upper-region offsets are intentional.

  const upperMin=[Math.min(...upper.map(b=>b.p[0])),34,Math.min(...upper.map(b=>b.p[2]))];

  const upperMax=[Math.max(...upper.map(b=>b.p[0])),100,Math.max(...upper.map(b=>b.p[2]))];

  const upperSize=upperMax.map((v,i)=>v-upperMin[i]+1);

  const lowerMin=[Math.min(0,...lower.map(b=>b.p[0])),0,Math.min(0,...lower.map(b=>b.p[2]))];

  const lowerSize=[Math.max(27,...lower.map(b=>b.p[0]))-lowerMin[0]+1,34,Math.max(19,...lower.map(b=>b.p[2]))-lowerMin[2]+1];

  const allMin=[Math.min(lowerMin[0],upperMin[0]),0,Math.min(lowerMin[2],upperMin[2])];

  const allMax=[Math.max(lowerMin[0]+lowerSize[0]-1,upperMax[0]),100,Math.max(lowerMin[2]+lowerSize[2]-1,upperMax[2])];

  const enclosing=allMax.map((v,i)=>v-allMin[i]+1);

  const regions={

    '01_fixed_pearl_correction':makeRegion(lower,lowerMin,lowerSize),

    '02_upper_cannon_and_fixed_signal_tower':makeRegion(upper,upperMin,upperSize),

  };

  const now=BigInt(options.timestamp??Date.now());

  const name=`珍珠炮 X${plan.predicted.textX} Z${plan.predicted.textZ}${plan.mirrorZ?' [v9 零轴省料]':plan.quarterTurns>=2?' [v9 旧信号绕行]':' [v9]'}`;

  const description=[`Requested X=${plan.requested.textX}, Z=${plan.requested.textZ}.`,

    `Nominal X=${plan.predicted.textX}, Z=${plan.predicted.textZ}; pearl-payload TNT X=${Math.abs(plan.counts.x)}, Z=${Math.abs(plan.counts.z)}.`,

    `Active-array propulsion TNT=${plan.counts.propulsion}; total TNT blocks=${plan.counts.structureTotal}. Propulsion excluded from range.`,

    `Each bank reuses two former glass rows; up to two arrays per axis, 160 payload TNT per array, total 320 / 13504 per axis. Zero axes omit their independent banks including propulsion rows by default.`,

    `42.2 blocks/TNT is user calibration, not measured here. Rotation=${plan.degrees} deg; mirrorZ=${!!plan.mirrorZ}.`,

    `v7 large-array threshold edition; zero-axis banks omitted by default. Runtime status is stored in PlanJSON; this exact generated file is not automatically runtime-tested.`,

    `Based on user-provided RedenMC schematic by ${template.author}. Pearl-correction blocks stay unrotated. Negative Z reflects the complete upper including its signal tower, translates the unchanged-direction lower correction, and reconnects the v5 interfaces.`,

    `Source MinecraftDataVersion=${sourceVersion}; output=${dataVersion}.`].join('\n');

  return {

    Version:tag(3,6),SubVersion:tag(3,1),MinecraftDataVersion:tag(3,dataVersion),

    Metadata:compound({Name:tag(8,name),Author:tag(8,template.author),Description:tag(8,description),

      TimeCreated:tag(4,now),TimeModified:tag(4,now),RegionCount:tag(3,2),TotalBlocks:tag(3,blocks.size),

      TotalVolume:tag(3,lowerSize.reduce((a,b)=>a*b,1)+upperSize.reduce((a,b)=>a*b,1)),EnclosingSize:pointCompound(enclosing)}),

    Regions:compound(regions),

    PearlCannonGenerator:compound({SchemaVersion:tag(3,7),PlanJSON:tag(8,JSON.stringify(plan)),

      SourceSHA256:tag(8,CONSTANTS.templateHash),GameTested:tag(1,0),DesignRuntimeTested:tag(1,plan.verification.designRuntimeTested?1:0),RuntimeVersion:tag(8,'1.21.10')}),

  };

}

export async function exportLitematic(result,options={}) {

  demand(!result.plan.needsExperimentalConsent||options.allowExperimentalRotation===true,

    '转向方案已做代表组合实测，当前输入未逐一实测。请确认测试世界导出选项。');

  return deflate(encodeNBT(toNBTRoot(result,options)));

}

export function suggestedFilename(plan) {

  return `pearl_X${plan.predicted.textX}_Z${plan.predicted.textZ}_TNT${Math.abs(plan.counts.x)}-${Math.abs(plan.counts.z)}_BOOST${plan.counts.propulsion}_v9-zero-axis${plan.mirrorZ?'_MIRROR-Z':plan.quarterTurns>=2?'_LEGACY-SIGNAL-BYPASS':''}.litematic`;

}

export function inspectLitematicRoot(root) {

  const regions=Object.entries(value(root,'Regions')).map(([name,[,r]])=>unpackRegion(name,r));

  const all=new Map();

  for(const reg of regions)for(const [k,b]of reg.blocks){demand(!all.has(k),'输出非空气方块重叠。');all.set(k,b);}

  return {regions,blocks:all};

}

export const testing = {stateKey,key,fromKey,isFixed,isFixedTower};





// Minecraft-only block assembly. Uses the user-approved v5 mirror and lower interfaces.

export const MIRROR_LAYOUT = Object.freeze({interceptZ:27,correctionShiftZ:17,

  referenceSHA256:'e15c1be8847501b9080a4e99916474d10f1ef09e44437c7f825909a9ae63b075'});

export function mirrorPointZ(p) {return [p[0],p[1],MIRROR_LAYOUT.interceptZ-p[2]];}

export function mirrorStateZ(s) {

  const out=clone(s),r={},direction=d=>d==='north'?'south':d==='south'?'north':d;

  for(const [k,v] of Object.entries(s.Properties||{})) {

    let a=DIRS.includes(k)?direction(k):k,b=v;

    if(k==='facing'||k==='horizontal_facing')b=direction(v);

    if(k==='rotation')b=String(((8-Number(v))%16+16)%16);

    if(k==='orientation')b=v.split('_').map(direction).join('_');

    if(k==='hinge'||(k==='type'&&s.Name.endsWith('chest')))b=v==='left'?'right':v==='right'?'left':v;

    if(k==='shape'&&v.startsWith('ascending_'))b='ascending_'+direction(v.slice(10));

    if(k==='shape'&&/^(north|south)_(east|west)$/.test(v))b=v.split('_').map(direction).join('_');

    if(k==='shape'&&/^(inner|outer)_(left|right)$/.test(v))b=v.replace(/(left|right)$/,v.endsWith('left')?'right':'left');

    r[a]=b;

  }

  if(Object.hasOwn(s,'Properties'))out.Properties=r;

  return out;

}

function positiveText(input) {return parseDisplacement(input).text.replace(/^[+-]/,'');}

export function makeV6Plan(dx,dz,options={}) {

  if(nearestTNT(dz)>=0||options.negativeZMode==='legacy-bypass'){const p=makeLegacyPlan(dx,dz,options);p.generatorVersion='0.7.0';return p;}

  const plan=makeLegacyPlan(dx,positiveText(dz),options),z=parseDisplacement(dz);

  plan.generatorVersion='0.7.0';plan.mirrorZ=true;plan.negativeZMode='user-mirror-v5';

  plan.requested.z=z.number;plan.requested.textZ=z.text;plan.counts.z=-Math.abs(plan.counts.z);

  plan.predicted.z=plan.counts.z*422/10;plan.predicted.textZ=exactDistance(plan.counts.z);

  plan.error.z=plan.predicted.z-z.number;plan.needsExperimentalConsent=true;

  plan.correctionOffset=[0,0,MIRROR_LAYOUT.correctionShiftZ];plan.playerEntry=[12.25,0,21.25];

  plan.mirror={axis:'z',interceptZ:27,upperIncludesSignalTower:true,lowerCorrectionMirrored:false};

  plan.verification={...plan.verification,gameTested:false,designRuntimeTested:plan.pivot.x===13.5&&plan.pivot.z===5.5,runtimeVersion:'1.21.10',runtimeScope:'v6: representative counts, both X signs and repeated real throws; 17 transport passes / 16 pearl exits / 1 early bottom collision; no landing-distance calibration'};

  plan.warnings=[VALIDATION.distance,'负 Z 使用用户确认的完整上部镜像和原向矫正接法。'];

  return plan;

}

export function buildV6Cannon(template,dx,dz,options={}) {

  if(nearestTNT(dz)>=0||options.negativeZMode==='legacy-bypass'){const r=buildLegacyCannon(template,dx,dz,options);r.plan.generatorVersion='0.7.0';return r;}

  const positive=buildLegacyCannon(template,dx,positiveText(dz),options),plan=options.__v7Target?clone(options.__v7Target):makeV6Plan(dx,dz,options);

  const blocks=new Map(),tower=p=>p[1]>=9&&p[0]>=12&&p[0]<=14&&p[2]>=0&&p[2]<=1;

  const shifted=p=>[p[0],p[1],p[2]+MIRROR_LAYOUT.correctionShiftZ];

  function put(b,p=b.p,state=b.state) {

    demand(!blocks.has(key(p)),`Minecraft 方块重叠：${key(p)}`);

    blocks.set(key(p),{...clone(b),p:[...p],state:clone(state)});

  }

  // Preserve block states from the working positive-Z Minecraft assembly.

  for(const b of positive.blocks.values())if(b.p[1]>=34)put(b,mirrorPointZ(b.p),mirrorStateZ(b.state));

  for(const b of positive.canonical.values())if(b.p[1]<34) {

    put(b,tower(b.p)?mirrorPointZ(b.p):shifted(b.p),tower(b.p)?mirrorStateZ(b.state):b.state);

    if(b.p[0]===14&&b.p[2]===1&&(b.p[1]===28||b.p[1]===29))put(b,shifted(b.p));

  }

  let added=0;

  const opposite={north:'south',south:'north',east:'west',west:'east'};

  function dustPath(path,powered=false) {

    path.forEach((p,i)=>{

      const props={north:'none',east:'none',south:'none',west:'none',power:String(powered?Math.max(0,15-i):0)};

      for(const n of [path[i-1],path[i+1]].filter(Boolean))for(const [dir,[x,z]]of Object.entries(VECTORS))

        if(n[0]-p[0]===x&&n[2]-p[2]===z)props[dir]='side';

      const sides=DIRS.filter(d=>props[d]==='side');if(sides.length===1)props[opposite[sides[0]]]='side';

      const old=blocks.get(key(p)),state={Name:NS+'redstone_wire',Properties:props};

      demand(!old||old.state.Name===state.Name,`红石粉接口被占用：${key(p)}`);

      if(old)old.state=state;else {put({p,state,sourceRegion:'v5-mirror-interface'});added++;}

      const below=[p[0],p[1]-1,p[2]];

      if(!blocks.has(key(below))){put({p:below,state:{Name:NS+'black_stained_glass'},sourceRegion:'v5-mirror-interface'});added++;}

    });

  }

  const bottomPath=Array.from({length:7},(_,i)=>[15,10,20+i]);dustPath(bottomPath,true);

  const tapPath=[[14,29,26],[15,29,26],...Array.from({length:9},(_,i)=>[16,29,26-i]),[15,29,18],[14,29,18]];

  dustPath(tapPath);

  blocks.get('14,29,18').state.Properties={north:'none',south:'side',east:'side',west:'none',power:'0'};

  for(const b of positive.blocks.values())if(b.p[1]>=34) {

    const after=blocks.get(key(mirrorPointZ(b.p)));

    demand(after&&stateKey(after.state)===stateKey(mirrorStateZ(b.state)),'上部镜像状态发生意外变化。');

    demand(JSON.stringify(after.tile??null)===JSON.stringify(b.tile??null),'上部方块实体内容发生变化。');

  }

  for(const b of positive.canonical.values())if(b.p[1]<34&&!tower(b.p)) {

    const after=blocks.get(key(shifted(b.p)));

    demand(after&&stateKey(after.state)===stateKey(b.state),'原向珍珠矫正发生变化。');

    demand(JSON.stringify(after.tile??null)===JSON.stringify(b.tile??null),'珍珠矫正方块实体内容发生变化。');

  }

  const materials={},min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];

  let propulsionTNT=0,payloadTNT=0;

  for(const b of blocks.values()) {

    materials[b.state.Name]=(materials[b.state.Name]||0)+1;

    if(b.state.Name===TNT){if(b.tntRole==='propulsion')propulsionTNT++;if(b.tntRole==='pearl')payloadTNT++;}

    for(let i=0;i<3;i++){min[i]=Math.min(min[i],b.p[i]);max[i]=Math.max(max[i],b.p[i]);}

  }

  demand(propulsionTNT===plan.counts.propulsion&&payloadTNT===plan.counts.total&&materials[TNT]===plan.counts.structureTotal,'镜像后 TNT 计数不符。');

  const reflectedBridge={...positive.plan.structure.bridge,path:positive.plan.structure.bridge.path.map(mirrorPointZ)};

  plan.verification.structure='passed-static-checks';

  plan.structure={...positive.plan.structure,nonAir:blocks.size,tnt:materials[TNT],propulsionTNT,payloadTNT,

    bounds:{min,max,size:max.map((v,i)=>v-min[i]+1)},bridge:reflectedBridge,

    fixedLower:false,fixedTower:false,correctionUnrotated:true,signalBypass:null,

    mirrorZ:true,upperFullyMirrored:true,mirrorInterfaces:{bottomPath,tapPath,added,initialBottomPower:[15,14,13,12,11,10,9]},

    correctionOffset:[0,0,17],referenceSHA256:MIRROR_LAYOUT.referenceSHA256};

  const rows=positive.rows.map(r=>({...r,outputPositions:r.positions.map(p=>mirrorPointZ(rotatePoint(p,plan.quarterTurns,plan.pivot))),

    outputCoral:mirrorPointZ(rotatePoint(r.coral,plan.quarterTurns,plan.pivot))}));

  return {...positive,plan,blocks,rows,materials};

}



const LARGE_TEMPLATE_BASE64='H4sIAAAAAAAA/+3d+2Mb15XY8QuLMmnKUuIk3onIOIEDPSxrQ4l+RnHkt5M6rhMrcuJms1kKoiAJNUWwIGTZqZwou06zmzTttttu3+n2r+j+A/2t/0B/3/0/Oq8LzAxmBgPgnAEG+H5gGoAA3ntw58wAM+cOuG7Muln9YetWu7N/uG5qz6yblavtn7eOmNrPjTE/cq8/dq9/5l5/4l63zCNm7a39XrvXbh0azyPmsdf3OrsfXu01e633mnutXq+17v77/1ozK99v3mmZ43fa+63dbvNm71vNdtfYf35i8M/X95q7H+4c9pruv9zYubXXPDzsP80ZPK3bunHY6+y3du61u24X6+91OwetrhfImjl60LnX6rrhu793r3XYMyuH7Rst906rObhz9LBzt3fbrOy7jbj39jtde89M2t+2YH+3us1PdnY7+7vdVq+V9oTDXnv3w092DtpeWImA1lof91r7N1o3zEqve9ft7uGbzd32/q0won5zjw+aC9rZud1q3kg0ttL75KBlHg76SzTlvazb7isxR2829w4jr+TLKSN33cuMCcf2oe3ny12YD20/l95h2EXYYdh9aodpY9DrdHdvJ3o8stceHkChaPWG59myOyx5bX5oW3J1LtThxZK3V5dK7u+bJff3Ysn9vVByfyVvEmslb2NqU29iIh8r7t1u91oZHysib4Peu2Z3Z/e222siqGP33I803b3OrVvu22qwtc58X/3SoMGbe95r2Tno9FLfxA+6d3dbO3ut5ketwyIdrt1w36eb+7stP7vX3Scfuv/Q2u8F7/Spb+2He+07yXffqd75vWWS+c4/9UcUf4n3m/ujSKDeSLoLr9ts7xUZq9XwF/r/4EbcdF/QMT9XdoL8mTzuoRy40bm3P2jvC4P2OtcPW92PWt1EU0Px2ZYeunugOgCfax7uuq/B7So5CCcHnbnrQLf7yU6v2zy40ekkY0/tb+V2c++mOdLrHKT0veL+8v7QSw3X27TPTMEaO/QReIpxPZp4tdF1ZLd582ZnzxuTQuv99U6v17mTtlpenHhzV+jtP/6B07s36G9zaOndbLkx7dxq9pJ9rrb3d+419/aycyV9eSU2dCX0mFxon09uuQqvoMmWpsik7O39fqcXbmtHtbXe3j90N313/I337WbXXWlWvN+OpZDCAOfvEpbQYXwDP81SiG9xH4u8697t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';

// Virtual Minecraft schematic extension. Each active bank has 10 fixed boost blocks.

export const ARRAY_LAYOUT=Object.freeze({capacity:160,maxArraysPerAxis:2,maxPayload:320,

  limit:13504,switchDistance:6773.1,zeroDistance:21.1,

  sourceSHA256:'6e43dfcea3f4bd7d7bccfedc1345be0b7858e023d1aa6d0360903fdc831a413b'});

const clippedText=input=>exactDistance(Math.sign(nearestTNT(input))*Math.min(160,Math.abs(nearestTNT(input))));

function bankPlan(n,omitZeroAxes=false) {

  const arrays=Array.from({length:Math.max(omitZeroAxes?0:1,Math.ceil(n/160))},(_,i)=>({index:i+1,tnt:Math.min(160,n-i*160),propulsionTNT:10,capacity:160}));

  return {tnt:n,arrays,arrayCount:arrays.length,omitted:omitZeroAxes&&n===0,fullRows:Math.floor(n/10),partial:n%10,

    activeRows:Math.ceil(n/10),propulsionTNT:arrays.length*10,totalTNT:n+arrays.length*10,

    restoredGlassTNT:arrays.reduce((a,b)=>a+Math.min(20,b.tnt),0),

    repeats:n===0?0:Math.ceil(Math.max(0,Math.min(n,160)-20)/20),

    payloadRows:arrays.reduce((a,b)=>a+(2+2*Math.ceil(Math.max(0,b.tnt-20)/20)),0),

    payloadCapacity:arrays.reduce((a,b)=>a+(20+20*Math.ceil(Math.max(0,b.tnt-20)/20)),0)};

}

export function makePlan(dx,dz,options={}) {

  const x=parseDisplacement(dx),z=parseDisplacement(dz),nx=nearestTNT(dx),nz=nearestTNT(dz);

  const p=makeV6Plan(clippedText(dx),clippedText(dz),options);

  const [sx,sz]=rotateVector(nx,p.mirrorZ?-nz:nz,4-p.quarterTurns);

  demand(sx>=0&&sz>=0,'Array axis conversion failed.');

  p.generatorVersion='0.9.0-zero-axis';p.omitZeroAxes=options.omitZeroAxes!==false;p.requested={x:x.number,z:z.number,textX:x.text,textZ:z.text};

  p.canonical={x:sx,z:sz};p.banks={east:bankPlan(sx,p.omitZeroAxes),south:bankPlan(sz,p.omitZeroAxes)};

  const propulsion=10*(p.banks.east.arrayCount+p.banks.south.arrayCount);

  p.counts={x:nx,z:nz,total:Math.abs(nx)+Math.abs(nz),propulsion,structureTotal:Math.abs(nx)+Math.abs(nz)+propulsion};

  p.predicted={x:nx*422/10,z:nz*422/10,textX:exactDistance(nx),textZ:exactDistance(nz)};

  p.error={x:p.predicted.x-x.number,z:p.predicted.z-z.number};p.zero=!nx&&!nz;

  p.largeArrays=Math.abs(nx)>160||Math.abs(nz)>160;p.activeArrays=propulsion/10;p.removeEmptyRows=p.largeArrays&&options.removeEmptyRows!==false;

  p.omittedAxes=p.omitZeroAxes?[...(!nx?['x']:[]),...(!nz?['z']:[])]:[];p.playerEntry=p.mirrorZ?[12.25,0,21.25]:[12.25,0,4.25];

  p.verification={...p.verification,gameTested:false,designRuntimeTested:p.pivot.x===13.5&&p.pivot.z===5.5&&options.negativeZMode!=='legacy-bypass',runtimeVersion:'1.21.10',runtimeScope:'large-array threshold edition: see bundled TEST_REPORT.md for exact native test coverage; no landing-distance calibration'};

  p.warnings=[VALIDATION.distance,'大射程结构省去全玻璃射程排；共用传动和推进首排保留。'];applyV8RuntimeNotes(p,options);applyV9RuntimeNotes(p,options);return p;

}

function extensionDelta(template) {

  if(template.v7Delta)return template.v7Delta;

  const reference=buildLegacyCannon(template,'6752','6752').canonical,large=template.large.blocks;

  const deltas={east:[],south:[]},side=p=>p[0]>=18?'east':'south';

  for(const [k,b]of large) {

    if(b.p[1]<34)continue;

    const old=reference.get(k);

    if(old&&stateKey(old.state)===stateKey(b.state))continue;

    if(old?.state.Name===TNT&&b.state.Name===NS+'white_stained_glass')continue;

    deltas[side(b.p)].push({p:b.p,block:b});

  }

  for(const [k,b]of reference)if(b.p[1]>=34&&!large.has(k))deltas[side(b.p)].push({p:b.p,block:null});

  template.v7Delta=deltas;return deltas;

}

function trimSecondArray(blocks,wing,count) {

  const east=wing==='east',boost=east?58:50,y=93;

  const slots=row=>Array.from({length:10},(_,i)=>east?[row,y,14-i]:[4+i,y,row]);

  const coral=row=>east?[row,y,15]:[3,y,row],rows=[];

  let remain=count;

  for(let index=0;index<=2+2*Math.ceil(Math.max(0,count-20)/20);index++) {

    const row=boost+index*2,positions=slots(row),c=coral(row),isBoost=index===0,kept=isBoost?10:Math.min(10,remain);

    const fan=blocks.get(key(c));demand(fan?.state.Name===NS+'dead_fire_coral_wall_fan','Second-array coral missing.');

    if(!isBoost)remain-=kept;

    positions.forEach((p,i)=>{const b=blocks.get(key(p));demand(b&&(b.state.Name===TNT||b.state.Name===NS+'white_stained_glass'),'Second-array slot mismatch.');

      b.state=i<kept?{Name:TNT,Properties:{unstable:'false'}}:{Name:GLASS};b.tntRole=isBoost?'propulsion':'pearl';b.bank=wing;b.arrayIndex=2;});

    rows.push({wing,row,arrayIndex:2,role:isBoost?'propulsion':'pearl',kept,replaced:10-kept,

      restoredFromGlass:index===1||index===2,positions,coral:c,order:'near-coral-first'});

  }

  demand(remain===0,'Second-array capacity exceeded.');return rows;

}

function assembleV7Arrays(template,blocks,plan,rows,target) {

  const delta=extensionDelta(template),removed={east:0,south:0};
  const zeroReport={enabled:target.omitZeroAxes,axes:[...target.omittedAxes],removedBlocks:0,removedMaterials:{},removedPositions:[]};

  for(const wing of ['east','south']) {

    const count=target.banks[wing].tnt;

    if(count>160) {

      const coordinate=wing==='east'?0:2,cut=(wing==='east'?64:56)+4*Math.ceil(Math.max(0,count-180)/20);

      for(const change of delta[wing]) {

        // Retain the last inside piston's extended head, but not the next array row.

        const isEndHead=change.p[coordinate]===cut&&change.block?.state.Name===NS+'piston_head';

        if(change.p[coordinate]>=cut&&!isEndHead)continue;

        if(change.block)blocks.set(key(change.p),clone(change.block));else blocks.delete(key(change.p));

      }

      rows.push(...trimSecondArray(blocks,wing,count-160));

    }

    if(count===0&&target.omitZeroAxes) {

      for(const [k,b]of blocks)if(b.p[1]>=34&&(wing==='east'?b.p[0]>=18:b.p[0]<18&&b.p[2]>=9)){blocks.delete(k);removed[wing]++;zeroReport.removedBlocks++;zeroReport.removedMaterials[b.state.Name]=(zeroReport.removedMaterials[b.state.Name]||0)+1;zeroReport.removedPositions.push([...b.p]);}

      for(let i=rows.length-1;i>=0;i--)if(rows[i].wing===wing)rows.splice(i,1);

    }

  }

  removeEmptyPayloadRows(blocks,rows,target);
  for(const row of rows){row.arrayIndex??=1;for(const p of row.positions){const b=blocks.get(key(p));if(b)b.arrayIndex=row.arrayIndex;}}

  plan.canonical=clone(target.canonical);plan.banks=clone(target.banks);

  plan.counts={...plan.counts,total:target.counts.total,propulsion:target.counts.propulsion,structureTotal:target.counts.structureTotal};

  plan.v7Removed=removed;target.zeroAxisRemoval=zeroReport;

}

export function buildCannon(template,dx,dz,options={}) {

  const plan=makePlan(dx,dz,options);demand(!plan.zero,'两轴均取整为零，无需生成珍珠炮。');

  const result=buildV6Cannon(template,clippedText(dx),clippedText(dz),{...options,__v7Target:plan});

  result.plan={...plan,structure:{...result.plan.structure,activeArrays:plan.activeArrays,omittedAxes:plan.omittedAxes,

    perArrayLimit:160,arraySourceSHA256:ARRAY_LAYOUT.sourceSHA256},verification:{...plan.verification,structure:'passed-static-checks'}};

  result.plan.structure.emptyRowRemoval=plan.emptyRowRemoval;
  result.plan.structure.zeroAxisRemoval=plan.zeroAxisRemoval;
  result.plan.zeroAxisRemoval=plan.zeroAxisRemoval;
  applyV8RuntimeNotes(result.plan,options);
  applyV9RuntimeNotes(result.plan,options);
  const tnt=[...result.blocks.values()].filter(b=>b.state.Name===TNT);

  demand(tnt.length===plan.counts.structureTotal,'Final virtual TNT count mismatch.');

  demand(tnt.filter(b=>b.tntRole==='propulsion').length===plan.counts.propulsion,'Active-array boost count mismatch.');

  for(const row of result.rows){row.outputPositions??=row.positions.map(p=>rotatePoint(p,plan.quarterTurns,plan.pivot));row.outputCoral??=rotatePoint(row.coral,plan.quarterTurns,plan.pivot);}

  return result;

}




// Remove only zero-payload Minecraft row modules; retain shared clocks and transport.
function removeEmptyPayloadRows(blocks,rows,target) {
  const report={enabled:target.removeEmptyRows,rows:[],removedBlocks:0,removedMaterials:{},sharedTransportPreserved:true};
  if(!target.removeEmptyRows){target.emptyRowRemoval=report;return;}
  const empty=rows.filter(r=>r.role==='pearl'&&r.kept===0);
  for(const row of empty) {
    demand(row.positions.every(p=>blocks.get(key(p))?.state.Name===GLASS),'待删排包含非玻璃，停止省料。');
    const axis=row.wing==='east'?0:2,y=row.positions[0][1],removed=[];
    for(const [k,b]of blocks) {
      const along=b.p[axis],cross=row.wing==='east'?b.p[2]:18-b.p[0];
      // Top input rail and its supports remain. Lower slime transport also remains.
      if(along<row.row||along>row.row+1||cross<4||cross>18||b.p[1]<y-1||b.p[1]>y+2)continue;
      demand(b.state.Name!==TNT,'删空排触及有效TNT，停止省料。');
      removed.push({p:[...b.p],state:clone(b.state)});blocks.delete(k);
      report.removedMaterials[b.state.Name]=(report.removedMaterials[b.state.Name]||0)+1;
    }
    demand(row.positions.every(p=>!blocks.has(key(p))),'全玻璃排未完全移除。');
    report.rows.push({...clone(row),removedBlocks:removed.length,removedPositions:removed.map(b=>b.p)});
    report.removedBlocks+=removed.length;
  }
  for(let i=rows.length-1;i>=0;i--)if(rows[i].role==='pearl'&&rows[i].kept===0)rows.splice(i,1);
  target.emptyRowRemoval=report;
}

function applyV8RuntimeNotes(p,options) {
  p.knownRuntimeIssue=p.counts.x===301&&p.counts.z===-1?{
    code:'legacy-301-negative1-blast',
    message:'此 301 / -1 射程 TNT 配置在本次测试世界中发生炸膛，保留空排的对照结构也复现。尚未修复，只适合隔离测试。',
    evidence:'evidence/baseline_tail_summary.json'}:null;
  p.verification={...p.verification,gameTested:false,
    designRuntimeTested:p.pivot.x===13.5&&p.pivot.z===5.5&&options.negativeZMode!=='legacy-bypass'&&!p.knownRuntimeIssue,
    runtimeScope:'v8: representative empty-row transport checks; known 301/-1 damage also reproduced without pruning. See TEST_REPORT.md. Landing distance not calibrated.'};
  if(p.knownRuntimeIssue){p.warnings.push(p.knownRuntimeIssue.message);p.needsExperimentalConsent=true;}
}

function applyV9RuntimeNotes(p,options) {
  if(!p.omittedAxes.length)return;
  p.warnings.push('绝对位移小于21.1格的轴不生成独立阵列及其推进首排；共用矫正和必要接线保留。');
  p.verification={...p.verification,gameTested:false,designRuntimeTested:p.pivot.x===13.5&&p.pivot.z===5.5&&options.negativeZMode!=='legacy-bypass',
    runtimeScope:'v9 independent server: 24/24 TNT transport passes, 20 pearl exits, 4 early lower-correction collisions; no material losses. No landing-distance calibration'};
}


// Public entry point for the native page; v9 generation code above is unchanged.
export function loadBundledTemplate() {
  return loadTemplate(Uint8Array.from(atob(TEMPLATE_BASE64), c => c.charCodeAt(0)));
}
