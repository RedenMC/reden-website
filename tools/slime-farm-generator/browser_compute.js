/* Browser-only acceleration. No fetch, uploads, backend or CUDA dependency. */
'use strict';
const SlimeLocalCompute = (() => {
  const shader = `
struct Params { width:u32, height:u32, unused0:u32, unused1:u32 }
@group(0) @binding(0) var<storage,read> xs:array<vec2<u32>>;
@group(0) @binding(1) var<storage,read> zs:array<vec2<u32>>;
@group(0) @binding(2) var<storage,read_write> output:array<u32>;
@group(0) @binding(3) var<uniform> p:Params;
var<workgroup> flags:array<u32,256>;
fn highProduct(a:u32,b:u32)->u32 {
 let a0=a&65535u; let a1=a>>16u; let b0=b&65535u; let b1=b>>16u;
 let w0=a0*b0; let t=a1*b0+(w0>>16u);
 let w1=(t&65535u)+a0*b1;
 return a1*b1+(t>>16u)+(w1>>16u);
}
fn next(s:vec2<u32>)->vec2<u32> {
 let product=s.x*0xdeece66du; let low=product+11u;
 let carry=select(0u,1u,low<product);
 let hi=(s.y*0xdeece66du+s.x*5u+highProduct(s.x,0xdeece66du)+carry)&65535u;
 return vec2<u32>(low,hi);
}
@compute @workgroup_size(256)
fn grid(@builtin(global_invocation_id) id:vec3<u32>,@builtin(local_invocation_index) lane:u32) {
 let i=id.x; flags[lane]=0u;
 if(i<p.width*p.height){
 let a=xs[i%p.width]; let b=zs[i/p.width]; let lo=a.x+b.x;
 var s=vec2<u32>(lo,(a.y+b.y+select(0u,1u,lo<a.x))&65535u);
 s=s^vec2<u32>(987234911u^0xdeece66du,5u);
 loop {
  s=next(s); let bits=(s.x>>17u)|(s.y<<15u); let v=bits%10u;
  if(bits<2147483640u){flags[lane]=select(0u,1u<<(lane&31u),v==0u);break;}
 }
 }
 workgroupBarrier();
 if((lane&31u)==0u && i<p.width*p.height){
  var packed=0u;
  for(var j=0u;j<32u;j++){packed|=flags[lane+j];}
  output[i/32u]=packed;
 }
}`;
  const mask=(1n<<48n)-1n;
  const pair=(array,i,value)=>{value&=mask;array[i*2]=Number(value&0xffffffffn);array[i*2+1]=Number(value>>32n);};
  async function grid(seed,bounds,onProgress=()=>{},gpu=globalThis.navigator?.gpu) {
    if(!gpu)throw new Error('浏览器未提供 WebGPU；请使用本机 CPU 或支持 WebGPU 的安全页面。');
    const adapter=await gpu.requestAdapter();
    if(!adapter)throw new Error('没有可用的本机 WebGPU 设备。');
    const device=await adapter.requestDevice(),buffers=[];
    let lost=null;device.lost.then(info=>{lost=info.message||'GPU 设备已断开';});
    try {
      const {cmin,cmax,zmin,zmax}=bounds,n=cmax-cmin+1,h=zmax-zmin+1;
      if(![n,h].every(v=>Number.isInteger(v)&&v>0)||n*h>200000000)throw new Error('区块网格尺寸超出支持范围。');
      const batchRows=Math.max(1,Math.min(128,Math.floor(device.limits.maxStorageBufferBindingSize/(n*4))));
      const batchCells=n*batchRows,maxBytes=Math.ceil(batchCells/32)*4;
      const make=(size,usage)=>{const b=device.createBuffer({size,usage});buffers.push(b);return b;};
      const xbuf=make(n*8,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST);
      const zbuf=make(batchRows*8,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST);
      const out=make(maxBytes,GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC);
      const read=make(maxBytes,GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST);
      const params=make(16,GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST);
      device.pushErrorScope('validation');
      const module=device.createShaderModule({code:shader});
      const info=await module.getCompilationInfo();
      const errors=info.messages.filter(m=>m.type==='error');
      if(errors.length)throw new Error(errors.map(m=>m.message).join('; '));
      const pipeline=await device.createComputePipelineAsync({layout:'auto',compute:{module,entryPoint:'grid'}});
      const validation=await device.popErrorScope();if(validation)throw new Error(validation.message);
      const bind=device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[xbuf,zbuf,out,params].map((buffer,binding)=>({binding,resource:{buffer}}))});
      const xs=new Uint32Array(n*2),zs=new Uint32Array(batchRows*2),result=new Uint8Array(n*h),b=BigInt(seed);
      for(let x=0;x<n;x++){const c=cmin+x;pair(xs,x,b+BigInt(Math.imul(Math.imul(c,c),4987142))+BigInt(Math.imul(c,5947611)));}
      device.queue.writeBuffer(xbuf,0,xs);
      for(let row=0;row<h;row+=batchRows){
        if(lost)throw new Error(lost);
        const rows=Math.min(batchRows,h-row),cells=n*rows,bytes=Math.ceil(cells/32)*4;
        for(let z=0;z<rows;z++){const c=zmin+row+z;pair(zs,z,BigInt(Math.imul(c,c))*4392871n+BigInt(Math.imul(c,389711)));}
        device.queue.writeBuffer(zbuf,0,zs);device.queue.writeBuffer(params,0,new Uint32Array([n,rows,0,0]));
        device.pushErrorScope('validation');
        const encoder=device.createCommandEncoder(),pass=encoder.beginComputePass();
        pass.setPipeline(pipeline);pass.setBindGroup(0,bind);pass.dispatchWorkgroups(Math.ceil(cells/256));pass.end();
        encoder.copyBufferToBuffer(out,0,read,0,bytes);device.queue.submit([encoder.finish()]);
        await read.mapAsync(GPUMapMode.READ,0,bytes);
        try{const words=new Uint32Array(read.getMappedRange(0,bytes));
          for(let i=0;i<cells;i++)result[row*n+i]=(words[i>>>5]>>>(i&31))&1;
        }finally{read.unmap();}
        const error=await device.popErrorScope();if(error)throw new Error(error.message);
        onProgress({phase:'grid',progress:0.05+0.25*(row+rows)/h,message:`本机 GPU 计算史莱姆区块：${row+rows} / ${h} 行`});
      }
      if(lost)throw new Error(lost);
      return {seed:String(seed),grid:result,minChunk:cmin,maxChunk:cmax,minChunkZ:zmin,maxChunkZ:zmax,n,h};
    } finally {for(const b of buffers)b.destroy();device.destroy();}
  }
  async function run(kind,data,onProgress=()=>{}) {
    const {seed,range,centerX=0,centerZ=0,compute='auto'}=data;
    if(!['auto','cpu','gpu'].includes(compute))throw new Error('未知本机计算方式。');
    if(!Number.isInteger(range)||range<1||range>SlimeFarm.MAX_SEARCH_RANGE)throw new Error('搜索范围必须是 1～216000 的整数。');
    const bounds=SlimeFarm.searchBounds(range,centerX,centerZ),halo=kind==='farm'||data.shape==='spawnRange'?10:0;
    for(const k of ['cmin','zmin'])bounds[k]-=halo;
    for(const k of ['cmax','zmax'])bounds[k]+=halo;
    const cells=(bounds.cmax-bounds.cmin+1)*(bounds.zmax-bounds.zmin+1);
    let prepared=null,reason='',backend='cpu';
    if(compute==='gpu'||compute==='auto'&&cells>=4194304){
      try{prepared=await grid(seed,bounds,onProgress);backend='gpu';}
      catch(error){if(compute==='gpu')throw error;reason=error.message;onProgress({phase:'grid',progress:0,message:'本机 GPU 不可用，改用本机 CPU 计算…'});}
    }
    const result=SlimeFarm.withGrid(prepared,()=>kind==='farm'
      ?SlimeFarm.search(seed,range,onProgress,data.biomes,data.spawnY,centerX,centerZ)
      :data.shape==='spawnRange'?SlimeFarm.searchLeastSlime(seed,range,onProgress,data.biomes,centerX,centerZ)
      :SlimeFarm.searchChunkCluster(seed,range,data.target,data.shape,onProgress,data.biomes,centerX,centerZ));
    result.execution={backend,fallbackReason:reason};return result;
  }
  return {grid,run};
})();
if(typeof module!=='undefined')module.exports=SlimeLocalCompute;
