const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ini=s=>String(s).replace(/\(.*?\)|:.*$/g,'').trim().split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const hue=s=>130+[...String(s)].reduce((a,c)=>(a*31+c.charCodeAt(0))%70,7);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\([^)]*\)/g,'').replace(/[^a-z0-9]+/g,' ').trim();

/* Datos: [titulo, artistas, duracion, subcategoria] */
const canciones=[["Nueva Era","Duki, Myke Towers","3:38","Trap latino"],["Que Se Parezca A Ti","Tiago PZK","4:10","Urbano romántico"],["Te Necesito","KHEA, Maria Becerra","4:14","Urbano romántico"],["Salir Con Vida","Morat, Feid","2:57","Pop latino"],["Cosas Pendientes","Maluma","4:31","Románticas"],["LALA","Myke Towers","3:18","Reguetón"],["Columbia","Quevedo","3:26","Reguetón"],["Otra vez","Zion y Lennox, J Balvin","3:33","Reguetón"],["Malbec (Vivo Calafate)","Duki","2:57","Trap latino"],["Ojitos Lindos","Bad Bunny, Bomba Estéreo","4:34","Románticas"],["Tal Vez","Paulo Londra","4:32","Urbano romántico"],["Desconocidos","Manuel Turizo, Mau y Ricky, Camilo","3:24","Pop latino"],["Tiago PZK: Bzrp Music Sessions, Vol. 48","Bizarrap, Tiago PZK","2:47","Sessions"],["Sirena","Cali Y El Dandee","5:49","Pop latino"],["Ameri","Duki","3:18","Trap latino"],["TQG","KAROL G, Shakira","3:37","Reguetón"],["Entre nosotros (remix)","Tiago PZK, LIT killah, Maria Becerra, Nicki Nicole","4:49","Remixes"],["Según Quién","Maluma, Carin Leon","2:30","Regional latino"],["Si Me Sobrara el Tiempo","Duki","2:55","Urbano romántico"],["Paulo Londra: Bzrp Music Sessions, Vol. 23/66","Bizarrap, Paulo Londra","4:18","Sessions"],["Además de Mí","Rusherking, Big One, Tiago PZK","3:14","Urbano romántico"],["Volando (Remix)","Mora, Bad Bunny, Sech","4:34","Remixes"],["Antes de Perderte","Duki","4:01","Urbano romántico"],["Mi Niña","Los Legendarios, Wisin, Myke Towers","3:34","Reguetón"],["Salimo de Noche","Tiago PZK, Trueno","3:33","Trap latino"],["Ahora Dice","Chris Jedi, J Balvin, Ozuna, Arcángel","4:41","Reguetón"],["Goteo","Duki","3:05","Trap latino"],["Girl","Myke Towers","3:10","Reguetón"],["Mamichula","Trueno, Nicki Nicole, Bizarrap","3:39","Urbano romántico"],["Prende la Cámara RMX","FMK, Mau y Ricky, Tiago PZK","4:02","Remixes"],["Yandel 150","Yandel, Feid","3:39","Reguetón"],["Bandido","Myke Towers, Juhn","3:53","Reguetón"],["Déjala Que Vuelva","Piso 21, Manuel Turizo","3:55","Pop latino"],["Además de Mí (Remix)","Rusherking, KHEA, Maria Becerra, Tiago PZK, LIT killah","5:53","Remixes"],["ULTRA SOLO REMIX","De La Ghetto, Pailita, Polimá Westcoast, Feid","5:29","Remixes"],["HORA CERO","Myke Towers","2:59","Trap latino"],["Santa","Rvssian, Rauw Alejandro, Ayra Starr","3:19","Reguetón"],["Cerca de ti [Remix]","LIT killah, Tiago PZK, Seven Kayne, Rusherking, Bhavi, Tobi","4:02","Remixes"],["WACHA","KHEA, Duki","3:30","Trap latino"],["Young Miko: Bzrp Music Sessions, Vol. 58","Young Miko, Bizarrap","3:09","Sessions"],["Solo pienso en ti","Paulo Londra, De La Ghetto, Justin Quiles","4:33","Urbano romántico"],["Hood (Remix)","Trueno, Tiago PZK","3:00","Remixes"],["hARAkiRI","Duki, C.R.O","2:52","Trap latino"],["Me Porto Bonito","Bad Bunny, Chencho Corleone","3:12","Reguetón"],["FERNET","Rei, Quevedo","3:13","Trap latino"],["Traductor","Myke Towers, Tiago PZK","3:45","Reguetón"],["como si no importara","Emilia, Duki","2:56","Urbano romántico"],["China","KAROL G, Anuel AA, Daddy Yankee, J Balvin, Ozuna","5:02","Reguetón"],["Paracaídas","Paulo Londra","3:10","Pop latino"],["WYA REMIX RED","J Abdiel, De La Rose, Yan Block, Jay Wheeler, iZaak","3:10","Remixes"]].map(([t,a,d,sub])=>({t,a,d,sub}));
canciones.forEach((x,i)=>x._id=i); // id único por canción (también para las de iTunes)

const cats=[['Trap latino','photo-1493225457124-a3eb161ffa5f'],['Reguetón','photo-1571266028243-d220c9a3a157'],['Pop latino','photo-1459749411175-04bf5292ceea'],['Urbano romántico','photo-1516280440614-37939bbacd81'],['Románticas','photo-1511379938547-c1f69419868d'],['Remixes','photo-1470225620780-dba8ba36b745'],['Sessions','photo-1598488035139-bdbb2231ce04'],['Regional latino','photo-1514525253161-7a46d19cd819']];
let genre='',page=1;const perPage=10;
/* Doble selección: artistas del género Romántica y canciones traídas de iTunes */
const ROMANTICAS=['Chayanne','Ricardo Arjona','Cristian Castro','Reik'];
const remote=new Map(),remoteLoading=new Set(),remoteErr=new Set();let nextId=1000;
const pool=a=>a&&remote.has(a)?canciones.concat(remote.get(a)):canciones;
/* ===== Portadas desde YouTube / YouTube Music =====
   YouTube Music no ofrece una API pública de imágenes, así que cada canción se busca en YouTube
   y se usa la miniatura de su video. Opciones:
   1) YT_API_KEY: pega aquí una clave gratuita de YouTube Data API v3 (la opción más estable).
   2) Sin clave: se intenta con instancias públicas de Piped (pueden estar caídas).
   Si ninguna responde, la página usa la portada de iTunes, así nunca queda una tarjeta vacía. */
