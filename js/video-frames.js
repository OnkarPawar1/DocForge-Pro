/* DocForge - Video to Frames */
window.DocForge=window.DocForge||{};
DocForge.VideoFrames=(function(){
  let videoFile=null,frames=[];
  function render(c){
    c.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">🎬</span>Video to Frames<span class="feature-badge">10 features</span></h1><p class="tool-description">Extract high-quality frames from videos at custom intervals. Hide duplicates automatically.</p></div>
    <div id="vf-upload" class="upload-zone"><div class="upload-zone-icon">🎬</div><div class="upload-zone-title">Drop video here or click to upload</div><div class="upload-zone-subtitle">MP4, WebM, Ogg (Max 200MB recommended)</div><input type="file" accept=".mp4,.webm,.ogg,video/*"></div>
    <div id="vf-main" class="hidden">
      <div class="video-preview"><video id="vf-video" controls></video></div>
      <div class="options-panel"><div class="options-grid">
        <div class="form-group"><label class="form-label">Interval</label><div style="display:flex;align-items:center;gap:var(--space-sm)"><input class="form-input" id="vf-interval" type="number" min="1" max="300" value="10" style="width:80px"><span style="font-size:var(--fs-sm);color:var(--text-secondary)">seconds</span></div></div>
        <div class="form-group"><label class="form-label">Output Format</label><select class="form-select" id="vf-format"><option value="image/jpeg">JPEG (smaller)</option><option value="image/png">PNG (lossless)</option></select></div>
        <div class="form-group"><label class="form-label">Quality</label><select class="form-select" id="vf-quality"><option value="0.95">High (95%)</option><option value="0.8">Medium (80%)</option><option value="0.6">Low (60%)</option></select></div>
        <div class="form-group"><label class="form-check"><input type="checkbox" id="vf-hideDups"> Hide Duplicates (by visual similarity)</label></div>
      </div></div>
      <div class="action-bar">
        <button class="btn btn-primary" id="vf-start">🎬 Start Extraction</button>
        <button class="btn btn-secondary" id="vf-downloadAll">📥 Download All (ZIP)</button>
        <button class="btn btn-secondary" id="vf-toPdf">📄 Frames to PDF</button>
        <span id="vf-status" style="font-size:var(--fs-sm);color:var(--text-secondary)">Ready</span>
      </div>
      <div id="vf-progressWrap" class="hidden" style="margin:var(--space-md) 0"></div>
      <div id="vf-gallery" class="frames-gallery" style="margin-top:var(--space-lg)"></div>
    </div>`;
    init(c);
  }
  function init(c){
    DocForge.FileHandler.setupDropZone(c.querySelector('#vf-upload'),{accept:'.mp4,.webm,.ogg,video/*',maxSize:200*1024*1024,onFile:loadVideo});
    c.querySelector('#vf-start').onclick=startExtraction;
    c.querySelector('#vf-downloadAll').onclick=downloadAll;
    c.querySelector('#vf-toPdf').onclick=framesToPdf;
  }
  function loadVideo(file){
    videoFile=file;
    const video=document.getElementById('vf-video');
    video.src=URL.createObjectURL(file);
    document.getElementById('vf-upload').classList.add('hidden');
    document.getElementById('vf-main').classList.remove('hidden');
    DocForge.UI.toast(`Loaded "${file.name}"`,'success');
  }
  async function startExtraction(){
    const video=document.getElementById('vf-video');
    if(!video.src)return;
    frames=[];
    const gallery=document.getElementById('vf-gallery');gallery.innerHTML='';
    const interval=parseFloat(document.getElementById('vf-interval').value)||10;
    const format=document.getElementById('vf-format').value;
    const quality=parseFloat(document.getElementById('vf-quality').value);
    const hideDups=document.getElementById('vf-hideDups').checked;
    const progressWrap=document.getElementById('vf-progressWrap');progressWrap.classList.remove('hidden');
    const progress=DocForge.UI.createProgress(progressWrap);
    const status=document.getElementById('vf-status');
    await new Promise(r=>{video.onloadedmetadata=r;if(video.readyState>=1)r();});
    const duration=video.duration;
    const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;
    const ctx=canvas.getContext('2d');
    let currentTime=0;let prevData=null;let idx=0;
    status.textContent='Extracting...';
    async function captureFrame(){
      return new Promise(resolve=>{
        video.currentTime=currentTime;
        video.onseeked=()=>{
          ctx.drawImage(video,0,0);
          const dataUrl=canvas.toDataURL(format,quality);
          let isDup=false;
          if(hideDups&&prevData){isDup=compareFrames(prevData,dataUrl);}
          if(!isDup){
            const ext=format==='image/png'?'png':'jpg';
            const timeStr=formatTime(currentTime);
            frames.push({name:`frame_${String(idx+1).padStart(4,'0')}_${timeStr}.${ext}`,dataUrl,time:currentTime});
            addFrameToGallery(frames.length-1,timeStr);
            prevData=dataUrl;idx++;
          }
          currentTime+=interval;
          progress.set((currentTime/duration)*100);
          status.textContent=`Extracting... ${Math.round((currentTime/duration)*100)}%`;
          if(currentTime<=duration){setTimeout(()=>captureFrame().then(resolve),50);}
          else{resolve();}
        };
      });
    }
    await captureFrame();
    status.textContent=`Done! ${frames.length} frames extracted`;
    progress.set(100);
    DocForge.UI.toast(`Extracted ${frames.length} frames!`,'success');
  }
  function compareFrames(a,b){
    if(a.length!==b.length)return false;
    const lenCheck=Math.abs(a.length-b.length)/Math.max(a.length,1);
    return lenCheck<0.02;
  }
  function addFrameToGallery(idx,timeStr){
    const gallery=document.getElementById('vf-gallery');
    const item=document.createElement('div');item.className='frame-item';item.style.animation='fadeIn .3s ease';
    item.innerHTML=`<img src="${frames[idx].dataUrl}" alt="Frame at ${timeStr}"><div class="frame-item-overlay"><span class="frame-item-time">⏱ ${timeStr}</span></div>`;
    item.onclick=()=>DocForge.FileHandler.downloadDataURL(frames[idx].dataUrl,frames[idx].name);
    gallery.appendChild(item);
  }
  function formatTime(s){const m=Math.floor(s/60);const sec=Math.floor(s%60);return `${String(m).padStart(2,'0')}m${String(sec).padStart(2,'0')}s`;}
  async function downloadAll(){
    if(!frames.length){DocForge.UI.toast('Extract frames first','info');return;}
    const files=frames.map(f=>{const d=atob(f.dataUrl.split(',')[1]);const arr=new Uint8Array(d.length);for(let i=0;i<d.length;i++)arr[i]=d.charCodeAt(i);return{name:f.name,data:arr};});
    await DocForge.FileHandler.downloadAsZip(files,'video_frames.zip');
    DocForge.UI.toast('Downloaded ZIP!','success');
  }
  async function framesToPdf(){
    if(!frames.length){DocForge.UI.toast('Extract frames first','info');return;}
    const{jsPDF}=window.jspdf;
    const doc=new jsPDF({orientation:'landscape'});
    for(let i=0;i<frames.length;i++){
      if(i>0)doc.addPage();
      const img=new Image();img.src=frames[i].dataUrl;
      await new Promise(r=>{img.onload=r;});
      const w=doc.internal.pageSize.getWidth();const h=doc.internal.pageSize.getHeight();
      const ratio=Math.min(w/img.width,h/img.height);
      const iw=img.width*ratio;const ih=img.height*ratio;
      doc.addImage(frames[i].dataUrl,'JPEG',(w-iw)/2,(h-ih)/2,iw,ih);
    }
    doc.save('video_frames.pdf');
    DocForge.UI.toast('Saved frames as PDF!','success');
  }
  function destroy(){videoFile=null;frames=[];const v=document.getElementById('vf-video');if(v&&v.src)URL.revokeObjectURL(v.src);}
  return{render,destroy};
})();
