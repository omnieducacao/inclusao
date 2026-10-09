/* Omnisfera · vivo.js — campo de encontros (hero), narrativa por rolagem, números, situação real, vídeos */
(function(){
const COL=['#e5484d','#f5b82e','#f28c28','#8e5bd8','#2f7fd1','#2eaa6a'];
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mixc=(a,b,w)=>{const A=hx(a),B=hx(b);return 'rgb('+A.map((x,i)=>{let m=(x+B[i])/2;return Math.round(m+(255-m)*w)}).join(',')+')'};
const bgOf=el=>getComputedStyle(el).getPropertyValue('--bg').trim()||'#f6f4f0';
const isDark=()=>{const c=hx((bgOf(document.body)+'').startsWith('#')?bgOf(document.body):'#f6f4f0');return (c[0]+c[1]+c[2])/3<90};
const sm=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
const lerp=(a,b,t)=>a+(b-a)*t;

/* desenha um conjunto de círculos com os encontros vazados/coloridos */
function paint(ctx,cs,bg,opt={}){
  for(const c of cs){if(c.a<=0)continue;ctx.globalAlpha=c.a;ctx.fillStyle=COL[c.k];ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,7);ctx.fill()}
  for(let i=0;i<cs.length;i++)for(let j=i+1;j<cs.length;j++){const a=cs[i],b=cs[j];if(a.a<=0||b.a<=0)continue;
    const d=Math.hypot(a.x-b.x,a.y-b.y);if(d>=a.r+b.r||d<=Math.abs(a.r-b.r)+.5)continue;
    ctx.save();ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,7);ctx.clip();ctx.globalAlpha=Math.min(a.a,b.a);
    ctx.fillStyle=opt.luz?bg:mixc(COL[a.k],COL[b.k],opt.dark?.18:.5);ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.fill();ctx.restore()}
  ctx.globalAlpha=1;
}
function fit(cv){const r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);const ctx=cv.getContext('2d');ctx.setTransform(d,0,0,d,0,0);return {ctx,w:r.width,h:r.height}}

/* ---------------------------------------------------------------- 1. campo de encontros */
const hero=document.getElementById('campo');
if(hero){
  const cv=hero.querySelector('canvas');let S=fit(cv),P={x:-9999,y:-9999,on:false},vis=true;
  const mobile=()=>S.w<760;
  let cs=[];
  function seed(){const n=mobile()?11:22;cs=[];let s=7;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280};
    for(let i=0;i<n;i++){const r=(mobile()?18:26)+rnd()*(mobile()?26:44);
      const x0=mobile()?rnd()*S.w:S.w*(.42+rnd()*.58);const y0=mobile()?20+rnd()*200:rnd()*S.h;
      cs.push({x:x0,y:y0,vx:(rnd()-.5)*.3,vy:(rnd()-.5)*.3,r,r0:r,k:i%6,a:1,ph:rnd()*6.28})}}
  seed();
  const sym=()=>{const cx=mobile()?S.w*.5:S.w*.72,cy=mobile()?135:S.h*.5,R=mobile()?40:74;return {cx,cy,R,d:R/0.875}};
  let t0=performance.now(),last=t0;
  function step(now){
    const dt=Math.min(32,now-last)/16.67;last=now;const t=(now-t0)/1000;
    const cyc=rm?7:(t%14);const gather=rm?1:(cyc<6?0:cyc<8?sm((cyc-6)/2):cyc<12?1:1-sm((cyc-12)/2));
    const G=sym();
    cs.forEach((c,i)=>{
      // deriva suave
      c.vx+=Math.cos(t*.3+c.ph)*.004*dt;c.vy+=Math.sin(t*.27+c.ph*1.3)*.004*dt;
      // o ponteiro atrai, criando encontros
      if(P.on){const dx=P.x-c.x,dy=P.y-c.y,d=Math.hypot(dx,dy);if(d<280){const f=(1-d/280)*.05;c.vx+=dx/d*f*dt;c.vy+=dy/d*f*dt}}
      c.vx*=.985;c.vy*=.985;
      const sp=Math.hypot(c.vx,c.vy),mx=1.6;if(sp>mx){c.vx*=mx/sp;c.vy*=mx/sp}
      c.x+=c.vx*dt;c.y+=c.vy*dt;
      const pad=c.r*.6,minx=mobile()?-pad:S.w*.36;
      if(c.x<minx){c.vx+=.06*dt}if(c.x>S.w+pad){c.vx-=.06*dt}if(c.y<-pad){c.vy+=.06*dt}if(c.y>(mobile()?240:S.h)+pad){c.vy-=.06*dt}
      c.r=lerp(c.r,c.r0,.05);
    });
    // seis círculos (um de cada cor) formam o símbolo de tempos em tempos
    const draw=cs.map(c=>({...c}));
    if(gather>0){for(let k=0;k<6;k++){const c=draw[k],a=(k*60)*Math.PI/180,tx=G.cx+G.d*Math.sin(a),ty=G.cy-G.d*Math.cos(a);
      c.x=lerp(c.x,tx,gather);c.y=lerp(c.y,ty,gather);c.r=lerp(c.r,G.R,gather);
      if(gather>.98){cs[k].x=lerp(cs[k].x,tx,.02);cs[k].y=lerp(cs[k].y,ty,.02)}}
      for(let k=6;k<draw.length;k++)draw[k].a=1-.55*gather}
    S.ctx.clearRect(0,0,S.w,S.h);
    const bgc=bgOf(document.body);
    if(gather>0){paint(S.ctx,draw.slice(6),bgc,{luz:true});paint(S.ctx,draw.slice(0,6),bgc,{luz:true})}
    else paint(S.ctx,draw,bgc,{luz:true});
    if(!rm&&vis)requestAnimationFrame(step);
  }
  const go=()=>{last=performance.now();requestAnimationFrame(step)};
  hero.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();P.x=e.clientX-r.left;P.y=e.clientY-r.top;P.on=true});
  hero.addEventListener('pointerleave',()=>P.on=false);
  addEventListener('resize',()=>{S=fit(cv);seed()});
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{const v=es[0].isIntersecting;if(v&&!vis){vis=true;go()}else vis=v}).observe(hero);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)vis=false;else{vis=true;go()}});
  go();
}

