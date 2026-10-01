'use strict';
const assert=require('assert'),fs=require('fs'),S=require('./core.js');
const rows=fs.readFileSync(__dirname+'/java_vectors.csv','utf8').trim().split('\n');
for(const row of rows){const [seed,x,z,v]=row.split(',');assert.equal(S.isSlime(seed,+x,+z),v==='1',row);}
assert.equal(S.parseSeed('9223372036854775807').seed,'9223372036854775807');assert.equal(S.parseSeed('-9223372036854775808').seed,'-9223372036854775808');assert.equal(S.parseSeed('9007199254740993').seed,'9007199254740993');assert.throws(()=>S.parseSeed('9223372036854775808'));assert.throws(()=>S.parseSeed(''));assert.equal(S.parseSeed('abc').seed,'96354');
// Construct a nextInt rejection branch explicitly from a forbidden first sample.
const MOD=1n<<48n,MULT=0x5deece66dn;
function inv(a,m){let [t,nt,r,nr]=[0n,1n,m,a];while(nr){const q=r/nr;[t,nt]=[nt,t-q*nt];[r,nr]=[nr,r-q*nr];}return (t%m+m)%m;}
const firstState=2147483647n<<17n,s0=((firstState-11n)*inv(MULT,MOD))&(MOD-1n),seed=s0^MULT^987234911n;
let nextState=(firstState*MULT+11n)&(MOD-1n),bits=Number(nextState>>17n);assert.equal(S.isSlime(seed,0,0),bits%10===0);
assert(!S.inAnnulus(24,0));assert(S.inAnnulus(25,0));assert(S.inAnnulus(128,0));assert(!S.inAnnulus(129,0));assert(!S.inAnnulus(100,100));
const results=[];for(const [seed,R] of [['0',1],['0',17],['-1',32],['9007199254740993',80],['-9223372036854775808',140],['0',4000]]){
 const r=S.search(seed,R),l=S.layout(seed,r.x,r.z);assert.equal(r.score,l.counts.obsidian);assert(Math.abs(r.x)<=R&&Math.abs(r.z)<=R);
 const {grid,...summary}=r;results.push(summary);
 for(let z=0;z<321;z++)for(let x=0;x<321;x++) {const i=z*321+x,dx=x-160,dz=z-160,wx=l.minX+x,wz=l.minZ+z;
   const active=S.inAnnulus(dx,dz)&&S.isSlime(seed,Math.floor(wx/16),Math.floor(wz/16));assert.equal(l.base[i]===2,active);
   assert.equal(l.top[i]===4,active&&S.portalAt(wx,wz));
   if(l.base[i]===3){let neighbour=false;for(let dz1=-1;dz1<=1;dz1++)for(let dx1=-1;dx1<=1;dx1++)if(x+dx1>=0&&x+dx1<321&&z+dz1>=0&&z+dz1<321&&l.base[(z+dz1)*321+x+dx1]===2)neighbour=true;assert(neighbour);}
   if(l.base[i]===1)assert(dx*dx+dz*dz<=25600);
   if(dx*dx+dz*dz>25600)assert.equal(l.base[i],0);
 }
 assert.equal(l.top[160*321+160],5);assert.equal(l.base[160*321+160],1);
 if(R===4000){const nbt=S.schematic(l,'1.21.10',0);fs.writeFileSync(__dirname+'/test_export.litematic',S.gzipStored(nbt));fs.writeFileSync(__dirname+'/sample_report.json',JSON.stringify(S.report(r,l,'1.21.10',0),null,2));}
}
fs.writeFileSync(__dirname+'/search_test_results.json',JSON.stringify(results,null,2));
console.log(JSON.stringify({javaVectors:rows.length,seedParsing:'PASS',rejectionBranch:'PASS',distanceBoundaries:'PASS',layoutInvariantCases:results.length,searchResults:results},null,2));