const YT_API_KEY='';
const PIPED=['https://pipedapi.kavin.rocks','https://pipedapi.adminforge.de','https://api.piped.private.coffee'];
const ytCache=(()=>{try{return JSON.parse(localStorage.getItem('alejandra-yt')||'{}')}catch(e){return{}}})();
const ytDead=new Set(),ytQueue=[];let ytActive=0,ytDown=false;
let exploreKey='';const exploreData=new Map(),exploreLoading=new Set(); // filtro de exploración activo y sus canciones
function ytNext(){while(ytActive<3&&ytQueue.length)ytQueue.shift()()}
function ytLimit(fn){return new Promise(r=>{ytQueue.push(async()=>{ytActive++;try{r(await fn())}catch(e){r(null)}ytActive--;ytNext()});ytNext()})}
// Devuelve el id del video, '' si no hay resultados o null si el servicio no respondió
async function ytSearch(q){
  if(YT_API_KEY){try{const r=await fetch('https://www.googleapis.com/youtube/v3/search?'+new URLSearchParams({part:'snippet',type:'video',videoCategoryId:'10',maxResults:'1',q,key:YT_API_KEY}));if(r.ok){const j=await r.json();return j.items&&j.items[0]?j.items[0].id.videoId:''}}catch(e){}}
  for(const base of PIPED){
    if(ytDead.has(base))continue;
    try{
      const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),4500);
      const r=await fetch(base+'/search?'+new URLSearchParams({q,filter:'music_songs'}),{signal:ctl.signal});clearTimeout(t);
      if(!r.ok)throw new Error('HTTP '+r.status);
      const m=((await r.json()).items||[]).map(i=>/[?&]v=([\w-]{11})/.exec(i.url||'')).find(Boolean);
      return m?m[1]:'';
    }catch(e){ytDead.add(base)}
  }
  if(!YT_API_KEY)ytDown=PIPED.every(b=>ytDead.has(b));
  return null;
}
async function ytCover(t,a){
  const first=a.split(',')[0].trim(),key=norm(t+' '+first);
  if(key in ytCache)return ytCache[key]||null;
  if(ytDown)return null;
  const id=await ytLimit(()=>ytSearch(t.replace(/\(.*?\)|\[.*?\]/g,'').trim()+' '+first));
  if(id===null||id===undefined)return null;
  ytCache[key]=id;try{localStorage.setItem('alejandra-yt',JSON.stringify(ytCache))}catch(e){}
  return id||null;
}
// Coloca la miniatura de YouTube sobre la portada (prueba calidad alta y luego media)
function putYT(el,vid,alt){
  if(!el)return;
  const urls=['hq720','mqdefault'].map(n=>`https://i.ytimg.com/vi/${vid}/${n}.jpg`);
  const go=i=>{if(i>=urls.length)return;const img=new Image();img.alt=alt;img.loading='lazy';img.onload=()=>{if(img.naturalWidth<=120)go(i+1);else el.appendChild(img)};img.onerror=()=>go(i+1);img.src=urls[i]};
  go(0);
}
// El botón de la tarjeta abre directamente la canción en YouTube Music
function linkYT(el,vid){const a=el&&el.parentElement&&el.parentElement.querySelector('.songbody a');if(a)a.href='https://music.youtube.com/watch?v='+vid}
function upgradeCovers(sel){document.querySelectorAll(sel+' .cover[data-t]').forEach(async el=>{const vid=await ytCover(el.dataset.t,el.dataset.a);if(vid&&el.isConnected&&!el.dataset.yt){el.dataset.yt=vid;putYT(el,vid,'Portada de '+el.dataset.t);linkYT(el,vid)}})}
// Categoría que se le asigna a las canciones traídas de internet para un artista
function subFor(a){if(ROMANTICAS.includes(a))return'Románticas';const n={};canciones.forEach(c=>{if(hasArtist(c,a))n[c.sub]=(n[c.sub]||0)+1});const top=Object.entries(n).sort((x,y)=>y[1]-x[1])[0];return top?top[0]:'Otros'}

/* Navegación y tema */
// Menú hamburguesa: abre/cierra con botón, fondo, tecla Escape o al elegir una sección
function setMenu(open){$('drawer').classList.toggle('open',open);$('scrim').classList.toggle('open',open);$('hamb').classList.toggle('open',open);$('hamb').setAttribute('aria-expanded',open)}
$('hamb').onclick=()=>setMenu(!$('drawer').classList.contains('open'));
$('scrim').onclick=()=>setMenu(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
document.querySelectorAll('.drawer a').forEach(a=>a.onclick=e=>{e.preventDefault();setMenu(false);const t=document.querySelector(a.getAttribute('href'));if(t)t.scrollIntoView({behavior:'smooth'})});
$('theme').onclick=()=>{document.body.classList.toggle('light');localStorage.setItem('alejandra-theme',document.body.classList.contains('light')?'light':'dark')};
if(localStorage.getItem('alejandra-theme')==='light')document.body.classList.add('light');

/* Música */
$('categories').innerHTML=cats.map(([n,img])=>`<button class="cat" data-genre="${esc(n)}" style="background-image:url('https://images.unsplash.com/${img}?w=700&q=70')"><strong>${esc(n)}</strong><small>${canciones.filter(x=>x.sub===n).length} canciones</small></button>`).join('');
$('filters').innerHTML=['Todas',...cats.map(c=>c[0])].map(g=>`<button class="chip ${g==='Todas'?'active':''}" data-genre="${g==='Todas'?'':esc(g)}">${esc(g)}</button>`).join('');
$('sub').innerHTML+=[...new Set(canciones.map(x=>x.sub))].sort().map(s=>`<option>${esc(s)}</option>`).join('');
const artists=[...new Set([...canciones.flatMap(x=>x.a.split(',').map(a=>a.trim())),'HUMBE','Duki','Reik','Cristian Castro','Chayanne','Ricardo Arjona'])].sort((a,b)=>a.localeCompare(b,'es'));
$('artist').innerHTML+=artists.map(a=>`<option>${esc(a)}</option>`).join('');
const hasArtist=(x,a)=>x.k===a||x.a.split(',').map(v=>v.trim()).includes(a);
document.querySelectorAll('[data-artist]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-artist]').forEach(x=>x.classList.toggle('selected',x===b));$('artist').value=b.dataset.artist;page=1;render();if(b.dataset.artist&&genre){genre='';document.querySelectorAll('.chip[data-genre]').forEach(c=>c.classList.toggle('active',c.dataset.genre===''));render()}}));
function chooseGenre(g,noScroll){genre=g;page=1;if(exploreKey){exploreKey='';syncExplore()}document.querySelectorAll('.chip[data-genre]').forEach(b=>b.classList.toggle('active',b.dataset.genre===g));render();syncDual();if(!noScroll)$('musica').scrollIntoView({behavior:'smooth'})}
document.querySelectorAll('[data-genre]').forEach(b=>b.onclick=()=>chooseGenre(b.dataset.genre));
['search','artist','sub'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',()=>{page=1;document.querySelectorAll('[data-artist]').forEach(b=>b.classList.toggle('selected',b.dataset.artist===$('artist').value));render()}));
$('reset').onclick=()=>{$('search').value='';$('artist').value='';$('sub').value='';document.querySelectorAll('[data-artist]').forEach(b=>b.classList.toggle('selected',b.dataset.artist===''));chooseGenre('')};
function filtered(){const q=$('search').value.toLocaleLowerCase('es'),a=$('artist').value,s=$('sub').value;if(exploreKey&&s){exploreKey='';syncExplore()} // al usar la subcategoría se sale de la exploración
  if(exploreKey)return (exploreData.get(exploreKey)||[]).filter(x=>(!a||norm(x.a).includes(norm(a)))&&(`${x.t} ${x.a}`.toLocaleLowerCase('es').includes(q)));
  return pool(a).filter(x=>(!genre||x.sub===genre)&&(!s||x.sub===s)&&(!a||hasArtist(x,a))&&(`${x.t} ${x.a}`.toLocaleLowerCase('es').includes(q)))}
function render(){
  const a0=$('artist').value;if(exploreKey&&!exploreData.has(exploreKey)&&!exploreLoading.has(exploreKey))loadExplore(exploreKey);
  if(a0&&!exploreKey&&!remote.has(a0)&&!remoteLoading.has(a0))loadRemote(a0);
  const list=filtered(),max=Math.max(1,Math.ceil(list.length/perPage));page=Math.min(page,max);
  $('count').textContent=`${list.length} canciones · página ${page}/${max}`+(remoteLoading.has(a0)?' · cargando canciones de internet...':'')+(remoteErr.has(a0)?' · no se pudo consultar el catálogo en línea':'')+(exploreKey&&exploreLoading.has(exploreKey)?' · cargando canciones de internet...':'');
  const slice=list.slice((page-1)*perPage,page*perPage);
  $('songgrid').innerHTML=slice.map(x=>{const id=x._id;return `<article class="song"><div class="cover" id="cover${id}" style="--h:${hue(x.t)}"><span class="ini">${esc(ini(x.t))}</span>${genImg(x.t,x.a.split(',')[0])}</div><div class="songbody"><strong>${esc(x.t)}</strong><p>${esc(x.a)}</p><small>${esc(x.sub)} · ${esc(x.d)}</small><br><a target="_blank" rel="noopener noreferrer" href="https://music.youtube.com/search?q=${encodeURIComponent(x.t+' '+x.a)}">Buscar en YouTube Music &#8599;</a></div></article>`}).join('')||'<p>No hay canciones con estos filtros.</p>';
  $('pages').innerHTML=Array.from({length:max},(_,i)=>`<button class="pagebtn ${page===i+1?'active':''}" data-page="${i+1}">${i+1}</button>`).join('');
  document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{page=+b.dataset.page;render()});
  slice.forEach(loadCover);
}
const covers=new Map();

