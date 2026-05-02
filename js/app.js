/* DocForge - Main App Controller */
window.DocForge=window.DocForge||{};
(function(){
  const toolMap={
    'home':null,'pdf-viewer':DocForge.PdfViewer,'epub-viewer':DocForge.EpubViewer,
    'pdf-splitter':DocForge.PdfSplitter,'pdf-merger':DocForge.PdfMerger,'pdf-editor':DocForge.PdfEditor,
    'image-extractor':DocForge.ImageExtractor,'video-frames':DocForge.VideoFrames,
    'converter':DocForge.Converter,'pdf-creator':DocForge.PdfCreator,
    'pdf-analysis':DocForge.PdfAnalysis,'pdf-security':DocForge.PdfSecurity,'utilities':DocForge.Utilities,
    'notepad':DocForge.Notepad,'prompt-gallery':DocForge.PromptGallery
  };
  const toolNames={
    'home':'Dashboard','pdf-viewer':'PDF Viewer','epub-viewer':'EPUB Reader',
    'pdf-splitter':'PDF Splitter','pdf-merger':'PDF Merger','pdf-editor':'PDF Editor',
    'image-extractor':'Image Extractor','video-frames':'Video to Frames',
    'converter':'Format Converter','pdf-creator':'PDF Creator',
    'pdf-analysis':'PDF Analysis','pdf-security':'PDF Security','utilities':'Utilities',
    'notepad':'Notepad Pro','prompt-gallery':'Prompt Gallery'
  };
  let currentTool=null,currentToolId='home';

  function init(){
    // Sidebar nav
    document.querySelectorAll('.nav-item').forEach(item=>{
      item.onclick=()=>navigateTo(item.dataset.tool);
    });
    // Sidebar toggle
    document.getElementById('sidebarToggle').onclick=()=>{
      document.getElementById('sidebar').classList.toggle('collapsed');
      document.getElementById('toggleIcon').textContent=document.getElementById('sidebar').classList.contains('collapsed')?'▶':'◀';
    };
    // Theme toggle
    document.getElementById('themeToggle').onclick=toggleTheme;
    // Mobile menu
    const mobileBtn=document.getElementById('mobileMenuBtn');
    if(window.innerWidth<=768)mobileBtn.style.display='flex';
    mobileBtn.onclick=()=>document.getElementById('sidebar').classList.toggle('mobile-open');
    window.addEventListener('resize',()=>{mobileBtn.style.display=window.innerWidth<=768?'flex':'none';});
    // Load initial view
    navigateTo('home');
  }

  function navigateTo(toolId){
    if(currentTool&&currentTool.destroy)currentTool.destroy();
    // Update sidebar
    document.querySelectorAll('.nav-item').forEach(item=>{item.classList.toggle('active',item.dataset.tool===toolId);});
    // Update breadcrumb
    document.getElementById('breadcrumbCurrent').textContent=toolNames[toolId]||toolId;
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('mobile-open');
    const container=document.getElementById('contentArea');
    if(toolId==='home'){renderDashboard(container);currentTool=null;}
    else if(toolMap[toolId]){currentTool=toolMap[toolId];currentTool.render(container);}
    currentToolId=toolId;
    container.scrollTop=0;
  }

  function renderDashboard(c){
    const cards=[
      {id:'pdf-viewer',icon:'📄',title:'PDF Viewer',desc:'Full-featured PDF viewer with zoom, search, thumbnails, and reading modes.',badge:'15 features',color:'var(--accent-violet)'},
      {id:'epub-viewer',icon:'📚',title:'EPUB Reader',desc:'Beautiful e-book reader with customizable fonts, themes, and navigation.',badge:'12 features',color:'var(--accent-cyan)'},
      {id:'pdf-splitter',icon:'✂️',title:'PDF Splitter',desc:'Split PDFs by pages, ranges, or chunks. Visual page selection.',badge:'10 features',color:'var(--accent-amber)'},
      {id:'pdf-merger',icon:'🔗',title:'PDF Merger',desc:'Combine multiple PDFs with drag-and-drop reordering.',badge:'6 features',color:'var(--accent-emerald)'},
      {id:'pdf-editor',icon:'✏️',title:'PDF Editor',desc:'Watermarks, rotation, page numbers, annotations, and more.',badge:'10 features',color:'var(--accent-rose)'},
      {id:'image-extractor',icon:'🖼️',title:'Image Extractor',desc:'Extract images from PDFs. Preview, filter, download as ZIP.',badge:'8 features',color:'var(--accent-blue)'},
      {id:'video-frames',icon:'🎬',title:'Video to Frames',desc:'Extract frames from videos at custom intervals. Hide duplicates.',badge:'10 features',color:'#ec4899'},
      {id:'converter',icon:'🔄',title:'Format Converter',desc:'Convert between PDF, images, DOCX, text, HTML, and 10+ formats.',badge:'12 features',color:'var(--accent-violet)'},
      {id:'pdf-creator',icon:'🎨',title:'PDF Creator',desc:'Create PDFs from scratch — invoices, certificates, resumes, and more.',badge:'10 features',color:'var(--accent-cyan)'},
      {id:'pdf-analysis',icon:'📊',title:'PDF Analysis',desc:'File info, text statistics, word frequency, and document comparison.',badge:'8 features',color:'var(--accent-amber)'},
      {id:'pdf-security',icon:'🔒',title:'PDF Security',desc:'Metadata editing, sanitization, and visual redaction tools.',badge:'5 features',color:'var(--accent-emerald)'},
      {id:'utilities',icon:'🧰',title:'Utilities',desc:'QR codes, compression, bookmarks, reverse pages, and more.',badge:'8 features',color:'var(--accent-rose)'},
      {id:'notepad',icon:'📝',title:'Notepad Pro',desc:'Rich text editor with formatting, images, auto-save, PDF/TXT export.',badge:'25+ features',color:'var(--accent-blue)'},
      {id:'prompt-gallery',icon:'💡',title:'Prompt Gallery',desc:'Save, organize, and reuse prompts. Color-coded sticky notes.',badge:'15+ features',color:'#ec4899'}
    ];
    c.innerHTML=`<div class="dashboard" style="animation:fadeIn .4s ease">
      <div class="dashboard-hero">
        <h1>DocForge Pro</h1>
        <p>Your all-in-one document toolkit — 100+ features, entirely in your browser.</p>
        <div style="margin-top:var(--space-lg);display:flex;gap:var(--space-sm);justify-content:center;flex-wrap:wrap">
          <span class="badge badge-violet">🔒 Private</span>
          <span class="badge badge-cyan">⚡ Client-side</span>
          <span class="badge badge-emerald">💰 Free</span>
          <span class="badge badge-amber">📦 No Upload</span>
        </div>
      </div>
      <div class="dashboard-grid">${cards.map(card=>`
        <div class="dashboard-card" data-tool="${card.id}" style="--card-color:${card.color}">
          <div class="dashboard-card-icon">${card.icon}</div>
          <div class="dashboard-card-title">${card.title} <span class="feature-badge">${card.badge}</span></div>
          <div class="dashboard-card-desc">${card.desc}</div>
        </div>`).join('')}
      </div>
      <div style="text-align:center;padding:var(--space-2xl) 0;color:var(--text-muted);font-size:var(--fs-xs)">
        <p>DocForge Pro — All processing happens locally in your browser. No files are uploaded to any server.</p>
      </div>
    </div>`;
    c.querySelectorAll('.dashboard-card').forEach(card=>{card.onclick=()=>navigateTo(card.dataset.tool);});
  }

  function toggleTheme(){
    const html=document.documentElement;
    const current=html.getAttribute('data-theme');
    const next=current==='dark'?'light':'dark';
    html.setAttribute('data-theme',next);
    document.getElementById('themeToggle').textContent=next==='dark'?'🌙':'☀️';
    localStorage.setItem('docforge_theme',next);
  }

  // Restore theme
  const savedTheme=localStorage.getItem('docforge_theme');
  if(savedTheme){document.documentElement.setAttribute('data-theme',savedTheme);document.getElementById('themeToggle').textContent=savedTheme==='dark'?'🌙':'☀️';}

  // Boot
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
