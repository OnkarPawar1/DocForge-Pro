/* DocForge - PDF Analysis */
window.DocForge=window.DocForge||{};
DocForge.PdfAnalysis=(function(){
  let pdf=null,pdfBytes=null;
  function render(c){
    c.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">📊</span>PDF Analysis<span class="feature-badge">8 features</span></h1><p class="tool-description">Analyze PDF structure, extract statistics, compare documents.</p></div>
    <div id="pa-upload" class="upload-zone"><div class="upload-zone-icon">📊</div><div class="upload-zone-title">Drop PDF to analyze</div><input type="file" accept=".pdf"></div>
    <div id="pa-main" class="hidden">
      <div class="tabs"><div class="tab active" data-tab="info">File Info</div><div class="tab" data-tab="text">Text Stats</div><div class="tab" data-tab="pages">Page Details</div><div class="tab" data-tab="compare">Compare</div></div>
      <div id="pa-content" class="card" style="border-top:none;border-radius:0 0 var(--radius-lg) var(--radius-lg)"></div>
    </div>`;
    init(c);
  }
  function init(c){
    DocForge.FileHandler.setupDropZone(c.querySelector('#pa-upload'),{accept:'.pdf',onFile:loadFile});
    c.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{c.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');showTab(t.dataset.tab);});
  }
  async function loadFile(file){
    pdfBytes=new Uint8Array(await DocForge.FileHandler.readAsArrayBuffer(file));
    pdf=await DocForge.PDFUtils.loadPdfJS(pdfBytes);
    document.getElementById('pa-upload').classList.add('hidden');
    document.getElementById('pa-main').classList.remove('hidden');
    showTab('info');DocForge.UI.toast('PDF loaded for analysis','success');
  }
  async function showTab(tab){
    const tc=document.getElementById('pa-content');
    if(tab==='info'){
      const meta=await DocForge.PDFUtils.getMetadata(pdf);const info=meta.info||{};
      const doc=await PDFLib.PDFDocument.load(pdfBytes);const page=doc.getPage(0);const{width,height}=page.getSize();
      tc.innerHTML=`<table style="width:100%;font-size:var(--fs-sm)">
        <tr><td style="color:var(--text-secondary);padding:6px 0">Title</td><td>${info.Title||'N/A'}</td></tr>
        <tr><td style="color:var(--text-secondary);padding:6px 0">Author</td><td>${info.Author||'N/A'}</td></tr>
        <tr><td style="color:var(--text-secondary);padding:6px 0">Subject</td><td>${info.Subject||'N/A'}</td></tr>
        <tr><td style="color:var(--text-secondary);padding:6px 0">Creator</td><td>${info.Creator||'N/A'}</td></tr>
        <tr><td style="color:var(--text-secondary);padding:6px 0">Producer</td><td>${info.Producer||'N/A'}</td></tr>
        <tr><td style="color:var(--text-secondary);padding:6px 0">Pages</td><td>${pdf.numPages}</td></tr>
        <tr><td style="color:var(--text-secondary);padding:6px 0">Page Size</td><td>${Math.round(width)} × ${Math.round(height)} pts (${Math.round(width/72*25.4)} × ${Math.round(height/72*25.4)} mm)</td></tr>
        <tr><td style="color:var(--text-secondary);padding:6px 0">File Size</td><td>${DocForge.FileHandler.formatSize(pdfBytes.length)}</td></tr>
        <tr><td style="color:var(--text-secondary);padding:6px 0">PDF Version</td><td>${info.PDFFormatVersion||'N/A'}</td></tr>
        <tr><td style="color:var(--text-secondary);padding:6px 0">Created</td><td>${info.CreationDate||'N/A'}</td></tr>
        <tr><td style="color:var(--text-secondary);padding:6px 0">Modified</td><td>${info.ModDate||'N/A'}</td></tr>
      </table>`;
    }else if(tab==='text'){
      tc.innerHTML=`<div class="spinner" style="margin:var(--space-lg) auto"></div>`;
      const fullText=await DocForge.PDFUtils.extractAllText(pdf);
      const words=fullText.split(/\s+/).filter(w=>w.length>0);
      const chars=fullText.length;const lines=fullText.split('\n').length;
      const uniqueWords=new Set(words.map(w=>w.toLowerCase()));
      const wordFreq={};words.forEach(w=>{const lw=w.toLowerCase().replace(/[^a-z]/g,'');if(lw.length>2){wordFreq[lw]=(wordFreq[lw]||0)+1;}});
      const topWords=Object.entries(wordFreq).sort((a,b)=>b[1]-a[1]).slice(0,20);
      tc.innerHTML=`<div class="options-grid" style="margin-bottom:var(--space-lg)">
        <div class="card" style="text-align:center"><div style="font-size:var(--fs-2xl);font-weight:800;color:var(--accent-violet)">${words.length.toLocaleString()}</div><div style="font-size:var(--fs-xs);color:var(--text-secondary)">Words</div></div>
        <div class="card" style="text-align:center"><div style="font-size:var(--fs-2xl);font-weight:800;color:var(--accent-cyan)">${chars.toLocaleString()}</div><div style="font-size:var(--fs-xs);color:var(--text-secondary)">Characters</div></div>
        <div class="card" style="text-align:center"><div style="font-size:var(--fs-2xl);font-weight:800;color:var(--accent-amber)">${lines.toLocaleString()}</div><div style="font-size:var(--fs-xs);color:var(--text-secondary)">Lines</div></div>
        <div class="card" style="text-align:center"><div style="font-size:var(--fs-2xl);font-weight:800;color:var(--accent-emerald)">${uniqueWords.size.toLocaleString()}</div><div style="font-size:var(--fs-xs);color:var(--text-secondary)">Unique Words</div></div>
      </div>
      <h4 style="margin-bottom:var(--space-sm)">Top 20 Words</h4>
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-xs)">${topWords.map(([w,c])=>`<span class="badge badge-violet">${w} (${c})</span>`).join('')}</div>`;
    }else if(tab==='pages'){
      const doc=await PDFLib.PDFDocument.load(pdfBytes);
      let html='<table style="width:100%;font-size:var(--fs-sm)"><tr style="color:var(--text-tertiary)"><th style="text-align:left;padding:6px">Page</th><th style="text-align:left">Width</th><th style="text-align:left">Height</th><th style="text-align:left">Rotation</th></tr>';
      doc.getPages().forEach((p,i)=>{const{width,height}=p.getSize();const rot=p.getRotation().angle;
        html+=`<tr><td style="padding:6px">${i+1}</td><td>${Math.round(width)} pts</td><td>${Math.round(height)} pts</td><td>${rot}°</td></tr>`;
      });
      html+='</table>';tc.innerHTML=html;
    }else if(tab==='compare'){
      tc.innerHTML=`<p style="color:var(--text-secondary);margin-bottom:var(--space-md)">Upload a second PDF to compare side by side.</p>
        <div class="upload-zone" id="pa-upload2"><div class="upload-zone-icon">📄</div><div class="upload-zone-title">Drop second PDF</div><input type="file" accept=".pdf"></div>
        <div id="pa-compare" class="hidden" style="margin-top:var(--space-lg)"><div class="compare-container"><div class="compare-pane"><div class="compare-pane-header">Document 1</div><div id="pa-comp1"></div></div><div class="compare-pane"><div class="compare-pane-header">Document 2</div><div id="pa-comp2"></div></div></div></div>`;
      DocForge.FileHandler.setupDropZone(tc.querySelector('#pa-upload2'),{accept:'.pdf',onFile:async f=>{
        const data=await DocForge.FileHandler.readAsArrayBuffer(f);const pdf2=await DocForge.PDFUtils.loadPdfJS(data);
        document.getElementById('pa-compare').classList.remove('hidden');
        const c1=await DocForge.PDFUtils.renderPageToCanvas(pdf,1,1);c1.style.maxWidth='100%';
        const c2=await DocForge.PDFUtils.renderPageToCanvas(pdf2,1,1);c2.style.maxWidth='100%';
        document.getElementById('pa-comp1').appendChild(c1);document.getElementById('pa-comp2').appendChild(c2);
        DocForge.UI.toast('Comparison ready','success');
      }});
    }
  }
  function destroy(){pdf=null;pdfBytes=null;}
  return{render,destroy};
})();
