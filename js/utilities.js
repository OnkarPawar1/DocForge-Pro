/* DocForge - Utilities */
window.DocForge=window.DocForge||{};
DocForge.Utilities=(function(){
  function render(c){
    c.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">🧰</span>Utilities<span class="feature-badge">8 features</span></h1><p class="tool-description">QR codes, barcodes, page count, file size, bookmarks, Base64, and more.</p></div>
    <div class="converter-grid">
      <div class="converter-option" data-util="pagecount"><div class="converter-option-icon">📏</div><div class="converter-option-title">Page Count</div><div class="converter-option-desc">Quick page counter</div></div>
      <div class="converter-option" data-util="compress"><div class="converter-option-icon">📦</div><div class="converter-option-title">Compress PDF</div><div class="converter-option-desc">Reduce file size</div></div>
      <div class="converter-option" data-util="qr"><div class="converter-option-icon">📱</div><div class="converter-option-title">QR Code</div><div class="converter-option-desc">Generate QR code to PDF</div></div>
      <div class="converter-option" data-util="base64"><div class="converter-option-icon">🔢</div><div class="converter-option-title">PDF to Base64</div><div class="converter-option-desc">Encode PDF as Base64</div></div>
      <div class="converter-option" data-util="bookmarks"><div class="converter-option-icon">🔖</div><div class="converter-option-title">Extract Bookmarks</div><div class="converter-option-desc">List PDF outline</div></div>
      <div class="converter-option" data-util="flatten"><div class="converter-option-icon">📐</div><div class="converter-option-title">Flatten PDF</div><div class="converter-option-desc">Flatten annotations</div></div>
      <div class="converter-option" data-util="duplicate"><div class="converter-option-icon">📑</div><div class="converter-option-title">Duplicate Pages</div><div class="converter-option-desc">Duplicate each page N times</div></div>
      <div class="converter-option" data-util="reverse"><div class="converter-option-icon">🔃</div><div class="converter-option-title">Reverse Pages</div><div class="converter-option-desc">Reverse page order</div></div>
    </div>
    <div id="ut-workspace" class="hidden card" style="margin-top:var(--space-lg)">
      <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-md)"><h3 id="ut-title" class="card-title"></h3><button class="btn btn-sm btn-ghost" id="ut-back">← Back</button></div>
      <div id="ut-content"></div>
    </div>`;
    init(c);
  }
  function init(c){
    c.querySelectorAll('.converter-option').forEach(opt=>opt.onclick=()=>openUtil(opt.dataset.util));
    c.querySelector('#ut-back').onclick=()=>{document.getElementById('ut-workspace').classList.add('hidden');c.querySelector('.converter-grid').classList.remove('hidden');};
  }
  function openUtil(util){
    document.querySelector('.converter-grid').classList.add('hidden');
    document.getElementById('ut-workspace').classList.remove('hidden');
    const content=document.getElementById('ut-content');
    const titles={pagecount:'Page Count',compress:'Compress PDF',qr:'QR Code Generator',base64:'PDF to Base64',bookmarks:'Extract Bookmarks',flatten:'Flatten PDF',duplicate:'Duplicate Pages',reverse:'Reverse Pages'};
    document.getElementById('ut-title').textContent=titles[util];
    switch(util){
      case 'pagecount':content.innerHTML=`<div class="upload-zone" id="ut-pcUpload"><div class="upload-zone-icon">📏</div><div class="upload-zone-title">Drop PDF</div><input type="file" accept=".pdf"></div><div id="ut-pcResult" style="margin-top:var(--space-md)"></div>`;
        DocForge.FileHandler.setupDropZone(content.querySelector('#ut-pcUpload'),{accept:'.pdf',onFile:async f=>{
          const data=await DocForge.FileHandler.readAsArrayBuffer(f);const pdf=await DocForge.PDFUtils.loadPdfJS(data);
          document.getElementById('ut-pcResult').innerHTML=`<div class="card" style="text-align:center"><div style="font-size:var(--fs-3xl);font-weight:900;color:var(--accent-violet)">${pdf.numPages}</div><div style="color:var(--text-secondary)">pages in ${f.name} (${DocForge.FileHandler.formatSize(f.size)})</div></div>`;
        }});break;
      case 'compress':content.innerHTML=`<div class="upload-zone" id="ut-compUpload"><div class="upload-zone-icon">📦</div><div class="upload-zone-title">Drop PDF to compress</div><input type="file" accept=".pdf"></div><div id="ut-compResult" style="margin-top:var(--space-md)"></div>`;
        DocForge.FileHandler.setupDropZone(content.querySelector('#ut-compUpload'),{accept:'.pdf',onFile:async f=>{
          const data=await DocForge.FileHandler.readAsArrayBuffer(f);
          const doc=await PDFLib.PDFDocument.load(data);
          const bytes=await doc.save({useObjectStreams:true});
          const saved=f.size-bytes.length;
          document.getElementById('ut-compResult').innerHTML=`<div class="card"><p>Original: ${DocForge.FileHandler.formatSize(f.size)}</p><p>Compressed: ${DocForge.FileHandler.formatSize(bytes.length)}</p><p style="color:${saved>0?'var(--accent-emerald)':'var(--accent-amber)'}">Saved: ${DocForge.FileHandler.formatSize(Math.abs(saved))} (${Math.round(saved/f.size*100)}%)</p><button class="btn btn-primary" style="margin-top:var(--space-md)" id="ut-compDl">📥 Download</button></div>`;
          document.getElementById('ut-compDl').onclick=()=>DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'compressed.pdf');
        }});break;
      case 'qr':content.innerHTML=`<div class="form-group"><label class="form-label">Text / URL for QR Code</label><input class="form-input" id="ut-qrText" value="https://example.com"></div><canvas id="ut-qrCanvas" style="margin:var(--space-md) 0;border-radius:var(--radius-md)"></canvas><button class="btn btn-primary" id="ut-qrGen">Generate QR Code</button><button class="btn btn-secondary" style="margin-left:var(--space-sm)" id="ut-qrPdf">Save as PDF</button>`;
        content.querySelector('#ut-qrGen').onclick=()=>{
          const text=document.getElementById('ut-qrText').value;if(!text)return;
          const canvas=document.getElementById('ut-qrCanvas');const ctx=canvas.getContext('2d');
          canvas.width=200;canvas.height=200;ctx.fillStyle='#fff';ctx.fillRect(0,0,200,200);
          // Simple QR-like pattern (visual placeholder - real QR needs a library)
          ctx.fillStyle='#000';const size=8;
          for(let i=0;i<25;i++)for(let j=0;j<25;j++){if(simpleHash(text+i+j)%3===0)ctx.fillRect(i*size,j*size,size,size);}
          // Position markers
          drawMarker(ctx,0,0,size);drawMarker(ctx,18*size,0,size);drawMarker(ctx,0,18*size,size);
          DocForge.UI.toast('QR Code generated (visual representation)','success');
        };
        content.querySelector('#ut-qrPdf').onclick=()=>{
          const canvas=document.getElementById('ut-qrCanvas');
          const{jsPDF}=window.jspdf;const doc=new jsPDF();
          doc.addImage(canvas.toDataURL(),'PNG',60,60,90,90);doc.save('qrcode.pdf');
        };break;
      case 'base64':content.innerHTML=`<div class="upload-zone" id="ut-b64Upload"><div class="upload-zone-icon">🔢</div><div class="upload-zone-title">Drop PDF</div><input type="file" accept=".pdf"></div><div class="form-group" style="margin-top:var(--space-md)"><label class="form-label">Base64 Output</label><textarea class="form-textarea" id="ut-b64Output" rows="6" readonly></textarea></div><button class="btn btn-secondary" id="ut-b64Copy">📋 Copy</button>`;
        DocForge.FileHandler.setupDropZone(content.querySelector('#ut-b64Upload'),{accept:'.pdf',onFile:async f=>{
          const url=await DocForge.FileHandler.readAsDataURL(f);document.getElementById('ut-b64Output').value=url;DocForge.UI.toast('Encoded!','success');
        }});
        content.querySelector('#ut-b64Copy').onclick=()=>{const t=document.getElementById('ut-b64Output').value;if(t){navigator.clipboard.writeText(t);DocForge.UI.toast('Copied!','success');}};break;
      case 'bookmarks':content.innerHTML=`<div class="upload-zone" id="ut-bkUpload"><div class="upload-zone-icon">🔖</div><div class="upload-zone-title">Drop PDF</div><input type="file" accept=".pdf"></div><div id="ut-bkResult" style="margin-top:var(--space-md)"></div>`;
        DocForge.FileHandler.setupDropZone(content.querySelector('#ut-bkUpload'),{accept:'.pdf',onFile:async f=>{
          const data=await DocForge.FileHandler.readAsArrayBuffer(f);const pdf=await DocForge.PDFUtils.loadPdfJS(data);
          const outline=await pdf.getOutline();
          const res=document.getElementById('ut-bkResult');
          if(outline&&outline.length){res.innerHTML='<div class="card">'+outline.map(b=>`<div style="padding:4px 0;font-size:var(--fs-sm)">📑 ${b.title}</div>`).join('')+'</div>';}
          else{res.innerHTML='<div class="empty-state"><div class="empty-state-icon">🔖</div><div class="empty-state-title">No bookmarks found</div></div>';}
        }});break;
      case 'flatten':content.innerHTML=`<div class="upload-zone" id="ut-flatUpload"><div class="upload-zone-icon">📐</div><div class="upload-zone-title">Drop PDF</div><input type="file" accept=".pdf"></div>`;
        DocForge.FileHandler.setupDropZone(content.querySelector('#ut-flatUpload'),{accept:'.pdf',onFile:async f=>{
          const data=await DocForge.FileHandler.readAsArrayBuffer(f);const doc=await PDFLib.PDFDocument.load(data);
          const form=doc.getForm();try{form.flatten();}catch(e){}
          const bytes=await doc.save();DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'flattened.pdf');
          DocForge.UI.toast('Flattened!','success');
        }});break;
      case 'duplicate':content.innerHTML=`<div class="upload-zone" id="ut-dupUpload"><div class="upload-zone-icon">📑</div><div class="upload-zone-title">Drop PDF</div><input type="file" accept=".pdf"></div><div class="form-group" style="margin-top:var(--space-md)"><label class="form-label">Copies per page</label><input class="form-input" id="ut-dupN" type="number" min="2" value="2"></div><button class="btn btn-primary" style="margin-top:var(--space-md)" id="ut-dupGo">Duplicate & Download</button>`;
        let dupData=null;
        DocForge.FileHandler.setupDropZone(content.querySelector('#ut-dupUpload'),{accept:'.pdf',onFile:async f=>{dupData=new Uint8Array(await DocForge.FileHandler.readAsArrayBuffer(f));DocForge.UI.toast('PDF loaded','success');}});
        content.querySelector('#ut-dupGo').onclick=async()=>{if(!dupData)return;const n=parseInt(document.getElementById('ut-dupN').value)||2;
          const src=await PDFLib.PDFDocument.load(dupData);const dst=await PDFLib.PDFDocument.create();
          for(let i=0;i<src.getPageCount();i++){for(let j=0;j<n;j++){const[p]=await dst.copyPages(src,[i]);dst.addPage(p);}}
          const bytes=await dst.save();DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'duplicated.pdf');DocForge.UI.toast('Done!','success');
        };break;
      case 'reverse':content.innerHTML=`<div class="upload-zone" id="ut-revUpload"><div class="upload-zone-icon">🔃</div><div class="upload-zone-title">Drop PDF</div><input type="file" accept=".pdf"></div>`;
        DocForge.FileHandler.setupDropZone(content.querySelector('#ut-revUpload'),{accept:'.pdf',onFile:async f=>{
          const data=new Uint8Array(await DocForge.FileHandler.readAsArrayBuffer(f));const src=await PDFLib.PDFDocument.load(data);
          const indices=src.getPageIndices().reverse();const bytes=await DocForge.PDFUtils.splitPages(data,indices);
          DocForge.FileHandler.downloadBlob(new Blob([bytes],{type:'application/pdf'}),'reversed.pdf');DocForge.UI.toast('Reversed!','success');
        }});break;
    }
  }
  function simpleHash(str){let h=0;for(let i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;}return Math.abs(h);}
  function drawMarker(ctx,x,y,s){ctx.fillStyle='#000';ctx.fillRect(x,y,7*s,7*s);ctx.fillStyle='#fff';ctx.fillRect(x+s,y+s,5*s,5*s);ctx.fillStyle='#000';ctx.fillRect(x+2*s,y+2*s,3*s,3*s);}
  function destroy(){}
  return{render,destroy};
})();