/* ===== Imágenes garantizadas: cada canción y cada juego siempre muestra una imagen =====
   1) Se muestra al instante una portada generada (SVG con el título), para que nunca quede vacío.
   2) Encima se coloca la portada real traída de internet: iTunes/App Store, Wikipedia,
      MusicBrainz + Cover Art Archive y miniaturas de YouTube. Con reintentos y caché local. */
function genArt(title,sub,h){
  const words=String(title).replace(/\(.*?\)|\[.*?\]/g,'').trim().split(/\s+/).filter(Boolean),lines=[];let cur='';
  for(const w of words){if(cur&&(cur+' '+w).length>13){lines.push(cur);cur=w}else cur=(cur?cur+' ':'')+w}
  if(cur)lines.push(cur);
  const Ls=lines.slice(0,4),fs=Ls.length>3?54:Ls.length>2?64:Ls.length>1?76:92,y0=290-(Ls.length-1)*fs*.55;
  const txt=Ls.map((l,i)=>`<text x="300" y="${Math.round(y0+i*fs*1.12)}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="${fs}" fill="#fff">${esc(l)}</text>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h} 60% 22%)"/><stop offset="1" stop-color="hsl(${h+40} 65% 42%)"/></linearGradient></defs><rect width="600" height="600" fill="url(#g)"/><circle cx="510" cy="90" r="160" fill="#fff" fill-opacity=".08"/><circle cx="70" cy="545" r="130" fill="#fff" fill-opacity=".07"/>${txt}<text x="300" y="565" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="30" fill="#fff" fill-opacity=".85">${esc(String(sub||'').slice(0,34))}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
const genImg=(t,s)=>`<img class="gen" alt="Portada de ${esc(t)}" src="${genArt(t,s,hue(t))}">`;

/* iTunes con cola (para no pasar el límite de peticiones), reintentos y caché en localStorage */
let itCache=(()=>{try{return JSON.parse(localStorage.getItem('alejandra-it2')||'{}')}catch(e){return{}}})();
if(Object.keys(itCache).length>350)itCache={};
let itChain=Promise.resolve();
function itunes(params){
  const key=new URLSearchParams(params).toString();
  if(key in itCache)return Promise.resolve(itCache[key]);
  const run=async()=>{
    for(let k=0;k<3;k++){
      try{
        const r=await fetch('https://itunes.apple.com/search?'+key);
        if(r.ok){
          const res=((await r.json()).results||[]).slice(0,25).map(x=>({trackName:x.trackName,artistName:x.artistName,artworkUrl100:x.artworkUrl100,artworkUrl512:x.artworkUrl512}));
          itCache[key]=res;try{localStorage.setItem('alejandra-it2',JSON.stringify(itCache))}catch(e){}
          return res;
        }
      }catch(e){}
      await new Promise(r=>setTimeout(r,800*(k+1)));
    }
    return [];
  };
  const p=itChain.then(run);
  itChain=p.then(()=>new Promise(r=>setTimeout(r,180)),()=>0);
  return p;
}
/* Wikipedia: imagen principal de un artículo (con redirecciones) o del mejor resultado de búsqueda */
async function wikiImg(params){
  try{
    const r=await fetch('https://en.wikipedia.org/w/api.php?'+new URLSearchParams({action:'query',prop:'pageimages',format:'json',pithumbsize:'650',redirects:'1',origin:'*',...params}));
    if(!r.ok)return '';
    const pages=Object.values((await r.json()).query?.pages||{}).sort((a,b)=>(a.index||99)-(b.index||99));
    return (pages.find(p=>p.thumbnail)||{}).thumbnail?.source||'';
  }catch(e){return ''}
}
/* MusicBrainz + Cover Art Archive (último recurso para canciones) */
let mbChain=Promise.resolve();
function mbCover(title,artist){
  const run=async()=>{
    try{
      const q=`release:"${title.replace(/"/g,'')}" AND artist:"${artist.replace(/"/g,'')}"`;
      const r=await fetch('https://musicbrainz.org/ws/2/release/?'+new URLSearchParams({query:q,fmt:'json',limit:'3'}));
      if(!r.ok)return '';
      const id=((await r.json()).releases||[])[0]?.id;
      return id?`https://coverartarchive.org/release/${id}/front-500`:'';
    }catch(e){return ''}
  };
  const p=mbChain.then(run);mbChain=p.then(()=>new Promise(r=>setTimeout(r,1100)),()=>0);
  return p;
}
async function findCover(x){
  const first=x.a.split(',')[0].trim(),t=norm(x.t),a=norm(first),clean=x.t.replace(/\(.*?\)|\[.*?\]/g,'').trim();
  const artistOk=h=>{const ra=norm(h.artistName);return ra&&a&&(ra.includes(a)||a.includes(ra))};
  const titleOk=h=>{const rt=norm(h.trackName);return rt&&(rt===t||rt.startsWith(t)||t.startsWith(rt)||rt.includes(t))};
  const art=h=>h&&h.artworkUrl100?h.artworkUrl100.replace('100x100bb','600x600bb'):'';
  let r=await itunes({term:clean+' '+first,entity:'song',limit:'25'});
  let hit=r.find(h=>titleOk(h)&&artistOk(h))||r.find(titleOk)||r.find(artistOk)||r[0];
  if(art(hit))return art(hit);
  r=await itunes({term:clean,entity:'song',limit:'25'});
  hit=r.find(h=>titleOk(h)&&artistOk(h))||r.find(titleOk);
  if(art(hit))return art(hit);
  const mb=await mbCover(clean,first);
  if(mb)return mb;
  r=await itunes({term:first,entity:'song',limit:'25'});
  return art(r.find(artistOk)||r[0]);
}
function putImg(el,url,alt){
  if(!el||!url)return;
  const tries=[url];
  if(/\d+x\d+bb/.test(url))tries.push(url.replace(/\d+x\d+bb/,'300x300bb'),url.replace(/\d+x\d+bb/,'100x100bb'));
  const go=i=>{if(i>=tries.length)return;const img=new Image();img.alt=alt;img.referrerPolicy='no-referrer';img.onload=()=>el.appendChild(img);img.onerror=()=>go(i+1);img.src=tries[i]};
  go(0);
}

async function loadCover(x){
  const id=x._id,alt='Portada de '+x.t;
  if(!$('cover'+id))return;
  if(covers.has(id)){const c=covers.get(id);putImg($('cover'+id),c.url,alt);if(c.yt){putYT($('cover'+id),c.yt,alt);linkYT($('cover'+id),c.yt)}return}
  const yp=ytCover(x.t,x.a); // YouTube se consulta en paralelo y se coloca encima cuando llega
  let url=x.cover||'';
  if(!url)url=await findCover(x);
  const c={url};covers.set(id,c);putImg($('cover'+id),url,alt);
  const y=await yp;if(y){c.yt=y;putYT($('cover'+id),y,alt);linkYT($('cover'+id),y)}
}
render();

/* Intereses */
const interests=[['Videojuegos','Plants vs. Zombies, estrategia y entretenimiento.','photo-1535223289827-42f1e9919769'],['Programación','HTML, CSS, JavaScript y desarrollo de sistemas.','photo-1515879218367-8466d910aaa4'],['Bases de datos','SQL Server, consultas y aplicaciones.','photo-1555066931-4365d14bab8c'],['Deportes','El voleibol, el movimiento y el trabajo en equipo.','photo-1592656094267-764a45160876'],['Pasatiempos','Escuchar música, descubrir artistas y ver películas.','photo-1516280440614-37939bbacd81'],['Metas','Seguir aprendiendo y crecer personal y profesionalmente.','photo-1497633762265-9d179a990aa6']];
$('interestcards').innerHTML=interests.map(([t,d,img])=>`<article class="panel info"><div class="pic" style="background-image:url('https://images.unsplash.com/${img}?w=900&q=70')"></div><div class="content"><h3>${t}</h3><p>${d}</p></div></article>`).join('');

