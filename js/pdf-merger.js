/* DocForge - PDF Merger */
window.DocForge=window.DocForge||{};
DocForge.PdfMerger=(function(){
  let files=[];
  function render(c){
    c.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">🔗</span>PDF Merger<span class="feature-badge">6 features</span></h1><p class="tool-description">Combine multiple PDFs into one. Drag to reorder files before merging.</p></div>
    <div class="upload-zone" id="mg-upload"><div class="upload-zone-icon">🔗</div><div class="upload-zone-title">Drop PDFs here (multiple allowed)</div><div class="upload-zone-subtitle">Add 2 or more PDF files</div><input type="file" accept=".pdf" multiple></div>
    <div id="mg-fileList" class="merger-files" style="margin-top:var(--space-lg)"></div>
    <div class="action-bar" id="mg-actions" style="display:none"><button class="btn btn-primary" id="mg-merge">🔗 Merge All</button><button class="btn btn-secondary" id="mg-clear">Clear All</button><span style="font-size:var(--fs-sm);color:var(--text-secondary)" id="mg-count"></span></div>`;
    init(c);
  }
  function init(c){
    DocForge.FileHandler.setupDropZone(c.querySelector('#mg-upload'),{accept:'.pdf',multiple:true,onFile:addFile});
    c.querySelector('#mg-merge').onclick=mergeAll;
    c.querySelector('#mg-clear').onclick=()=>{files=[];renderList();};
  }
  function addFile(file){
    DocForge.FileHandler.readAsArrayBuffer(file).then(buf=>{
      files.push({name:file.name,size:file.size,data:new Uint8Array(buf)});
      renderList();DocForge.UI.toast(`Added "${file.name}"`,'success');
    });
  }
  function renderList(){
    const list=document.getElementById('mg-fileList');list.innerHTML='';
    const actions=document.getElementById('mg-actions');
    if(files.length===0){actions.style.display='none';return;}
    actions.style.display='flex';
    document.getElementById('mg-count').textContent=`${files.length} file(s)`;
    files.forEach((f,i)=>{
      const item=document.createElement('div');item.className='merger-file-item';item.draggable=true;item.dataset.idx=i;
      item.innerHTML=`<span class="merger-drag-handle">⠿</span><span style="flex:1"><strong>${f.name}</strong><br><span style="font-size:var(--fs-xs);color:var(--text-secondary)">${DocForge.FileHandler.formatSize(f.size)}</span></span><button class="btn btn-sm btn-ghost" data-action="up">▲</button><button class="btn btn-sm btn-ghost" data-action="down">▼</button><button class="btn btn-sm btn-ghost" data-action="remove">✕</button>`;
      item.querySelector('[data-action="up"]').onclick=()=>{if(i>0){[files[i-1],files[i]]=[files[i],files[i-1]];renderList();}};
      item.querySelector('[data-action="down"]').onclick=()=>{if(i<files.length-1){[files[i],files[i+1]]=[files[i+1],files[i]];renderList();}};
      item.querySelector('[data-action="remove"]').onclick=()=>{files.splice(i,1);renderList();};
      item.ondragstart=e=>{e.dataTransfer.setData('text/plain',i);item.classList.add('dragging');};
      item.ondragend=()=>item.classList.remove('dragging');
      item.ondragover=e=>e.preventDefault();
      item.ondrop=e=>{e.preventDefault();const from=parseInt(e.dataTransfer.getData('text/plain'));const to=i;if(from!==to){const el=files.splice(from,1)[0];files.splice(to,0,el);renderList();}};
      list.appendChild(item);
    });
  }
  async function mergeAll(){
    if(files.length<2){DocForge.UI.toast('Add at least 2 PDFs','info');return;}
    DocForge.UI.toast('Merging...','info');
    try{
      const merged=await DocForge.PDFUtils.mergeDocuments(files.map(f=>f.data));
      DocForge.FileHandler.downloadBlob(new Blob([merged],{type:'application/pdf'}),'merged.pdf');
      DocForge.UI.toast('Merged successfully!','success');
    }catch(e){DocForge.UI.toast('Merge failed: '+e.message,'error');}
  }
  function destroy(){files=[];}
  return{render,destroy};
})();
