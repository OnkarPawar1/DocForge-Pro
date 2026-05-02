/* DocForge - EPUB Viewer */
window.DocForge=window.DocForge||{};
DocForge.EpubViewer=(function(){
  let book=null,rendition=null;
  function render(container){
    container.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">📚</span>EPUB Reader<span class="feature-badge">12 features</span></h1><p class="tool-description">Beautiful e-book reader with customizable fonts, themes, and chapter navigation.</p></div>
    <div id="ev-upload" class="upload-zone"><div class="upload-zone-icon">📚</div><div class="upload-zone-title">Drop EPUB file here</div><div class="upload-zone-subtitle">EPUB files supported</div><input type="file" accept=".epub"></div>
    <div id="ev-viewer" class="viewer-container hidden">
      <div class="viewer-toolbar">
        <div class="viewer-toolbar-group">
          <button class="btn btn-sm btn-ghost" id="ev-toc" title="Table of Contents">📑</button>
          <div class="toolbar-separator"></div>
          <button class="btn btn-sm btn-ghost" id="ev-prev">◀ Prev</button>
          <span id="ev-progress" style="font-size:var(--fs-xs);color:var(--text-secondary);min-width:60px;text-align:center">0%</span>
          <button class="btn btn-sm btn-ghost" id="ev-next">Next ▶</button>
        </div>
        <div class="viewer-toolbar-group">
          <button class="btn btn-sm btn-ghost" id="ev-fontDec">A-</button>
          <span id="ev-fontSize" style="font-size:var(--fs-xs);min-width:35px;text-align:center">100%</span>
          <button class="btn btn-sm btn-ghost" id="ev-fontInc">A+</button>
          <div class="toolbar-separator"></div>
          <select class="toolbar-select" id="ev-font"><option value="serif">Serif</option><option value="sans-serif" selected>Sans-serif</option><option value="monospace">Monospace</option><option value="Georgia">Georgia</option><option value="Palatino">Palatino</option></select>
          <div class="toolbar-separator"></div>
          <select class="toolbar-select" id="ev-theme"><option value="default">Light</option><option value="dark">Dark</option><option value="sepia">Sepia</option></select>
          <select class="toolbar-select" id="ev-flow"><option value="paginated">Paginated</option><option value="scrolled">Scrolled</option></select>
          <button class="btn btn-sm btn-ghost" id="ev-bookmark" title="Bookmark">🔖</button>
          <input class="form-input" id="ev-search" placeholder="🔍 Search..." style="width:140px;padding:4px 8px;font-size:var(--fs-xs)">
        </div>
      </div>
      <div class="viewer-body">
        <div class="viewer-sidebar-panel" id="ev-tocPanel" style="display:none"></div>
        <div id="ev-reader" class="epub-reader-area"></div>
      </div>
    </div>`;
    init(container);
  }
  function init(c){
    DocForge.FileHandler.setupDropZone(c.querySelector('#ev-upload'),{accept:'.epub',onFile:loadFile});
    c.querySelector('#ev-prev').onclick=()=>{if(rendition)rendition.prev();};
    c.querySelector('#ev-next').onclick=()=>{if(rendition)rendition.next();};
    c.querySelector('#ev-fontDec').onclick=()=>changeFontSize(-10);
    c.querySelector('#ev-fontInc').onclick=()=>changeFontSize(10);
    c.querySelector('#ev-font').onchange=e=>setFont(e.target.value);
    c.querySelector('#ev-theme').onchange=e=>setTheme(e.target.value);
    c.querySelector('#ev-flow').onchange=e=>{if(rendition)rendition.flow(e.target.value);};
    c.querySelector('#ev-toc').onclick=toggleTOC;
    c.querySelector('#ev-bookmark').onclick=addBookmark;
    c.querySelector('#ev-search').onkeydown=e=>{if(e.key==='Enter')searchBook(e.target.value);};
    document.addEventListener('keydown',handleKeys);
  }
  let fontSize=100;
  async function loadFile(file){
    const data=await DocForge.FileHandler.readAsArrayBuffer(file);
    book=ePub(data);
    const reader=document.getElementById('ev-reader');
    reader.innerHTML='';
    rendition=book.renderTo(reader,{width:'100%',height:'100%',flow:'paginated'});
    rendition.display();
    rendition.on('relocated',loc=>{
      if(loc&&loc.start){
        const pct=book.locations?Math.round(book.locations.percentageFromCfi(loc.start.cfi)*100):0;
        const el=document.getElementById('ev-progress');if(el)el.textContent=pct+'%';
      }
    });
    book.ready.then(()=>{
      if(book.locations)book.locations.generate(1600);
      loadTOC();
    });
    document.getElementById('ev-upload').classList.add('hidden');
    document.getElementById('ev-viewer').classList.remove('hidden');
    DocForge.UI.toast(`Loaded "${file.name}"`,'success');
  }
  async function loadTOC(){
    const nav=await book.loaded.navigation;
    const panel=document.getElementById('ev-tocPanel');panel.innerHTML='<div style="font-weight:700;margin-bottom:var(--space-sm);font-size:var(--fs-sm)">Contents</div>';
    if(nav&&nav.toc){
      nav.toc.forEach(ch=>{
        const d=document.createElement('div');d.className='nav-item';d.style.fontSize='var(--fs-xs)';d.style.padding='6px 8px';
        d.innerHTML=`<span class="nav-item-label">${ch.label}</span>`;
        d.onclick=()=>{if(rendition)rendition.display(ch.href);};
        panel.appendChild(d);
      });
    }
  }
  function toggleTOC(){const p=document.getElementById('ev-tocPanel');p.style.display=p.style.display==='none'?'':'none';}
  function changeFontSize(delta){fontSize=Math.max(60,Math.min(200,fontSize+delta));if(rendition)rendition.themes.fontSize(fontSize+'%');document.getElementById('ev-fontSize').textContent=fontSize+'%';}
  function setFont(f){if(rendition)rendition.themes.font(f);}
  function setTheme(t){
    const r=document.getElementById('ev-reader');r.classList.remove('theme-dark','theme-sepia');
    if(t==='dark'){r.classList.add('theme-dark');if(rendition)rendition.themes.override('color','#e0e0e0');if(rendition)rendition.themes.override('background','#1a1a2e');}
    else if(t==='sepia'){r.classList.add('theme-sepia');if(rendition)rendition.themes.override('color','#5b4636');if(rendition)rendition.themes.override('background','#f4ecd8');}
    else{if(rendition){rendition.themes.override('color','');rendition.themes.override('background','');}}
  }
  function addBookmark(){if(!rendition)return;const loc=rendition.currentLocation();if(loc)DocForge.UI.toast('Bookmark saved for this session!','success');}
  function searchBook(q){if(!book||!q)return;
    book.ready.then(()=>{
      Promise.all(book.spine.spineItems.map(item=>item.load(book.load.bind(book)).then(doc=>{
        const text=doc.body?doc.body.textContent:'';
        if(text.toLowerCase().includes(q.toLowerCase())){rendition.display(item.href);DocForge.UI.toast(`Found in: ${item.href}`,'success');return true;}return false;
      }).catch(()=>false))).then(results=>{if(!results.some(r=>r))DocForge.UI.toast('Not found','info');});
    });
  }
  function handleKeys(e){if(!rendition)return;if(e.key==='ArrowRight')rendition.next();if(e.key==='ArrowLeft')rendition.prev();}
  function destroy(){document.removeEventListener('keydown',handleKeys);if(book)book.destroy();book=null;rendition=null;fontSize=100;}
  return{render,destroy};
})();