/* Carrusel */
let photos=[],current=0,playing=true;
function drawCarousel(){
  const stage=$('stage');
  if(!photos.length){stage.innerHTML='<div class="photo"><span>Agrega tus fotos<br>para verlas girar</span></div>';return}
  stage.innerHTML=photos.map((src,i)=>{let d=(i-current+photos.length)%photos.length;if(d>photos.length/2)d-=photos.length;const dist=Math.abs(d),scale=dist===0?1.12:Math.max(.64,1-dist*.13);return `<button class="photo" data-photo="${i}" style="transform:translateX(${d*105}px) rotateY(${-d*33}deg) scale(${scale});z-index:${100-dist};opacity:${dist>3?.15:1}"><img src="${src}" alt="Foto personal ${i+1}"></button>`}).join('');
  stage.querySelectorAll('[data-photo]').forEach(b=>b.onclick=()=>{const i=+b.dataset.photo;if(i!==current){current=i;drawCarousel()}else{$('bigphoto').src=photos[i];$('zoom').showModal()}});
}
$('upload').onchange=e=>{photos.forEach(u=>URL.revokeObjectURL(u));photos=[...e.target.files].filter(f=>f.type.startsWith('image/')).slice(0,15).map(f=>URL.createObjectURL(f));current=0;drawCarousel()};
$('prev').onclick=()=>{if(photos.length){current=(current-1+photos.length)%photos.length;drawCarousel()}};
$('next').onclick=()=>{if(photos.length){current=(current+1)%photos.length;drawCarousel()}};
$('auto').onclick=()=>{playing=!playing;$('auto').textContent=playing?'Pausar giro':'Reanudar giro'};
setInterval(()=>{if(playing&&photos.length>1&&!document.hidden){current=(current+1)%photos.length;drawCarousel()}},3500);
$('closezoom').onclick=()=>$('zoom').close();$('zoom').onclick=e=>{if(e.target===$('zoom'))$('zoom').close()};drawCarousel();

/* ===== Formulario de contacto: validaciones ===== */
(()=>{
  const form=$('contact');
  const F={name:$('name'),email:$('email'),phone:$('phone'),date:$('date'),topic:$('topic'),message:$('message'),accept:$('accept')};
  // Cada regla devuelve el mensaje de error, o '' si el campo es válido
  const rules={
    name(v){v=v.trim();if(!v)return'Escribe tu nombre completo.';if(v.length<3)return'El nombre debe tener al menos 3 caracteres.';if(v.length>60)return'El nombre no puede superar los 60 caracteres.';if(!/\p{L}/u.test(v))return'El nombre no puede contener solo números o símbolos.';return''},
    email(v){if(!v)return'Escribe tu correo electrónico.';if(/\s/.test(v))return'El correo no puede contener espacios en blanco.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))return'Introduce un correo válido, por ejemplo nombre@dominio.com.';return''},
    phone(v){v=v.trim();if(!v)return'';if(!/^\+?[\d\s().-]+$/.test(v))return'Usa solo números, espacios y un prefijo opcional que empiece con +.';const d=v.replace(/\D/g,'').length;if(d<7||d>15)return'El teléfono debe tener entre 7 y 15 dígitos.';return''},
    date(v){if(!v)return'';const d=new Date(v+'T00:00:00');if(isNaN(d))return'Introduce una fecha válida.';const hoy=new Date();hoy.setHours(0,0,0,0);if(d<hoy)return'La fecha no puede ser anterior a hoy.';const max=new Date(hoy);max.setFullYear(max.getFullYear()+1);if(d>max)return'La fecha no puede superar un año desde hoy.';return''},
    topic(v){return v?'':'Selecciona un asunto.'},
    message(v){v=v.trim();if(!v)return'Escribe tu mensaje.';if(v.length<10)return`El mensaje necesita al menos 10 caracteres (llevas ${v.length}).`;if(v.length>300)return'El mensaje no puede superar los 300 caracteres.';return''},
    accept(v){return v?'':'Debes aceptar las condiciones de contacto.'}
  };
  const val=k=>k==='accept'?F.accept.checked:F[k].value;
  function check(k){
    const msg=rules[k](val(k));$('e'+k).textContent=msg;
    if(k!=='accept'){F[k].classList.toggle('invalid',!!msg);F[k].classList.toggle('valid',!msg&&val(k).trim()!=='');F[k].setAttribute('aria-invalid',!!msg)}
    return !msg;
  }
  const touched=new Set();
  Object.keys(F).forEach(k=>{
    F[k].addEventListener(k==='topic'||k==='accept'?'change':'input',()=>{if(touched.has(k))check(k)}); // valida en vivo después de tocar el campo
    F[k].addEventListener('blur',()=>{touched.add(k);check(k)});
  });
  // El selector de fecha solo permite desde hoy hasta dentro de un año
  const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const hoy=new Date(),limite=new Date();limite.setFullYear(limite.getFullYear()+1);F.date.min=iso(hoy);F.date.max=iso(limite);
  // Contador de caracteres en tiempo real
  F.message.addEventListener('input',()=>{const n=F.message.value.length;$('counter').textContent=n+'/300';$('counter').style.color=n>=280?'#ff8fa8':''});
  form.addEventListener('submit',e=>{
    e.preventDefault();
    Object.keys(F).forEach(k=>touched.add(k));
    const results=Object.keys(F).map(check),ok=results.every(Boolean);
    const res=$('result');res.className=ok?'success':'error';
    if(ok){res.textContent='Los datos son correctos (validado el '+new Date().toLocaleString('es',{dateStyle:'long',timeStyle:'short'})+'). Esta página no tiene un sistema de envío conectado, así que el mensaje no se envió a ningún correo.'}
    else{res.textContent='Revisa los campos marcados antes de continuar.';const bad=Object.keys(F)[results.indexOf(false)];F[bad].focus()}
  });
  $('cclear').onclick=()=>{form.reset();touched.clear();Object.keys(F).forEach(k=>{$('e'+k).textContent='';if(k!=='accept'){F[k].classList.remove('invalid','valid');F[k].removeAttribute('aria-invalid')}});$('counter').textContent='0/300';$('counter').style.color='';$('result').textContent='';$('result').className=''};
})();

/* Discografías */
const catalogArtists=['HUMBE','Duki','Reik','Cristian Castro'];
const catalogCache=new Map();let selectedCatalog='HUMBE',discPage=1;
const tabs=$('artistTabs'),discGrid=$('discGrid'),discPages=$('discPages'),discStatus=$('discStatus');
tabs.innerHTML=catalogArtists.map(a=>`<button class="chip" data-catalog="${a}">${a}</button>`).join('');
function catalogRender(){
  const q=$('artistSongSearch').value.toLocaleLowerCase('es');
  const list=(catalogCache.get(selectedCatalog)||[]).filter(x=>(x.trackName+' '+x.collectionName).toLocaleLowerCase('es').includes(q));
  const max=Math.max(1,Math.ceil(list.length/20));discPage=Math.min(discPage,max);
  discStatus.textContent=`${list.length} canciones encontradas para ${selectedCatalog}`;
  discGrid.innerHTML=list.slice((discPage-1)*20,discPage*20).map(x=>`<article class="song"><div class="cover" data-t="${esc(x.trackName)}" data-a="${esc(x.artistName)}" style="--h:${hue(x.trackName)}"><span class="ini">${esc(ini(x.trackName))}</span>${genImg(x.trackName,x.artistName)}${x.artworkUrl100?`<img loading="lazy" src="${x.artworkUrl100.replace('100x100bb','600x600bb')}" alt="Portada de ${esc(x.trackName)}" onerror="this.remove()">`:''}</div><div class="songbody"><strong>${esc(x.trackName)}</strong><p>${esc(x.artistName)}</p><small>${esc(x.collectionName||'Sencillo')}</small><br><a target="_blank" rel="noopener noreferrer" href="https://music.youtube.com/search?q=${encodeURIComponent(x.trackName+' '+x.artistName)}">Buscar en YouTube Music &#8599;</a></div></article>`).join('')||'<p>No se encontraron canciones.</p>';
  discPages.innerHTML=Array.from({length:max},(_,i)=>`<button class="pagebtn ${discPage===i+1?'active':''}" data-discpage="${i+1}">${i+1}</button>`).join('');
  discPages.querySelectorAll('button').forEach(b=>b.onclick=()=>{discPage=Number(b.dataset.discpage);catalogRender()});
  upgradeCovers('#discGrid'); // portadas de YouTube
}
async function loadCatalog(a){
  selectedCatalog=a;discPage=1;$('artistSongSearch').value='';
  tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.catalog===a));
  if(catalogCache.has(a)){catalogRender();return}
  discStatus.textContent='Buscando canciones y portadas de '+a+'...';discGrid.innerHTML='';discPages.innerHTML='';
  try{
    const response=await fetch('https://itunes.apple.com/search?'+new URLSearchParams({term:a,entity:'song',media:'music',limit:'200'}));
    if(!response.ok)throw Error('HTTP '+response.status);
    const data=await response.json(),na=v=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const found=(data.results||[]).filter(x=>x.kind==='song'&&na(x.artistName||'').split(/[,;&]/).some(p=>p.trim()===na(a)));
    const unique=[...new Map(found.map(x=>[(x.trackName+'|'+x.artistName+'|'+x.collectionName).toLowerCase(),x])).values()].sort((x,y)=>(x.collectionName||'').localeCompare(y.collectionName||'','es')||x.trackNumber-y.trackNumber);
    catalogCache.set(a,unique);if(selectedCatalog===a)catalogRender();
  }catch(err){if(selectedCatalog===a)discStatus.textContent='No se pudo consultar el catálogo. Revisa tu conexión a internet e inténtalo de nuevo.'}
}
tabs.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>loadCatalog(b.dataset.catalog)));
$('artistSongSearch').addEventListener('input',()=>{discPage=1;catalogRender()});
new IntersectionObserver((en,ob)=>{if(en.some(e=>e.isIntersecting)){loadCatalog('HUMBE');ob.disconnect()}},{rootMargin:'250px'}).observe($('discografias'));

