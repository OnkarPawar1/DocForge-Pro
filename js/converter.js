/* DocForge - Format Converter */
window.DocForge=window.DocForge||{};
DocForge.Converter=(function(){
  function render(c){
    c.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">🔄</span>Format Converter<span class="feature-badge">12 features</span></h1><p class="tool-description">Convert between PDF, images, DOCX, text, HTML, and more.</p></div>
    <div class="converter-grid" id="cv-grid">
      <div class="converter-option" data-mode="img2pdf"><div class="converter-option-icon">🖼️→📄</div><div class="converter-option-title">Images → PDF</div><div class="converter-option-desc">Combine images into PDF</div></div>
      <div class="converter-option" data-mode="pdf2img"><div class="converter-option-icon">📄→🖼️</div><div class="converter-option-title">PDF → Images</div><div class="converter-option-desc">Convert pages to images</div></div>
      <div class="converter-option" data-mode="html2pdf"><div class="converter-option-icon">🌐→📄</div><div class="converter-option-title">HTML → PDF</div><div class="converter-option-desc">Convert HTML to PDF</div></div>
      <div class="converter-option" data-mode="docx2pdf"><div class="converter-option-icon">📝→📄</div><div class="converter-option-title">DOCX → PDF</div><div class="converter-option-desc">Word document to PDF</div></div>
      <div class="converter-option" data-mode="txt2pdf"><div class="converter-option-icon">📃→📄</div><div class="converter-option-title">Text → PDF</div><div class="converter-option-desc">Plain text or markdown</div></div>
      <div class="converter-option" data-mode="pdf2txt"><div class="converter-option-icon">📄→📃</div><div class="converter-option-title">PDF → Text</div><div class="converter-option-desc">Extract all text from PDF</div></div>
      <div class="converter-option" data-mode="csv2pdf"><div class="converter-option-icon">📊→📄</div><div class="converter-option-title">CSV → PDF</div><div class="converter-option-desc">Table data to PDF</div></div>
      <div class="converter-option" data-mode="json2pdf"><div class="converter-option-icon">{ }→📄</div><div class="converter-option-title">JSON → PDF</div><div class="converter-option-desc">Formatted JSON report</div></div>
      <div class="converter-option" data-mode="svg2pdf"><div class="converter-option-icon">🎨→📄</div><div class="converter-option-title">SVG → PDF</div><div class="converter-option-desc">Vector graphics to PDF</div></div>
      <div class="converter-option" data-mode="md2pdf"><div class="converter-option-icon">📋→📄</div><div class="converter-option-title">Markdown → PDF</div><div class="converter-option-desc">Markdown file to PDF</div></div>
      <div class="converter-option" data-mode="epub2pdf"><div class="converter-option-icon">📚→📄</div><div class="converter-option-title">EPUB → PDF</div><div class="converter-option-desc">E-book to PDF</div></div>
      <div class="converter-option" data-mode="screenshot"><div class="converter-option-icon">📷→📄</div><div class="converter-option-title">Screenshot → PDF</div><div class="converter-option-desc">Capture page as PDF</div></div>
    </div>
    <div id="cv-workspace" class="hidden">
      <div class="card" style="margin-bottom:var(--space-lg)">
        <div style="display:flex;align-items:center;justify-content:space-between"><h3 id="cv-modeTitle" class="card-title"></h3><button class="btn btn-sm btn-ghost" id="cv-back">← Back</button></div>
        <div id="cv-uploadArea" style="margin-top:var(--space-md)"></div>
        <div id="cv-options" style="margin-top:var(--space-md)"></div>
        <div id="cv-actions" class="action-bar" style="margin-top:var(--space-md)"></div>
        <div id="cv-preview" style="margin-top:var(--space-md)"></div>
      </div>
    </div>`;
    init(c);
  }
  function init(c){
    c.querySelectorAll('.converter-option').forEach(opt=>{opt.onclick=()=>openMode(opt.dataset.mode);});
    c.querySelector('#cv-back').onclick=()=>{
      document.getElementById('cv-workspace').classList.add('hidden');
      document.getElementById('cv-grid').classList.remove('hidden');
    };
  }
  function openMode(mode){
    document.getElementById('cv-grid').classList.add('hidden');
    const ws=document.getElementById('cv-workspace');ws.classList.remove('hidden');
    const titles={'img2pdf':'Images → PDF','pdf2img':'PDF → Images','html2pdf':'HTML → PDF','docx2pdf':'DOCX → PDF','txt2pdf':'Text → PDF','pdf2txt':'PDF → Text','csv2pdf':'CSV → PDF','json2pdf':'JSON → PDF','svg2pdf':'SVG → PDF','md2pdf':'Markdown → PDF','epub2pdf':'EPUB → PDF','screenshot':'Screenshot → PDF'};
    document.getElementById('cv-modeTitle').textContent=titles[mode]||mode;
    const upload=document.getElementById('cv-uploadArea');
    const options=document.getElementById('cv-options');
    const actions=document.getElementById('cv-actions');
    const preview=document.getElementById('cv-preview');
    upload.innerHTML='';options.innerHTML='';actions.innerHTML='';preview.innerHTML='';
    switch(mode){
      case 'img2pdf':setupImg2Pdf(upload,actions);break;
      case 'pdf2img':setupPdf2Img(upload,actions);break;
      case 'html2pdf':setupHtml2Pdf(upload,options,actions);break;
      case 'docx2pdf':setupDocx2Pdf(upload,actions);break;
      case 'txt2pdf':setupTxt2Pdf(options,actions);break;
      case 'pdf2txt':setupPdf2Txt(upload,actions,preview);break;
      case 'csv2pdf':setupCsv2Pdf(upload,actions);break;
      case 'json2pdf':setupJson2Pdf(upload,actions);break;
      case 'svg2pdf':setupSvg2Pdf(upload,actions);break;
      case 'md2pdf':setupMd2Pdf(options,actions);break;
      case 'epub2pdf':setupEpub2Pdf(upload,actions);break;
      case 'screenshot':setupScreenshot(options,actions);break;
    }
  }
  let imgFiles=[];
  function setupImg2Pdf(upload,actions){
    imgFiles=[];
    upload.innerHTML=`<div class="upload-zone" id="cv-imgUpload"><div class="upload-zone-icon">🖼️</div><div class="upload-zone-title">Drop images here</div><div class="upload-zone-subtitle">PNG, JPG, WebP, BMP</div><input type="file" accept="image/*" multiple></div><div id="cv-imgList" style="margin-top:var(--space-md)"></div>`;
    actions.innerHTML=`<button class="btn btn-primary" id="cv-imgConvert">📄 Create PDF</button>`;
    DocForge.FileHandler.setupDropZone(upload.querySelector('#cv-imgUpload'),{accept:'image/*',multiple:true,onFile:f=>{
      DocForge.FileHandler.readAsDataURL(f).then(url=>{imgFiles.push({name:f.name,url});
        const list=document.getElementById('cv-imgList');const d=document.createElement('div');d.className='badge badge-cyan';d.style.margin='2px';d.textContent=f.name;list.appendChild(d);
      });
    }});
    actions.querySelector('#cv-imgConvert').onclick=async()=>{
      if(!imgFiles.length){DocForge.UI.toast('Add images first','info');return;}
      const{jsPDF}=window.jspdf;const doc=new jsPDF();
      for(let i=0;i<imgFiles.length;i++){
        if(i>0)doc.addPage();const img=new Image();img.src=imgFiles[i].url;
        await new Promise(r=>{img.onload=r;});
        const pw=doc.internal.pageSize.getWidth();const ph=doc.internal.pageSize.getHeight();
        const ratio=Math.min(pw/img.width,ph/img.height);
        doc.addImage(imgFiles[i].url,'JPEG',(pw-img.width*ratio)/2,(ph-img.height*ratio)/2,img.width*ratio,img.height*ratio);
      }
      doc.save('images.pdf');DocForge.UI.toast('PDF created!','success');
    };
  }
  function setupPdf2Img(upload,actions){
    upload.innerHTML=`<div class="upload-zone" id="cv-p2iUpload"><div class="upload-zone-icon">📄</div><div class="upload-zone-title">Drop PDF here</div><input type="file" accept=".pdf"></div>`;
    actions.innerHTML=`<button class="btn btn-primary" id="cv-p2iConvert">🖼️ Convert to Images</button>`;
    let pdfData=null;
    DocForge.FileHandler.setupDropZone(upload.querySelector('#cv-p2iUpload'),{accept:'.pdf',onFile:async f=>{
      pdfData=await DocForge.FileHandler.readAsArrayBuffer(f);DocForge.UI.toast('PDF loaded','success');
    }});
    actions.querySelector('#cv-p2iConvert').onclick=async()=>{
      if(!pdfData){DocForge.UI.toast('Upload PDF first','info');return;}
      const pdf=await DocForge.PDFUtils.loadPdfJS(pdfData);const files=[];
      for(let i=1;i<=pdf.numPages;i++){const canvas=await DocForge.PDFUtils.renderPageToCanvas(pdf,i,2);
        const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));
        files.push({name:`page_${i}.png`,data:blob});
      }
      if(files.length===1){saveAs(files[0].data,files[0].name);}
      else{const zip=new JSZip();for(const f of files)zip.file(f.name,f.data);const b=await zip.generateAsync({type:'blob'});saveAs(b,'pdf_images.zip');}
      DocForge.UI.toast('Converted!','success');
    };
  }
  function setupHtml2Pdf(upload,options,actions){
    options.innerHTML=`<div class="form-group"><label class="form-label">Paste HTML</label><textarea class="form-textarea" id="cv-htmlInput" rows="8" placeholder="<h1>Hello World</h1>"></textarea></div>`;
    actions.innerHTML=`<button class="btn btn-primary" id="cv-htmlConvert">📄 Convert</button>`;
    actions.querySelector('#cv-htmlConvert').onclick=()=>{
      const html=document.getElementById('cv-htmlInput').value;if(!html){DocForge.UI.toast('Enter HTML','info');return;}
      const{jsPDF}=window.jspdf;const doc=new jsPDF();
      const div=document.createElement('div');div.innerHTML=html;div.style.cssText='width:550px;padding:20px;font-family:Arial,sans-serif;';
      document.body.appendChild(div);
      html2canvas(div).then(canvas=>{
        document.body.removeChild(div);
        const w=doc.internal.pageSize.getWidth();const ratio=w/canvas.width;
        doc.addImage(canvas.toDataURL(),'PNG',0,0,w,canvas.height*ratio);
        doc.save('html_converted.pdf');DocForge.UI.toast('Converted!','success');
      });
    };
  }
  function setupDocx2Pdf(upload,actions){
    upload.innerHTML=`<div class="upload-zone" id="cv-docxUpload"><div class="upload-zone-icon">📝</div><div class="upload-zone-title">Drop DOCX file</div><input type="file" accept=".docx"></div>`;
    actions.innerHTML=`<button class="btn btn-primary" id="cv-docxConvert">📄 Convert</button>`;
    let docxData=null;
    DocForge.FileHandler.setupDropZone(upload.querySelector('#cv-docxUpload'),{accept:'.docx',onFile:async f=>{
      docxData=await DocForge.FileHandler.readAsArrayBuffer(f);DocForge.UI.toast('DOCX loaded','success');
    }});
    actions.querySelector('#cv-docxConvert').onclick=async()=>{
      if(!docxData){DocForge.UI.toast('Upload DOCX first','info');return;}
      const result=await mammoth.convertToHtml({arrayBuffer:docxData});
      const div=document.createElement('div');div.innerHTML=result.value;div.style.cssText='width:550px;padding:30px;font-family:Arial,sans-serif;background:#fff;color:#000;';
      document.body.appendChild(div);
      const canvas=await html2canvas(div);document.body.removeChild(div);
      const{jsPDF}=window.jspdf;const doc=new jsPDF();
      const w=doc.internal.pageSize.getWidth();const ratio=w/canvas.width;
      doc.addImage(canvas.toDataURL(),'PNG',0,0,w,canvas.height*ratio);
      doc.save('document.pdf');DocForge.UI.toast('Converted!','success');
    };
  }
  function setupTxt2Pdf(options,actions){
    options.innerHTML=`<div class="form-group"><label class="form-label">Enter or paste text</label><textarea class="form-textarea" id="cv-txtInput" rows="10" placeholder="Your text here..."></textarea></div>`;
    actions.innerHTML=`<button class="btn btn-primary" id="cv-txtConvert">📄 Convert to PDF</button>`;
    actions.querySelector('#cv-txtConvert').onclick=()=>{
      const text=document.getElementById('cv-txtInput').value;if(!text){DocForge.UI.toast('Enter text','info');return;}
      const{jsPDF}=window.jspdf;const doc=new jsPDF();
      const lines=doc.splitTextToSize(text,170);doc.setFontSize(11);
      let y=20;for(const line of lines){if(y>280){doc.addPage();y=20;}doc.text(line,20,y);y+=6;}
      doc.save('text.pdf');DocForge.UI.toast('PDF created!','success');
    };
  }
  function setupPdf2Txt(upload,actions,preview){
    upload.innerHTML=`<div class="upload-zone" id="cv-p2tUpload"><div class="upload-zone-icon">📄</div><div class="upload-zone-title">Drop PDF</div><input type="file" accept=".pdf"></div>`;
    actions.innerHTML=`<button class="btn btn-primary" id="cv-p2tExtract">📃 Extract Text</button><button class="btn btn-secondary" id="cv-p2tCopy">📋 Copy</button><button class="btn btn-secondary" id="cv-p2tDownload">📥 Download .txt</button>`;
    let pdfData=null,extractedText='';
    DocForge.FileHandler.setupDropZone(upload.querySelector('#cv-p2tUpload'),{accept:'.pdf',onFile:async f=>{pdfData=await DocForge.FileHandler.readAsArrayBuffer(f);DocForge.UI.toast('PDF loaded','success');}});
    actions.querySelector('#cv-p2tExtract').onclick=async()=>{
      if(!pdfData){DocForge.UI.toast('Upload PDF first','info');return;}
      const pdf=await DocForge.PDFUtils.loadPdfJS(pdfData);
      extractedText=await DocForge.PDFUtils.extractAllText(pdf);
      preview.innerHTML=`<div class="card" style="max-height:400px;overflow-y:auto"><pre style="white-space:pre-wrap;font-size:var(--fs-sm);font-family:var(--font-mono)">${extractedText.replace(/</g,'&lt;')}</pre></div>`;
      DocForge.UI.toast('Text extracted!','success');
    };
    actions.querySelector('#cv-p2tCopy').onclick=()=>{if(extractedText){navigator.clipboard.writeText(extractedText);DocForge.UI.toast('Copied!','success');}};
    actions.querySelector('#cv-p2tDownload').onclick=()=>{if(extractedText){const blob=new Blob([extractedText],{type:'text/plain'});saveAs(blob,'extracted.txt');}};
  }
  function setupCsv2Pdf(upload,actions){
    upload.innerHTML=`<div class="upload-zone" id="cv-csvUpload"><div class="upload-zone-icon">📊</div><div class="upload-zone-title">Drop CSV file</div><input type="file" accept=".csv,.tsv"></div>`;
    actions.innerHTML=`<button class="btn btn-primary" id="cv-csvConvert">📄 Convert</button>`;
    let csvText='';
    DocForge.FileHandler.setupDropZone(upload.querySelector('#cv-csvUpload'),{accept:'.csv,.tsv',onFile:async f=>{csvText=await DocForge.FileHandler.readAsText(f);DocForge.UI.toast('CSV loaded','success');}});
    actions.querySelector('#cv-csvConvert').onclick=()=>{
      if(!csvText){DocForge.UI.toast('Upload CSV','info');return;}
      const{jsPDF}=window.jspdf;const doc=new jsPDF();
      const rows=csvText.split('\n').map(r=>r.split(','));
      let y=20;doc.setFontSize(9);
      for(const row of rows){let x=10;for(const cell of row){doc.text(cell.trim().substring(0,25),x,y);x+=40;}y+=6;if(y>280){doc.addPage();y=20;}}
      doc.save('table.pdf');DocForge.UI.toast('Converted!','success');
    };
  }
  function setupJson2Pdf(upload,actions){
    upload.innerHTML=`<div class="form-group"><label class="form-label">Paste JSON</label><textarea class="form-textarea" id="cv-jsonInput" rows="8" placeholder='{"key":"value"}'></textarea></div>`;
    actions.innerHTML=`<button class="btn btn-primary" id="cv-jsonConvert">📄 Convert</button>`;
    actions.querySelector('#cv-jsonConvert').onclick=()=>{
      const text=document.getElementById('cv-jsonInput').value;if(!text)return;
      try{const parsed=JSON.stringify(JSON.parse(text),null,2);
        const{jsPDF}=window.jspdf;const doc=new jsPDF();doc.setFont('Courier');doc.setFontSize(9);
        const lines=doc.splitTextToSize(parsed,170);let y=20;
        for(const line of lines){if(y>280){doc.addPage();y=20;}doc.text(line,20,y);y+=5;}
        doc.save('json_report.pdf');DocForge.UI.toast('Converted!','success');
      }catch(e){DocForge.UI.toast('Invalid JSON','error');}
    };
  }
  function setupSvg2Pdf(upload,actions){
    upload.innerHTML=`<div class="upload-zone" id="cv-svgUpload"><div class="upload-zone-icon">🎨</div><div class="upload-zone-title">Drop SVG file</div><input type="file" accept=".svg"></div>`;
    actions.innerHTML=`<button class="btn btn-primary" id="cv-svgConvert">📄 Convert</button>`;
    let svgText='';
    DocForge.FileHandler.setupDropZone(upload.querySelector('#cv-svgUpload'),{accept:'.svg',onFile:async f=>{svgText=await DocForge.FileHandler.readAsText(f);DocForge.UI.toast('SVG loaded','success');}});
    actions.querySelector('#cv-svgConvert').onclick=()=>{
      if(!svgText)return;const div=document.createElement('div');div.innerHTML=svgText;div.style.cssText='position:absolute;left:-9999px;background:#fff;';document.body.appendChild(div);
      html2canvas(div).then(canvas=>{document.body.removeChild(div);
        const{jsPDF}=window.jspdf;const doc=new jsPDF();const w=doc.internal.pageSize.getWidth();const r=w/canvas.width;
        doc.addImage(canvas.toDataURL(),'PNG',0,0,w,canvas.height*r);doc.save('svg.pdf');DocForge.UI.toast('Converted!','success');
      });
    };
  }
  function setupMd2Pdf(options,actions){
    options.innerHTML=`<div class="form-group"><label class="form-label">Enter Markdown</label><textarea class="form-textarea" id="cv-mdInput" rows="10" placeholder="# Heading\n\nParagraph text..."></textarea></div>`;
    actions.innerHTML=`<button class="btn btn-primary" id="cv-mdConvert">📄 Convert</button>`;
    actions.querySelector('#cv-mdConvert').onclick=()=>{
      let md=document.getElementById('cv-mdInput').value;if(!md)return;
      md=md.replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
      const div=document.createElement('div');div.innerHTML=md;div.style.cssText='width:550px;padding:30px;font-family:Arial;background:#fff;color:#000;position:absolute;left:-9999px;';
      document.body.appendChild(div);
      html2canvas(div).then(canvas=>{document.body.removeChild(div);
        const{jsPDF}=window.jspdf;const doc=new jsPDF();const w=doc.internal.pageSize.getWidth();const r=w/canvas.width;
        doc.addImage(canvas.toDataURL(),'PNG',0,0,w,canvas.height*r);doc.save('markdown.pdf');DocForge.UI.toast('Converted!','success');
      });
    };
  }
  function setupEpub2Pdf(upload,actions){
    upload.innerHTML=`<div class="upload-zone" id="cv-epubUpload"><div class="upload-zone-icon">📚</div><div class="upload-zone-title">Drop EPUB file</div><input type="file" accept=".epub"></div>`;
    actions.innerHTML=`<button class="btn btn-primary" id="cv-epubConvert">📄 Convert to PDF</button>`;
    let epubData=null;
    DocForge.FileHandler.setupDropZone(upload.querySelector('#cv-epubUpload'),{accept:'.epub',onFile:async f=>{epubData=await DocForge.FileHandler.readAsArrayBuffer(f);DocForge.UI.toast('EPUB loaded','success');}});
    actions.querySelector('#cv-epubConvert').onclick=async()=>{
      if(!epubData){DocForge.UI.toast('Upload EPUB','info');return;}
      DocForge.UI.toast('Converting EPUB to PDF... this may take a moment','info');
      const book=ePub(epubData);const div=document.createElement('div');div.style.cssText='width:550px;padding:30px;font-family:Georgia;background:#fff;color:#000;position:absolute;left:-9999px;';
      document.body.appendChild(div);const rend=book.renderTo(div,{width:550,height:800});await rend.display();
      setTimeout(async()=>{
        const canvas=await html2canvas(div);document.body.removeChild(div);book.destroy();
        const{jsPDF}=window.jspdf;const doc=new jsPDF();const w=doc.internal.pageSize.getWidth();const r=w/canvas.width;
        doc.addImage(canvas.toDataURL(),'PNG',0,0,w,canvas.height*r);doc.save('ebook.pdf');DocForge.UI.toast('Converted!','success');
      },2000);
    };
  }
  function setupScreenshot(options,actions){
    options.innerHTML=`<p style="color:var(--text-secondary);font-size:var(--fs-sm)">Capture the current page as a PDF screenshot.</p>`;
    actions.innerHTML=`<button class="btn btn-primary" id="cv-screenshot">📷 Capture & Save</button>`;
    actions.querySelector('#cv-screenshot').onclick=()=>{
      html2canvas(document.body).then(canvas=>{
        const{jsPDF}=window.jspdf;const doc=new jsPDF({orientation:canvas.width>canvas.height?'landscape':'portrait'});
        const w=doc.internal.pageSize.getWidth();const r=w/canvas.width;
        doc.addImage(canvas.toDataURL(),'PNG',0,0,w,canvas.height*r);doc.save('screenshot.pdf');DocForge.UI.toast('Screenshot saved!','success');
      });
    };
  }
  function destroy(){imgFiles=[];}
  return{render,destroy};
})();
