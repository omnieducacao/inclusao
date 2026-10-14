/* Omnisfera · plataforma.js — a parte da plataforma no fim do início (onda 43):
   1. órbita: o símbolo no centro, os papéis da escola em volta e o que passa entre eles
   2. jornada: narrativa por rolagem com a tela do produto trocando a cada etapa
   3. rio de fotos: pausa ao passar o mouse ou ao focar */
(function(){
const COL=['#e5484d','#f5b82e','#f28c28','#8e5bd8','#2f7fd1','#2eaa6a'];
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sm=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
const lerp=(a,b,t)=>a+(b-a)*t;
function fit(cv){const r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);const ctx=cv.getContext('2d');ctx.setTransform(d,0,0,d,0,0);return {ctx,w:r.width,h:r.height}}
/* círculos com os encontros vazados (a "luz" do símbolo) */
function paint(ctx,cs,bg){
  for(const c of cs){ctx.globalAlpha=c.a??1;ctx.fillStyle=COL[c.k];ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,7);ctx.fill()}
  for(let i=0;i<cs.length;i++)for(let j=i+1;j<cs.length;j++){const a=cs[i],b=cs[j];
    const d=Math.hypot(a.x-b.x,a.y-b.y);if(d>=a.r+b.r||d<=Math.abs(a.r-b.r)+.5)continue;
    ctx.save();ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,7);ctx.clip();ctx.globalAlpha=Math.min(a.a??1,b.a??1);ctx.fillStyle=bg;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.fill();ctx.restore()}
  ctx.globalAlpha=1}