/* Videojuegos */
const games=[
{n:'Plants vs. Zombies',cat:'Estrategia',sub:'Defensa de torres',p:['Móvil','PC'],wiki:'Plants_vs._Zombies',desc:'Defiende tu jardín con plantas frente a oleadas de zombis.',favorite:true},
{n:'Plants vs. Zombies 2',cat:'Estrategia',sub:'Defensa de torres',p:['Móvil'],wiki:'Plants_vs._Zombies_2:_It’s_About_Time',desc:'Viaja por distintas épocas y supera nuevos niveles.',favorite:true},
{n:'Clash Royale',cat:'Estrategia',sub:'Cartas y batallas',p:['Móvil'],wiki:'Clash_Royale',desc:'Construye mazos y compite en duelos estratégicos.',favorite:true},
{n:'Clash of Clans',cat:'Estrategia',sub:'Construcción y estrategia',p:['Móvil'],wiki:'Clash_of_Clans',desc:'Construye una aldea, organiza tropas y participa en guerras.'},
{n:'Brawl Stars',cat:'Acción',sub:'Multijugador',p:['Móvil'],wiki:'Brawl_Stars',desc:'Batallas rápidas en equipo con distintos personajes.'},
{n:'Subway Surfers',cat:'Casuales',sub:'Carrera infinita',p:['Móvil'],wiki:'Subway_Surfers',desc:'Esquiva obstáculos y supera tu récord de carrera.'},
{n:'Roblox',cat:'Aventura',sub:'Mundos creativos',p:['Móvil','PC'],wiki:'Roblox',desc:'Explora experiencias creadas por una comunidad global.'},
{n:'Minecraft',cat:'Aventura',sub:'Supervivencia y construcción',p:['Móvil','PC'],wiki:'Minecraft',desc:'Construye, explora y sobrevive en mundos de bloques.'},
{n:'Among Us',cat:'Casuales',sub:'Deducción social',p:['Móvil','PC'],wiki:'Among_Us',desc:'Descubre quién es el impostor entre tus compañeros.'},
{n:'Pokémon GO',cat:'Aventura',sub:'Realidad aumentada',p:['Móvil'],wiki:'Pokémon_Go',desc:'Explora el mundo para encontrar y coleccionar Pokémon.'},
{n:'Call of Duty: Mobile',cat:'Acción',sub:'Disparos',p:['Móvil'],wiki:'Call_of_Duty:_Mobile',desc:'Partidas de acción multijugador desde el celular.'},
{n:'Free Fire',cat:'Acción',sub:'Battle royale',p:['Móvil'],wiki:'Garena_Free_Fire',desc:'Compite por ser la última persona en pie.'},
{n:'Candy Crush Saga',cat:'Casuales',sub:'Rompecabezas',p:['Móvil'],wiki:'Candy_Crush_Saga',desc:'Combina caramelos y resuelve niveles de dificultad creciente.'},
{n:'Stardew Valley',cat:'Simulación',sub:'Granja y vida',p:['Móvil','PC'],wiki:'Stardew_Valley',desc:'Cuida tu granja, cultiva y conoce a los habitantes.'},
{n:'The Sims Mobile',cat:'Simulación',sub:'Vida virtual',p:['Móvil'],wiki:'The_Sims_Mobile',desc:'Crea personajes, diseña hogares y cuenta historias.'},
{n:'Geometry Dash',cat:'Casuales',sub:'Ritmo y plataformas',p:['Móvil','PC'],wiki:'Geometry_Dash',desc:'Supera obstáculos al ritmo de la música.'}
];
let gameCat='Todos';const gameArt=new Map();
const gameCats=['Todos',...new Set(games.map(g=>g.cat))];
$('gameCategories').innerHTML=gameCats.map(c=>`<button type="button" class="chip ${c==='Todos'?'active':''}" data-gcat="${c}">${c}</button>`).join('');
function gameSubOptions(){const sel=$('gameSub'),old=sel.value,subs=[...new Set(games.filter(g=>gameCat==='Todos'||g.cat===gameCat).map(g=>g.sub))].sort();sel.innerHTML='<option value="">Todas las subcategorías</option>'+subs.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');sel.value=subs.includes(old)?old:''}
function renderGames(){
  const q=$('gameSearch').value.trim().toLocaleLowerCase('es'),p=$('gamePlatform').value,sub=$('gameSub').value;
  const items=games.filter(g=>(gameCat==='Todos'||g.cat===gameCat)&&(!p||g.p.includes(p))&&(!sub||g.sub===sub)&&(!q||(g.n+' '+g.cat+' '+g.sub).toLocaleLowerCase('es').includes(q)));
  $('gameCount').textContent=`${items.length} de ${games.length} juegos`;
  $('gameGrid').innerHTML=items.map(g=>{const i=games.indexOf(g),img=gameArt.get(g.n);return `<article class="gamecard"><div class="gameposter" id="gamePoster${i}" style="--h:${hue(g.n)}"><span class="ini">${esc(ini(g.n))}</span>${genImg(g.n,g.cat)}${img?`<img loading="lazy" src="${esc(img)}" alt="Portada de ${esc(g.n)}">`:''}<span class="platform">${g.p.join(' · ')}</span></div><div class="gamecontent"><span class="gamepill">${esc(g.cat)} · ${esc(g.sub)}</span><h3>${esc(g.n)}${g.favorite?' &middot; Favorito':''}</h3><p>${esc(g.desc)}</p><button type="button" class="btn" data-game="${i}">Ver detalles</button></div></article>`}).join('')||'<div class="gameempty">No se encontraron juegos. Prueba otros filtros.</div>';
  $('gameGrid').querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>showGame(Number(b.dataset.game)));
}
function showGame(i){const g=games[i];$('gameDetail').innerHTML=`<span class="gamepill">${esc(g.cat)} / ${esc(g.sub)}</span><h3>${esc(g.n)}</h3><p>${esc(g.desc)}</p><p><strong>Plataformas:</strong> ${esc(g.p.join(', '))}</p><p>${g.favorite?'Uno de mis juegos favoritos.':'Sugerencia para explorar.'}</p><a class="btn primary" target="_blank" rel="noopener noreferrer" href="https://www.google.com/search?q=${encodeURIComponent(g.n+' videojuego oficial')}">Conocer el juego &#8599;</a>`;$('gameDialog').showModal()}
$('gameClose').onclick=()=>$('gameDialog').close();$('gameDialog').onclick=e=>{if(e.target===$('gameDialog'))$('gameDialog').close()};
$('gameCategories').onclick=e=>{const b=e.target.closest('[data-gcat]');if(!b)return;gameCat=b.dataset.gcat;$('gameCategories').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));gameSubOptions();renderGames()};
['gameSearch','gamePlatform','gameSub'].forEach(id=>$(id).addEventListener(id==='gameSearch'?'input':'change',renderGames));
$('gameReset').onclick=()=>{gameCat='Todos';$('gameSearch').value='';$('gamePlatform').value='';$('gameCategories').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.gcat==='Todos'));gameSubOptions();renderGames()};
gameSubOptions();renderGames();

