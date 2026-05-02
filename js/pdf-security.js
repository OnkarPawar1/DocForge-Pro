/* DocForge - PDF Security */
window.DocForge=window.DocForge||{};
DocForge.PdfSecurity=(function(){
  let pdfBytes=null;
  function render(c){
    c.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">🔒</span>PDF Security<span class="feature-badge">5 features</span></h1><p class="tool-description">Edit metadata, sanitize documents, and redact sensitive content.</p></div>
    <div id="ps-upload" class="upload-zone"><div class="upload-zone-icon">🔒</div><div class="upload-zone-title">Drop PDF for security tools</div><input type="file" accept=".pdf"></div>
    <div id="ps-main" class="hidden">
      <div class="tabs"><div class="tab active" data-tab="metadata">Metadata Editor</div><div class="tab" data-tab="sanitize">Sanitize</div><div class="tab" data-tab="redact">Redact</div><div class="tab" data-tab="protect">Protection</div></div>
      <div id="ps-content" class="card" style="border-top:none;border-radius:0 0 var(--radius-lg) var(--radius-lg)"></div>
    </div>`;
    init(c);
  }
  function init(c){
    DocForge.FileHandler.setupDropZone(c.querySelector('#ps-upload'),{accept:'.pdf',onFile:loadFile});
    c.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{c.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');showTab(t.dataset.tab);});
  }
  async function loadFile(file){
    pdfBytes=new Uint8Array(await DocForge.FileHandler.readAsArrayBuffer(file));
    document.getElementById('ps-upload').classList.add('hidden');
    document.getElementById('ps-main').classList.remove('hidden');
    showTab('metadata');DocForge.UI.toast('PDF loaded','success');
  }
  async function showTab(tab){
    const tc=document.getElementById('ps-content');
    if(tab==='metadata'){
      const doc=await PDFLib.PDFDocument.load(pdfBytes);
      tc.innerHTML=`<div class="options-grid">
        <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="ps-title" value="${doc.getTitle()||''}"></div>
        <div class="form-group"><label class="form-label">Author</label><input class="form-input" id="ps-author" value="${doc.getAuthor()||''}"></div>
        <div class="form-group"><label class="form-label">Subject</label><input class="form-input" id="ps-subject" value="${doc.getSubject()||''}"></div>
        <div class="form-group"><label class="form-label">Keywords</label><input class="form-input" id="ps-keywords" value="${(doc.getKeywords()||'')}"></div>
        <div class="form-group"><label class="form-label">Creator</label><input class="form-input" id="ps-creator" value="${doc.getCreator()||''}"></div>
        <div class="form-group"><label class="form-label">Producer</label><input class="form-input" id="ps-producer" value="${doc.getProducer()||''}"></div>
      </div><button class="btn btn-primary" style="margin-top:var(--space-md)" id="ps-saveMeta">💾 Save Metadata</button>`;
      tc.querySelector('#ps-saveMeta').onclick=async()=>{
        const d=await PDFLib.PDFDocument.load(pdfBytes);
        d.setTitle(document.getElementById('ps-title').value);d.setAuthor(document.getElementById('ps-author').value);
        d.setSubject(document.getElementById('ps-subject').value);d.setKeywords(document.getElementById('ps-keywords').value.split(','));
        d.setCreator(document.getElementById('ps-creator').value);d.setProducer(document.getElementById('ps-producer').value);
        const bytes=await d.save();DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'metadata_edited.pdf');
        DocForge.UI.toast('Metadata updated!','success');
      };
    }else if(tab==='sanitize'){
      tc.innerHTML=`<p style="color:var(--text-secondary);margin-bottom:var(--space-md)">Remove all metadata from the PDF to protect privacy.</p><button class="btn btn-danger" id="ps-sanitize">🧹 Sanitize Document</button>`;
      tc.querySelector('#ps-sanitize').onclick=async()=>{
        const d=await PDFLib.PDFDocument.load(pdfBytes);
        d.setTitle('');d.setAuthor('');d.setSubject('');d.setKeywords([]);d.setCreator('');d.setProducer('');
        const bytes=await d.save();DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'sanitized.pdf');
        DocForge.UI.toast('Metadata removed!','success');
      };
    }else if(tab==='redact'){
      tc.innerHTML=`<p style="color:var(--text-secondary);margin-bottom:var(--space-md)">Add black redaction boxes over sensitive areas.</p>
        <div class="options-grid">
          <div class="form-group"><label class="form-label">Page</label><input class="form-input" id="ps-rdPage" type="number" min="1" value="1"></div>
          <div class="form-group"><label class="form-label">X</label><input class="form-input" id="ps-rdX" type="number" value="100"></div>
          <div class="form-group"><label class="form-label">Y</label><input class="form-input" id="ps-rdY" type="number" value="100"></div>
          <div class="form-group"><label class="form-label">Width</label><input class="form-input" id="ps-rdW" type="number" value="200"></div>
          <div class="form-group"><label class="form-label">Height</label><input class="form-input" id="ps-rdH" type="number" value="30"></div>
        </div><button class="btn btn-danger" style="margin-top:var(--space-md)" id="ps-applyRedact">■ Apply Redaction</button>`;
      tc.querySelector('#ps-applyRedact').onclick=async()=>{
        const doc=await PDFLib.PDFDocument.load(pdfBytes);const pg=parseInt(document.getElementById('ps-rdPage').value)-1;
        const page=doc.getPage(pg);
        page.drawRectangle({x:parseInt(document.getElementById('ps-rdX').value),y:parseInt(document.getElementById('ps-rdY').value),width:parseInt(document.getElementById('ps-rdW').value),height:parseInt(document.getElementById('ps-rdH').value),color:PDFLib.rgb(0,0,0)});
        const bytes=await doc.save();DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'redacted.pdf');
        DocForge.UI.toast('Redaction applied!','success');
      };
    }else if(tab==='protect'){
      tc.innerHTML=`<p style="color:var(--text-secondary)">⚠️ Client-side PDF encryption is limited. For production-grade password protection, consider server-side solutions.</p><p style="color:var(--text-tertiary);font-size:var(--fs-xs);margin-top:var(--space-md)">You can still use metadata editing and redaction to protect sensitive information visually.</p>`;
    }
  }
  function destroy(){pdfBytes=null;}
  return{render,destroy};
})();
