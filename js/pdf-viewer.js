/* DocForge - PDF Viewer */
window.DocForge=window.DocForge||{};
DocForge.PdfViewer=(function(){
  let pdf=null,currentPage=1,scale=1.5,totalPages=0,pdfBytes=null,searchResults=[],thumbsVisible=true;
  const SCALES=[0.5,0.75,1,1.25,1.5,2,2.5,3];
  function render(container){
    container.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">📄</span>PDF Viewer<span class="feature-badge">15 features</span></h1><p class="tool-description">Full-featured PDF viewer with zoom, search, rotate, thumbnails, and reading modes.</p></div>
    <div id="pv-upload" class="upload-zone"><div class="upload-zone-icon">📄</div><div class="upload-zone-title">Drop PDF here or click to upload</div><div class="upload-zone-subtitle">PDF files up to 100MB</div><input type="file" accept=".pdf"></div>
    <div id="pv-viewer" class="viewer-container hidden">
      <div class="viewer-toolbar">
        <div class="viewer-toolbar-group">
          <button class="btn btn-sm btn-ghost" id="pv-toggleThumbs" title="Toggle thumbnails">📑</button>
          <div class="toolbar-separator"></div>
          <button class="btn btn-sm btn-ghost" id="pv-prev" title="Previous page">◀</button>
          <span style="font-size:var(--fs-sm);color:var(--text-secondary)"><input id="pv-pageInput" class="form-input" style="width:50px;padding:4px 6px;text-align:center;display:inline-block" type="number" min="1" value="1"> / <span id="pv-totalPages">0</span></span>
          <button class="btn btn-sm btn-ghost" id="pv-next" title="Next page">▶</button>
        </div>
        <div class="viewer-toolbar-group">
          <button class="btn btn-sm btn-ghost" id="pv-zoomOut" title="Zoom out">➖</button>
          <span id="pv-zoomLevel" style="font-size:var(--fs-xs);min-width:45px;text-align:center">150%</span>
          <button class="btn btn-sm btn-ghost" id="pv-zoomIn" title="Zoom in">➕</button>
          <button class="btn btn-sm btn-ghost" id="pv-fitWidth" title="Fit width">↔️</button>
          <div class="toolbar-separator"></div>
          <button class="btn btn-sm btn-ghost" id="pv-rotateL" title="Rotate left">↪️</button>
          <button class="btn btn-sm btn-ghost" id="pv-rotateR" title="Rotate right">↩️</button>
          <div class="toolbar-separator"></div>
          <select class="toolbar-select" id="pv-mode"><option value="single">Single Page</option><option value="continuous">Continuous</option><option value="spread">Two-Page</option></select>
          <div class="toolbar-separator"></div>
          <input class="form-input" id="pv-search" placeholder="🔍 Search..." style="width:160px;padding:4px 8px;font-size:var(--fs-xs)">
          <div class="toolbar-separator"></div>
          <select class="toolbar-select" id="pv-readMode"><option value="default">Default</option><option value="dark">Dark</option><option value="sepia">Sepia</option></select>
          <button class="btn btn-sm btn-ghost" id="pv-fullscreen" title="Fullscreen">⛶</button>
          <button class="btn btn-sm btn-ghost" id="pv-info" title="File info">ℹ️</button>
          <button class="btn btn-sm btn-ghost" id="pv-present" title="Presentation">🎥</button>
        </div>
      </div>
      <div class="viewer-body" id="pv-body">
        <div class="viewer-sidebar-panel" id="pv-thumbsPanel"></div>
        <div class="viewer-canvas-area" id="pv-canvasArea"></div>
      </div>
    </div>`;
    init(container);
  }
  function init(container){
    DocForge.FileHandler.setupDropZone(container.querySelector('#pv-upload'),{accept:'.pdf',onFile:loadFile});
    container.querySelector('#pv-prev').onclick=()=>goToPage(currentPage-1);
    container.querySelector('#pv-next').onclick=()=>goToPage(currentPage+1);
    container.querySelector('#pv-pageInput').onchange=e=>goToPage(parseInt(e.target.value));
    container.querySelector('#pv-zoomIn').onclick=()=>changeZoom(1);
    container.querySelector('#pv-zoomOut').onclick=()=>changeZoom(-1);
    container.querySelector('#pv-fitWidth').onclick=fitWidth;
    container.querySelector('#pv-rotateL').onclick=()=>rotateView(-90);
    container.querySelector('#pv-rotateR').onclick=()=>rotateView(90);
    container.querySelector('#pv-toggleThumbs').onclick=toggleThumbs;
    container.querySelector('#pv-fullscreen').onclick=toggleFullscreen;
    container.querySelector('#pv-mode').onchange=e=>{renderPages();};
    container.querySelector('#pv-readMode').onchange=e=>setReadMode(e.target.value);
    container.querySelector('#pv-search').onkeydown=e=>{if(e.key==='Enter')searchText(e.target.value);};
    container.querySelector('#pv-info').onclick=showInfo;
    container.querySelector('#pv-present').onclick=presentMode;
    document.addEventListener('keydown',handleKeys);
  }
  async function loadFile(file){
    pdfBytes=await DocForge.FileHandler.readAsArrayBuffer(file);
    pdf=await DocForge.PDFUtils.loadPdfJS(pdfBytes);
    totalPages=pdf.numPages;currentPage=1;
    document.querySelector('#pv-upload').classList.add('hidden');
    document.querySelector('#pv-viewer').classList.remove('hidden');
    document.querySelector('#pv-totalPages').textContent=totalPages;
    renderThumbs();renderPages();
    DocForge.UI.toast(`Loaded "${file.name}" — ${totalPages} pages`,'success');
  }
  async function renderPages(){
    const area=document.querySelector('#pv-canvasArea');area.innerHTML='';
    const mode=document.querySelector('#pv-mode').value;
    if(mode==='continuous'){for(let i=1;i<=totalPages;i++){const c=await DocForge.PDFUtils.renderPageToCanvas(pdf,i,scale);c.className='viewer-page-canvas';c.dataset.page=i;area.appendChild(c);}}
    else if(mode==='spread'){const start=currentPage%2===0?currentPage-1:currentPage;const wrap=document.createElement('div');wrap.style.cssText='display:flex;gap:var(--space-md);justify-content:center;';for(let i=start;i<=Math.min(start+1,totalPages);i++){const c=await DocForge.PDFUtils.renderPageToCanvas(pdf,i,scale);c.className='viewer-page-canvas';wrap.appendChild(c);}area.appendChild(wrap);}
    else{const c=await DocForge.PDFUtils.renderPageToCanvas(pdf,currentPage,scale);c.className='viewer-page-canvas';area.appendChild(c);}
    updateUI();
  }
  async function renderThumbs(){
    const panel=document.querySelector('#pv-thumbsPanel');panel.innerHTML='';
    for(let i=1;i<=totalPages;i++){
      const div=document.createElement('div');div.className='page-thumb'+(i===currentPage?' selected':'');div.dataset.page=i;
      const c=await DocForge.PDFUtils.renderThumb(pdf,i,160);div.appendChild(c);
      const lbl=document.createElement('div');lbl.className='page-thumb-label';lbl.textContent=i;div.appendChild(lbl);
      div.onclick=()=>goToPage(i);panel.appendChild(div);
    }
  }
  function goToPage(n){
    if(n<1||n>totalPages)return;currentPage=n;renderPages();
    document.querySelectorAll('.page-thumb').forEach(t=>{t.classList.toggle('selected',parseInt(t.dataset.page)===n);});
  }
  function updateUI(){
    const pi=document.querySelector('#pv-pageInput');if(pi)pi.value=currentPage;
    document.querySelector('#pv-zoomLevel').textContent=Math.round(scale*100)+'%';
  }
  function changeZoom(dir){const idx=SCALES.indexOf(scale);const ni=Math.max(0,Math.min(SCALES.length-1,idx+dir));if(SCALES[ni]){scale=SCALES[ni];renderPages();}}
  function fitWidth(){const area=document.querySelector('#pv-canvasArea');if(!area)return;scale=area.clientWidth/612*0.95;renderPages();}
  let rotation=0;
  function rotateView(deg){rotation=(rotation+deg)%360;const area=document.querySelector('#pv-canvasArea');area.style.transform=`rotate(${rotation}deg)`;}
  function toggleThumbs(){thumbsVisible=!thumbsVisible;const p=document.querySelector('#pv-thumbsPanel');p.style.display=thumbsVisible?'':'none';}
  function toggleFullscreen(){const el=document.querySelector('#pv-viewer');if(!document.fullscreenElement)el.requestFullscreen?.();else document.exitFullscreen?.();}
  function setReadMode(mode){const area=document.querySelector('#pv-canvasArea');area.classList.remove('theme-dark','theme-sepia');if(mode==='dark')area.style.background='#1a1a2e';else if(mode==='sepia')area.style.background='#f4ecd8';else area.style.background='';}
  async function searchText(query){if(!query||!pdf)return;let found=0;for(let i=1;i<=totalPages;i++){const t=await DocForge.PDFUtils.extractText(pdf,i);if(t.toLowerCase().includes(query.toLowerCase())){found++;if(found===1){goToPage(i);DocForge.UI.toast(`Found on page ${i}`,'success');}}}if(!found)DocForge.UI.toast('No results found','info');}
  async function showInfo(){if(!pdf)return;const meta=await DocForge.PDFUtils.getMetadata(pdf);const info=meta.info||{};DocForge.UI.toast(`Title: ${info.Title||'N/A'} | Pages: ${totalPages} | Author: ${info.Author||'N/A'}`,'info',5000);}
  function presentMode(){goToPage(1);toggleFullscreen();document.querySelector('#pv-mode').value='single';renderPages();}
  function handleKeys(e){if(!pdf)return;if(e.key==='ArrowRight'||e.key==='ArrowDown')goToPage(currentPage+1);if(e.key==='ArrowLeft'||e.key==='ArrowUp')goToPage(currentPage-1);if(e.key==='+'||e.key==='=')changeZoom(1);if(e.key==='-')changeZoom(-1);}
  function destroy(){document.removeEventListener('keydown',handleKeys);pdf=null;pdfBytes=null;currentPage=1;rotation=0;}
  return{render,destroy};
})();
