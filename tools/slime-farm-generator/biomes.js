/* Read saved Overworld region biomes at the farm's spawn height. */
'use strict';
const SlimeBiomes=(()=>{
  const decoder=new TextDecoder();
  const SNOW_NAMES=new Set(['snowy_plains','ice_spikes','snowy_taiga','snowy_beach','frozen_river','frozen_ocean','deep_frozen_ocean','snowy_slopes','grove','jagged_peaks','frozen_peaks']);
  const SNOW_IDS=new Set([10,11,12,13,26,30,31,140,158]);
  class Reader{
    constructor(bytes){this.view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);this.bytes=bytes;this.p=0;}
    take(n){if(n<0||this.p+n>this.bytes.length)throw new Error('损坏的区块 NBT 数据');const p=this.p;this.p+=n;return p;}
    u8(){return this.view.getUint8(this.take(1));}
    i16(){return this.view.getInt16(this.take(2));}
    i32(){return this.view.getInt32(this.take(4));}
    i64(){return this.view.getBigInt64(this.take(8));}
    str(){const n=this.view.getUint16(this.take(2));const p=this.take(n);return decoder.decode(this.bytes.subarray(p,p+n));}
    payload(t){switch(t){
      case 1:return this.view.getInt8(this.take(1));
      case 2:return this.i16();
      case 3:return this.i32();
      case 4:return this.i64();
      case 5:return this.view.getFloat32(this.take(4));
      case 6:return this.view.getFloat64(this.take(8));
      case 7:{const n=this.i32(),p=this.take(n);return this.bytes.subarray(p,p+n);}
      case 8:return this.str();
      case 9:{const item=this.u8(),n=this.i32();if(n<0||n>2000000)throw new Error('NBT 列表长度异常');const out=[];for(let i=0;i<n;i++)out.push(this.payload(item));return out;}
      case 10:{const out={};for(;;){const item=this.u8();if(item===0)return out;out[this.str()]=this.payload(item);}}
      case 11:{const n=this.i32();if(n<0||n>2000000)throw new Error('NBT 数组长度异常');const out=new Int32Array(n);for(let i=0;i<n;i++)out[i]=this.i32();return out;}
      case 12:{const n=this.i32();if(n<0||n>2000000)throw new Error('NBT 数组长度异常');const out=new BigInt64Array(n);for(let i=0;i<n;i++)out[i]=this.i64();return out;}
      default:throw new Error('未知 NBT 类型 '+t);
    }}
    root(){if(this.u8()!==10)throw new Error('NBT 根标签不是 Compound');this.str();return this.payload(10);}
  }
  function classification(name,y){
    if(typeof name==='number')return SNOW_IDS.has(name)?2:0;
    const id=String(name||'').replace(/^minecraft:/,'');
    if(id==='deep_dark')return 1;
    if(SNOW_NAMES.has(id))return 2;
    if(y>=110&&['meadow','windswept_hills','windswept_gravelly_hills','windswept_forest','stony_peaks'].includes(id))return 2;
    return 0;
  }
  // Category codes for the separate mob-tower site search.
  // 0 unknown, 1 desert, 2 snowy plains, 3 every other recorded biome.
  function clusterCategory(name){
    if(name===null||name===undefined||name==='')return 0;
    if(typeof name==='number')return name===2?1:name===12?2:3;
    const id=String(name).replace(/^minecraft:/,'');
    return id==='desert'?1:['snowy_plains','snowy_tundra'].includes(id)?2:3;
  }
  function paletteIndex(data,paletteLength,index){
    if(paletteLength===1)return 0;
    const bits=Math.max(1,Math.ceil(Math.log2(paletteLength))),perLong=Math.floor(64/bits);
    const word=data[Math.floor(index/perLong)];if(word===undefined)throw new Error('群系调色板数据不足');
    return Number((BigInt.asUintN(64,word)>>BigInt(index%perLong*bits))&((1n<<BigInt(bits))-1n));
  }
  function chunkBiomes(root,y,classifier=classification){
    const chunk=root.Level||root,sections=chunk.sections||chunk.Sections||[];
    const sy=Math.floor(y/16),qy=Math.floor((y-sy*16)/4),out=new Uint8Array(16);
    const section=sections.find(s=>Number(s.Y)===sy);
    if(section?.biomes?.palette){
      const {palette,data}=section.biomes;
      for(let z=0;z<4;z++)for(let x=0;x<4;x++){
        const index=qy*16+z*4+x,choice=paletteIndex(data,palette.length,index);
        out[z*4+x]=classifier(palette[choice],y);
      }
      return out;
    }
    const old=chunk.Biomes||chunk.biomes;
    if(old?.length===1024){const quartY=Math.floor(y/4);if(quartY<0||quartY>=64)return null;for(let z=0;z<4;z++)for(let x=0;x<4;x++)out[z*4+x]=classifier(old[quartY*16+z*4+x],y);return out;}
    if(old?.length===256){for(let z=0;z<4;z++)for(let x=0;x<4;x++)out[z*4+x]=classifier(old[(z*4+2)*16+x*4+2],y);return out;}
    return null;
  }
  function ancientBoxes(root){
    const chunk=root.Level||root,starts=chunk.structures?.starts||chunk.Structures?.Starts||{},boxes=[];
    for(const [name,start] of Object.entries(starts))if(name.toLowerCase().endsWith('ancient_city')&&start?.BB?.length===6){
      const b=Array.from(start.BB);if(b[0]<=b[3]&&b[1]<=b[4]&&b[2]<=b[5])boxes.push(b);
    }
    return boxes;
  }
  function validBox(raw){
    if(!raw||raw.length!==6)return null;
    const b=Array.from(raw,Number);
    return b.every(Number.isInteger)&&b[0]<=b[3]&&b[1]<=b[4]&&b[2]<=b[5]?b:null;
  }
  function savedStructureBoxes(root){
    const chunk=root.Level||root,starts=chunk.structures?.starts||chunk.Structures?.Starts||{},out={hut:[],monument:[],incomplete:0};
    for(const [key,start] of Object.entries(starts)){
      const name=key.toLowerCase().replace(/^minecraft:/,'');
      const children=start?.Children||start?.children||[];
      const hut=name==='swamp_hut'||name==='swamp_hut_piece'||name==='temple'&&children.some(p=>String(p.id||p.Id||'').toLowerCase()==='tesh');
      const monument=name==='monument'||name==='ocean_monument';
      if(hut){
        const pieces=children.filter(p=>['tesh','minecraft:swamp_hut'].includes(String(p.id||p.Id||'').toLowerCase()));
        if(!pieces.length&&name==='swamp_hut'&&children.length===1)pieces.push(children[0]);
        const boxes=pieces.map(p=>validBox(p.BB||p.bb)).filter(Boolean);
        if(boxes.length)out.hut.push(...boxes);else out.incomplete++;
      }else if(monument){const b=validBox(start?.BB||start?.bb);if(b)out.monument.push(b);else out.incomplete++;}
    }
    return out;
  }
  async function decompress(data,kind){
    if(kind===3)return data;
    const format=kind===1?'gzip':kind===2?'deflate':null;
    if(!format)throw new Error('不支持的 MCA 区块压缩类型 '+kind);
    return new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream(format))).arrayBuffer());
  }
  async function readLevelDat(file){
    if(!file)return null;
    const bytes=new Uint8Array(await file.arrayBuffer());
    const raw=bytes[0]===31&&bytes[1]===139?await decompress(bytes,1):bytes;
    const data=new Reader(raw).root().Data;
    if(!data)throw new Error('level.dat 缺少 Data 标签');
    const seed=data.WorldGenSettings?.seed??data.RandomSeed;
    return {seed:typeof seed==='bigint'?seed.toString():null,version:String(data.Version?.Name||'未知')};
  }
  async function readRegions(files,y,onProgress=()=>{},levelFile=null,classifier=classification){
    const saveInfo=await readLevelDat(levelFile);
    const chunks=new Map(),snowChunks=new Set(),boxes=[],seenBoxes=new Set();let read=0,unsupported=0;
    for(const file of files){
      if(!/^r\.-?\d+\.-?\d+\.mca$/i.test(file.name))continue;
      const bytes=new Uint8Array(await file.arrayBuffer());if(bytes.length<8192){unsupported++;continue;}
      const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
      for(let i=0;i<1024;i++){
        const entry=view.getUint32(i*4),sector=entry>>>8;if(!sector)continue;
        const p=sector*4096;if(p+5>bytes.length){unsupported++;continue;}
        const length=view.getUint32(p);if(length<1||p+4+length>bytes.length){unsupported++;continue;}
        try{
          const root=new Reader(await decompress(bytes.subarray(p+5,p+4+length),bytes[p+4]&127)).root();
          const chunk=root.Level||root,x=Number(chunk.xPos),z=Number(chunk.zPos),biome=chunkBiomes(root,y,classifier);
          if(Number.isInteger(x)&&Number.isInteger(z)&&biome){
            const key=x+','+z;chunks.set(key,biome);read++;
            if(classifier===clusterCategory&&chunkBiomes(root,y,classification)?.includes(2))snowChunks.add(key);
          }
          for(const b of ancientBoxes(root)){const key=b.join(',');if(!seenBoxes.has(key)){seenBoxes.add(key);boxes.push(b);}}
        }catch(e){unsupported++;}
        if((i&63)===0)onProgress({file:file.name,chunks:read,unsupported});
      }
      onProgress({file:file.name,chunks:read,unsupported});
    }
    return {y,chunks,snowChunks,boxes,read,unsupported,files:files.length,saveInfo};
  }
  async function readSavedStructures(files,onProgress=()=>{},levelFile=null){
    const saveInfo=await readLevelDat(levelFile),boxes={hut:[],monument:[]},seen={hut:new Set(),monument:new Set()};
    let chunks=0,unsupported=0,incomplete=0;
    for(const file of files){
      if(!/^r\.-?\d+\.-?\d+\.mca$/i.test(file.name))continue;
      const bytes=new Uint8Array(await file.arrayBuffer());if(bytes.length<8192){unsupported++;continue;}
      const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
      for(let i=0;i<1024;i++){
        const entry=view.getUint32(i*4),sector=entry>>>8;if(!sector)continue;
        const p=sector*4096;if(p+5>bytes.length){unsupported++;continue;}
        const length=view.getUint32(p);if(length<1||p+4+length>bytes.length){unsupported++;continue;}
        try{
          const root=new Reader(await decompress(bytes.subarray(p+5,p+4+length),bytes[p+4]&127)).root();
          const found=savedStructureBoxes(root);chunks++;incomplete+=found.incomplete;
          for(const type of ['hut','monument'])for(const b of found[type]){const key=b.join(',');if(!seen[type].has(key)){seen[type].add(key);boxes[type].push(b);}}
        }catch{unsupported++;}
        if((i&63)===0)onProgress({file:file.name,chunks,unsupported,incomplete});
      }
      onProgress({file:file.name,chunks,unsupported,incomplete});
    }
    return {boxes,chunks,unsupported,incomplete,files:files.length,saveInfo};
  }
  function at(data,x,z){const chunk=data?.chunks?.get(Math.floor(x/16)+','+Math.floor(z/16));return chunk?chunk[((z&15)>>2)*4+((x&15)>>2)]:null;}
  function excluded(data,x,y,z){if(at(data,x,z)===1)return true;return !!data?.boxes?.some(b=>x>=b[0]&&x<=b[3]&&y>=b[1]&&y<=b[4]&&z>=b[2]&&z<=b[5]);}
  return {Reader,classification,clusterCategory,paletteIndex,chunkBiomes,ancientBoxes,savedStructureBoxes,readLevelDat,readRegions,readSavedStructures,at,excluded};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=SlimeBiomes;
if(typeof self!=='undefined')self.SlimeBiomes=SlimeBiomes;