/* ---------------------------------------------------------------- 1. órbita */
const orb=document.querySelector('.orbita canvas');
if(orb){
  let S=fit(orb),vis=true,P={x:0,y:0,on:false};
  const night=getComputedStyle(document.querySelector('.omni-ponte')).backgroundColor||'#101a2e';
  const PAP=[{t:'AEE',k:3,o:.62,v:.11,f:0},{t:'Sala comum',k:4,o:.86,v:-.07,f:1.7},{t:'Coordenação',k:0,o:.74,v:.085,f:3.3},{t:'Família',k:5,o:.95,v:-.05,f:4.6}];
  const EST=Array.from({length:9},(_,i)=>({k:(i*2+1)%6,o:1.12+((i*37)%11)/40,v:.025+((i*13)%7)/400,f:i*.7,r:.022+((i*5)%4)/180}));
  let pulsos=[],brilho=0,t0=performance.now(),last=t0,prox=0;
  const pos=(p,t,U,cx,cy)=>{const a=p.f+t*p.v,ex=1,ey=.62;return {x:cx+Math.cos(a)*U*p.o*ex,y:cy+Math.sin(a)*U*p.o*ey,a}};
  function frame(now){
    const dt=Math.min(40,now-last)/1000;last=now;const t=(now-t0)/1000;
    const {ctx,w,h}=S,cx=w/2,cy=h/2,U=Math.min(w*.46,h*.78);
    ctx.clearRect(0,0,w,h);
    // estudantes: órbita externa, pequenos e calmos
    const est=EST.map(p=>{const q=pos(p,t,U,cx,cy);return {x:q.x,y:q.y,r:U*p.r,k:p.k,a:.55}});
    // papéis
    const pap=PAP.map(p=>{const q=pos(p,t,U,cx,cy);let x=q.x,y=q.y;
      if(P.on){const dx=P.x-x,dy=P.y-y,d=Math.hypot(dx,dy);if(d<170){const f=(1-d/170)*22;x+=dx/d*f;y+=dy/d*f}}
      return {...p,x,y,r:U*.075}});
    // fios até o centro
    ctx.lineCap='round';
    pap.forEach(p=>{const g=ctx.createLinearGradient(p.x,p.y,cx,cy);g.addColorStop(0,COL[p.k]+'88');g.addColorStop(1,'rgba(238,241,246,.10)');
      ctx.strokeStyle=g;ctx.lineWidth=1.4;ctx.setLineDash([2,7]);ctx.lineDashOffset=-t*14;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(cx,cy);ctx.stroke()});
    ctx.setLineDash([]);
    // pulsos: o que cada papel registra chega ao centro e volta para os outros
    if(!rm&&Math.random()<dt*1.6){const de=Math.floor(Math.random()*PAP.length);pulsos.push({de,s:0,ida:true})}
    pulsos=pulsos.filter(q=>{q.s+=dt*.55;const p=pap[q.de];const s=sm(q.s);
      const x=q.ida?lerp(p.x,cx,s):lerp(cx,p.x,s),y=q.ida?lerp(p.y,cy,s):lerp(cy,p.y,s);
      ctx.fillStyle=COL[p.k];ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(x,y,3.2,0,7);ctx.fill();
      ctx.globalAlpha=.18;ctx.beginPath();ctx.arc(x,y,9,0,7);ctx.fill();ctx.globalAlpha=1;
      if(q.s>=1&&q.ida){brilho=1;const outro=(q.de+1+Math.floor(Math.random()*(PAP.length-1)))%PAP.length;q.de=outro;q.s=0;q.ida=false;return true}
      return q.s<1});
    brilho=Math.max(0,brilho-dt*1.4);
    // símbolo no centro: gira devagar, respira e acende quando algo chega
    const R=U*(.2+.012*Math.sin(t*1.1))*(1+.05*brilho),d=R/.875,rot=rm?0:t*.12;
    if(brilho>0){const gl=ctx.createRadialGradient(cx,cy,0,cx,cy,R*3.2);gl.addColorStop(0,`rgba(255,255,255,${.10*brilho})`);gl.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(cx,cy,R*3.2,0,7);ctx.fill()}
    const sym=[0,1,2,3,4,5].map(k=>{const a=rot+k*Math.PI/3;return {x:cx+d*Math.sin(a),y:cy-d*Math.cos(a),r:R,k}});
    paint(ctx,est,night);
    paint(ctx,sym,night);
    paint(ctx,pap,night);
    // nomes dos papéis
    ctx.font=`700 ${Math.max(12,U*.042)}px "Plus Jakarta Sans",system-ui,sans-serif`;ctx.textAlign='center';ctx.fillStyle='#eef1f6';
    pap.forEach(p=>{const ty=p.y+p.r+Math.max(16,U*.05);const tw=ctx.measureText(p.t).width;ctx.fillText(p.t,Math.max(tw/2+6,Math.min(w-tw/2-6,p.x)),Math.min(h-6,ty))});
    if(!rm&&vis)requestAnimationFrame(frame);
  }
  const go=()=>{last=performance.now();requestAnimationFrame(frame)};
  const host=orb.parentElement;
  host.addEventListener('pointermove',e=>{const r=orb.getBoundingClientRect();P.x=e.clientX-r.left;P.y=e.clientY-r.top;P.on=true});
  host.addEventListener('pointerleave',()=>P.on=false);
  addEventListener('resize',()=>{S=fit(orb);if(rm)go()});
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{const v=es[0].isIntersecting;if(v&&!vis){vis=true;go()}else vis=v}).observe(orb);
  go();
}