/* ---------------------------------------------------------------- 2. da barreira ao encontro */
const story=document.getElementById('historia');
if(story){
  const cv=story.querySelector('canvas'),steps=[...story.querySelectorAll('.st')];let S=fit(cv);
  const LBL=JSON.parse(story.dataset.rotulos),BAR=JSON.parse(story.dataset.barreiras);
  addEventListener('resize',()=>{S=fit(cv)});
  function prog(){ // progresso contínuo 0..3 ao longo dos passos
    const mid=innerHeight*.55;let p=0;
    steps.forEach((s,i)=>{const r=s.getBoundingClientRect();if(r.top<mid)p=i+Math.min(1,(mid-r.top)/r.height)});
    return Math.max(0,Math.min(3.999,p-0.2))}
  function frame(){
    const p=rm?Math.round(prog()):prog(),i=Math.floor(p),f=p-i;
    steps.forEach((s,k)=>s.classList.toggle('on',k===Math.min(3,Math.round(p))));
    const {ctx,w,h}=S,cx=w/2,cy=h/2,U=Math.min(w,h)/2;
    const spreadD=U*.54,spreadR=U*.15,symR=U*.36,symD=symR/.875;
    const label=(t,x,y)=>{const tw=ctx.measureText(t).width;ctx.fillText(t,Math.max(tw/2+4,Math.min(w-tw/2-4,x)),y)};
    const gathering=i===3?sm(f*2.4):0;
    const barVis=k=>i===0?sm((f-.55)/.45):i===1?1:i===2?1-sm(f*7-k):0;
    const dim=i===1?.35:i===2?.35*(1-sm(f*1.2)):0;
    ctx.clearRect(0,0,w,h);
    const bg=bgOf(document.body),ink=getComputedStyle(document.body).getPropertyValue('--ink').trim()||'#1b2a4a',mut=getComputedStyle(document.body).getPropertyValue('--mut').trim();
    const cs=[0,1,2,3,4,5].map(k=>{const a=(k*60)*Math.PI/180,D=lerp(spreadD,symD,gathering),r=lerp(spreadR,symR,gathering);
      const wob=rm?0:Math.sin(performance.now()/900+k)*2*(1-gathering);
      return {x:cx+D*Math.sin(a)+wob,y:cy-D*Math.cos(a),r,k,a:1-dim}});
    // barreiras: seis paredes entre os estudantes e o centro
    {ctx.lineCap='round';
      for(let k=0;k<6;k++){const a=((k*60)+30)*Math.PI/180;const vis=barVis(k);if(vis<=0)continue;
        const r1=U*.15,r2=U*.15+U*.5*vis;ctx.strokeStyle=ink;ctx.globalAlpha=.85;ctx.lineWidth=Math.max(6,U*.035);
        ctx.beginPath();ctx.moveTo(cx+r1*Math.sin(a),cy-r1*Math.cos(a));ctx.lineTo(cx+r2*Math.sin(a),cy-r2*Math.cos(a));ctx.stroke();
        ctx.globalAlpha=vis;ctx.fillStyle=ink;ctx.font=`600 ${Math.max(11,U*.045)}px "JetBrains Mono",monospace`;ctx.textAlign='center';
        const lr=U*.8;label(BAR[k],cx+lr*Math.sin(a),cy-lr*Math.cos(a)+4)}
      ctx.globalAlpha=1}
    paint(ctx,cs,bg,{luz:true});
    // rótulos dos estudantes (passo 1)
    const la=i===0?1-sm((f-.45)/.3):0;
    if(la>0&&gathering===0){ctx.globalAlpha=la;ctx.fillStyle=ink;ctx.font=`600 ${Math.max(12,U*.05)}px "Plus Jakarta Sans",sans-serif`;ctx.textAlign='center';
      cs.forEach((c,k)=>{const a=(k*60)*Math.PI/180,lr=spreadD+spreadR+U*.09;const lines=LBL[k].split('|');
        lines.forEach((ln,j)=>label(ln,cx+lr*Math.sin(a),cy-lr*Math.cos(a)+(j-(lines.length-1)/2)*U*.06+4))});ctx.globalAlpha=1}
    if(i===3&&gathering>.9){ctx.globalAlpha=sm((gathering-.9)*10);ctx.fillStyle=mut;ctx.font=`600 ${Math.max(12,U*.05)}px "Plus Jakarta Sans",sans-serif`;ctx.textAlign='center';ctx.fillText('o espaço comum',cx,cy+symD+symR+U*.12);ctx.globalAlpha=1}
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------------------------------------------------------------- 3. números aparecem */
const nums=document.querySelectorAll('.viz');
if(nums.length){if('IntersectionObserver' in window&&!rm){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.25});nums.forEach(n=>io.observe(n))}else nums.forEach(n=>n.classList.add('in'))}

