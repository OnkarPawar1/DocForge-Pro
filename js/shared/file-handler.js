/* DocForge - File Handler */
window.DocForge=window.DocForge||{};
DocForge.FileHandler=(function(){
  function setupDropZone(el,opts){
    const accept=opts.accept||'*';const maxSize=opts.maxSize||200*1024*1024;const onFile=opts.onFile;const multiple=opts.multiple||false;
    el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('dragover');});
    el.addEventListener('dragleave',()=>el.classList.remove('dragover'));
    el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('dragover');handleFiles(e.dataTransfer.files);});
    const input=el.querySelector('input[type="file"]');
    if(input){input.addEventListener('change',e=>handleFiles(e.target.files));}
    function handleFiles(files){
      if(!files||!files.length)return;
      const arr=Array.from(files);
      for(const f of arr){
        if(f.size>maxSize){DocForge.UI.toast(`File "${f.name}" exceeds ${formatSize(maxSize)} limit`,'error');continue;}
        if(accept!=='*'){
          const parts=accept.split(',').map(s=>s.trim().toLowerCase());
          const ext='.'+f.name.split('.').pop().toLowerCase();
          const ftype=(f.type||'').toLowerCase();
          let ok=false;
          for(const p of parts){
            if(p.startsWith('.')){if(ext===p){ok=true;break;}}
            else if(p.includes('/')){
              if(p.includes('*')){const prefix=p.split('/')[0];if(ftype.startsWith(prefix+'/')){ok=true;break;}}
              else if(ftype===p){ok=true;break;}
            }
            else{ok=true;break;}
          }
          if(!ok){DocForge.UI.toast(`"${f.name}" is not a supported format`,'error');continue;}
        }
        if(onFile)onFile(f);
        if(!multiple)break;
      }
    }
  }
  function readAsArrayBuffer(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsArrayBuffer(file);})}
  function readAsDataURL(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);})}
  function readAsText(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsText(file);})}
  function formatSize(bytes){if(bytes===0)return '0 B';const k=1024;const sizes=['B','KB','MB','GB'];const i=Math.floor(Math.log(bytes)/Math.log(k));return parseFloat((bytes/Math.pow(k,i)).toFixed(1))+' '+sizes[i];}
  function downloadBlob(blob,name){saveAs(blob,name);}
  function downloadDataURL(dataUrl,name){const a=document.createElement('a');a.href=dataUrl;a.download=name;a.click();}
  async function downloadAsZip(files,zipName){
    const zip=new JSZip();
    for(const f of files){zip.file(f.name,f.data);}
    const blob=await zip.generateAsync({type:'blob'});
    saveAs(blob,zipName);
  }
  return{setupDropZone,readAsArrayBuffer,readAsDataURL,readAsText,formatSize,downloadBlob,downloadDataURL,downloadAsZip};
})();
