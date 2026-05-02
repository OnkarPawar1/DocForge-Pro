/* DocForge - PDF Splitter */
window.DocForge=window.DocForge||{};
DocForge.PdfSplitter=(function(){
  let pdfBytes=null,pdf=null,totalPages=0,selected=new Set();
  function render(c){
    c.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">✂️</span>PDF Splitter<span class="feature-badge">10 features</span></h1><p class="tool-description">Split PDFs by selecting pages, ranges, or fixed chunks. Drag to reorder.</p></div>
    <div id="sp-upload" class="upload-zone"><div class="upload-zone-icon">✂️</div><div class="upload-zone-title">Drop PDF to split</div><div class="upload-zone-subtitle">PDF files supported</div><input type="file" accept=".pdf"></div>
    <div id="sp-main" class="hidden">
      <div class="splitter-layout">
        <div>
          <div class="action-bar" style="margin-bottom:var(--space-md)">
            <button class="btn btn-sm btn-ghost" id="sp-selectAll">Select All</button>
            <button class="btn btn-sm btn-ghost" id="sp-deselectAll">Deselect All</button>
            <button class="btn btn-sm btn-ghost" id="sp-invertSel">Invert</button>
            <span style="font-size:var(--fs-xs);color:var(--text-secondary)" id="sp-selCount">0 selected</span>
          </div>
          <div class="splitter-pages" id="sp-pages"></div>
        </div>
        <div class="splitter-options">
          <div class="card"><div class="card-title" style="font-size:var(--fs-sm)">Page Range</div><div class="card-subtitle" style="margin-bottom:var(--space-md)">e.g. 1-5, 8, 10-15</div><input class="form-input" id="sp-range" placeholder="1-5, 8, 10-15"><button class="btn btn-sm btn-secondary" style="margin-top:var(--space-sm);width:100%" id="sp-applyRange">Apply Range</button></div>
          <div class="card"><div class="card-title" style="font-size:var(--fs-sm)">Split Every N Pages</div><input class="form-input" id="sp-chunkSize" type="number" min="1" value="1" style="margin-top:var(--space-sm)"><button class="btn btn-sm btn-secondary" style="margin-top:var(--space-sm);width:100%" id="sp-splitChunks">Split into Chunks</button></div>
          <div class="card"><div class="card-title" style="font-size:var(--fs-sm)">Actions</div>
            <button class="btn btn-primary" style="width:100%;margin-top:var(--space-sm)" id="sp-extractSel">Extract Selected</button>
            <button class="btn btn-secondary" style="width:100%;margin-top:var(--space-sm)" id="sp-removeSel">Remove Selected</button>
            <button class="btn btn-secondary" style="width:100%;margin-top:var(--space-sm)" id="sp-splitAll">Split All (1 per page)</button>
            <button class="btn btn-secondary" style="width:100%;margin-top:var(--space-sm)" id="sp-downloadZip">Download as ZIP</button>
          </div>
        </div>
      </div>
    </div>`;
    init(c);
  }
  function init(c){
    DocForge.FileHandler.setupDropZone(c.querySelector('#sp-upload'),{accept:'.pdf',onFile:loadFile});
    c.querySelector('#sp-selectAll').onclick=()=>{for(let i=0;i<totalPages;i++)selected.add(i);updateThumbs();};
    c.querySelector('#sp-deselectAll').onclick=()=>{selected.clear();updateThumbs();};
    c.querySelector('#sp-invertSel').onclick=()=>{for(let i=0;i<totalPages;i++){if(selected.has(i))selected.delete(i);else selected.add(i);}updateThumbs();};
    c.querySelector('#sp-applyRange').onclick=applyRange;
    c.querySelector('#sp-extractSel').onclick=extractSelected;
    c.querySelector('#sp-removeSel').onclick=removeSelected;
    c.querySelector('#sp-splitAll').onclick=splitAll;
    c.querySelector('#sp-splitChunks').onclick=splitChunks;
    c.querySelector('#sp-downloadZip').onclick=downloadZip;
  }
  async function loadFile(file){
    pdfBytes=new Uint8Array(await DocForge.FileHandler.readAsArrayBuffer(file));
    pdf=await DocForge.PDFUtils.loadPdfJS(pdfBytes);
    totalPages=pdf.numPages;selected.clear();
    document.getElementById('sp-upload').classList.add('hidden');
    document.getElementById('sp-main').classList.remove('hidden');
    renderThumbs();
    DocForge.UI.toast(`Loaded ${totalPages} pages`,'success');
  }
  async function renderThumbs(){
    const cont=document.getElementById('sp-pages');cont.innerHTML='';
    for(let i=1;i<=totalPages;i++){
      const div=document.createElement('div');div.className='page-thumb';div.dataset.idx=i-1;
      const canvas=await DocForge.PDFUtils.renderThumb(pdf,i,140);div.appendChild(canvas);
      const lbl=document.createElement('div');lbl.className='page-thumb-label';lbl.textContent=`Page ${i}`;div.appendChild(lbl);
      div.onclick=()=>{const idx=i-1;if(selected.has(idx))selected.delete(idx);else selected.add(idx);updateThumbs();};
      cont.appendChild(div);
    }
    updateThumbs();
  }
  function updateThumbs(){
    document.querySelectorAll('#sp-pages .page-thumb').forEach(t=>{t.classList.toggle('selected',selected.has(parseInt(t.dataset.idx)));});
    document.getElementById('sp-selCount').textContent=selected.size+' selected';
  }
  function applyRange(){
    const val=document.getElementById('sp-range').value;if(!val)return;selected.clear();
    val.split(',').forEach(part=>{
      part=part.trim();const m=part.match(/^(\d+)\s*-\s*(\d+)$/);
      if(m){for(let i=parseInt(m[1]);i<=Math.min(parseInt(m[2]),totalPages);i++)selected.add(i-1);}
      else{const n=parseInt(part);if(n>=1&&n<=totalPages)selected.add(n-1);}
    });
    updateThumbs();DocForge.UI.toast(`Selected ${selected.size} pages`,'success');
  }
  async function extractSelected(){
    if(!selected.size){DocForge.UI.toast('Select pages first','info');return;}
    const bytes=await DocForge.PDFUtils.splitPages(pdfBytes,Array.from(selected).sort((a,b)=>a-b));
    DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'extracted_pages.pdf');
    DocForge.UI.toast('Extracted successfully!','success');
  }
  async function removeSelected(){
    if(!selected.size)return;
    const bytes=await DocForge.PDFUtils.deletePages(pdfBytes,Array.from(selected));
    DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'remaining_pages.pdf');
    DocForge.UI.toast('Removed selected pages','success');
  }
  async function splitAll(){
    const files=[];
    for(let i=0;i<totalPages;i++){
      const bytes=await DocForge.PDFUtils.splitPages(pdfBytes,[i]);
      files.push({name:`page_${i+1}.pdf`,data:bytes});
    }
    await DocForge.FileHandler.downloadAsZip(files,'split_pages.zip');
    DocForge.UI.toast('All pages split!','success');
  }
  async function splitChunks(){
    const size=parseInt(document.getElementById('sp-chunkSize').value)||1;const files=[];
    for(let i=0;i<totalPages;i+=size){
      const indices=[];for(let j=i;j<Math.min(i+size,totalPages);j++)indices.push(j);
      const bytes=await DocForge.PDFUtils.splitPages(pdfBytes,indices);
      files.push({name:`chunk_${Math.floor(i/size)+1}.pdf`,data:bytes});
    }
    await DocForge.FileHandler.downloadAsZip(files,'chunks.zip');
    DocForge.UI.toast(`Split into ${files.length} chunks`,'success');
  }
  async function downloadZip(){if(!selected.size){await splitAll();return;}
    const indices=Array.from(selected).sort((a,b)=>a-b);const files=[];
    for(const idx of indices){const bytes=await DocForge.PDFUtils.splitPages(pdfBytes,[idx]);files.push({name:`page_${idx+1}.pdf`,data:bytes});}
    await DocForge.FileHandler.downloadAsZip(files,'selected_pages.zip');
    DocForge.UI.toast('Downloaded as ZIP','success');
  }
  function destroy(){pdf=null;pdfBytes=null;selected.clear();}
  return{render,destroy};
})();
