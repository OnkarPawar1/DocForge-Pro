/* DocForge - Notepad Pro */
window.DocForge=window.DocForge||{};
DocForge.Notepad=(function(){
  const STORAGE_KEY='docforge_notepad';
  function render(c){
    c.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">📝</span>Notepad Pro<span class="feature-badge">25+ features</span></h1><p class="tool-description">Advanced rich text editor with formatting, images, download as PDF/TXT, and auto-save.</p></div>
    <div class="notepad-container">
      <div class="notepad-toolbar" id="np-toolbar">
        <select class="toolbar-select" id="np-fontFamily" title="Font Family">
          <option value="Inter">Inter</option><option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Times New Roman">Times New Roman</option><option value="Courier New">Courier New</option><option value="Verdana">Verdana</option><option value="Trebuchet MS">Trebuchet MS</option><option value="Comic Sans MS">Comic Sans</option><option value="Impact">Impact</option>
        </select>
        <select class="toolbar-select" id="np-fontSize" title="Font Size">
          <option value="1">8px</option><option value="2">10px</option><option value="3" selected>12px</option><option value="4">14px</option><option value="5">18px</option><option value="6">24px</option><option value="7">36px</option>
        </select>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn" data-cmd="bold" title="Bold (Ctrl+B)"><b>B</b></button>
        <button class="toolbar-btn" data-cmd="italic" title="Italic (Ctrl+I)"><i>I</i></button>
        <button class="toolbar-btn" data-cmd="underline" title="Underline (Ctrl+U)"><u>U</u></button>
        <button class="toolbar-btn" data-cmd="strikeThrough" title="Strikethrough"><s>S</s></button>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn" data-cmd="superscript" title="Superscript">X²</button>
        <button class="toolbar-btn" data-cmd="subscript" title="Subscript">X₂</button>
        <div class="toolbar-separator"></div>
        <input type="color" class="toolbar-color" id="np-textColor" value="#f1f5f9" title="Text Color">
        <input type="color" class="toolbar-color" id="np-bgColor" value="#7c3aed" title="Highlight Color">
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn" data-cmd="justifyLeft" title="Align Left">⫷</button>
        <button class="toolbar-btn" data-cmd="justifyCenter" title="Center">☰</button>
        <button class="toolbar-btn" data-cmd="justifyRight" title="Align Right">⫸</button>
        <button class="toolbar-btn" data-cmd="justifyFull" title="Justify">≡</button>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn" data-cmd="insertUnorderedList" title="Bullet List">•≡</button>
        <button class="toolbar-btn" data-cmd="insertOrderedList" title="Numbered List">1≡</button>
        <button class="toolbar-btn" data-cmd="indent" title="Indent">→≡</button>
        <button class="toolbar-btn" data-cmd="outdent" title="Outdent">←≡</button>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn" id="np-insertImg" title="Insert Image">🖼️</button>
        <button class="toolbar-btn" id="np-insertLink" title="Insert Link">🔗</button>
        <button class="toolbar-btn" id="np-insertHR" title="Horizontal Rule">─</button>
        <button class="toolbar-btn" id="np-insertTable" title="Insert Table">⊞</button>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn" data-cmd="removeFormat" title="Clear Formatting">🚫</button>
        <button class="toolbar-btn" data-cmd="undo" title="Undo (Ctrl+Z)">↩</button>
        <button class="toolbar-btn" data-cmd="redo" title="Redo (Ctrl+Y)">↪</button>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn" id="np-find" title="Find & Replace">🔍</button>
        <button class="toolbar-btn" id="np-print" title="Print">🖨️</button>
        <button class="toolbar-btn" id="np-fullscreen" title="Fullscreen">⛶</button>
        <div class="toolbar-separator"></div>
        <select class="toolbar-select" id="np-heading" title="Heading">
          <option value="">Normal</option><option value="H1">H1</option><option value="H2">H2</option><option value="H3">H3</option><option value="H4">H4</option><option value="H5">H5</option><option value="H6">H6</option>
          <option value="PRE">Code Block</option><option value="BLOCKQUOTE">Quote</option>
        </select>
      </div>
      <div class="notepad-editor" id="np-editor" contenteditable="true" spellcheck="true"></div>
      <div class="notepad-statusbar">
        <div><span id="np-wordCount">0 words</span> · <span id="np-charCount">0 chars</span> · <span id="np-lineCount">0 lines</span></div>
        <div style="display:flex;gap:var(--space-sm);align-items:center">
          <span id="np-saved" style="color:var(--accent-emerald)">💾 Saved</span>
          <button class="btn btn-sm btn-secondary" id="np-downloadPdf">📄 PDF</button>
          <button class="btn btn-sm btn-secondary" id="np-downloadTxt">📃 TXT</button>
          <button class="btn btn-sm btn-secondary" id="np-downloadHtml">🌐 HTML</button>
          <button class="btn btn-sm btn-ghost" id="np-clear">🗑️ Clear</button>
        </div>
      </div>
    </div>
    <div id="np-findDialog" class="hidden" style="position:fixed;top:80px;right:30px;z-index:200;background:var(--bg-secondary);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-md);box-shadow:var(--shadow-lg)">
      <div style="display:flex;gap:var(--space-sm);margin-bottom:var(--space-sm)"><input class="form-input" id="np-findInput" placeholder="Find..." style="width:180px"><button class="btn btn-sm btn-ghost" id="np-findNext">Next</button></div>
      <div style="display:flex;gap:var(--space-sm)"><input class="form-input" id="np-replaceInput" placeholder="Replace..." style="width:180px"><button class="btn btn-sm btn-ghost" id="np-replaceBtn">Replace</button><button class="btn btn-sm btn-ghost" id="np-replaceAll">All</button><button class="btn btn-sm btn-ghost" id="np-findClose">✕</button></div>
    </div>`;
    init(c);
  }
  function init(c){
    const editor=document.getElementById('np-editor');
    // Load saved content
    const saved=localStorage.getItem(STORAGE_KEY);if(saved)editor.innerHTML=saved;
    // Toolbar commands
    c.querySelectorAll('[data-cmd]').forEach(btn=>{btn.onclick=()=>{document.execCommand(btn.dataset.cmd,false,null);editor.focus();}});
    // Font
    document.getElementById('np-fontFamily').onchange=e=>{document.execCommand('fontName',false,e.target.value);editor.focus();};
    document.getElementById('np-fontSize').onchange=e=>{document.execCommand('fontSize',false,e.target.value);editor.focus();};
    document.getElementById('np-textColor').oninput=e=>{document.execCommand('foreColor',false,e.target.value);editor.focus();};
    document.getElementById('np-bgColor').oninput=e=>{document.execCommand('hiliteColor',false,e.target.value);editor.focus();};
    document.getElementById('np-heading').onchange=e=>{if(e.target.value)document.execCommand('formatBlock',false,e.target.value);else document.execCommand('removeFormat',false,null);editor.focus();e.target.value='';};
    // Insert
    document.getElementById('np-insertImg').onclick=insertImage;
    document.getElementById('np-insertLink').onclick=insertLink;
    document.getElementById('np-insertHR').onclick=()=>{document.execCommand('insertHTML',false,'<hr>');editor.focus();};
    document.getElementById('np-insertTable').onclick=insertTable;
    // Find
    document.getElementById('np-find').onclick=()=>document.getElementById('np-findDialog').classList.toggle('hidden');
    document.getElementById('np-findClose').onclick=()=>document.getElementById('np-findDialog').classList.add('hidden');
    document.getElementById('np-findNext').onclick=()=>{const q=document.getElementById('np-findInput').value;if(q)window.find(q);};
    document.getElementById('np-replaceBtn').onclick=replaceText;
    document.getElementById('np-replaceAll').onclick=replaceAllText;
    // Downloads
    document.getElementById('np-downloadPdf').onclick=downloadPdf;
    document.getElementById('np-downloadTxt').onclick=downloadTxt;
    document.getElementById('np-downloadHtml').onclick=downloadHtml;
    document.getElementById('np-clear').onclick=async()=>{if(await DocForge.UI.confirm('Clear Notepad','Are you sure? This will clear all content.')){editor.innerHTML='';saveContent();}};
    document.getElementById('np-print').onclick=()=>{const w=window.open();w.document.write('<html><head><title>Notepad</title></head><body>'+editor.innerHTML+'</body></html>');w.document.close();w.print();};
    document.getElementById('np-fullscreen').onclick=()=>{const el=c.querySelector('.notepad-container');if(!document.fullscreenElement)el.requestFullscreen?.();else document.exitFullscreen?.();};
    // Auto-save & stats
    editor.oninput=()=>{updateStats();saveContentDebounced();};
    updateStats();
  }
  let saveTimer=null;
  function saveContentDebounced(){clearTimeout(saveTimer);document.getElementById('np-saved').textContent='✏️ Editing...';document.getElementById('np-saved').style.color='var(--accent-amber)';saveTimer=setTimeout(saveContent,1000);}
  function saveContent(){const editor=document.getElementById('np-editor');localStorage.setItem(STORAGE_KEY,editor.innerHTML);document.getElementById('np-saved').textContent='💾 Saved';document.getElementById('np-saved').style.color='var(--accent-emerald)';}
  function updateStats(){
    const editor=document.getElementById('np-editor');const text=editor.innerText||'';
    const words=text.trim().split(/\s+/).filter(w=>w.length>0).length;
    const chars=text.length;const lines=text.split('\n').length;
    document.getElementById('np-wordCount').textContent=words+' words';
    document.getElementById('np-charCount').textContent=chars+' chars';
    document.getElementById('np-lineCount').textContent=lines+' lines';
  }
  function insertImage(){
    const input=document.createElement('input');input.type='file';input.accept='image/*';
    input.onchange=e=>{
      const file=e.target.files[0];if(!file)return;
      const reader=new FileReader();reader.onload=ev=>{
        document.execCommand('insertHTML',false,`<img src="${ev.target.result}" style="max-width:100%;border-radius:8px;margin:8px 0">`);
        saveContent();
      };reader.readAsDataURL(file);
    };input.click();
  }
  async function insertLink(){
    const url=await DocForge.UI.prompt('Enter URL');
    if(url){document.execCommand('createLink',false,url);document.getElementById('np-editor').focus();}
  }
  function insertTable(){
    const html='<table style="width:100%;border-collapse:collapse;margin:8px 0"><tr><td style="border:1px solid var(--border-hover);padding:8px">Cell 1</td><td style="border:1px solid var(--border-hover);padding:8px">Cell 2</td><td style="border:1px solid var(--border-hover);padding:8px">Cell 3</td></tr><tr><td style="border:1px solid var(--border-hover);padding:8px">Cell 4</td><td style="border:1px solid var(--border-hover);padding:8px">Cell 5</td><td style="border:1px solid var(--border-hover);padding:8px">Cell 6</td></tr></table>';
    document.execCommand('insertHTML',false,html);
  }
  function replaceText(){
    const find=document.getElementById('np-findInput').value;const replace=document.getElementById('np-replaceInput').value;
    const editor=document.getElementById('np-editor');
    if(window.find(find)){document.execCommand('insertText',false,replace);saveContent();}
  }
  function replaceAllText(){
    const find=document.getElementById('np-findInput').value;const replace=document.getElementById('np-replaceInput').value;
    const editor=document.getElementById('np-editor');
    editor.innerHTML=editor.innerHTML.split(find).join(replace);saveContent();
    DocForge.UI.toast('Replaced all occurrences','success');
  }
  function downloadPdf(){
    const editor=document.getElementById('np-editor');
    const div=document.createElement('div');div.innerHTML=editor.innerHTML;
    div.style.cssText='width:550px;padding:30px;font-family:Arial,sans-serif;background:#fff;color:#000;position:absolute;left:-9999px;';
    document.body.appendChild(div);
    html2canvas(div,{scale:2}).then(canvas=>{
      document.body.removeChild(div);
      const{jsPDF}=window.jspdf;const doc=new jsPDF();
      const w=doc.internal.pageSize.getWidth();const h=doc.internal.pageSize.getHeight();
      const ratio=w/canvas.width;const imgH=canvas.height*ratio;
      let y=0;let page=0;
      while(y<canvas.height){
        if(page>0)doc.addPage();
        const pageCanvas=document.createElement('canvas');pageCanvas.width=canvas.width;pageCanvas.height=Math.min(canvas.height-y,canvas.width*(h/w));
        pageCanvas.getContext('2d').drawImage(canvas,0,-y);
        doc.addImage(pageCanvas.toDataURL(),'PNG',0,0,w,h);
        y+=pageCanvas.height;page++;
      }
      doc.save('notepad.pdf');DocForge.UI.toast('Saved as PDF!','success');
    });
  }
  function downloadTxt(){
    const text=document.getElementById('np-editor').innerText;
    const blob=new Blob([text],{type:'text/plain'});saveAs(blob,'notepad.txt');
    DocForge.UI.toast('Saved as TXT!','success');
  }
  function downloadHtml(){
    const html='<!DOCTYPE html><html><head><meta charset="utf-8"><title>Notepad</title></head><body>'+document.getElementById('np-editor').innerHTML+'</body></html>';
    const blob=new Blob([html],{type:'text/html'});saveAs(blob,'notepad.html');
    DocForge.UI.toast('Saved as HTML!','success');
  }
  function destroy(){clearTimeout(saveTimer);saveContent();}
  return{render,destroy};
})();
