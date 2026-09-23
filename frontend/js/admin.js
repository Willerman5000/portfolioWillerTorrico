const adminState = {
  token: sessionStorage.getItem('portfolio-admin-token') || '',
  user: null,
  data: {projects:[], experiences:[], profile:null, messages:[]},
  editing: null
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = (v='') => String(v).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

async function api(path, options={}){
  const headers = new Headers(options.headers || {});
  if(adminState.token) headers.set('Authorization', `Bearer ${adminState.token}`);
  if(options.body && !(options.body instanceof FormData)) headers.set('Content-Type','application/json');
  const res = await fetch(path, {...options, headers, cache:'no-store'});
  const type = res.headers.get('content-type') || '';
  const body = type.includes('application/json') ? await res.json() : await res.text();
  if(!res.ok){
    const err = new Error(body?.error || body?.message || body || `HTTP ${res.status}`);
    err.status = res.status;
    err.path = path;
    throw err;
  }
  return body;
}

async function login(e){
  e.preventDefault();
  const status=$('#loginStatus');
  status.textContent='Ingresando…';
  status.className='form-status';
  const fd=new FormData(e.currentTarget);
  try{
    const out=await api('/api/auth/login',{method:'POST',body:JSON.stringify(Object.fromEntries(fd.entries()))});
    adminState.token=out.access_token;
    adminState.user=out.user;
    sessionStorage.setItem('portfolio-admin-token',adminState.token);
    status.textContent='Credenciales correctas. Abriendo panel…';
    status.className='form-status ok';
    await openApp(true);
  }catch(err){
    status.textContent=err.message || 'No se pudo iniciar sesión.';
    status.className='form-status error';
  }
}

async function openApp(fromLogin=false){
  if(!adminState.token) return;
  let me;
  try{
    me=await api('/api/admin/me');
  }catch(err){
    console.warn('Admin session check failed', err);
    if(err.status===401 || err.status===403){
      logout(false);
      const status=$('#loginStatus');
      if(status){
        status.textContent=err.message || 'Sesión no autorizada.';
        status.className='form-status error';
      }
    }
    return;
  }

  adminState.user=me.user;
  $('#loginPanel').hidden=true;
  $('#adminApp').hidden=false;
  $('#adminIdentity').textContent=adminState.user?.email || '';

  try{
    await refreshAll();
    setAdminStatus('Panel cargado correctamente.','ok',true);
  }catch(err){
    // Authentication already succeeded. A content/render error must never throw
    // the user back to the login form.
    console.error('Admin bootstrap/render error', err);
    setAdminStatus(`Sesión iniciada. No se pudo cargar todo el contenido: ${err.message || err}`,'error',false);
  }
}

function logout(reload=true){
  adminState.token='';adminState.user=null;sessionStorage.removeItem('portfolio-admin-token');
  if(reload) location.reload(); else {$('#adminApp').hidden=true;$('#loginPanel').hidden=false;}
}

function setAdminStatus(message='', kind='', autoHide=false){
  const el=$('#adminGlobalStatus');
  if(!el) return;
  el.textContent=message;
  el.className=`form-status admin-global-status ${kind||''}`.trim();
  el.hidden=!message;
  if(message && autoHide) setTimeout(()=>{el.hidden=true;},3500);
}

function safeRender(label, fn){
  try{fn();}
  catch(err){console.error(`Render ${label} failed`,err);setAdminStatus(`Error visual en ${label}: ${err.message||err}`,'error',false);}
}

async function refreshAll(){
  const out=await api('/api/admin/bootstrap');
  adminState.data.projects=Array.isArray(out.projects)?out.projects:[];
  adminState.data.experiences=Array.isArray(out.experiences)?out.experiences:[];
  adminState.data.profile=out.profile&&typeof out.profile==='object'?out.profile:{};
  adminState.data.messages=Array.isArray(out.messages)?out.messages:[];
  safeRender('proyectos',renderProjects);
  safeRender('experiencia',renderExperiences);
  safeRender('perfil',renderProfile);
  safeRender('mensajes',renderMessages);
}

function renderProjects(){
  const el=$('#projectsAdminList');
  if(!adminState.data.projects.length){el.innerHTML='<div class="admin-empty">No hay proyectos.</div>';return;}
  el.innerHTML=adminState.data.projects.map(p=>`<article class="admin-item"><div><h3>${esc(p.title_es || p.title_en || 'Sin título')} ${p.published?'<span class="status-pill">Publicado</span>':''}</h3><p>${esc(p.category||'')} · ${esc(p.subtitle_es||'')}</p></div><div class="admin-item-actions"><button class="mini-btn" data-edit-project="${esc(p.id)}">Editar</button><button class="mini-btn danger" data-delete-project="${esc(p.id)}">Eliminar</button></div></article>`).join('');
  $$('[data-edit-project]').forEach(b=>b.onclick=()=>openProjectEditor(b.dataset.editProject));
  $$('[data-delete-project]').forEach(b=>b.onclick=()=>deleteRecord('projects',b.dataset.deleteProject));
}

function renderExperiences(){
  const el=$('#experienceAdminList');
  if(!adminState.data.experiences.length){el.innerHTML='<div class="admin-empty">No hay experiencias.</div>';return;}
  el.innerHTML=adminState.data.experiences.map(x=>`<article class="admin-item"><div><h3>${esc(x.role_es||x.role_en||'Sin cargo')}</h3><p>${esc(x.organization||'')} · ${esc(x.start_date||'')} — ${esc(x.end_date||'Actualidad')}</p></div><div class="admin-item-actions"><button class="mini-btn" data-edit-exp="${esc(x.id)}">Editar</button><button class="mini-btn danger" data-delete-exp="${esc(x.id)}">Eliminar</button></div></article>`).join('');
  $$('[data-edit-exp]').forEach(b=>b.onclick=()=>openExperienceEditor(b.dataset.editExp));
  $$('[data-delete-exp]').forEach(b=>b.onclick=()=>deleteRecord('experiences',b.dataset.deleteExp));
}

function renderProfile(){
  const p=adminState.data.profile||{};
  $('#profileForm').innerHTML=`
    ${field('name','Nombre',p.name)}
    ${field('email','Email público',p.email,'email')}
    ${field('headline_es','Titular ES',p.headline_es)}
    ${field('headline_en','Headline EN',p.headline_en)}
    ${textarea('summary_es','Resumen ES',p.summary_es)}
    ${textarea('summary_en','Summary EN',p.summary_en)}
    ${field('location_es','Ubicación ES',p.location_es)}
    ${field('location_en','Location EN',p.location_en)}
    ${field('linkedin_url','LinkedIn',p.linkedin_url,'url')}
    ${field('github_url','GitHub',p.github_url,'url')}
    ${field('crypto_note_es','Trading (mención breve) ES',p.crypto_note_es)}
    ${field('crypto_note_en','Trading (brief mention) EN',p.crypto_note_en)}
    <div class="admin-form-actions"><button class="btn primary" type="submit">Guardar perfil</button></div>`;
  $('#profileForm').onsubmit=saveProfile;
}

function renderMessages(){
  const el=$('#messagesAdminList');
  if(!adminState.data.messages.length){el.innerHTML='<div class="admin-empty">Todavía no hay mensajes.</div>';return;}
  el.innerHTML=adminState.data.messages.map(m=>`<article class="admin-item"><div><h3>${esc(m.name)} · ${esc(m.email)}</h3><p>${esc(m.company||'')} ${m.project_type?`· ${esc(m.project_type)}`:''}</p><div class="message-meta">${esc(m.created_at||'')}</div><p class="message-body">${esc(m.message||'')}</p></div></article>`).join('');
}

function field(name,label,value='',type='text',extra=''){
  return `<div class="field ${extra}"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" type="${type}" value="${esc(value??'')}" /></div>`;
}
function textarea(name,label,value='',extra='full'){
  return `<div class="field ${extra}"><label for="f-${name}">${label}</label><textarea id="f-${name}" name="${name}">${esc(value??'')}</textarea></div>`;
}
function checkbox(name,label,checked=false){return `<label class="field"><span>${label}</span><input name="${name}" type="checkbox" ${checked?'checked':''} /></label>`;}

function openProjectEditor(id=''){
  const p=id?adminState.data.projects.find(x=>String(x.id)===String(id)):{};
  adminState.editing={resource:'projects',id:id||null};
  $('#editorForm').innerHTML=`
    <div class="field full"><span class="section-kicker">${id?'Editar':'Nuevo'} trabajo</span><h2>${id?'Editar proyecto':'Agregar proyecto / trabajo'}</h2></div>
    ${field('title_es','Título ES',p?.title_es)} ${field('title_en','Title EN',p?.title_en)}
    ${field('subtitle_es','Subtítulo ES',p?.subtitle_es)} ${field('subtitle_en','Subtitle EN',p?.subtitle_en)}
    ${textarea('description_es','Descripción ES',p?.description_es)} ${textarea('description_en','Description EN',p?.description_en)}
    ${field('category','Categoría (data, gis, water, ai)',p?.category||'data')} ${field('tags','Tags separados por coma',(p?.tags||[]).join(', '))}
    ${field('image_url','URL de imagen',p?.image_url||'','url')} ${field('sort_order','Orden',p?.sort_order||10,'number')}
    <div class="field full"><label>Subir imagen</label><div class="upload-row"><input id="projectUpload" type="file" accept="image/*" /><button class="mini-btn" type="button" id="uploadProjectBtn">Subir</button></div><span class="upload-note">La URL pública se insertará en el campo de imagen.</span></div>
    ${checkbox('featured','Proyecto destacado',!!p?.featured)} ${checkbox('published','Publicado',p?.published!==false)}
    <div class="admin-form-actions"><button class="btn secondary" type="button" id="cancelEditor">Cancelar</button><button class="btn primary" type="submit">Guardar</button></div>`;
  bindEditorCommon();
  $('#uploadProjectBtn').onclick=uploadProjectImage;
  openDialog();
}

function openExperienceEditor(id=''){
  const x=id?adminState.data.experiences.find(v=>String(v.id)===String(id)):{};
  adminState.editing={resource:'experiences',id:id||null};
  $('#editorForm').innerHTML=`
    <div class="field full"><span class="section-kicker">${id?'Editar':'Nueva'} experiencia</span><h2>${id?'Editar experiencia':'Agregar experiencia'}</h2></div>
    ${field('organization','Organización',x?.organization)} ${field('location','Ubicación',x?.location)}
    ${field('role_es','Cargo ES',x?.role_es)} ${field('role_en','Role EN',x?.role_en)}
    ${field('start_date','Inicio',x?.start_date,'date')} ${field('end_date','Fin',x?.end_date,'date')}
    ${field('category','Categorías separadas por coma',x?.category||'data')} ${field('sort_order','Orden',x?.sort_order||10,'number')}
    ${textarea('summary_es','Resumen ES',x?.summary_es)} ${textarea('summary_en','Summary EN',x?.summary_en)}
    <div class="admin-form-actions"><button class="btn secondary" type="button" id="cancelEditor">Cancelar</button><button class="btn primary" type="submit">Guardar</button></div>`;
  bindEditorCommon(); openDialog();
}

function bindEditorCommon(){
  $('#editorForm').onsubmit=saveEditor;
  $('#cancelEditor').onclick=()=>$('#editorDialog').close();
}
function openDialog(){const d=$('#editorDialog'); if(typeof d.showModal==='function')d.showModal(); else d.setAttribute('open','');}

async function saveEditor(e){
  e.preventDefault();
  const fd=new FormData(e.currentTarget), obj=Object.fromEntries(fd.entries());
  if(adminState.editing.resource==='projects'){
    obj.featured=fd.has('featured'); obj.published=fd.has('published'); obj.tags=String(obj.tags||'').split(',').map(x=>x.trim()).filter(Boolean); obj.sort_order=Number(obj.sort_order||10);
  } else {obj.sort_order=Number(obj.sort_order||10); if(!obj.end_date) obj.end_date=null;}
  const {resource,id}=adminState.editing;
  const path=id?`/api/admin/${resource}/${encodeURIComponent(id)}`:`/api/admin/${resource}`;
  await api(path,{method:id?'PATCH':'POST',body:JSON.stringify(obj)});
  $('#editorDialog').close(); await refreshAll();
}

async function saveProfile(e){
  e.preventDefault();
  const obj=Object.fromEntries(new FormData(e.currentTarget).entries());
  try{await api('/api/admin/profile',{method:'PATCH',body:JSON.stringify(obj)});await refreshAll();alert('Perfil guardado.');}
  catch(err){alert(err.message);}
}

async function deleteRecord(resource,id){
  if(!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return;
  try{await api(`/api/admin/${resource}/${encodeURIComponent(id)}`,{method:'DELETE'});await refreshAll();}
  catch(err){alert(err.message);}
}

async function uploadProjectImage(){
  const input=$('#projectUpload'); if(!input.files?.length){alert('Seleccioná una imagen.');return;}
  const fd=new FormData(); fd.append('file',input.files[0]);
  try{const out=await api('/api/admin/upload',{method:'POST',body:fd});$('#f-image_url').value=out.public_url;}
  catch(err){alert(err.message);}
}

function bindTabs(){
  $$('.admin-tab').forEach(btn=>btn.onclick=()=>{
    $$('.admin-tab').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
    $$('.admin-section').forEach(x=>x.classList.remove('active'));
    $(`[data-panel="${btn.dataset.tab}"]`)?.classList.add('active');
  });
}

function init(){
  $('#loginForm').addEventListener('submit',login);$('#logoutBtn').addEventListener('click',()=>logout(true));
  $('#newProjectBtn').onclick=()=>openProjectEditor();$('#newExperienceBtn').onclick=()=>openExperienceEditor();
  $('#editorClose').onclick=()=>$('#editorDialog').close();
  bindTabs(); if(adminState.token) openApp(false);
}

document.addEventListener('DOMContentLoaded',init);