/* Portadas de juegos: App Store (EE. UU. y México) -> Wikipedia (artículo) -> Wikipedia (búsqueda) -> portada generada */
async function fetchGameArt(g){
  let url='';const name=norm(g.n);
  for(const country of ['us','mx']){
    if(url)break;
    const res=await itunes({term:g.n,entity:'software',country,limit:'15'});
    const f=res.find(x=>{const n=norm(x.trackName);return n===name||n.startsWith(name+' ')||name.startsWith(n+' ')})||res.find(x=>norm(x.trackName).includes(name));
    url=f?(f.artworkUrl512||(f.artworkUrl100||'').replace('100x100bb','512x512bb')):'';
  }
  if(!url&&g.wiki)url=await wikiImg({titles:g.wiki});
  if(!url)url=await wikiImg({generator:'search',gsrsearch:g.n+' video game',gsrlimit:'3'});
  if(!url)return; // se queda la portada generada
  gameArt.set(g.n,url);
  const poster=$('gamePoster'+games.indexOf(g));
  if(poster&&!poster.querySelector('img:not(.gen)')){const img=new Image();img.alt='Portada de '+g.n;img.referrerPolicy='no-referrer';img.onload=()=>poster.appendChild(img);img.src=url}
}
new IntersectionObserver((en,ob)=>{if(en.some(x=>x.isIntersecting)){ob.disconnect();games.forEach(fetchGameArt)}},{rootMargin:'350px'}).observe($('juegos'));

/* ===== Doble selección musical: género -> artista ===== */
const GENEROS=[['Romántica','Románticas'],['Pop latino','Pop latino'],['Reguetón','Reguetón'],['Trap latino','Trap latino'],['Urbano romántico','Urbano romántico'],['Remixes','Remixes'],['Sessions','Sessions'],['Regional latino','Regional latino']];
const gSel=$('genreSel'),aSel=$('artistSel');
gSel.innerHTML='<option value="">Todos los géneros</option>'+GENEROS.map(([l,v])=>`<option value="${esc(v)}">${esc(l)}</option>`).join('');
// Artistas que corresponden a cada género (Romántica usa la lista fija; los demás salen de las canciones)
function artistsFor(g){
  if(g==='Románticas')return [...ROMANTICAS];
  const names=canciones.filter(x=>!g||x.sub===g).flatMap(x=>x.a.split(',').map(v=>v.trim()));
  return [...new Set(g?names:[...names,...ROMANTICAS])].sort((a,b)=>a.localeCompare(b,'es'));
}
function syncChips(){document.querySelectorAll('[data-artist]').forEach(b=>b.classList.toggle('selected',b.dataset.artist===$('artist').value))}
// Actualiza la segunda lista y la deja sincronizada con los filtros existentes
function syncDual(){
  gSel.value=genre;
  const list=artistsFor(genre),cur=$('artist').value;
  if(cur&&!list.includes(cur))list.push(cur);
  aSel.innerHTML='<option value="">Todos los artistas</option>'+list.map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('');
  aSel.value=cur;
  $('dualInfo').textContent=genre==='Románticas'?'Las canciones de estos artistas se consultan en iTunes (requiere conexión a internet).':genre?`${list.length} artistas en este género. Al elegir uno se cargan todas sus canciones.`:'Elige un género para ver solo sus artistas.';
}
gSel.onchange=()=>{$('artist').value='';syncChips();chooseGenre(gSel.value,true)};
aSel.onchange=()=>{$('artist').value=aSel.value;syncChips();page=1;render()};
$('artist').addEventListener('change',syncDual);
document.querySelectorAll('[data-artist]').forEach(b=>b.addEventListener('click',syncDual));
// Canciones de los artistas románticos desde iTunes (título, artista, portada, categoría y enlace)
async function loadRemote(a){
  remoteLoading.add(a);remoteErr.delete(a);
  try{
    const r=await fetch('https://itunes.apple.com/search?'+new URLSearchParams({term:a,entity:'song',media:'music',limit:'200'}));
    if(!r.ok)throw new Error('HTTP '+r.status);
    const na=' '+norm(a)+' ',seen=new Set(),out=[];
    for(const x of (await r.json()).results||[]){
      if(x.kind!=='song'||!(' '+norm(x.artistName)+' ').includes(na))continue;
      const key=norm(x.trackName);if(seen.has(key)||canciones.some(c=>hasArtist(c,a)&&norm(c.t)===key))continue;seen.add(key);
      const m=x.trackTimeMillis;
      out.push({t:x.trackName,a:x.artistName,k:a,d:m?Math.floor(m/60000)+':'+String(Math.round(m/1000)%60).padStart(2,'0'):'--:--',sub:subFor(a),cover:x.artworkUrl100?x.artworkUrl100.replace('100x100bb','600x600bb'):'',_id:nextId++});
      if(out.length>=150)break;
    }
    remote.set(a,out);
  }catch(e){remote.set(a,[]);remoteErr.add(a)}
  remoteLoading.delete(a);render();
}
syncDual();

/* ===== Redes sociales =====
   EDITA AQUÍ tus perfiles reales: cambia "usuario" y "url" de cada red.
   Aquí ya están tus perfiles reales. */
