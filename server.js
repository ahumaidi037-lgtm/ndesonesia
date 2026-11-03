const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const srv=http.createServer((q,r)=>{fs.readFile(path.join(__dirname,'public','index.html'),(e,d)=>{if(e){r.writeHead(500);return r.end('error')}r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end(d)})});
const wss=new WebSocketServer({server:srv,maxPayload:2048});
let nid=1;const P=new Map();
const clean=s=>String(s||'').replace(/[<>]/g,'').slice(0,14);
wss.on('connection',ws=>{
 if(P.size>=30){ws.close();return}
 const id=nid++;const p={id,n:'Cantrik',c:'#22262e',x:800,y:1040};P.set(id,p);ws.id=id;
 ws.on('message',d=>{let m;try{m=JSON.parse(d)}catch(e){return}
  if(m.t=='hi'){p.n=clean(m.n)||'Cantrik';if(/^#[0-9a-f]{6}$/i.test(m.c))p.c=m.c}
  else if(m.t=='pos'&&isFinite(m.x)&&isFinite(m.y)){p.x=Math.max(0,Math.min(1600,+m.x));p.y=Math.max(0,Math.min(1100,+m.y))}
  else if(m.t=='say'){const s=String(m.s||'').slice(0,30).replace(/[<>]/g,'');const o=JSON.stringify({t:'say',id,s});wss.clients.forEach(c=>c.readyState==1&&c.send(o))}});
 ws.on('close',()=>P.delete(id))});
setInterval(()=>{const l=[...P.values()];wss.clients.forEach(c=>{if(c.readyState==1)c.send(JSON.stringify({t:'all',me:c.id,p:l}))})},100);
srv.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('NDESONESIA jalan'));
