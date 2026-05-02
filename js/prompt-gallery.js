/* DocForge - Prompt Gallery */
window.DocForge=window.DocForge||{};
DocForge.PromptGallery=(function(){
  const STORAGE_KEY='docforge_prompts';
  const COLORS=['#7c3aed','#06b6d4','#f59e0b','#10b981','#f43f5e','#3b82f6','#ec4899','#8b5cf6','#14b8a6','#f97316'];
  const BG_COLORS=['rgba(124,58,237,.15)','rgba(6,182,212,.15)','rgba(245,158,11,.15)','rgba(16,185,129,.15)','rgba(244,63,94,.15)','rgba(59,130,246,.15)','rgba(236,72,153,.15)','rgba(139,92,246,.15)','rgba(20,184,166,.15)','rgba(249,115,22,.15)'];
  function getPrompts(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[];}catch(e){return[];}}
  function savePrompts(prompts){localStorage.setItem(STORAGE_KEY,JSON.stringify(prompts));}
  function render(c){
    const prompts=getPrompts();
    c.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">💡</span>Prompt Gallery<span class="feature-badge">${prompts.length} prompts</span></h1><p class="tool-description">Save, organize, and reuse your favorite prompts. Stored locally in your browser.</p></div>
    <div class="prompt-gallery-header">
      <div style="display:flex;gap:var(--space-sm);align-items:center;flex-wrap:wrap">
        <button class="btn btn-primary" id="pg-add">➕ New Prompt</button>
        <button class="btn btn-secondary" id="pg-export">📤 Export</button>
        <button class="btn btn-secondary" id="pg-import">📥 Import</button>
        <input type="file" id="pg-importFile" accept=".json" style="display:none">
      </div>
      <div class="prompt-search"><input class="form-input" id="pg-search" placeholder="🔍 Search prompts..."></div>
    </div>
    <div style="display:flex;gap:var(--space-sm);margin-bottom:var(--space-lg);flex-wrap:wrap">
      <button class="btn btn-sm btn-ghost pg-filter active" data-filter="all">All</button>
      <button class="btn btn-sm btn-ghost pg-filter" data-filter="pinned">📌 Pinned</button>
      ${[...new Set(prompts.map(p=>p.category).filter(Boolean))].map(cat=>`<button class="btn btn-sm btn-ghost pg-filter" data-filter="${cat}">${cat}</button>`).join('')}
    </div>
    <div id="pg-grid" class="prompt-grid"></div>
    <div id="pg-modal" class="modal-overlay">
      <div class="modal" style="max-width:600px">
        <div class="modal-header"><h3 class="modal-title" id="pg-modalTitle">New Prompt</h3><button class="modal-close" id="pg-modalClose">✕</button></div>
        <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="pg-title" placeholder="Prompt title..."></div>
        <div class="form-group"><label class="form-label">Prompt Content</label><textarea class="form-textarea" id="pg-content" rows="6" placeholder="Your prompt text here..."></textarea></div>
        <div class="form-group"><label class="form-label">Category</label><input class="form-input" id="pg-category" placeholder="e.g. Coding, Writing, Creative..."></div>
        <div class="form-group"><label class="form-label">Tags (comma separated)</label><input class="form-input" id="pg-tags" placeholder="tag1, tag2, tag3"></div>
        <div class="form-group"><label class="form-label">Color</label>
          <div class="prompt-colors" id="pg-colors">${COLORS.map((c,i)=>`<div class="prompt-color-dot${i===0?' active':''}" style="background:${c}" data-color="${i}"></div>`).join('')}</div>
        </div>
        <div style="display:flex;gap:var(--space-sm);justify-content:flex-end;margin-top:var(--space-lg)"><button class="btn btn-secondary" id="pg-cancel">Cancel</button><button class="btn btn-primary" id="pg-save">💾 Save</button></div>
      </div>
    </div>`;
    init(c);renderGrid(prompts);
  }
  let editId=null,selectedColor=0;
  function init(c){
    document.getElementById('pg-add').onclick=()=>openModal(null);
    document.getElementById('pg-export').onclick=exportPrompts;
    document.getElementById('pg-import').onclick=()=>document.getElementById('pg-importFile').click();
    document.getElementById('pg-importFile').onchange=importPrompts;
    document.getElementById('pg-search').oninput=e=>filterPrompts(e.target.value);
    document.getElementById('pg-modalClose').onclick=closeModal;
    document.getElementById('pg-cancel').onclick=closeModal;
    document.getElementById('pg-save').onclick=savePrompt;
    document.querySelectorAll('.pg-filter').forEach(btn=>btn.onclick=()=>{
      document.querySelectorAll('.pg-filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
      filterByCategory(btn.dataset.filter);
    });
    document.querySelectorAll('#pg-colors .prompt-color-dot').forEach(dot=>dot.onclick=()=>{
      document.querySelectorAll('#pg-colors .prompt-color-dot').forEach(d=>d.classList.remove('active'));dot.classList.add('active');
      selectedColor=parseInt(dot.dataset.color);
    });
  }
  function renderGrid(prompts){
    const grid=document.getElementById('pg-grid');grid.innerHTML='';
    if(!prompts.length){grid.innerHTML='<div class="empty-state"><div class="empty-state-icon">💡</div><div class="empty-state-title">No prompts yet</div><p style="color:var(--text-tertiary)">Click "New Prompt" to create your first one!</p></div>';return;}
    prompts.forEach(p=>{
      const note=document.createElement('div');note.className='sticky-note';note.style.animation='fadeIn .3s ease';
      const ci=p.colorIndex||0;note.style.background=BG_COLORS[ci];note.style.borderLeft=`4px solid ${COLORS[ci]}`;note.style.color='var(--text-primary)';
      note.innerHTML=`
        <div class="sticky-note-actions">
          ${p.pinned?'<button class="sticky-note-btn" data-action="unpin" title="Unpin">📌</button>':'<button class="sticky-note-btn" data-action="pin" title="Pin">📍</button>'}
          <button class="sticky-note-btn" data-action="copy" title="Copy">📋</button>
          <button class="sticky-note-btn" data-action="edit" title="Edit">✏️</button>
          <button class="sticky-note-btn" data-action="delete" title="Delete">🗑️</button>
        </div>
        <div style="font-weight:700;margin-bottom:var(--space-xs);font-size:var(--fs-base)">${p.pinned?'📌 ':''}${escapeHtml(p.title||'Untitled')}</div>
        <div style="font-size:var(--fs-sm);opacity:.85;line-height:1.6;max-height:120px;overflow:hidden">${escapeHtml(p.content||'').substring(0,200)}${(p.content||'').length>200?'...':''}</div>
        <div style="margin-top:var(--space-sm);display:flex;gap:4px;flex-wrap:wrap">
          ${p.category?`<span class="badge" style="background:${COLORS[ci]}22;color:${COLORS[ci]}">${escapeHtml(p.category)}</span>`:''}
          ${(p.tags||[]).map(t=>`<span class="badge badge-violet" style="font-size:9px">${escapeHtml(t)}</span>`).join('')}
        </div>
        <div style="font-size:9px;color:var(--text-muted);margin-top:var(--space-sm)">${new Date(p.created).toLocaleDateString()}</div>`;
      note.querySelector('[data-action="copy"]').onclick=e=>{e.stopPropagation();navigator.clipboard.writeText(p.content);DocForge.UI.toast('Copied to clipboard!','success');};
      note.querySelector('[data-action="edit"]').onclick=e=>{e.stopPropagation();openModal(p);};
      note.querySelector('[data-action="delete"]').onclick=async e=>{e.stopPropagation();if(await DocForge.UI.confirm('Delete Prompt','Delete "'+escapeHtml(p.title)+'"?')){deletePrompt(p.id);}};
      const pinBtn=note.querySelector('[data-action="pin"],[data-action="unpin"]');
      pinBtn.onclick=e=>{e.stopPropagation();togglePin(p.id);};
      note.onclick=()=>{navigator.clipboard.writeText(p.content);DocForge.UI.toast('Prompt copied!','success');};
      grid.appendChild(note);
    });
  }
  function openModal(prompt){
    editId=prompt?prompt.id:null;
    document.getElementById('pg-modalTitle').textContent=prompt?'Edit Prompt':'New Prompt';
    document.getElementById('pg-title').value=prompt?prompt.title:'';
    document.getElementById('pg-content').value=prompt?prompt.content:'';
    document.getElementById('pg-category').value=prompt?prompt.category:'';
    document.getElementById('pg-tags').value=prompt?(prompt.tags||[]).join(', '):'';
    selectedColor=prompt?prompt.colorIndex||0:Math.floor(Math.random()*COLORS.length);
    document.querySelectorAll('#pg-colors .prompt-color-dot').forEach(d=>{d.classList.toggle('active',parseInt(d.dataset.color)===selectedColor);});
    document.getElementById('pg-modal').classList.add('active');
  }
  function closeModal(){document.getElementById('pg-modal').classList.remove('active');editId=null;}
  function savePrompt(){
    const title=document.getElementById('pg-title').value.trim();const content=document.getElementById('pg-content').value.trim();
    const category=document.getElementById('pg-category').value.trim();const tags=document.getElementById('pg-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
    if(!content){DocForge.UI.toast('Please enter prompt content','info');return;}
    const prompts=getPrompts();
    if(editId){
      const idx=prompts.findIndex(p=>p.id===editId);
      if(idx!==-1){prompts[idx]={...prompts[idx],title,content,category,tags,colorIndex:selectedColor,modified:Date.now()};}
    }else{
      prompts.unshift({id:Date.now().toString(36)+Math.random().toString(36).substr(2,5),title:title||'Untitled',content,category,tags,colorIndex:selectedColor,pinned:false,created:Date.now(),modified:Date.now()});
    }
    savePrompts(prompts);closeModal();renderGrid(sortPrompts(prompts));
    updateBadge(prompts.length);DocForge.UI.toast(editId?'Prompt updated!':'Prompt saved!','success');
  }
  function deletePrompt(id){
    let prompts=getPrompts().filter(p=>p.id!==id);
    savePrompts(prompts);renderGrid(sortPrompts(prompts));
    updateBadge(prompts.length);DocForge.UI.toast('Prompt deleted','success');
  }
  function togglePin(id){
    const prompts=getPrompts();const idx=prompts.findIndex(p=>p.id===id);
    if(idx!==-1){prompts[idx].pinned=!prompts[idx].pinned;}
    savePrompts(prompts);renderGrid(sortPrompts(prompts));
  }
  function sortPrompts(prompts){return[...prompts].sort((a,b)=>{if(a.pinned&&!b.pinned)return-1;if(!a.pinned&&b.pinned)return 1;return b.created-a.created;});}
  function filterPrompts(query){
    const prompts=getPrompts();
    const filtered=query?prompts.filter(p=>(p.title+p.content+p.category+(p.tags||[]).join(' ')).toLowerCase().includes(query.toLowerCase())):prompts;
    renderGrid(sortPrompts(filtered));
  }
  function filterByCategory(cat){
    const prompts=getPrompts();
    const filtered=cat==='all'?prompts:cat==='pinned'?prompts.filter(p=>p.pinned):prompts.filter(p=>p.category===cat);
    renderGrid(sortPrompts(filtered));
  }
  function exportPrompts(){
    const prompts=getPrompts();const blob=new Blob([JSON.stringify(prompts,null,2)],{type:'application/json'});
    saveAs(blob,'docforge_prompts.json');DocForge.UI.toast('Prompts exported!','success');
  }
  function importPrompts(e){
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();reader.onload=ev=>{
      try{
        const imported=JSON.parse(ev.target.result);if(!Array.isArray(imported)){throw new Error();}
        const prompts=getPrompts();const merged=[...prompts,...imported.filter(imp=>!prompts.some(p=>p.id===imp.id))];
        savePrompts(merged);renderGrid(sortPrompts(merged));
        updateBadge(merged.length);DocForge.UI.toast(`Imported ${imported.length} prompts!`,'success');
      }catch(err){DocForge.UI.toast('Invalid file format','error');}
    };reader.readAsText(file);
  }
  function updateBadge(count){const badge=document.querySelector('.tool-header .feature-badge');if(badge)badge.textContent=count+' prompts';}
  function escapeHtml(str){const d=document.createElement('div');d.textContent=str;return d.innerHTML;}
  function destroy(){}
  return{render,destroy};
})();
