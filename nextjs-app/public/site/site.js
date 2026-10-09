/* Omnisfera · site.js — símbolo vivo, navegação, quiz, checklists, glossário */
(function(){
document.documentElement.classList.remove('no-js');
const COL=['#e5484d','#f5b82e','#f28c28','#8e5bd8','#2f7fd1','#2eaa6a'];
const NS='http://www.w3.org/2000/svg', D=24, R=21;
const cl=x=>Math.max(0,Math.min(1,x)), sm=x=>{x=cl(x);return x*x*(3-2*x)};
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,w)=>{const A=hx(a),B=hx(b);return '#'+A.map((x,i)=>{let m=(x+B[i])/2;m=m+(255-m)*w;return Math.round(m).toString(16).padStart(2,'0')}).join('')};
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
let uid=0;
function lens(p,q,r){const dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy);if(d>=2*r-0.01||d<0.01)return null;
  const a=d/2,h=Math.sqrt(r*r-a*a),mx=p[0]+dx/2,my=p[1]+dy/2,px=-dy/d*h,py=dx/d*h;
  return `M${(mx+px).toFixed(2)},${(my+py).toFixed(2)} A${r},${r} 0 0 1 ${(mx-px).toFixed(2)},${(my-py).toFixed(2)} A${r},${r} 0 0 1 ${(mx+px).toFixed(2)},${(my+py).toFixed(2)}Z`}
function base(dd=D,rot=0){return [0,1,2,3,4,5].map(i=>{const a=(i*60+rot)*Math.PI/180;return {x:60+dd*Math.sin(a),y:60-dd*Math.cos(a),op:1,s:1}})}
function setup(svg){
  const id='om'+(uid++);
  svg.setAttribute('viewBox','-12 -12 144 144');
  svg.innerHTML=`<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-40" y="-40" width="200" height="200"><rect x="-40" y="-40" width="200" height="200" fill="#fff"/><g></g></mask></defs><g mask="url(#${id})"></g><g></g>`;
  const cut=svg.querySelector('mask g'), cs=svg.children[1], ls=svg.children[2];
  const circ=COL.map(()=>{const c=document.createElementNS(NS,'circle');cs.appendChild(c);return c});
  return {svg,cut,ls,circ,f:svg.dataset.f||'luz',hl:svg.dataset.hl!=null?+svg.dataset.hl:null,mc:svg.dataset.mc};
}
function draw(o,st){
  st.forEach((c,i)=>{const e=o.circ[i];e.setAttribute('cx',c.x.toFixed(2));e.setAttribute('cy',c.y.toFixed(2));e.setAttribute('r',(R*c.s).toFixed(2));
    e.setAttribute('fill',o.f==='mono'?(o.mc||'currentColor'):COL[i]);e.setAttribute('opacity',c.op.toFixed(3))});
  let cut='',ls='';
  for(let i=0;i<6;i++)for(let j=i+1;j<6;j++){const a=st[i],b=st[j];const d=lens([a.x,a.y],[b.x,b.y],R*Math.min(a.s,b.s));if(!d)continue;
    if(o.f==='cor') ls+=`<path d="${d}" fill="${mix(COL[i],COL[j],.42)}" opacity="${Math.min(a.op,b.op).toFixed(3)}"/>`; else cut+=`<path d="${d}"/>`}
  o.cut.innerHTML=cut; o.ls.innerHTML=ls;
}
function state(a,t,o){
  if(a==='respira') return base(D+3*Math.sin(t*1.5),t*5);
  if(a==='vez'){const k=Math.floor(t/1.3)%6,u=(t%1.3)/1.3,l=Math.sin(Math.PI*cl(u*1.3));return base(D,t*3).map((c,i)=>{if(i===k){const g=(i*60+t*3)*Math.PI/180;c.x+=Math.sin(g)*5*l;c.y-=Math.cos(g)*5*l;c.s=1+.07*l}else c.op=1-.45*l;return c})}
  if(a==='destaque'){const k=o.hl;const l=.5+.5*Math.sin(t*1.6);return base(D+1.5*Math.sin(t*1.2),t*4).map((c,i)=>{if(i===k){const g=(i*60+t*4)*Math.PI/180;c.x+=Math.sin(g)*(3+3*l);c.y-=Math.cos(g)*(3+3*l);c.s=1.06}else c.op=.38;return c})}
  if(a==='encontro'){const p=sm(t/2.2);return base(D+46*(1-p),-120*(1-p)).map(c=>{c.op=cl(t/.5);c.s=.5+.5*p;return c})}
  if(a==='hover'){o.h+=((o.hov?1:0)-o.h)*.12;return base(D+5*o.h,30*o.h)}
  if(a==='ciclo'){const u=t%14;
    if(u<3) return state('encontro',u,o);
    if(u<7) return state('respira',u-3,o);
    if(u<12.6) return state('vez',(u-7),o);
    const q=sm((u-12.6)/1.2);const s=state('respira',4,o);return s.map((c,i)=>{const b=base(D+44*q,40*q)[i];b.op=1-q;b.s=1-.4*q;return b})}
  return base();
}
const objs=[];
document.querySelectorAll('svg.sym[data-a]').forEach(svg=>{
  const o=setup(svg);o.a=svg.dataset.a;o.h=0;o.hov=false;o.vis=true;o.t0=0;
  if(o.a==='hover'){const lk=svg.closest('a');if(lk){lk.addEventListener('mouseenter',()=>o.hov=true);lk.addEventListener('mouseleave',()=>o.hov=false);lk.addEventListener('focus',()=>o.hov=true);lk.addEventListener('blur',()=>o.hov=false)}}
  if(o.a==='destaque'&&o.hl!=null&&rm){draw(o,base().map((c,i)=>{if(i!==o.hl)c.op=.38;return c}));return}
  draw(o,base());objs.push(o);
});
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{const o=objs.find(x=>x.svg===e.target);if(o){if(e.isIntersecting&&!o.vis&&o.a==='encontro')o.t0=performance.now()/1000;o.vis=e.isIntersecting}}),{threshold:.1});objs.forEach(o=>{o.vis=false;io.observe(o.svg)})}
if(!rm){const t0=performance.now();(function loop(now){const t=(now-t0)/1000;for(const o of objs){if(!o.vis&&o.a!=='hover')continue;let tt=t;if(o.a==='encontro')tt=Math.min(now/1000-o.t0,2.4);draw(o,state(o.a,tt,o))}requestAnimationFrame(loop)})(t0)}
window.omniRender=t=>objs.forEach(o=>draw(o,state(o.a,t,o)));

