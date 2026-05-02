/* DocForge - PDF Utils */
window.DocForge=window.DocForge||{};
DocForge.PDFUtils=(function(){
  async function loadPdfJS(data){
    const arr=data instanceof ArrayBuffer?new Uint8Array(data):data;
    return pdfjsLib.getDocument({data:arr}).promise;
  }
  async function renderPageToCanvas(pdf,pageNum,scale=1.5){
    const page=await pdf.getPage(pageNum);
    const vp=page.getViewport({scale});
    const canvas=document.createElement('canvas');
    canvas.width=vp.width;canvas.height=vp.height;
    await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
    return canvas;
  }
  async function renderThumb(pdf,pageNum,maxW=150){
    const page=await pdf.getPage(pageNum);
    const vp0=page.getViewport({scale:1});
    const scale=maxW/vp0.width;
    return renderPageToCanvas(pdf,pageNum,scale);
  }
  async function extractText(pdf,pageNum){
    const page=await pdf.getPage(pageNum);
    const tc=await page.getTextContent();
    return tc.items.map(i=>i.str).join(' ');
  }
  async function extractAllText(pdf){
    let text='';
    for(let i=1;i<=pdf.numPages;i++){text+=await extractText(pdf,i)+'\n\n';}
    return text;
  }
  async function getMetadata(pdf){
    const meta=await pdf.getMetadata();
    return{info:meta.info,metadata:meta.metadata};
  }
  async function loadPdfLib(data){
    return PDFLib.PDFDocument.load(data);
  }
  async function splitPages(srcBytes,pageIndices){
    const src=await PDFLib.PDFDocument.load(srcBytes);
    const dst=await PDFLib.PDFDocument.create();
    const pages=await dst.copyPages(src,pageIndices);
    pages.forEach(p=>dst.addPage(p));
    return dst.save();
  }
  async function mergeDocuments(bytesArr){
    const merged=await PDFLib.PDFDocument.create();
    for(const bytes of bytesArr){
      const doc=await PDFLib.PDFDocument.load(bytes);
      const pages=await merged.copyPages(doc,doc.getPageIndices());
      pages.forEach(p=>merged.addPage(p));
    }
    return merged.save();
  }
  async function rotatePage(srcBytes,pageIdx,degrees){
    const doc=await PDFLib.PDFDocument.load(srcBytes);
    const page=doc.getPage(pageIdx);
    const cur=page.getRotation().angle;
    page.setRotation(PDFLib.degrees(cur+degrees));
    return doc.save();
  }
  async function addWatermark(srcBytes,text,opts={}){
    const doc=await PDFLib.PDFDocument.load(srcBytes);
    const font=await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    const pages=doc.getPages();
    const fontSize=opts.fontSize||48;const opacity=opts.opacity||0.15;const color=opts.color||PDFLib.rgb(0.5,0.5,0.5);
    for(const page of pages){
      const{width,height}=page.getSize();
      page.drawText(text,{x:width/2-font.widthOfTextAtSize(text,fontSize)/2,y:height/2,size:fontSize,font,color,opacity,rotate:PDFLib.degrees(-45)});
    }
    return doc.save();
  }
  async function addPageNumbers(srcBytes,opts={}){
    const doc=await PDFLib.PDFDocument.load(srcBytes);
    const font=await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    const pages=doc.getPages();
    const fontSize=opts.fontSize||10;
    pages.forEach((page,i)=>{
      const{width}=page.getSize();
      page.drawText(`${i+1} / ${pages.length}`,{x:width/2-20,y:20,size:fontSize,font,color:PDFLib.rgb(0.4,0.4,0.4)});
    });
    return doc.save();
  }
  async function deletePages(srcBytes,indicesToRemove){
    const src=await PDFLib.PDFDocument.load(srcBytes);
    const all=src.getPageIndices();
    const keep=all.filter(i=>!indicesToRemove.includes(i));
    return splitPages(srcBytes,keep);
  }
  async function reorderPages(srcBytes,newOrder){
    return splitPages(srcBytes,newOrder);
  }
  return{loadPdfJS,renderPageToCanvas,renderThumb,extractText,extractAllText,getMetadata,loadPdfLib,splitPages,mergeDocuments,rotatePage,addWatermark,addPageNumbers,deletePages,reorderPages};
})();
