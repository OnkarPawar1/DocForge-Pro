/* DocForge - PDF Creator */
window.DocForge=window.DocForge||{};
DocForge.PdfCreator=(function(){
  function render(c){
    c.innerHTML=`
    <div class="tool-header"><h1 class="tool-title"><span class="tool-title-icon">🎨</span>PDF Creator<span class="feature-badge">10 features</span></h1><p class="tool-description">Create PDFs from scratch with templates — invoices, certificates, resumes, and more.</p></div>
    <div class="converter-grid">
      <div class="converter-option" data-tpl="blank"><div class="converter-option-icon">📄</div><div class="converter-option-title">Blank PDF</div><div class="converter-option-desc">Start from scratch</div></div>
      <div class="converter-option" data-tpl="invoice"><div class="converter-option-icon">🧾</div><div class="converter-option-title">Invoice</div><div class="converter-option-desc">Professional invoice</div></div>
      <div class="converter-option" data-tpl="certificate"><div class="converter-option-icon">🏅</div><div class="converter-option-title">Certificate</div><div class="converter-option-desc">Award certificate</div></div>
      <div class="converter-option" data-tpl="resume"><div class="converter-option-icon">📋</div><div class="converter-option-title">Resume</div><div class="converter-option-desc">Professional resume</div></div>
      <div class="converter-option" data-tpl="letter"><div class="converter-option-icon">✉️</div><div class="converter-option-title">Business Letter</div><div class="converter-option-desc">Formal letter template</div></div>
      <div class="converter-option" data-tpl="report"><div class="converter-option-icon">📊</div><div class="converter-option-title">Report</div><div class="converter-option-desc">Business report</div></div>
      <div class="converter-option" data-tpl="card"><div class="converter-option-icon">💼</div><div class="converter-option-title">Business Card</div><div class="converter-option-desc">Contact card</div></div>
      <div class="converter-option" data-tpl="clipboard"><div class="converter-option-icon">📋</div><div class="converter-option-title">From Clipboard</div><div class="converter-option-desc">Paste & create</div></div>
    </div>
    <div id="pc-workspace" class="hidden card" style="margin-top:var(--space-lg)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-lg)"><h3 id="pc-tplTitle" class="card-title"></h3><button class="btn btn-sm btn-ghost" id="pc-back">← Back</button></div>
      <div id="pc-form"></div>
      <button class="btn btn-primary" style="margin-top:var(--space-lg)" id="pc-generate">📄 Generate PDF</button>
    </div>`;
    init(c);
  }
  function init(c){
    c.querySelectorAll('.converter-option').forEach(opt=>opt.onclick=()=>openTemplate(opt.dataset.tpl));
    c.querySelector('#pc-back').onclick=()=>{document.getElementById('pc-workspace').classList.add('hidden');c.querySelector('.converter-grid').classList.remove('hidden');};
  }
  let currentTpl='';
  function openTemplate(tpl){
    currentTpl=tpl;
    document.querySelector('.converter-grid').classList.add('hidden');
    const ws=document.getElementById('pc-workspace');ws.classList.remove('hidden');
    const form=document.getElementById('pc-form');
    const titles={blank:'Blank PDF',invoice:'Invoice Generator',certificate:'Certificate Generator',resume:'Resume Builder',letter:'Business Letter',report:'Report',card:'Business Card',clipboard:'From Clipboard'};
    document.getElementById('pc-tplTitle').textContent=titles[tpl];
    document.getElementById('pc-generate').onclick=()=>generatePdf(tpl);
    switch(tpl){
      case 'blank':form.innerHTML=`<div class="options-grid"><div class="form-group"><label class="form-label">Page Size</label><select class="form-select" id="pc-size"><option>a4</option><option>letter</option><option>legal</option></select></div><div class="form-group"><label class="form-label">Orientation</label><select class="form-select" id="pc-orient"><option>portrait</option><option>landscape</option></select></div><div class="form-group"><label class="form-label">Pages</label><input class="form-input" id="pc-pages" type="number" min="1" value="1"></div></div><div class="form-group" style="margin-top:var(--space-md)"><label class="form-label">Content (optional)</label><textarea class="form-textarea" id="pc-content" rows="6"></textarea></div>`;break;
      case 'invoice':form.innerHTML=`<div class="options-grid"><div class="form-group"><label class="form-label">Company Name</label><input class="form-input" id="pc-company" value="My Company"></div><div class="form-group"><label class="form-label">Invoice #</label><input class="form-input" id="pc-invNum" value="INV-001"></div><div class="form-group"><label class="form-label">Client Name</label><input class="form-input" id="pc-client" value="Client Name"></div><div class="form-group"><label class="form-label">Date</label><input class="form-input" id="pc-date" type="date" value="${new Date().toISOString().split('T')[0]}"></div></div><div class="form-group" style="margin-top:var(--space-md)"><label class="form-label">Items (one per line: description, qty, price)</label><textarea class="form-textarea" id="pc-items" rows="4">Web Development, 1, 5000\nDesign Services, 1, 2000\nHosting, 12, 100</textarea></div>`;break;
      case 'certificate':form.innerHTML=`<div class="options-grid"><div class="form-group"><label class="form-label">Recipient Name</label><input class="form-input" id="pc-recipient" value="John Doe"></div><div class="form-group"><label class="form-label">Achievement</label><input class="form-input" id="pc-achievement" value="Excellence in Technology"></div><div class="form-group"><label class="form-label">Organization</label><input class="form-input" id="pc-org" value="DocForge Academy"></div><div class="form-group"><label class="form-label">Date</label><input class="form-input" id="pc-certDate" type="date" value="${new Date().toISOString().split('T')[0]}"></div></div>`;break;
      case 'resume':form.innerHTML=`<div class="options-grid"><div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="pc-name" value="Your Name"></div><div class="form-group"><label class="form-label">Title</label><input class="form-input" id="pc-title" value="Software Engineer"></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="pc-email" value="email@example.com"></div><div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="pc-phone" value="+1 234 567 890"></div></div><div class="form-group" style="margin-top:var(--space-md)"><label class="form-label">Summary</label><textarea class="form-textarea" id="pc-summary" rows="3">Experienced professional with expertise in...</textarea></div><div class="form-group"><label class="form-label">Experience (one per line)</label><textarea class="form-textarea" id="pc-exp" rows="4">Senior Developer at TechCo (2020-Present)\nDeveloper at StartupXYZ (2018-2020)</textarea></div>`;break;
      case 'letter':form.innerHTML=`<div class="options-grid"><div class="form-group"><label class="form-label">From</label><input class="form-input" id="pc-from" value="Your Name"></div><div class="form-group"><label class="form-label">To</label><input class="form-input" id="pc-to" value="Recipient Name"></div><div class="form-group"><label class="form-label">Subject</label><input class="form-input" id="pc-subj" value="Subject Line"></div><div class="form-group"><label class="form-label">Date</label><input class="form-input" id="pc-lDate" type="date" value="${new Date().toISOString().split('T')[0]}"></div></div><div class="form-group" style="margin-top:var(--space-md)"><label class="form-label">Body</label><textarea class="form-textarea" id="pc-body" rows="8">Dear Sir/Madam,\n\nI am writing to...</textarea></div>`;break;
      case 'report':form.innerHTML=`<div class="options-grid"><div class="form-group"><label class="form-label">Report Title</label><input class="form-input" id="pc-rTitle" value="Annual Report 2024"></div><div class="form-group"><label class="form-label">Author</label><input class="form-input" id="pc-rAuthor" value="Your Name"></div></div><div class="form-group" style="margin-top:var(--space-md)"><label class="form-label">Content</label><textarea class="form-textarea" id="pc-rContent" rows="10">Executive Summary\n\nThis report covers...</textarea></div>`;break;
      case 'card':form.innerHTML=`<div class="options-grid"><div class="form-group"><label class="form-label">Name</label><input class="form-input" id="pc-cName" value="Your Name"></div><div class="form-group"><label class="form-label">Title</label><input class="form-input" id="pc-cTitle" value="CEO & Founder"></div><div class="form-group"><label class="form-label">Company</label><input class="form-input" id="pc-cCompany" value="My Company"></div><div class="form-group"><label class="form-label">Email</label><input class="form-input" id="pc-cEmail" value="email@company.com"></div><div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="pc-cPhone" value="+1 234 567 890"></div><div class="form-group"><label class="form-label">Website</label><input class="form-input" id="pc-cWeb" value="www.company.com"></div></div>`;break;
      case 'clipboard':form.innerHTML=`<div class="form-group"><label class="form-label">Paste content from clipboard</label><textarea class="form-textarea" id="pc-clipboard" rows="10" placeholder="Paste anything here..."></textarea></div><button class="btn btn-sm btn-secondary" style="margin-top:var(--space-sm)" id="pc-pasteBtn">📋 Paste from Clipboard</button>`;
        setTimeout(()=>{document.getElementById('pc-pasteBtn').onclick=async()=>{try{const t=await navigator.clipboard.readText();document.getElementById('pc-clipboard').value=t;DocForge.UI.toast('Pasted!','success');}catch(e){DocForge.UI.toast('Clipboard access denied','error');}};},0);break;
    }
  }
  function generatePdf(tpl){
    const{jsPDF}=window.jspdf;let doc;
    switch(tpl){
      case 'blank':{
        const size=document.getElementById('pc-size').value;const orient=document.getElementById('pc-orient').value;
        doc=new jsPDF({format:size,orientation:orient});const pages=parseInt(document.getElementById('pc-pages').value)||1;
        const content=document.getElementById('pc-content').value;
        if(content){doc.setFontSize(11);const lines=doc.splitTextToSize(content,170);let y=20;for(const line of lines){if(y>280){doc.addPage();y=20;}doc.text(line,20,y);y+=6;}}
        for(let i=1;i<pages;i++)doc.addPage();
        doc.save('blank.pdf');break;}
      case 'invoice':{
        doc=new jsPDF();doc.setFontSize(24);doc.setFont('helvetica','bold');doc.text('INVOICE',20,30);
        doc.setFontSize(10);doc.setFont('helvetica','normal');
        doc.text(document.getElementById('pc-company').value,20,45);
        doc.text('Invoice: '+document.getElementById('pc-invNum').value,140,30);
        doc.text('Date: '+document.getElementById('pc-date').value,140,37);
        doc.text('Bill To: '+document.getElementById('pc-client').value,20,60);
        doc.setDrawColor(124,58,237);doc.setLineWidth(0.5);doc.line(20,70,190,70);
        const items=document.getElementById('pc-items').value.split('\n').map(l=>l.split(',').map(s=>s.trim()));
        let y=80;doc.setFont('helvetica','bold');doc.text('Description',20,y);doc.text('Qty',120,y);doc.text('Price',150,y);doc.text('Total',175,y);
        doc.setFont('helvetica','normal');let total=0;
        items.forEach(item=>{if(item.length>=3){y+=8;doc.text(item[0],20,y);doc.text(item[1],120,y);doc.text('$'+item[2],150,y);const t=parseFloat(item[1])*parseFloat(item[2]);doc.text('$'+t.toFixed(2),175,y);total+=t;}});
        y+=15;doc.setFont('helvetica','bold');doc.setFontSize(14);doc.text('Total: $'+total.toFixed(2),150,y);
        doc.save('invoice.pdf');break;}
      case 'certificate':{
        doc=new jsPDF({orientation:'landscape'});
        doc.setDrawColor(124,58,237);doc.setLineWidth(3);doc.rect(10,10,277,190);doc.setLineWidth(1);doc.rect(15,15,267,180);
        doc.setFontSize(36);doc.setFont('helvetica','bold');doc.setTextColor(124,58,237);doc.text('Certificate of Achievement',148,60,{align:'center'});
        doc.setTextColor(0);doc.setFontSize(14);doc.setFont('helvetica','normal');doc.text('This is to certify that',148,85,{align:'center'});
        doc.setFontSize(28);doc.setFont('helvetica','bold');doc.text(document.getElementById('pc-recipient').value,148,105,{align:'center'});
        doc.setFontSize(14);doc.setFont('helvetica','normal');doc.text('has been awarded for',148,125,{align:'center'});
        doc.setFontSize(20);doc.setFont('helvetica','italic');doc.text(document.getElementById('pc-achievement').value,148,145,{align:'center'});
        doc.setFontSize(12);doc.text(document.getElementById('pc-org').value,80,180);doc.text(document.getElementById('pc-certDate').value,200,180);
        doc.save('certificate.pdf');break;}
      case 'resume':{
        doc=new jsPDF();doc.setFillColor(124,58,237);doc.rect(0,0,210,45,'F');
        doc.setTextColor(255);doc.setFontSize(24);doc.setFont('helvetica','bold');doc.text(document.getElementById('pc-name').value,20,25);
        doc.setFontSize(12);doc.setFont('helvetica','normal');doc.text(document.getElementById('pc-title').value,20,35);
        doc.setTextColor(0);doc.setFontSize(9);doc.text(document.getElementById('pc-email').value+' | '+document.getElementById('pc-phone').value,20,55);
        doc.setFontSize(12);doc.setFont('helvetica','bold');doc.setTextColor(124,58,237);doc.text('SUMMARY',20,70);
        doc.setTextColor(0);doc.setFont('helvetica','normal');doc.setFontSize(10);
        const summary=doc.splitTextToSize(document.getElementById('pc-summary').value,170);let y=78;summary.forEach(l=>{doc.text(l,20,y);y+=5;});
        y+=8;doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(124,58,237);doc.text('EXPERIENCE',20,y);
        doc.setTextColor(0);doc.setFont('helvetica','normal');doc.setFontSize(10);y+=8;
        document.getElementById('pc-exp').value.split('\n').forEach(l=>{doc.text('• '+l.trim(),20,y);y+=7;});
        doc.save('resume.pdf');break;}
      case 'letter':{
        doc=new jsPDF();doc.setFontSize(10);
        doc.text(document.getElementById('pc-from').value,20,30);doc.text(document.getElementById('pc-lDate').value,20,37);
        doc.text('To: '+document.getElementById('pc-to').value,20,55);
        doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text('Re: '+document.getElementById('pc-subj').value,20,70);
        doc.setFont('helvetica','normal');doc.setFontSize(10);
        const body=doc.splitTextToSize(document.getElementById('pc-body').value,170);let ly=85;body.forEach(l=>{if(ly>280){doc.addPage();ly=20;}doc.text(l,20,ly);ly+=6;});
        ly+=15;doc.text('Sincerely,',20,ly);doc.text(document.getElementById('pc-from').value,20,ly+10);
        doc.save('letter.pdf');break;}
      case 'report':{
        doc=new jsPDF();doc.setFillColor(124,58,237);doc.rect(0,0,210,80,'F');
        doc.setTextColor(255);doc.setFontSize(28);doc.setFont('helvetica','bold');doc.text(document.getElementById('pc-rTitle').value,105,40,{align:'center'});
        doc.setFontSize(14);doc.text(document.getElementById('pc-rAuthor').value,105,55,{align:'center'});
        doc.setTextColor(0);doc.setFontSize(11);doc.setFont('helvetica','normal');
        const rc=doc.splitTextToSize(document.getElementById('pc-rContent').value,170);let ry=100;
        rc.forEach(l=>{if(ry>280){doc.addPage();ry=20;}doc.text(l,20,ry);ry+=6;});
        doc.save('report.pdf');break;}
      case 'card':{
        doc=new jsPDF({format:[90,55],unit:'mm'});doc.setFillColor(124,58,237);doc.rect(0,0,90,20,'F');
        doc.setTextColor(255);doc.setFontSize(14);doc.setFont('helvetica','bold');doc.text(document.getElementById('pc-cName').value,5,12);
        doc.setTextColor(0);doc.setFontSize(8);doc.setFont('helvetica','normal');
        doc.text(document.getElementById('pc-cTitle').value,5,27);doc.text(document.getElementById('pc-cCompany').value,5,33);
        doc.setFontSize(7);doc.text(document.getElementById('pc-cEmail').value,5,42);doc.text(document.getElementById('pc-cPhone').value,5,47);doc.text(document.getElementById('pc-cWeb').value,5,52);
        doc.save('business_card.pdf');break;}
      case 'clipboard':{
        doc=new jsPDF();doc.setFontSize(11);
        const text=document.getElementById('pc-clipboard').value;if(!text){DocForge.UI.toast('Paste content first','info');return;}
        const lines=doc.splitTextToSize(text,170);let cy=20;
        lines.forEach(l=>{if(cy>280){doc.addPage();cy=20;}doc.text(l,20,cy);cy+=6;});
        doc.save('clipboard.pdf');break;}
    }
    DocForge.UI.toast('PDF created!','success');
  }
  function destroy(){}
  return{render,destroy};
})();
