/* DocForge - Image Extractor */
window.DocForge=window.DocForge||{};
DocForge.ImageExtractor=(function(){
  let pdf=null,pdfBytes=null,images=[];
  function render(c){
    c.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">🖼️</span>Image Extractor<span class="feature-badge">8 features</span></h1><p class="tool-description">Extract all images from PDF pages. Preview, filter by size, and download.</p></div>
    <div id="ie-upload" class="upload-zone"><div class="upload-zone-icon">🖼️</div><div class="upload-zone-title">Drop PDF to extract images</div><div class="upload-zone-subtitle">PDF files supported</div><input type="file" accept=".pdf"></div>
    <div id="ie-main" class="hidden">
      <div class="options-panel"><div class="options-grid">
        <div class="form-group"><label class="form-label">Output Format</label><select class="form-select" id="ie-format"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option></select></div>
        <div class="form-group"><label class="form-label">Min Width (px)</label><input class="form-input" id="ie-minW" type="number" value="50"></div>
        <div class="form-group"><label class="form-label">Scale</label><select class="form-select" id="ie-scale"><option value="1">1x</option><option value="2" selected>2x (HD)</option><option value="3">3x</option></select></div>
      </div></div>
      <div class="action-bar"><button class="btn btn-primary" id="ie-extract">🖼️ Extract Images</button><button class="btn btn-secondary" id="ie-downloadAll">📥 Download All (ZIP)</button><span id="ie-count" style="font-size:var(--fs-sm);color:var(--text-secondary)"></span></div>
      <div id="ie-gallery" class="gallery-grid" style="margin-top:var(--space-lg)"></div>
    </div>`;
    init(c);
  }
  function init(c){
    DocForge.FileHandler.setupDropZone(c.querySelector('#ie-upload'),{accept:'.pdf',onFile:loadFile});
    c.querySelector('#ie-extract').onclick=extractImages;
    c.querySelector('#ie-downloadAll').onclick=downloadAll;
  }
  async function loadFile(file){
    pdfBytes=await DocForge.FileHandler.readAsArrayBuffer(file);
    pdf=await DocForge.PDFUtils.loadPdfJS(pdfBytes);
    document.getElementById('ie-upload').classList.add('hidden');
    document.getElementById('ie-main').classList.remove('hidden');
    DocForge.UI.toast(`Loaded ${pdf.numPages} pages — click Extract`,'success');
  }
  async function extractImages(){
    if(!pdf)return;images=[];
    const gallery=document.getElementById('ie-gallery');gallery.innerHTML='';
    const format=document.getElementById('ie-format').value;
    const scale=parseFloat(document.getElementById('ie-scale').value);
    const minW=parseInt(document.getElementById('ie-minW').value)||0;
    DocForge.UI.toast('Extracting images from all pages...','info');
    for(let i=1;i<=pdf.numPages;i++){
      const canvas=await DocForge.PDFUtils.renderPageToCanvas(pdf,i,scale);
      if(canvas.width<minW)continue;
      const dataUrl=canvas.toDataURL(format,0.95);
      const ext=format==='image/png'?'png':'jpg';
      images.push({name:`page_${i}.${ext}`,dataUrl,page:i});
      const item=document.createElement('div');item.className='gallery-item';item.style.animation='fadeIn .3s ease';
      item.innerHTML=`<img src="${dataUrl}" alt="Page ${i}"><div class="gallery-item-info" style="display:flex;justify-content:space-between;align-items:center"><span>Page ${i}</span><button class="btn btn-sm btn-ghost" data-idx="${images.length-1}">📥</button></div>`;
      item.querySelector('button').onclick=e=>{const idx=parseInt(e.currentTarget.dataset.idx);DocForge.FileHandler.downloadDataURL(images[idx].dataUrl,images[idx].name);};
      gallery.appendChild(item);
    }
    document.getElementById('ie-count').textContent=`${images.length} images extracted`;
    DocForge.UI.toast(`Extracted ${images.length} images!`,'success');
  }
  async function downloadAll(){
    if(!images.length){DocForge.UI.toast('Extract images first','info');return;}
    const files=images.map(img=>{const d=atob(img.dataUrl.split(',')[1]);const arr=new Uint8Array(d.length);for(let i=0;i<d.length;i++)arr[i]=d.charCodeAt(i);return{name:img.name,data:arr};});
    await DocForge.FileHandler.downloadAsZip(files,'extracted_images.zip');
    DocForge.UI.toast('Downloaded ZIP!','success');
  }
  function destroy(){pdf=null;pdfBytes=null;images=[];}
  return{render,destroy};
})();
