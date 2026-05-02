/* DocForge - PDF Editor */
window.DocForge=window.DocForge||{};
DocForge.PdfEditor=(function(){
  let pdfBytes=null,pdf=null;
  function render(c){
    c.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">✏️</span>PDF Editor<span class="feature-badge">10 features</span></h1><p class="tool-description">Add watermarks, rotate pages, delete pages, add page numbers, crop, and more.</p></div>
    <div id="pe-upload" class="upload-zone"><div class="upload-zone-icon">✏️</div><div class="upload-zone-title">Drop PDF to edit</div><input type="file" accept=".pdf"></div>
    <div id="pe-main" class="hidden">
      <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-lg);flex-wrap:wrap">
        <span class="badge badge-emerald" id="pe-info"></span>
      </div>
      <div class="tabs" id="pe-tabs">
        <div class="tab active" data-tab="watermark">Watermark</div>
        <div class="tab" data-tab="rotate">Rotate</div>
        <div class="tab" data-tab="pages">Delete Pages</div>
        <div class="tab" data-tab="reorder">Reorder</div>
        <div class="tab" data-tab="numbers">Page Numbers</div>
        <div class="tab" data-tab="headers">Headers/Footers</div>
        <div class="tab" data-tab="resize">Resize</div>
        <div class="tab" data-tab="annotate">Annotate</div>
      </div>
      <div id="pe-tabContent" class="card" style="margin-top:0;border-top:none;border-radius:0 0 var(--radius-lg) var(--radius-lg)"></div>
    </div>`;
    init(c);
  }
  function init(c){
    DocForge.FileHandler.setupDropZone(c.querySelector('#pe-upload'),{accept:'.pdf',onFile:loadFile});
    c.querySelectorAll('#pe-tabs .tab').forEach(tab=>{tab.onclick=()=>{
      c.querySelectorAll('#pe-tabs .tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');showTab(tab.dataset.tab);
    };});
  }
  async function loadFile(file){
    pdfBytes=new Uint8Array(await DocForge.FileHandler.readAsArrayBuffer(file));
    pdf=await DocForge.PDFUtils.loadPdfJS(pdfBytes);
    document.getElementById('pe-upload').classList.add('hidden');
    document.getElementById('pe-main').classList.remove('hidden');
    document.getElementById('pe-info').textContent=`${file.name} — ${pdf.numPages} pages — ${DocForge.FileHandler.formatSize(file.size)}`;
    showTab('watermark');
  }
  function showTab(tab){
    const tc=document.getElementById('pe-tabContent');
    switch(tab){
      case 'watermark':tc.innerHTML=`<div class="form-group"><label class="form-label">Watermark Text</label><input class="form-input" id="pe-wmText" value="CONFIDENTIAL"></div><div class="options-grid"><div class="form-group"><label class="form-label">Font Size</label><input class="form-input" id="pe-wmSize" type="number" value="48"></div><div class="form-group"><label class="form-label">Opacity (0-1)</label><input class="form-input" id="pe-wmOpacity" type="number" step="0.05" min="0" max="1" value="0.15"></div></div><button class="btn btn-primary" style="margin-top:var(--space-md)" onclick="DocForge.PdfEditor._applyWatermark()">Apply Watermark</button>`;break;
      case 'rotate':tc.innerHTML=`<div class="options-grid"><div class="form-group"><label class="form-label">Page Number</label><input class="form-input" id="pe-rotPage" type="number" min="1" value="1"></div><div class="form-group"><label class="form-label">Degrees</label><select class="form-select" id="pe-rotDeg"><option value="90">90° CW</option><option value="180">180°</option><option value="270">90° CCW</option></select></div></div><button class="btn btn-primary" style="margin-top:var(--space-md)" onclick="DocForge.PdfEditor._applyRotate()">Rotate & Download</button><button class="btn btn-secondary" style="margin-top:var(--space-md);margin-left:var(--space-sm)" onclick="DocForge.PdfEditor._rotateAll()">Rotate All Pages</button>`;break;
      case 'pages':tc.innerHTML=`<div class="form-group"><label class="form-label">Pages to delete (e.g. 1,3,5-7)</label><input class="form-input" id="pe-delPages"></div><button class="btn btn-danger" style="margin-top:var(--space-md)" onclick="DocForge.PdfEditor._deletePages()">Delete & Download</button>`;break;
      case 'reorder':tc.innerHTML=`<div class="form-group"><label class="form-label">New page order (e.g. 3,1,2,5,4)</label><input class="form-input" id="pe-reorder" placeholder="3,1,2,5,4"></div><button class="btn btn-primary" style="margin-top:var(--space-md)" onclick="DocForge.PdfEditor._reorder()">Reorder & Download</button>`;break;
      case 'numbers':tc.innerHTML=`<div class="form-group"><label class="form-label">Font Size</label><input class="form-input" id="pe-numSize" type="number" value="10"></div><button class="btn btn-primary" style="margin-top:var(--space-md)" onclick="DocForge.PdfEditor._addNumbers()">Add Page Numbers</button>`;break;
      case 'headers':tc.innerHTML=`<div class="options-grid"><div class="form-group"><label class="form-label">Header Text</label><input class="form-input" id="pe-headerText" placeholder="My Document"></div><div class="form-group"><label class="form-label">Footer Text</label><input class="form-input" id="pe-footerText" placeholder="Page {n}"></div></div><button class="btn btn-primary" style="margin-top:var(--space-md)" onclick="DocForge.PdfEditor._addHeaders()">Apply & Download</button>`;break;
      case 'resize':tc.innerHTML=`<div class="options-grid"><div class="form-group"><label class="form-label">Page Size</label><select class="form-select" id="pe-pageSize"><option value="a4">A4</option><option value="letter">US Letter</option><option value="legal">US Legal</option></select></div></div><p style="font-size:var(--fs-xs);color:var(--text-tertiary);margin-top:var(--space-md)">Note: Resize recreates the document with new page dimensions.</p>`;break;
      case 'annotate':tc.innerHTML=`<div class="options-grid"><div class="form-group"><label class="form-label">Page</label><input class="form-input" id="pe-annPage" type="number" min="1" value="1"></div><div class="form-group"><label class="form-label">Text</label><input class="form-input" id="pe-annText" value="Note"></div><div class="form-group"><label class="form-label">X Position</label><input class="form-input" id="pe-annX" type="number" value="100"></div><div class="form-group"><label class="form-label">Y Position</label><input class="form-input" id="pe-annY" type="number" value="100"></div></div><button class="btn btn-primary" style="margin-top:var(--space-md)" onclick="DocForge.PdfEditor._annotate()">Add Annotation</button>`;break;
    }
  }
  async function _applyWatermark(){
    const text=document.getElementById('pe-wmText').value;const size=parseInt(document.getElementById('pe-wmSize').value);const opacity=parseFloat(document.getElementById('pe-wmOpacity').value);
    const bytes=await DocForge.PDFUtils.addWatermark(pdfBytes,text,{fontSize:size,opacity});
    DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'watermarked.pdf');DocForge.UI.toast('Watermark applied!','success');
  }
  async function _applyRotate(){
    const page=parseInt(document.getElementById('pe-rotPage').value)-1;const deg=parseInt(document.getElementById('pe-rotDeg').value);
    const bytes=await DocForge.PDFUtils.rotatePage(pdfBytes,page,deg);
    DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'rotated.pdf');DocForge.UI.toast('Rotated!','success');
  }
  async function _rotateAll(){
    const deg=parseInt(document.getElementById('pe-rotDeg').value);
    const doc=await PDFLib.PDFDocument.load(pdfBytes);
    doc.getPages().forEach(p=>{const cur=p.getRotation().angle;p.setRotation(PDFLib.degrees(cur+deg));});
    const bytes=await doc.save();DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'rotated_all.pdf');DocForge.UI.toast('All pages rotated!','success');
  }
  function parsePageList(str,max){
    const result=[];str.split(',').forEach(part=>{
      part=part.trim();const m=part.match(/^(\d+)\s*-\s*(\d+)$/);
      if(m){for(let i=parseInt(m[1]);i<=Math.min(parseInt(m[2]),max);i++)result.push(i-1);}
      else{const n=parseInt(part);if(n>=1&&n<=max)result.push(n-1);}
    });return[...new Set(result)];
  }
  async function _deletePages(){
    const indices=parsePageList(document.getElementById('pe-delPages').value,pdf.numPages);
    if(!indices.length){DocForge.UI.toast('Enter valid pages','info');return;}
    const bytes=await DocForge.PDFUtils.deletePages(pdfBytes,indices);
    DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'edited.pdf');DocForge.UI.toast(`Deleted ${indices.length} pages`,'success');
  }
  async function _reorder(){
    const order=document.getElementById('pe-reorder').value.split(',').map(s=>parseInt(s.trim())-1).filter(n=>n>=0&&n<pdf.numPages);
    if(!order.length){DocForge.UI.toast('Enter valid order','info');return;}
    const bytes=await DocForge.PDFUtils.reorderPages(pdfBytes,order);
    DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'reordered.pdf');DocForge.UI.toast('Reordered!','success');
  }
  async function _addNumbers(){
    const size=parseInt(document.getElementById('pe-numSize').value)||10;
    const bytes=await DocForge.PDFUtils.addPageNumbers(pdfBytes,{fontSize:size});
    DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'numbered.pdf');DocForge.UI.toast('Page numbers added!','success');
  }
  async function _addHeaders(){
    const header=document.getElementById('pe-headerText').value;const footer=document.getElementById('pe-footerText').value;
    const doc=await PDFLib.PDFDocument.load(pdfBytes);const font=await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    doc.getPages().forEach((page,i)=>{const{width,height}=page.getSize();
      if(header)page.drawText(header,{x:width/2-font.widthOfTextAtSize(header,10)/2,y:height-20,size:10,font,color:PDFLib.rgb(.3,.3,.3)});
      if(footer){const ft=footer.replace('{n}',i+1);page.drawText(ft,{x:width/2-font.widthOfTextAtSize(ft,10)/2,y:15,size:10,font,color:PDFLib.rgb(.3,.3,.3)});}
    });
    const bytes=await doc.save();DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'headers.pdf');DocForge.UI.toast('Headers/footers added!','success');
  }
  async function _annotate(){
    const pageIdx=parseInt(document.getElementById('pe-annPage').value)-1;const text=document.getElementById('pe-annText').value;
    const x=parseInt(document.getElementById('pe-annX').value);const y=parseInt(document.getElementById('pe-annY').value);
    const doc=await PDFLib.PDFDocument.load(pdfBytes);const font=await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    const page=doc.getPage(pageIdx);page.drawText(text,{x,y,size:14,font,color:PDFLib.rgb(0.8,0.1,0.1)});
    const bytes=await doc.save();DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'annotated.pdf');DocForge.UI.toast('Annotation added!','success');
  }
  function destroy(){pdf=null;pdfBytes=null;}
  return{render,destroy,_applyWatermark,_applyRotate,_rotateAll,_deletePages,_reorder,_addNumbers,_addHeaders,_annotate};
})();
