/* Free, in-browser screenshot assistance. No AI API, uploads, or server storage. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const fileInput = byId('scanFile');
  if (!fileInput) return;
  const status = byId('scanStatus'), canvas = byId('scanCanvas'), ctx = canvas.getContext('2d');
  const results = byId('scanResults'), apply = byId('scanApply');
  const W = 295, H = 405, snapshotsKey = 'maple-inventory-snapshots-v1';
  let bitmap = null, selected = null, dragging = null, active = null, busy = false, ocrPromise = null;
  const reference = {Meat: decode('4ODY4NjYyMjA2NjQ4ODY4ODY4ODY4ODY4ODY4ODY4ODY4ODY2NjQmJiQkJCAgHhw4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQgHhwwLio6NjIYFhQcGBgYFBIYFBIoKCY2NjQ4NjQ4NjQ4NjQqJiAwLCQ2Mi4gFBIiDgwiDgweDAoUCgYiICA4NjQ4NjQ4NjQeHBoaFhIoFBQoEhIoEhImEBAmEA4iDgwWDgwsLCg4NjQ4NjQ4NjQyMC4SCggiDgwmEhAmEhImEhAmEA4kEAweDAwWDAogHhw2NjI4NjQeHhwYDAgcDAokEAwmEA4kEA4eDgwcDAoaDAgYCgYWCgYaGBY4NjQkIiAUCAQaDAggDgwkEA4cDAoYDAgaDAYiEAwkDgogDAgSCgYwLiw0NDISDgwWCgQcDAocDAoYDAggEgwsGBIsEg4oDAgmCgYUDAgwMC4iIiAsLCoGBAQQCAYYDAgUCAYeFBAkFA4sFhAuGBQgCgYcGho4NjQ'), Lemon: decode('6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo6Ojo2NjQ2NjQ2NjQ2NjQ2NjQ2NjQ2NjQ2NjQ2NjQ2NjQ2NjQ2NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ2NjIqKiYgHhYwLiw4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ4NjQ2NDImJhYwMBA8OgAsJgIoJh44NjQ4NjQ4NjQ4NjQ4NjQ4NjQ0NDImJhY6Ohg+Phg+PgA+OgA0LgAoJhw4NjQ4NjQ4NjQ4NjQ4NjQiIhg6Oho+PjA+Pgg+PgA+PgA+OgAyKgAoKCQ4NjQ4NjQ4NjQyMjAkJAg+PjA+PiA+PgA+PgA+PAA+PAA+NAAgHAw4NjQ4NjQ4NjQyMC4mJgQ+Pig+Pgo+PgA+PgA+PgA+OgA+NAAgHAg4NjQ4NjQuLiw0NDAcHAo2Ng4+Pgg6OgA0NAA4NgA+NgA6MAAiIBg4NjQ4NjQ')};
  const countReference = [{"item":"Meat","qty":54,"pattern":"2NjI4NjQaGBYWCAQaDAggDgwaDAgaDAgkFA4uFhIqDgomCgYaDAgwMC4yMC4sKigOCggUCAYaDAgWCgYoFhAwGhQqDgosEg4mCgYSDAoYGBgeHh4eHh4QEBAUDgoUDAgUEBAmCgYsEg4wIhw0KiQaDgokJCIiIiIODg4ODg4mJiQkJCIaGhoeHBooDgoqEAwqGhQ0MCo2NDAkIh4iIiIcHBwaHBwcHBweICAOEBAcHh4eEAwaCAQSCgYoJB42MiwwLCQcHBwsLCoaHBwQEhYWFhgYGhweICQMCAgWFhQkJCIaGBQwLCQeHBgeICISFhwSFhwYGhogIB4UFBQQEhgWFhYYGBgcHBoUEhAgHhYaGBg"},{"item":"Meat","qty":100,"pattern":"2NDI2NjQUEhAWCgYaDAogDgwaDAgaDAgmFhAuFhIoDAgmDAgWCgY2NDI0NDAsLCoOCAYUCgYaDAgYCgYmFhAsFhAqDgoqEgwkCgYUEA4mJiQcHBwgIB4cHBwcGhoUDAoUDAoeHBweGhgsIhwyKCIYDgooKCYSEhIiIiIQEBAYGBgaGBgUFBQaGhoaDgwcGBgcGhg2Miw0Mi4kIB4sKigaGhoOEBAeHhwiIiAUFBQaHBwaDAgYFhYQDg4sKCI2MiwuKiIuLioUGBoMDhAYGhoaHBoQEhQWGBwKCAYUFhgWFhYaGBQuKiIcGhYuLioOEhgSFBQSFhwQFhwQEhQSFBgQFhwSFhwUFBQUEg4eHBYeHhw"},{"item":"Lemon","qty":42,"pattern":"2NjI4NjQ4NjQiIBA+PiI+Phw+PgA+PgA+PgA+PAA+NgAkHgQ2NjI2NjI4NjQ4NjQkJBY8PA4+Phg+PgA+PgA+PgA+OAA+NAAkIAg2NjQ2NjI2NjIgIB4gIB4iIgoiIhYqKgg+PAA+PAA+NgA2LgAmJB44NjQ0NDIkJCImJiYcHBoaGhoYGBIeHhouKgI+NgA4LgAmJBY2NjQ4NjQkJCIUFhYaHBwcHBosLCoaGhQcHBguLAIuKAQiIBY2NDI4NjQ4NjQaGhweICImKiwWFhYmJiYaHB4eHhwYFgwkIh4wMC4wMC4yMi40NDIuLCooKCYSFhoQEBAWHCIOEhYSFBgUFBQaGhoeHBweHhwgHh4mJiQ"},{"item":"Lemon","qty":100,"pattern":"2NDI4NjQ2NjQgIAo+PiY+PhY+PgA+PgA+PgA+PAA+NAAiHAg2NjQ2NDI4NjQ2NjQiIhA8PBQ+PhA+PgA+PgA+PgA+OAA8MgAiHg42NjQsLCoeHh4oKCYcHBwgIBI2NgQwMAIiIhImJAw8NAAyKgAoKCQ4NjQWFhYmJiYSEhIaGhoaGhoaGhAeHhgeHhAeHhogHAYmJhw2NjQ4NjQkIiAaGhoOEBAeHhwiIiAUFBQaHBwsKgAiIBQaGho2NjQ4NjQ4NjQuLioWGBoMDhAcHBwgIB4SFBQWGhwSEAgWGBYcHBwwMC4yMjA0NDIuLioSFhwOEBISFhoSFhoOEBQSFBgSFhoSGBwUFBYeHhwgIB4oJiY"}].map(x=>({item:x.item,qty:x.qty,pattern:decode(x.pattern)}));
  function decode(s){ const b=atob(s), arr=new Uint8Array(b.length);for(let i=0;i<b.length;i++)arr[i]=b.charCodeAt(i);return arr; }
  function say(s){status.textContent=s;}
  function draw() {
    if (!bitmap) return;
    const width = Math.min(580, bitmap.width), height = Math.max(1, Math.round(bitmap.height * width / bitmap.width));
    canvas.width=width;canvas.height=height;ctx.drawImage(bitmap,0,0,width,height);
    const rect=dragging || selected;
    if(rect){ctx.fillStyle='rgba(16,99,190,.12)';ctx.strokeStyle='#e85e22';ctx.lineWidth=3;
      const x=rect.x*width/bitmap.width,y=rect.y*height/bitmap.height,
       w=rect.w*width/bitmap.width,h=rect.h*height/bitmap.height;
      ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);}
  }
  const position = event => {
    const box=canvas.getBoundingClientRect();
    return {x:Math.max(0,Math.min(bitmap.width, (event.clientX-box.left)*bitmap.width/box.width)),
      y:Math.max(0,Math.min(bitmap.height,(event.clientY-box.top)*bitmap.height/box.height))};
  };
  canvas.addEventListener('pointerdown',event=>{if(!bitmap||busy)return;canvas.setPointerCapture(event.pointerId);const p=position(event);dragging={x:p.x,y:p.y,w:0,h:0};draw();});
  canvas.addEventListener('pointermove',event=>{if(!dragging||!bitmap)return;const p=position(event);
    const p0=dragging;dragging={x:p0.x,y:p0.y,w:p.x-p0.x,h:p.y-p0.y};draw();});
  canvas.addEventListener('pointerup',()=>{if(!dragging)return;
    let {x,y,w,h}=dragging;if(w<0){x+=w;w=-w;}if(h<0){y+=h;h=-h;}
    selected=w>12&&h>12?{x,y,w,h}:null;dragging=null;draw();
    say(selected?'Crop selected. Press Read screenshot.':'Using the full screenshot.');});
  byId('scanResetCrop').onclick=()=>{selected=null;draw();say('Using the full image.');};
  fileInput.onchange=async()=>{const f=fileInput.files&&fileInput.files[0];if(!f)return;
    try {if(bitmap&&bitmap.close)bitmap.close();bitmap=await createImageBitmap(f);selected=null;active=null;
      results.hidden=true;apply.hidden=true;canvas.hidden=false;draw();
      say('Screenshot loaded. For a full-game image, drag around the EXP bar or the entire inventory window before reading.');}
    catch(e){say('Cannot open screenshot: '+e.message);}
  };
  function cropSource(){const r=selected||{x:0,y:0,w:bitmap.width,h:bitmap.height};
    const c=document.createElement('canvas');c.width=Math.round(r.w);c.height=Math.round(r.h);
    c.getContext('2d').drawImage(bitmap,r.x,r.y,r.w,r.h,0,0,c.width,c.height);return c;}
  function scale(source,w,h,smoothing=true){const c=document.createElement('canvas');c.width=w;c.height=h;
    const x=c.getContext('2d');x.imageSmoothingEnabled=smoothing;x.imageSmoothingQuality='high';x.drawImage(source,0,0,w,h);return c;}
  function take(source,x,y,w,h,multiplier=4){
    const c=document.createElement('canvas');c.width=Math.round(w*multiplier);c.height=Math.round(h*multiplier);
    const ct=c.getContext('2d');ct.imageSmoothingEnabled=true;ct.imageSmoothingQuality='high';
    ct.drawImage(source,x,y,w,h,0,0,c.width,c.height);return c;
  }
  function templateDistance(slotPixels,template) {
    let total=0;for(let i=0,j=0;j<template.length;i+=4,j+=3)
      total+=Math.abs(slotPixels[i]-template[j])+Math.abs(slotPixels[i+1]-template[j+1])+Math.abs(slotPixels[i+2]-template[j+2]);
    return total/template.length;
  }
  function iconScores(source,x,y) {
    const c=document.createElement('canvas');c.width=13;c.height=10;
    c.getContext('2d').drawImage(source,x,y,39,31,0,0,13,10);
    const p=c.getContext('2d').getImageData(0,0,13,10).data;
    return {meat:templateDistance(p,reference.Meat),lemon:templateDistance(p,reference.Lemon)};
  }
  function countGuess(source,entry){
    // Recognize exact pixel-font overlays seen in the sample. New values still fall back to OCR.
    const c=document.createElement('canvas');c.width=13;c.height=7;
    c.getContext('2d').drawImage(source,entry.x,entry.y+24,40,20,0,0,13,7);
    const pixels=c.getContext('2d').getImageData(0,0,13,7).data;
    const candidates=countReference.filter(x=>x.item===entry.type)
      .map(x=>({qty:x.qty,error:templateDistance(pixels,x.pattern)})).sort((a,b)=>a.error-b.error);
    return candidates.length&&candidates[0].error<18&&candidates[1].error-candidates[0].error>6?candidates[0].qty:null;
  }
  function findItems(source){
    // Screenshot should contain the complete Use-tab inventory window, including top and bottom edges.
    const normalized=scale(source,W,H), entries=[];
    for(let row=0;row<6;row++)for(let col=0;col<5;col++){
      const x=14+51*col,y=69+47*row;
      const d=iconScores(normalized,x+4,y);
      const type=d.meat<23&&d.meat<d.lemon-9?'Meat':d.lemon<18&&d.lemon<d.meat-9?'Lemon':null;
      if(type){const entry={type,row:row+1,col:col+1,x,y,quantity:null,score:+(type==='Meat'?d.meat:d.lemon).toFixed(1)};entry.quantity=countGuess(normalized,entry);entries.push(entry);}
    }
    return {normalized,entries};
  }
  async function loadTesseract(){
    if(window.Tesseract)return window.Tesseract;
    if(!ocrPromise)ocrPromise=new Promise((resolve,reject)=>{
      const tag=document.createElement('script');tag.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      tag.onload=()=>resolve(window.Tesseract);tag.onerror=()=>reject(Error('Free OCR library unavailable. Check the connection.'));
      document.head.appendChild(tag);
    }).catch(e=>{ocrPromise=null;throw e;});
    return ocrPromise;
  }
  async function makeWorker(){
    const tess=await loadTesseract();
    return tess.createWorker('eng',1);
  }
  async function recognize(worker,image,parameters){
    await worker.setParameters(parameters);
    const r=await worker.recognize(image);
    return (r.data&&r.data.text||'').trim();
  }
  function parseExp(t){
    const s=t.replace(/\s+/g,' ').replace(/[oO](?=\d)/g,'0');
    const pct=(s.match(/(\d{1,3}[.,]\d{1,2})\s*%/)||[])[1];
    const match=s.match(/EXP\.?\s*[:.]?\s*(\d{1,3}(?:[,.]\d{3})+|\d{4,10})/i);
    const raw=match?Number(match[1].replace(/[,.]/g,'')):null;
    return {exp:raw!=null&&Number.isFinite(raw)?raw:null,percent:pct?Number(pct.replace(',','.')):null};
  }
  function parseMesos(t) {
    const match=t.replace(/\s/g,'').match(/\d{1,3}(?:[, .]\d{3})+|\d{4,10}/);
    return match?Number(match[0].replace(/\D/g,'')):null;
  }
  function numberInput(label,val,key){return '<label>'+label+'<input type="number" min="0" step="1" data-scan-field="'+key+'" value="'+(val==null?'':val)+'"></label>';}
  function inventoryPreview(scan) {
    const meat=scan.entries.filter(x=>x.type==='Meat'),lemon=scan.entries.filter(x=>x.type==='Lemon');
    const cells=scan.entries.map((x,i)=>'<label>'+x.type+' · row '+x.row+', slot '+x.col+
      '<input type="number" min="0" max="100" step="1" inputmode="numeric" data-stack="'+i+'" placeholder="Verify quantity" value="'+(x.quantity==null?'':x.quantity)+'"></label>').join('');
    results.innerHTML='<p><strong>Inventory:</strong> '+meat.length+' meat stack(s), '+lemon.length+' lemon stack(s) recognized.</p>'+
      '<p class="muted">Quantities can be misread. Check each stack, particularly the partial stacks. Blank means OCR was uncertain.</p>'+
      '<div class="grid two">'+numberInput('Mesos',scan.mesos,'mesos')+'</div>'+
      '<div class="grid two">'+cells+'</div>'+
      '<p id="scanTotals" class="muted"></p>';
    results.querySelectorAll('[data-stack]').forEach(input=>input.addEventListener('input',()=>{const v=input.value;
      scan.entries[Number(input.dataset.stack)].quantity=v===''?null:Number(v);renderTotals(scan);}));
    renderTotals(scan);
  }
  function renderTotals(scan){
    const value=kind=>{const selected=scan.entries.filter(x=>x.type===kind);
      const known=selected.filter(x=>Number.isInteger(x.quantity)).reduce((sum,x)=>sum+x.quantity,0);
      return selected.length&&selected.every(x=>Number.isInteger(x.quantity))?known+' total':known+' known, '+selected.filter(x=>x.quantity==null).length+' unread';};
    byId('scanTotals').textContent='Meat: '+value('Meat')+' · Lemons: '+value('Lemon');
  }
  function barPreview(scan){
    const p=scan.percent==null?'':scan.percent;
    results.innerHTML='<div class="grid">'+numberInput('Raw EXP',scan.exp,'raw')+
      '<label>EXP %<input type="number" data-scan-field="percent" min="0" max="100" step="0.01" value="'+p+'"></label>'+
      numberInput('Mesos',scan.mesos,'mesos')+'</div>'+
      '<p class="muted">Only filled values will be applied. Correct any OCR errors before applying.</p>';
  }
  function getScanField(name){const el=results.querySelector('[data-scan-field="'+name+'"]');return el&&el.value!==''?Number(el.value):null;}
  function updateInput(id,value){const el=byId(id);if(!el||value==null||!Number.isFinite(value))return;el.value=value;
    el.dispatchEvent(new Event('input',{bubbles:true}));}
  function loadSnapshots(){try{return JSON.parse(localStorage.getItem(snapshotsKey)||'{}')}catch{return {};}}
  function putConsumable(name,qty){
    const container=byId('pots');let input=[...container.querySelectorAll('input[data-pk="name"]')].find(el=>el.value.trim().toLowerCase()===name.toLowerCase());
    if(!input){byId('addPot').click();input=[...container.querySelectorAll('input[data-pk="name"]')].at(-1);
      if(!input)return;input.value=name;input.dispatchEvent(new Event('input',{bubbles:true}));}
    const index=input.dataset.pi,quantity=container.querySelector('input[data-pi="'+index+'"][data-pk="qty"]');
    if(quantity){quantity.value=qty;quantity.dispatchEvent(new Event('input',{bubbles:true}));}
  }
  function inventoryApply(scan){
    const snapshot={};
    for(const kind of ['Meat','Lemon']){
      const a=scan.entries.filter(x=>x.type===kind);
      if(!a.length||a.every(x=>Number.isInteger(x.quantity)&&x.quantity>=0&&x.quantity<=100))
        snapshot[kind]=a.reduce((sum,x)=>sum+x.quantity,0);
    }
    const key=byId('scanTarget').value, saved=loadSnapshots();saved[key]=snapshot;
    try{localStorage.setItem(snapshotsKey,JSON.stringify(saved));}catch{}
    let applied=0;
    if(saved.s&&saved.e)for(const item of ['Meat','Lemon']){
      if(saved.s[item]!=null&&saved.e[item]!=null){
        const used=saved.s[item]-saved.e[item];
        if(used>=0){putConsumable(item,used);applied++;}
      }
    }
    return applied;
  }
  function setBusy(value){busy=value;byId('scanRead').disabled=value;apply.disabled=value;}
  byId('scanRead').onclick=async()=>{
    if(!bitmap){say('Choose a screenshot first.');return;}
    setBusy(true);results.hidden=true;apply.hidden=true;active=null;
    const input=cropSource(),aspect=input.width/input.height;
    try{
      if(aspect>0.55&&aspect<0.95){
        const scan=findItems(input);scan.kind='inventory';scan.mesos=null;active=scan;
        inventoryPreview(scan);results.hidden=false;apply.hidden=false;
        if(!scan.entries.length){say('No meat or lemon icons matched. Crop the ENTIRE inventory window, from title to mesos bar. You can still read mesos from this inventory crop.');}
        else say('Found '+scan.entries.length+' matching stack icons. Reading mesos and quantities…');
        try{
          const worker=await makeWorker();
          try {
            const mesoImage=take(scan.normalized,170,374,77,27,4);
            const mesoText=await recognize(worker,mesoImage,{tessedit_pageseg_mode:'7',tessedit_char_whitelist:'0123456789,'});
            scan.mesos=parseMesos(mesoText);
            for(let i=0;i<scan.entries.length;i++){
              const entry=scan.entries[i];if(entry.quantity!=null)continue;const count=take(scan.normalized,entry.x,entry.y+24,40,21,5);
              const txt=await recognize(worker,count,{tessedit_pageseg_mode:'7',tessedit_char_whitelist:'0123456789'});
              const digits=txt.replace(/[^0-9]/g,'');
              const value=digits?Number(digits):null;
              if(value!=null&&value>=1&&value<=100)entry.quantity=value;
              say('Reading inventory stack '+(i+1)+' / '+scan.entries.length+'…');
            }
          }finally{await worker.terminate();}
          inventoryPreview(scan);
          say('Scan complete. Verify the numbers, especially partial stacks, before applying.');
        }catch(e){inventoryPreview(scan);say('Icons detected, but quantity OCR could not finish ('+e.message+'). Enter quantities manually and apply.');}
      }else if(aspect>2.3){
        const scan={kind:'bar',exp:null,percent:null,mesos:null};active=scan;
        say('Reading cropped EXP / mesos bar…');
        const worker=await makeWorker();
        try{
          const enlarged=scale(input,input.width*3,input.height*3);
          const text=await recognize(worker,enlarged,{tessedit_pageseg_mode:'7',tessedit_char_whitelist:''});
          const exp=parseExp(text);scan.exp=exp.exp;scan.percent=exp.percent;
          if(scan.exp==null&&scan.percent==null)scan.mesos=parseMesos(text);
        }finally{await worker.terminate();}
        barPreview(scan);results.hidden=false;apply.hidden=false;
        say('Bar recognized. Verify and apply the detected values.');
      }else {
        say('Please crop closely to the EXP/mesos bar (wide and short) or to the entire inventory window (tall and narrow).');
      }
    }catch(e){say('Could not read screenshot: '+(e.message||String(e)));}
    finally{setBusy(false);}
  };
  apply.onclick=()=>{
    if(!active)return;
    const prefix=byId('scanTarget').value;
    if(active.kind==='bar'){
      const raw=getScanField('raw'),pct=getScanField('percent'),mesos=getScanField('mesos');
      updateInput(prefix+'x',raw);updateInput(prefix+'p',pct);updateInput(prefix+'m',mesos);
      say('Applied detected EXP/mesos to '+(prefix==='s'?'starting':'ending')+' stats.');
    }else{
      const mesos=getScanField('mesos');updateInput(prefix+'m',mesos);
      const count=inventoryApply(active);
      say('Inventory saved for '+(prefix==='s'?'starting':'ending')+'. '+count+
        ' consumable quantities calculated from starting minus ending inventory. Check costs and adjustments manually.');
    }
  };
})();