/* topo */
const top=document.querySelector('.top');
if(top){const on=()=>top.classList.toggle('scrolled',scrollY>8);on();addEventListener('scroll',on,{passive:true});
  const b=top.querySelector('.burger');if(b)b.addEventListener('click',()=>{const o=top.classList.toggle('open');b.setAttribute('aria-expanded',o)});
  document.addEventListener('click',e=>{top.querySelectorAll('details[open]').forEach(d=>{if(!d.contains(e.target))d.removeAttribute('open')})});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){top.querySelectorAll('details[open]').forEach(d=>d.removeAttribute('open'));top.classList.remove('open')}})}

/* revelar ao rolar */
const rv=document.querySelectorAll('.rv');
if('IntersectionObserver' in window&&!rm){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});rv.forEach(el=>io.observe(el))}else rv.forEach(el=>el.classList.add('in'));

/* sumário com seção ativa */
if(innerWidth<980)document.querySelectorAll('.toc details[open]').forEach(d=>d.removeAttribute('open'));
const tocLinks=[...document.querySelectorAll('.toc a')];
if(tocLinks.length&&'IntersectionObserver' in window){const map=new Map(tocLinks.map(a=>[a.getAttribute('href').slice(1),a]));
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){tocLinks.forEach(a=>a.classList.remove('on'));const a=map.get(e.target.id);if(a)a.classList.add('on')}})},{rootMargin:'-20% 0px -70% 0px'});
  map.forEach((a,id)=>{const el=document.getElementById(id);if(el)io.observe(el)})}

/* quiz */
const qz=document.getElementById('quiz-data');
if(qz){const data=JSON.parse(qz.textContent),box=document.querySelector('.quiz .qs'),sc=document.querySelector('.quiz-score b');let ok=0,done=0;
  data.forEach((q,qi)=>{const fs=document.createElement('div');fs.className='qq';
    fs.innerHTML=`<fieldset><legend>${qi+1}. ${q[0]}</legend><div class="opts"></div></fieldset><div class="why" hidden></div>`;
    const opts=fs.querySelector('.opts'),why=fs.querySelector('.why');
    q[1].forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<span class="l">${'ABCD'[i]}</span><span>${t}</span>`;
      b.addEventListener('click',()=>{opts.querySelectorAll('button').forEach((x,j)=>{x.disabled=true;if(j===q[2])x.classList.add('ok')});
        if(i!==q[2])b.classList.add('no');else ok++;done++;why.hidden=false;why.innerHTML=(i===q[2]?'<strong>Isso.</strong> ':'<strong>Não é bem assim.</strong> ')+q[3];sc.textContent=ok;
        if(done===data.length)sc.parentElement.setAttribute('aria-label',`${ok} de ${data.length} acertos`)});
      opts.appendChild(b)});
    box.appendChild(fs)})}

/* checklists */
const store={get(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
document.querySelectorAll('.fg-ck').forEach(ck=>{const key='om-'+ck.dataset.ck,boxes=[...ck.querySelectorAll('input[type=checkbox]')],saved=store.get(key)||[];
  const upd=()=>{const n=boxes.filter(b=>b.checked).length;ck.querySelector('.prog b').textContent=n;ck.querySelector('.fg-ck-bar i').style.width=(100*n/boxes.length)+'%';store.set(key,boxes.map(b=>b.checked))};
  boxes.forEach((b,i)=>{b.checked=!!saved[i];b.addEventListener('change',upd)});upd()});
const rs=document.getElementById('ckReset');if(rs)rs.addEventListener('click',()=>{document.querySelectorAll('.fg-ck input').forEach(b=>{b.checked=false;b.dispatchEvent(new Event('change'))})});

/* glossário */
const gs=document.getElementById('glSearch');
if(gs){const items=[...document.querySelectorAll('.fg-gl dl')],empty=document.querySelector('.gl-empty');
  const norm=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
  items.forEach(d=>d.dataset.s=norm(d.textContent));
  gs.addEventListener('input',()=>{const q=norm(gs.value.trim());let n=0;items.forEach(d=>{const v=!q||d.dataset.s.includes(q);d.hidden=!v;if(v)n++});empty.hidden=n>0})}

/* formação: filtro por papel */
const fl=document.querySelectorAll('.filters button');
if(fl.length){fl.forEach(b=>b.addEventListener('click',()=>{fl.forEach(x=>x.setAttribute('aria-pressed',x===b));const p=b.dataset.p;let m=0;
  document.querySelectorAll('.trow').forEach(r=>{const v=p==='all'||r.dataset.p.split(' ').includes(p);r.hidden=!v;if(v)m+=+r.dataset.min});
  const t=document.getElementById('trilhaTempo');if(t)t.textContent='≈ '+m+' min de leitura'}));
  const h=location.hash.slice(1);const hb=[...fl].find(b=>b.dataset.p===h);if(hb)hb.click()}
})();
