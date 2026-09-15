'use strict';
const subjects={
  chemie:{name:'Chemie',tag:'Malé částice. Velké souvislosti.',description:'Látky, reakce a svět, který není vidět.',image:'assets/chemie.png',accent:'#5ae4cd',number:'01'},
  fyzika:{name:'Fyzika',tag:'Velké otázky. Fyzikální odpovědi.',description:'Pohyb, energie a pravidla vesmíru.',image:'assets/fyzika.png',accent:'#b99cff',number:'02'}
};
const sections={
  obrazky:{name:'Obrázky',description:'Prohlédni si vědu zblízka.',lead:'Fotografie, schémata a PDF. Klikni a prozkoumej detail.',empty:'Zatím tu nejsou žádné obrázky.',hint:'Až přibudou první fotografie nebo PDF, najdeš je právě tady.'},
  testy:{name:'Testy',description:'Zjisti, co už máš v hlavě.',lead:'Testy a pracovní listy na jednom místě.',empty:'První testy teprve přijdou.',hint:'Tady najdeš materiály k procvičování, jakmile budou připravené.'},
  ucivo:{name:'Učivo',description:'Dej si souvislosti dohromady.',lead:'Přehledy a materiály, ke kterým se můžeš vracet.',empty:'Učivo se připravuje.',hint:'Jakmile přibudou studijní materiály, zobrazí se tady.'}
};
const practice={...sections.testy,name:'Procvičování',description:'Ověř si, co už umíš.',lead:'Úlohy a pracovní listy k procvičování.',icon:'testy'};
const pages={
 'chemie':{name:'Chemie',children:['chemie/ucivo','chemie/procvicovani']},
 'chemie/ucivo':{...sections.ucivo,icon:'ucivo',children:['chemie/ucivo/obrazky']},
 'chemie/ucivo/obrazky':{...sections.obrazky,icon:'obrazky',folder:'chemie/ucivo/obrázky'},
 'chemie/procvicovani':{...practice,folder:'chemie/procvicovani'},
 'fyzika':{name:'Fyzika',children:['fyzika/obrazky','fyzika/testy','fyzika/ucivo']},
 'fyzika/obrazky':{...sections.obrazky,icon:'obrazky',folder:'fyzika/obrazky'},
 'fyzika/testy':{...sections.testy,icon:'testy',folder:'fyzika/testy'},
 'fyzika/ucivo':{...sections.ucivo,icon:'ucivo',folder:'fyzika/ucivo'}
};
const icons={
  obrazky:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m4 17 5-5 4 4 3-3 5 5"/>',
  testy:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10l2 2 4-4M9 17h6"/>',
  ucivo:'<path d="M12 5v16M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2z"/>'
};
const view=document.getElementById('view'),breadcrumbs=document.getElementById('breadcrumbs'),viewer=document.getElementById('viewer');
const viewerImage=document.getElementById('viewer-image'),viewerPDF=document.getElementById('viewer-pdf'),original=document.getElementById('open-original');
let route='',generation=0,signature=null,busy=false;
function node(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function icon(key){const el=node('span','section-icon');el.setAttribute('aria-hidden','true');el.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+icons[key]+'</svg>';return el;}
function link(label,hash){const a=node('a','',label);a.href=hash;return a;}
function emptyState(key,title,hint){const box=node('div','empty-state');box.append(icon(key),node('h2','',title),node('p','',hint));return box;}
function renderHome(){
  const intro=node('div','hero-heading home-heading');intro.append(node('p','eyebrow','Poznej, jak funguje svět'));
  const title=node('h1');title.append(document.createTextNode('Dva předměty. '),node('br'),node('em','','Nekonečno objevů.'));
  intro.append(title,node('p','lead','Vyber si svůj směr. Materiály k učení i procvičování máš na jednom místě.'));
  const grid=node('div','subject-grid');
  for(const [key,subject] of Object.entries(subjects)){
    const card=link('',`#${key}`);card.className='subject-card'+(key==='fyzika'?' physics':'');
    const img=node('img');img.src=subject.image;img.alt='';img.width=1536;img.height=1024;img.fetchPriority='high';
    const copy=node('div','subject-copy'),text=node('div');text.append(node('h2','',subject.name),node('p','',subject.description));
    const arrow=node('span','round-arrow','↗');arrow.setAttribute('aria-hidden','true');copy.append(text,arrow);
    card.append(img,node('span','subject-number',subject.number+' / '+subject.name.toUpperCase()),copy);grid.append(card);
  }
  const note=node('p','bottom-note');note.append(node('span','','↳'),node('span','','Od prvního „proč?“ k vlastnímu „aha!“'));
  view.append(intro,grid,note);
}
function renderCards(key){
 const grid=node('div','section-grid');
 grid.classList.toggle('two-columns',pages[key].children.length===2);
 for(const child of pages[key].children){
  const info=pages[child],card=link('','#'+child);card.className='section-card';
  const heading=node('h2','',info.name),arrow=node('span','','↗');arrow.setAttribute('aria-hidden','true');heading.append(arrow);
  card.append(icon(info.icon),heading,node('p','',info.description));grid.append(card);
 }
 return grid;
}
function renderSubject(key){
 const subject=subjects[key],hero=node('div','subject-hero'),text=node('div','text');
 text.append(node('p','eyebrow',subject.tag),node('h1','',subject.name),node('p','lead','Co dnes prozkoumáš?'));
 const image=node('img');image.src=subject.image;image.alt='';image.width=1536;image.height=1024;
 hero.append(text,image);view.append(hero,renderCards(key));
}
function renderLearning(){
 const heading=node('div','hero-heading');heading.append(node('p','eyebrow','Chemie'),node('h1','','Učivo'),node('p','lead','Vyber si, co chceš prozkoumat.'));
 view.append(heading,renderCards('chemie/ucivo'));
}
function renderFiles(subject,info){
 const heading=node('div','page-heading'),text=node('div');
 text.append(node('p','eyebrow',subjects[subject].name),node('h1','',info.name),node('p','lead',info.lead));
 const count=node('span','count');count.id='file-count';heading.append(text,count);
 const grid=node('div','media-grid');grid.id='files';const status=node('div');status.id='status';status.setAttribute('role','status');status.append(node('p','notice','Načítání…'));
 view.append(heading,grid,status);loadFiles();
}
function openFile(file,url,trigger){
  const office=/\.docx?$/i.test(file.path),pdf=/\.pdf$/i.test(file.path),name=file.path.split('/').pop().replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ');
  if(office){window.open(url,'_blank','noopener');return;}
  document.getElementById('viewer-title').textContent=name;
  viewerImage.hidden=pdf;viewerPDF.hidden=!pdf;original.href=url;
  if(pdf)viewerPDF.src=url;else{viewerImage.src=url;viewerImage.alt=name;}
  viewer.returnFocus=trigger;viewer.showModal();
}
function fileCard(file){
  const name=file.path.split('/').pop(),title=name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' '),pdf=/\.pdf$/i.test(name),office=/\.docx?$/i.test(name);
  const url=file.path.split('/').map(encodeURIComponent).join('/')+(file.version?'?v='+encodeURIComponent(file.version):'');
  const card=node('button','media-card');card.type='button';card.setAttribute('aria-label',title+(pdf?' – otevřít PDF':office?' – otevřít dokument Word':' – zvětšit obrázek'));
  const preview=node('div','media-preview');
  if(pdf){const frame=node('iframe');frame.src=url+'#page=1&toolbar=0&navpanes=0';frame.title='Náhled PDF: '+title;frame.loading='lazy';frame.tabIndex=-1;frame.setAttribute('aria-hidden','true');preview.append(frame);}
  else if(office){const documentIcon=node('span','document-preview','W');documentIcon.setAttribute('aria-hidden','true');preview.append(documentIcon);}
  else{const image=node('img');image.src=url;image.alt='';image.loading='lazy';image.addEventListener('error',()=>{image.alt='Náhled není dostupný';});preview.append(image);}
  preview.append(node('span','file-tag',pdf?'PDF':name.split('.').pop().toUpperCase()));
  const caption=node('span','media-caption');caption.append(node('span','',title),node('span','arrow','↗'));
  card.append(preview,caption);card.addEventListener('click',()=>openFile(file,url,card));return card;
}
async function loadFiles(){
  const info=pages[route];if(!info?.folder||busy||viewer.open)return;
  const section=info.icon;
  const currentGeneration=generation,status=document.getElementById('status');
  if(location.protocol==='file:'){
    status.replaceChildren(emptyState(section,'Otevři místní spouštěč.','Pro automatické čtení složek otevři SPUSTIT-MAC.command nebo SPUSTIT-WINDOWS.bat z rozbaleného webu. Na GitHub Pages se soubory načtou samy.'));return;
  }
  busy=true;
  try{
    let data;
    if(location.hostname.endsWith('.github.io')){
      const owner=location.hostname.slice(0,-'.github.io'.length),parts=location.pathname.split('/').filter(Boolean),repo=parts[0]||owner+'.github.io';
      const folder=info.folder.split('/').map(encodeURIComponent).join('/');
      const response=await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${folder}`,{cache:'no-store'});
      if(!response.ok)throw Error('GitHub folder unavailable');
      const entries=await response.json();if(!Array.isArray(entries))throw Error('Invalid GitHub folder');
      data=entries.filter(item=>item.type==='file').map(item=>({path:item.path,version:item.sha}));
    }else{
      const response=await fetch('galerie.json',{cache:'no-store'});if(!response.ok)throw Error('Manifest unavailable');
      data=await response.json();if(!Array.isArray(data))throw Error('Invalid manifest');
    }
    if(currentGeneration!==generation)return;
    const valid=/^[^/\\]+\.(jpe?g|png|webp|gif|avif|pdf|docx?)$/i;
    const files=data.map(item=>typeof item==='string'?{path:item}:item).filter(item=>item&&typeof item.path==='string'&&item.path.startsWith(info.folder+'/')&&valid.test(item.path.slice(info.folder.length+1))).sort((a,b)=>a.path.localeCompare(b.path,'cs',{numeric:true}));
    const next=JSON.stringify(files);
    if(next!==signature){const fragment=document.createDocumentFragment();files.forEach(file=>fragment.append(fileCard(file)));document.getElementById('files').replaceChildren(fragment);signature=next;}
    document.getElementById('file-count').textContent=files.length+' '+(files.length===1?'soubor':files.length>1&&files.length<5?'soubory':'souborů');
    status.replaceChildren(...(files.length?[]:[emptyState(section,info.empty,info.hint)]));
  }catch{
    if(currentGeneration===generation)status.replaceChildren(emptyState(section,'Materiály se nepodařilo načíst.','Zkus stránku obnovit za chvíli.'));
  }finally{busy=false;if(currentGeneration!==generation)loadFiles();}
}
function navigate(focus=false){
 const candidate=location.hash.slice(1),aliases={'chemie/obrazky':'chemie/ucivo/obrazky','chemie/testy':'chemie/procvicovani'};
 route=aliases[candidate]||candidate;if(!pages[route])route='';
 generation++;signature=null;view.replaceChildren();breadcrumbs.replaceChildren();breadcrumbs.hidden=!route;
 if(viewer.open)viewer.close();const subject=route.split('/')[0],info=pages[route];
 document.documentElement.style.setProperty('--accent',subject?subjects[subject].accent:'#5ae4cd');
 document.querySelectorAll('[data-subject]').forEach(a=>{if(a.dataset.subject===subject)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 if(route){
  breadcrumbs.append(link('Rozcestník','#'));
  const parts=route.split('/');
  parts.forEach((_,index)=>{const key=parts.slice(0,index+1).join('/');breadcrumbs.append(node('span','sep','/'));if(index===parts.length-1){const current=node('span','',pages[key].name);current.setAttribute('aria-current','page');breadcrumbs.append(current);}else breadcrumbs.append(link(pages[key].name,'#'+key));});
 }
 if(!route)renderHome();else if(route===subject)renderSubject(subject);else if(info.children)renderLearning();else renderFiles(subject,info);
 document.title=(route&&route!==subject?info.name+' • ':'')+(subject?subjects[subject].name:'Chemie & fyzika')+' | LAB';
 if(focus){const heading=view.querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});window.scrollTo(0,0);}
}
document.getElementById('close-viewer').addEventListener('click',()=>viewer.close());
viewer.addEventListener('close',()=>{viewerPDF.removeAttribute('src');viewerImage.removeAttribute('src');if(viewer.returnFocus?.isConnected)viewer.returnFocus.focus();});
viewer.addEventListener('click',event=>{if(event.target===viewer){const r=viewer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)viewer.close();}});
document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault();document.getElementById('content').focus();});
window.addEventListener('hashchange',()=>navigate(true));
navigate();setInterval(()=>{if(!document.hidden)loadFiles();},5000);