/* ---------------------------------------------------------------- 4. situação real */
const sit=document.getElementById('situacao');
if(sit){const all=JSON.parse(document.getElementById('sit-data').textContent),box=sit.querySelector('.qbox'),src=sit.querySelector('.sit-src');let last=-1;
  function show(){let n;do{n=Math.floor(Math.random()*all.length)}while(n===last&&all.length>1);last=n;const q=all[n];
    box.innerHTML=`<p class="sit-q">${q.q[0]}</p><div class="opts"></div><div class="why" hidden></div>`;
    src.innerHTML=`Do tema <a href="/${q.slug}/">${q.tema}</a>`;
    const opts=box.querySelector('.opts'),why=box.querySelector('.why');
    q.q[1].forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<span class="l">${'ABCD'[i]}</span><span>${t}</span>`;
      b.addEventListener('click',()=>{opts.querySelectorAll('button').forEach((x,j)=>{x.disabled=true;if(j===q.q[2])x.classList.add('ok')});if(i!==q.q[2])b.classList.add('no');
        why.hidden=false;why.innerHTML=(i===q.q[2]?'<strong>Isso.</strong> ':'<strong>Não é bem assim.</strong> ')+q.q[3]});opts.appendChild(b)})}
  sit.querySelector('.sit-next').addEventListener('click',show);show()}

/* ---------------------------------------------------------------- 5. vídeos (carregam só no clique) */
document.querySelectorAll('.yt').forEach(v=>v.addEventListener('click',()=>{
  const f=document.createElement('iframe');f.src=`https://www.youtube-nocookie.com/embed/${v.dataset.id}?autoplay=1&rel=0`;
  f.title=v.dataset.t;f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';f.allowFullscreen=true;v.replaceWith(f)}));

/* ---------------------------------------------------------------- 6. filtro da imprensa */
const mf=document.querySelectorAll('.mfil button');
if(mf.length)mf.forEach(b=>b.addEventListener('click',()=>{mf.forEach(x=>x.setAttribute('aria-pressed',x===b));const t=b.dataset.t;
  document.querySelectorAll('.news').forEach(n=>n.hidden=!(t==='all'||n.dataset.t===t))}));
})();
