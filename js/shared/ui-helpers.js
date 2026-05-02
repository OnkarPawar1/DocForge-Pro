/* DocForge - UI Helpers */
window.DocForge=window.DocForge||{};
DocForge.UI=(function(){
  function toast(msg,type='info',dur=3500){
    const c=document.getElementById('toastContainer');
    const t=document.createElement('div');
    t.className=`toast toast-${type}`;
    const icons={success:'✅',error:'❌',info:'ℹ️'};
    t.innerHTML=`<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(()=>{t.style.animation='fadeOut .3s ease forwards';setTimeout(()=>t.remove(),300);},dur);
  }
  function showLoading(container,msg='Processing...'){
    const el=document.createElement('div');el.className='loading-overlay';el.id='loadingOverlay';
    el.innerHTML=`<div style="text-align:center"><div class="spinner spinner-lg" style="margin:0 auto var(--space-md)"></div><p style="color:var(--text-secondary);font-size:var(--fs-sm)">${msg}</p></div>`;
    el.style.cssText='position:absolute;inset:0;background:rgba(8,8,15,.85);display:flex;align-items:center;justify-content:center;z-index:50;border-radius:var(--radius-lg);backdrop-filter:blur(4px)';
    container.style.position='relative';container.appendChild(el);return el;
  }
  function hideLoading(){const el=document.getElementById('loadingOverlay');if(el)el.remove();}
  function confirm(title,msg){
    return new Promise(resolve=>{
      const ov=document.createElement('div');ov.className='modal-overlay active';
      ov.innerHTML=`<div class="modal"><div class="modal-header"><h3 class="modal-title">${title}</h3><button class="modal-close" id="modalCancel">✕</button></div><p style="color:var(--text-secondary);margin-bottom:var(--space-lg)">${msg}</p><div style="display:flex;gap:var(--space-sm);justify-content:flex-end"><button class="btn btn-secondary" id="modalNo">Cancel</button><button class="btn btn-primary" id="modalYes">Confirm</button></div></div>`;
      document.body.appendChild(ov);
      ov.querySelector('#modalYes').onclick=()=>{ov.remove();resolve(true);};
      ov.querySelector('#modalNo').onclick=()=>{ov.remove();resolve(false);};
      ov.querySelector('#modalCancel').onclick=()=>{ov.remove();resolve(false);};
      ov.addEventListener('click',e=>{if(e.target===ov){ov.remove();resolve(false);}});
    });
  }
  function createProgress(container){
    const wrap=document.createElement('div');wrap.className='progress-bar';wrap.style.marginBottom='var(--space-md)';
    const fill=document.createElement('div');fill.className='progress-fill shimmer';fill.style.width='0%';
    wrap.appendChild(fill);container.appendChild(wrap);
    return{el:wrap,set(pct){fill.style.width=Math.min(100,pct)+'%';},remove(){wrap.remove();}};
  }
  function prompt(title,defaultVal=''){
    return new Promise(resolve=>{
      const ov=document.createElement('div');ov.className='modal-overlay active';
      ov.innerHTML=`<div class="modal"><div class="modal-header"><h3 class="modal-title">${title}</h3><button class="modal-close" id="pClose">✕</button></div><input class="form-input" id="pInput" value="${defaultVal}" style="margin-bottom:var(--space-lg)"><div style="display:flex;gap:var(--space-sm);justify-content:flex-end"><button class="btn btn-secondary" id="pCancel">Cancel</button><button class="btn btn-primary" id="pOk">OK</button></div></div>`;
      document.body.appendChild(ov);const inp=ov.querySelector('#pInput');inp.focus();inp.select();
      ov.querySelector('#pOk').onclick=()=>{ov.remove();resolve(inp.value);};
      ov.querySelector('#pCancel').onclick=()=>{ov.remove();resolve(null);};
      ov.querySelector('#pClose').onclick=()=>{ov.remove();resolve(null);};
      inp.onkeydown=e=>{if(e.key==='Enter'){ov.remove();resolve(inp.value);}};
    });
  }
  return{toast,showLoading,hideLoading,confirm,createProgress,prompt};
})();