const REDES=[
  {nombre:'Instagram',usuario:'@ale_h.p_',url:'https://www.instagram.com/ale_h.p_',icono:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/>'},
  {nombre:'Facebook',usuario:'Mi perfil de Facebook',url:'https://www.facebook.com/share/1E1KnyZcns/',icono:'<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'},
  {nombre:'TikTok',usuario:'@alejandra_peralta2.0',url:'https://www.tiktok.com/@alejandra_peralta2.0',icono:'<path d="M15 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M15 3c.4 2.6 2.2 4.4 5 4.5"/>'}
];
const svgIcon=i=>`<svg viewBox="0 0 24 24" aria-hidden="true">${i}</svg>`;
$('socialGrid').innerHTML=REDES.map(r=>`<a class="social" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(r.nombre)} (se abre en una pestaña nueva)"><span class="ico">${svgIcon(r.icono)}</span><strong>${esc(r.nombre)}</strong><span>${esc(r.usuario)}</span><span class="go" aria-hidden="true">&#8599;</span></a>`).join('');
$('footSocial').innerHTML=REDES.map(r=>`<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(r.nombre)}" title="${esc(r.nombre)}">${svgIcon(r.icono)}</a>`).join('');

/* ===== Proyectos ===== */
// Agrega o edita proyectos aquí. estado: 'terminado' o 'progreso'. tecnologias y enlace son opcionales.
const ICONO_CAJA='<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/>';
const ICONO_WEB='<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>';
const PROYECTOS=[
  {nombre:'Sistema de inventario',estado:'terminado',para:'Mi trabajo',descripcion:'Sistema de inventario que desarrollé para mi trabajo.',tecnologias:[],enlace:'',icono:ICONO_CAJA},
  {nombre:'Sitio web para el emprendimiento de mi prima',estado:'progreso',para:'El emprendimiento de mi prima',descripcion:'Sitio web que estoy desarrollando para el emprendimiento de mi prima.',tecnologias:[],enlace:'',icono:ICONO_WEB}
];
(()=>{
  const grupos=[['terminado','Proyectos terminados','Terminado'],['progreso','En progreso','En progreso']];
  $('projects').innerHTML=grupos.map(([est,titulo,etiqueta])=>{
    const lista=PROYECTOS.filter(p=>p.estado===est);if(!lista.length)return'';
    return `<div class="projgroup"><h3 class="projlabel">${titulo}</h3><div class="projgrid">${lista.map(p=>`<article class="panel proj"><span class="pico"><svg viewBox="0 0 24 24" aria-hidden="true">${p.icono}</svg></span><span class="status ${est==='terminado'?'done':'wip'}">${etiqueta}</span><h3>${esc(p.nombre)}</h3><p>${esc(p.descripcion)}</p><span class="pmeta">Hecho para: <b>${esc(p.para)}</b></span>${p.tecnologias.length?`<div class="ptags">${p.tecnologias.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`:''}${p.enlace?`<a class="btn" href="${esc(p.enlace)}" target="_blank" rel="noopener noreferrer">Ver proyecto</a>`:''}</article>`).join('')}</div></div>`;
  }).join('');
})();

/* ===== Horario desde Google Sheets =====
   Pega aquí el enlace de tu hoja (normal, o el de "Publicar en la web" en CSV).
   La hoja debe estar compartida como "Cualquier persona con el enlace" o publicada en la web. */
const HORARIO_SHEET_URL='';
const HORARIO_HOJA='';  // nombre de la pestaña (opcional; si queda vacío se usa la primera)
// Horario de respaldo: se muestra mientras no haya hoja conectada o si falla la lectura
const HORARIO_RESPALDO=[['Día','Universidad','Trabajo','Observaciones'],['Lunes','08:30 - 11:45','14:00 - 21:00','Universidad y trabajo'],['Martes','08:30 - 11:45','14:00 - 21:00','Universidad y trabajo'],['Miércoles','08:30 - 11:45','14:00 - 21:00','Universidad y trabajo'],['Jueves','08:30 - 11:45','14:00 - 21:00','Universidad y trabajo'],['Viernes','08:30 - 11:45','14:00 - 21:00','Universidad y trabajo'],['Sábado','—','11:00 - 22:00','Jornada de trabajo'],['Domingo','—','11:00 - 22:00','Jornada de trabajo']];
function sheetCsvUrl(u){
  u=(u||'').trim();if(!u)return'';
  if(/output=csv|tqx=out:csv/.test(u))return u;
  const gid=/[#&?]gid=(\d+)/.exec(u);
  if(/\/d\/e\//.test(u))return u.replace(/\/pub(html)?.*$/,'/pub')+'?output=csv'+(gid?'&gid='+gid[1]:'');
  const m=/\/d\/([\w-]+)/.exec(u);if(!m)return u;
  return `https://docs.google.com/spreadsheets/d/${m[1]}/gviz/tq?tqx=out:csv`+(HORARIO_HOJA?'&sheet='+encodeURIComponent(HORARIO_HOJA):gid?'&gid='+gid[1]:'');
}
// Lector de CSV (respeta comillas y saltos de línea dentro de una celda)
function parseCSV(t){
  const rows=[];let row=[],c='',q=false;
  for(let i=0;i<t.length;i++){const ch=t[i];
    if(q){if(ch==='"'){if(t[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}
    else if(ch==='"')q=true;
    else if(ch===','){row.push(c);c=''}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&t[i+1]==='\n')i++;row.push(c);rows.push(row);row=[];c=''}
    else c+=ch}
  if(c!==''||row.length){row.push(c);rows.push(row)}
  return rows.filter(r=>r.some(x=>x.trim()));
}
function drawSchedule(rows){
  const head=rows[0],body=rows.slice(1);
  const dias=['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
  const hoy=dias[new Date().getDay()];
  const cls=t=>{const n=norm(t);return !n||/^[—–-]+$/.test(n)?'free':/trabaj/.test(n)?'work':/univ|clase|estud|curso|tarea/.test(n)?'uni':/libre|descanso/.test(n)?'free':'other'};
  if(/^d[ií]a$/i.test((head[0]||'').trim())){ // días en filas (Día | Universidad | Trabajo | Observaciones)
    const colcls=['','uni','work','obs'];
    $('schedule').innerHTML='<thead><tr>'+head.map(h=>`<th scope="col">${esc(h)}</th>`).join('')+'</tr></thead><tbody>'+body.map(r=>{
      const isToday=norm(r[0]||'').startsWith(hoy);
      return `<tr class="${isToday?'todayrow':''}">`+head.map((_,i)=>{
        const v=(r[i]||'').trim();
        if(i===0)return `<th scope="row">${esc(v)}${isToday?' <span class="hoybadge">Hoy</span>':''}</th>`;
        const free=/^[—–-]+$/.test(v)||!v;
        return `<td class="${free?'free':(colcls[i]||'')}">${esc(v||'—')}</td>`}).join('')+'</tr>'}).join('')+'</tbody>';
    return;
  }
  const ti=head.findIndex((h,i)=>i>0&&norm(h).startsWith(hoy)); // columna del día de hoy
  $('schedule').innerHTML='<thead><tr>'+head.map((h,i)=>`<th scope="col" class="${i===ti?'today':''}">${esc(h)}</th>`).join('')+'</tr></thead><tbody>'+body.map(r=>'<tr>'+head.map((_,i)=>i===0?`<th scope="row">${esc(r[0]||'')}</th>`:`<td class="${cls(r[i]||'')}${i===ti?' today':''}">${esc(r[i]||'')}</td>`).join('')+'</tr>').join('')+'</tbody>';
}
async function loadHorario(){
  const url=sheetCsvUrl(HORARIO_SHEET_URL),st=$('schedStatus');
  if(!url){drawSchedule(HORARIO_RESPALDO);st.textContent='Mi semana de universidad y trabajo.';$('schedRefresh').hidden=true;return}
  st.textContent='Leyendo Google Sheets...';
  try{
    const r=await fetch(url+(url.includes('?')?'&':'?')+'_='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const text=await r.text();
    if(/^\s*<(!doctype|html)/i.test(text))throw new Error('La hoja no es pública');
    const rows=parseCSV(text);if(rows.length<2)throw new Error('Hoja vacía');
    drawSchedule(rows);
    try{localStorage.setItem('alejandra-horario',text)}catch(e){}
    st.textContent='Conectado a Google Sheets · actualizado a las '+new Date().toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'});
  }catch(e){
    let saved='';try{saved=localStorage.getItem('alejandra-horario')||''}catch(e2){}
    if(saved){drawSchedule(parseCSV(saved));st.textContent='Mostrando mi último horario guardado.'}
    else{drawSchedule(HORARIO_RESPALDO);st.textContent='Mi semana de universidad y trabajo.'}
  }
}
$('schedRefresh').onclick=loadHorario;
loadHorario();setInterval(()=>{if(!document.hidden)loadHorario()},300000); // se actualiza sola cada 5 minutos

/* ===== Explorar como en YouTube Music: 50 filtros ===== */
// [nombre, [términos de búsqueda en iTunes]]. Cada filtro junta los resultados de sus términos.
const EXPLORAR=[
 {g:'Géneros',items:[['Pop',['pop hits','top pop']],['Pop latino',['pop latino','latin pop hits']],['Reguetón',['reggaeton','reguetón éxitos']],['Trap latino',['trap latino','trap argentino']],['Hip-hop',['hip hop','rap hits']],['R&B',['r&b','soul']],['Rock',['rock classics','rock hits']],['Rock en español',['rock en español','rock latino']],['Indie',['indie pop','indie rock']],['Electrónica',['electronic dance','edm']],['Salsa',['salsa','salsa clásica']],['Bachata',['bachata','bachata romántica']],['Cumbia',['cumbia','cumbia sonidera']],['Merengue',['merengue','merengue clásico']],['Vallenato',['vallenato','vallenato romántico']],['Baladas',['baladas románticas','baladas pop']],['Regional mexicano',['regional mexicano','banda norteño']],['Corridos tumbados',['corridos tumbados','corridos bélicos']],['Reggae',['reggae','dancehall']],['Jazz',['jazz','smooth jazz']]]},
 {g:'Estados de ánimo',items:[['Romántica',['canciones románticas','love songs']],['Fiesta',['fiesta latina','party hits']],['Entrenar',['workout','gym motivation']],['Relax',['chill','relax']],['Triste',['canciones tristes','sad songs']],['Feliz',['happy','feel good']],['Concentración',['lofi','focus study']],['Dormir',['sleep','calm piano']],['Viaje',['road trip','canciones para viajar']],['Nostalgia',['nostalgia latina','recuerdos']],['Motivación',['motivación','superación']],['Perreo',['perreo','perreo intenso']],['Desamor',['desamor','canciones de despecho']],['Para cantar',['karaoke','para cantar']]]},
 {g:'Décadas',items:[['Años 80',['éxitos 80s','80s hits']],['Años 90',['éxitos 90s','90s hits']],['Años 2000',['éxitos 2000s','2000s hits']],['Años 2010',['éxitos 2010s','2010s hits']],['Años 2020',['éxitos 2020','2020s hits']],['Éxitos actuales',['top hits 2026','éxitos del momento']]]},
 {g:'Regiones e idiomas',items:[['Colombia',['música colombiana','artistas colombianos']],['México',['música mexicana','éxitos mexicanos']],['Argentina',['música argentina','rock argentino']],['España',['música española','pop español']],['Puerto Rico',['música puertorriqueña','boricua']],['Chile',['música chilena','pop chileno']],['Perú',['música peruana','cumbia peruana']],['Venezuela',['música venezolana','éxitos venezolanos']],['K-pop',['k-pop','korean pop']],['Inglés',['english hits','billboard hot 100']]]}
];
$('exGroups').innerHTML=EXPLORAR.map(g=>`<div><h4>${esc(g.g)}</h4><div class="filters">${g.items.map(([l])=>`<button type="button" class="chip" data-ex="${esc(l)}">${esc(l)}</button>`).join('')}</div></div>`).join('');
function syncExplore(){document.querySelectorAll('[data-ex]').forEach(b=>b.classList.toggle('active',b.dataset.ex===exploreKey));$('exBadge').hidden=!exploreKey;$('exName').textContent=exploreKey?'Explorando: '+exploreKey:''}
$('exGroups').addEventListener('click',e=>{
  const b=e.target.closest('[data-ex]');if(!b)return;
  exploreKey=exploreKey===b.dataset.ex?'':b.dataset.ex;
  genre='';$('sub').value='';document.querySelectorAll('.chip[data-genre]').forEach(c=>c.classList.toggle('active',c.dataset.genre===''));
  page=1;syncExplore();syncDual();render();
  if(exploreKey)document.querySelector('.musiclayout').scrollIntoView({behavior:'smooth'});
});
$('exClear').onclick=()=>{exploreKey='';page=1;syncExplore();render()};
// Trae las canciones de un filtro (varias búsquedas, mezcladas para dar variedad)
async function loadExplore(key){
  exploreLoading.add(key);
  const terms=EXPLORAR.flatMap(g=>g.items).find(i=>i[0]===key)[1],out=[],seen=new Set();
  const rs=await Promise.all(terms.map(t=>fetch('https://itunes.apple.com/search?'+new URLSearchParams({term:t,entity:'song',media:'music',limit:'200'})).then(r=>r.ok?r.json():{results:[]}).catch(()=>({results:[]}))));
  const lists=rs.map(j=>(j.results||[]).filter(x=>x.kind==='song'));
  for(let i=0;i<200;i++)for(const l of lists){
    const x=l[i];if(!x)continue;
    const k=norm(x.trackName+' '+x.artistName);if(seen.has(k))continue;seen.add(k);
    const m=x.trackTimeMillis;
    out.push({t:x.trackName,a:x.artistName,d:m?Math.floor(m/60000)+':'+String(Math.round(m/1000)%60).padStart(2,'0'):'--:--',sub:key,cover:x.artworkUrl100?x.artworkUrl100.replace('100x100bb','600x600bb'):'',_id:nextId++});
  }
  exploreData.set(key,out);exploreLoading.delete(key);render();
}

/* ===== Animaciones y efectos ===== */
(()=>{
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
/* Barra de progreso y volver arriba */
const prog=$('progress'),top=$('totop');
const onScroll=()=>{const h=document.documentElement,max=h.scrollHeight-h.clientHeight;prog.style.width=(max>0?h.scrollTop/max*100:0)+'%';top.classList.toggle('show',h.scrollTop>600)};
addEventListener('scroll',onScroll,{passive:true});onScroll();
top.onclick=()=>scrollTo({top:0,behavior:'smooth'});
/* Luz que sigue al cursor */
const glow=$('glow');
addEventListener('mousemove',e=>{glow.style.opacity=1;glow.style.transform=`translate(${e.clientX}px,${e.clientY}px)`},{passive:true});
document.addEventListener('mouseleave',()=>glow.style.opacity=0);
/* Aparición al hacer scroll */
const targets=[['.sectionhead',''],['.about>.panel','left'],['.gamehero',''],['.musiclayout>.sidebar','left'],['.musiclayout>.songs','right'],['.gamefilters',''],['#galeria .panel',''],['.socialgrid',''],['.projgroup',''],['.schedpanel',''],['.explore',''],['.formwrap',''],['#discografias .panel',''],['.footer','']];
const io=new IntersectionObserver(en=>en.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
targets.forEach(([sel,dir])=>document.querySelectorAll(sel).forEach((el,i)=>{el.classList.add('reveal');if(dir&&i%2)el.classList.add(dir==='left'?'right':'left');else if(dir)el.classList.add(dir);io.observe(el)}));
const quoteEl=document.querySelector('#frase h2');if(quoteEl){quoteEl.classList.add('reveal');io.observe(quoteEl)}
const panelGames=document.querySelector('#juegos>.panel');if(panelGames){panelGames.classList.add('reveal');io.observe(panelGames)}
/* Contadores animados */
const cio=new IntersectionObserver(en=>en.forEach(e=>{if(!e.isIntersecting)return;cio.unobserve(e.target);const end=+e.target.dataset.count,t0=performance.now(),dur=1800;const step=t=>{const k=Math.min(1,(t-t0)/dur),v=1-Math.pow(1-k,3);e.target.textContent=Math.round(end*v);if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}),{threshold:.6});
document.querySelectorAll('[data-count]').forEach(b=>cio.observe(b));
/* Texto que se escribe solo */
const roles=['estudiante de Ingeniería de Sistemas','amante de la música','gamer de corazón','jugadora de voleibol','creadora de proyectos'];
const tEl=$('typed');let ri=0,ci=0,del=false;
(function type(){const w=roles[ri];tEl.textContent=w.slice(0,ci);if(!del&&ci<w.length){ci++;setTimeout(type,70)}else if(!del){del=true;setTimeout(type,1500)}else if(ci>0){ci--;setTimeout(type,35)}else{del=false;ri=(ri+1)%roles.length;setTimeout(type,300)}})();
/* Inclinación 3D en tarjetas */
if(matchMedia('(hover:hover)').matches&&!reduce){
  const sel='.song,.gamecard,.info,.cat';
  document.addEventListener('mousemove',e=>{const c=e.target.closest&&e.target.closest(sel);if(!c)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(800px) rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-6px) scale(1.02)`});
  document.addEventListener('mouseout',e=>{const c=e.target.closest&&e.target.closest(sel);if(c&&!c.contains(e.relatedTarget))c.style.transform=''});
}
/* Partículas conectadas de fondo */
if(!reduce){
  const cv=$('bg'),ctx=cv.getContext('2d');let W,H,pts=[],mx=-999,my=-999;
  const size=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight;const n=Math.min(45,Math.floor(W*H/32000));pts=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5,r:Math.random()*2+.8}))};
  size();addEventListener('resize',size);addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
  (function draw(){
    ctx.clearRect(0,0,W,H);const light=document.body.classList.contains('light'),col=light?'10,130,116':'45,212,182',a=light?.5:1;
    for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy);if(d<130){p.x+=dx/d*1.6;p.y+=dy/d*1.6}
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fillStyle=`rgba(${col},${.7*a})`;ctx.fill()}
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);if(d<120){ctx.strokeStyle=`rgba(${col},${(1-d/120)*.35*a})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke()}}
    requestAnimationFrame(draw)})();
}
})();