/* ---------------------------------------------------------------- 2. jornada */
const jor=document.getElementById('jornada');
if(jor){
  const steps=[...jor.querySelectorAll('.js')],vids=[...jor.querySelectorAll('.jv')],dots=[...jor.querySelectorAll('.jor-ciclo li')],linha=jor.querySelector('.jor-linha');
  let atual=-1,dentro=false;
  function ativa(i){if(i===atual)return;atual=i;
    steps.forEach((s,k)=>s.classList.toggle('on',k===i));
    dots.forEach((d,k)=>{d.classList.toggle('feito',k<=i);d.classList.toggle('cur',k===i)});
    vids.forEach((v,k)=>{const on=k===i;v.classList.toggle('on',on);
      if(on){if(v.preload!=='auto')v.preload='auto';if(dentro&&!rm)v.play().catch(()=>{})}else v.pause()});
    // carrega o próximo antes de precisar
    const prox=vids[i+1];if(prox&&prox.preload!=='auto')prox.preload='auto';
  }
  function tick(){
    const mid=innerHeight*.5;let p=0;
    steps.forEach((s,k)=>{const r=s.getBoundingClientRect();if(r.top<mid)p=k+Math.min(1,(mid-r.top)/Math.max(1,r.height))});
    p=Math.max(0,Math.min(steps.length-1,p-.35));
    ativa(Math.round(p));
    if(linha)linha.style.setProperty('--p',(p/(steps.length-1)).toFixed(4));
  }
  addEventListener('scroll',()=>requestAnimationFrame(tick),{passive:true});addEventListener('resize',tick);
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{dentro=es[0].isIntersecting;const v=vids[atual];if(v){if(dentro&&!rm)v.play().catch(()=>{});else v.pause()}}).observe(jor);
  if(rm)vids.forEach(v=>v.controls=true);
  tick();
}

/* ---------------------------------------------------------------- 3. rio de fotos */
document.querySelectorAll('.rio').forEach(r=>{
  r.addEventListener('focusin',()=>r.classList.add('pausa'));r.addEventListener('focusout',()=>r.classList.remove('pausa'));
});
})();

/* ---------------------------------------------------------------- 4. profundidade nas pausas com foto (onda 45) */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const figs=[...document.querySelectorAll('.intl-fig')];if(!figs.length)return;
  let pend=false;
  function tick(){pend=false;const vh=innerHeight;
    figs.forEach(f=>{const r=f.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;
      const p=(r.top+r.height/2-vh/2)/(vh/2+r.height/2);f.firstElementChild.style.setProperty('--py',(p*-28).toFixed(1)+'px')})}
  addEventListener('scroll',()=>{if(!pend){pend=true;requestAnimationFrame(tick)}},{passive:true});tick();
})();

/* ---------------------------------------------------------------- 5. lapidação (onda 48) */
(function(){
  const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // linha de leitura no topo
  if(!rm){const b=document.createElement('div');b.className='omni-progresso';b.setAttribute('aria-hidden','true');document.body.appendChild(b);
    let pend=false;const up=()=>{pend=false;const h=document.documentElement.scrollHeight-innerHeight;b.style.setProperty('--pr',h>0?Math.min(1,scrollY/h).toFixed(4):'0')};
    addEventListener('scroll',()=>{if(!pend){pend=true;requestAnimationFrame(up)}},{passive:true});addEventListener('resize',up);up()}
  // entradas em cascata: irmãos aparecem um depois do outro
  if(!rm)document.querySelectorAll('.rv').forEach(el=>{const p=el.parentElement;if(!p)return;const irm=[...p.children].filter(c=>c.classList.contains('rv'));
    if(irm.length>1)el.style.setProperty('--rv-d',Math.min(irm.indexOf(el)*80,480)+'ms')});
  // onda no ponto do clique dos botões
  if(!rm)document.addEventListener('pointerdown',e=>{const b=e.target.closest('.btn');if(!b)return;const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height);
    const o=document.createElement('span');o.className='onda';o.setAttribute('aria-hidden','true');
    o.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;b.appendChild(o);setTimeout(()=>o.remove(),700)});
  // ciclo da jornada: clicar na bolinha leva à etapa
  const jor=document.getElementById('jornada');
  if(jor){const steps=[...jor.querySelectorAll('.js')];
    jor.querySelectorAll('.jor-ciclo li').forEach((li,i)=>{li.setAttribute('role','button');li.tabIndex=0;li.setAttribute('aria-label','Ir para a etapa '+(i+1)+': '+li.textContent.trim());
      const go=()=>{const s=steps[i];if(!s)return;const y=s.getBoundingClientRect().top+scrollY-innerHeight*.4;scrollTo({top:y,behavior:rm?'auto':'smooth'})};
      li.addEventListener('click',go);li.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})})}
})();
