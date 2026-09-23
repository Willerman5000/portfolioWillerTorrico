const state = {
  lang: localStorage.getItem('portfolio-lang') || 'es',
  theme: localStorage.getItem('portfolio-theme') || 'dark',
  data: null,
  projectFilter: 'all',
  skillFilter: 'all',
  experienceFilter: 'all',
  labDataset: 'onion',
  thesisView: 'classes',
  map: null
};

const t = {
  es: {
    'nav.about':'Sobre mí','nav.projects':'Proyectos','nav.thesis':'Tesis','nav.data':'Data Lab','nav.gis':'SIG','nav.experience':'Experiencia','nav.contact':'Contacto',
    'hero.work':'Ver proyectos','hero.cv':'Descargar CV ATS','hero.available':'Disponible para proyectos remotos','hero.years':'años de trayectoria',
    'about.kicker':'Perfil profesional','about.title':'Datos, territorio y decisiones','about.text':'Mi perfil combina ciencias agroambientales, recursos hídricos, geotecnologías y analítica de datos. Esa combinación permite abordar problemas técnicos desde la evidencia, no desde una sola herramienta.','about.data':'Limpieza, análisis, estadística, visualización y comunicación de resultados.','about.gis':'Análisis espacial, cartografía, riesgo, ambiente y teledetección.','about.water':'Gestión integral, riego, agrohidrología y evaluación técnica.','about.ai':'Automatización, asistentes analíticos y flujos de trabajo con LLM.',
    'skills.kicker':'Stack profesional','skills.title':'Herramientas y capacidades','filters.all':'Todas','filters.environment':'Ambiente',
    'projects.kicker':'Trabajo seleccionado','projects.title':'Casos que demuestran capacidad técnica','projects.text':'Los proyectos se presentan por problema, datos, herramientas y resultado técnico. El foco está en evidencia verificable y transferible a trabajos remotos.','projects.open':'Ver caso','projects.featured':'Destacado',
    'lab.kicker':'Data Lab','lab.title':'Investigación agrícola convertida en una experiencia interactiva','lab.text':'Este módulo transforma tablas técnicas en comparaciones visuales. Los datos se conservan tal como están documentados y el sistema señala inconsistencias de origen en vez de ocultarlas.','lab.onion':'Cebolla','lab.tomato':'Tomate','lab.garlic':'Ajo','lab.chartKicker':'Comparación','lab.sort':'Ordenar','lab.highLow':'Mayor a menor','lab.lowHigh':'Menor a mayor','lab.alpha':'Alfabético',
    'thesis.kicker':'Maestría · análisis aplicado','thesis.title':'Datos, suelos, SIG y riego integrados en una investigación real','thesis.text':'Mi tesis de Maestría en Gestión Integral de Recursos Hídricos convirtió datos de campo y cartografía en criterios concretos para diseñar y manejar riego por aspersión en Cliza.','thesis.fullTitle':'Evaluación de la infiltrabilidad del suelo, como criterio de diseño y manejo de sistemas de riego por aspersión en el municipio de Cliza','thesis.intro':'Trabajo aplicado que conecta medición de campo, análisis cuantitativo, suelos, cartografía SIG y diseño de riego.','thesis.classes':'Clases de infiltrabilidad','thesis.irrigation':'Diseño y manejo de riego','thesis.methods':'Métodos de análisis','thesis.maps':'Mapas SIG','thesis.conclusions':'Conclusiones','thesis.area':'Superficie municipal','thesis.basic':'Infiltración básica','thesis.acc5h':'Infiltración acumulada · 5 h','thesis.maxTime':'Tiempo máximo de riego','thesis.source':'Tesis de Maestría · UMSS / Centro AGUA · 2019','thesis.rounding':'Los porcentajes publicados en la tesis están redondeados y suman 99,7%.','thesis.skills':'Competencias demostradas','thesis.skillsText':'Análisis de datos · regresión · modelado de infiltración · suelos · riego por aspersión · análisis espacial · cartografía SIG · comunicación técnica',
    'gis.title':'Experiencia territorial en un mapa interactivo','gis.text':'El mapa interactivo resume la experiencia territorial y el portfolio incorpora además mapas originales de la tesis de maestría sobre unidades de suelo e infiltrabilidad en Cliza.','gis.coverage':'Cobertura profesional','gis.thesisTitle':'Cartografía de la tesis incorporada','gis.thesisText':'La sección de Maestría incluye mapas originales de ubicación, unidades de suelo e infiltrabilidad, junto con los resultados cuantitativos documentados.',
    'experience.kicker':'Trayectoria','experience.title':'Experiencia multidisciplinaria','experience.text':'Consultoría, sector público, cooperación internacional, investigación y proyectos socioambientales.',
    'education.kicker':'Formación','education.title':'Educación y especialización',
    'contact.kicker':'Contacto','contact.title':'¿Necesitás transformar datos técnicos en una decisión útil?','contact.text':'Disponible para análisis de datos, SIG, automatización, recursos hídricos, investigación aplicada y soporte técnico remoto.','contact.name':'Nombre','contact.email':'Email','contact.company':'Empresa / organización','contact.type':'Tipo de proyecto','contact.message':'Mensaje','contact.send':'Enviar mensaje','contact.sending':'Enviando…','contact.ok':'Mensaje enviado. Gracias por contactar.','contact.error':'No se pudo enviar. Podés contactarme directamente por email o LinkedIn.','contact.required':'Completá nombre, email y mensaje.',
    'footer.tagline':'Data · GIS · Water Resources · Applied AI','footer.admin':'Administrar portfolio',
    'lab.onionTitle':'Rendimiento esperado · cebolla','lab.onionMetric':'40 t/ha','lab.onionInsight':'Mayor rendimiento esperado documentado','lab.onionText':'Sintética 14 presenta el mayor rendimiento esperado de la tabla. El explorador permite comparar ciclo, color, pungencia y vida en anaquel.','lab.tomatoTitle':'Alcance de investigación · tomate','lab.tomatoText':'La documentación reporta 116 F1 obtenidos a partir de parentales, 39 variedades introducidas evaluadas, 6 híbridos introducidos en 2013 y 15 líneas puras de Taiwán.','lab.garlicTitle':'Cobertura de investigación · ajo','lab.garlicText':'El documento reporta 9 ensayos de investigación. La narrativa menciona 17 variedades o ecotipos, mientras la tabla visible enumera 16; v1.0 conserva esa diferencia como control de calidad de la fuente.',
    'table.variety':'Variedad','table.yield':'Rendimiento esperado (t/ha)','table.cycle':'Ciclo (días)','table.skin':'Color de piel','table.pungency':'Pungencia','table.shelf':'Anaquel',
    'map.fallback':'El mapa interactivo necesita conexión para cargar Leaflet. Las ubicaciones siguen disponibles en la lista lateral.'
  },
  en: {
    'nav.about':'About','nav.projects':'Projects','nav.thesis':'Thesis','nav.data':'Data Lab','nav.gis':'GIS','nav.experience':'Experience','nav.contact':'Contact',
    'hero.work':'View projects','hero.cv':'Download ATS Resume','hero.available':'Available for remote projects','hero.years':'years across career timeline',
    'about.kicker':'Professional profile','about.title':'Data, territory and decisions','about.text':'My profile combines agro-environmental sciences, water resources, geotechnologies and data analytics. That combination helps solve technical problems through evidence rather than through a single tool.','about.data':'Cleaning, analysis, statistics, visualization and communication of results.','about.gis':'Spatial analysis, mapping, risk, environment and remote sensing.','about.water':'Integrated management, irrigation, agrohydrology and technical assessment.','about.ai':'Automation, analytical assistants and LLM-enabled workflows.',
    'skills.kicker':'Professional stack','skills.title':'Tools and capabilities','filters.all':'All','filters.environment':'Environment',
    'projects.kicker':'Selected work','projects.title':'Cases that demonstrate technical capability','projects.text':'Projects are presented through problem, data, tools and technical outcome, with an emphasis on verifiable evidence transferable to remote work.','projects.open':'View case','projects.featured':'Featured',
    'lab.kicker':'Data Lab','lab.title':'Agricultural research turned into an interactive experience','lab.text':'This module turns technical tables into visual comparisons. Source values are preserved as documented, and source inconsistencies are flagged instead of silently corrected.','lab.onion':'Onion','lab.tomato':'Tomato','lab.garlic':'Garlic','lab.chartKicker':'Comparison','lab.sort':'Sort','lab.highLow':'High to low','lab.lowHigh':'Low to high','lab.alpha':'Alphabetical',
    'thesis.kicker':'Master’s · applied analytics','thesis.title':'Data, soils, GIS and irrigation integrated in a real research project','thesis.text':'My Master’s thesis in Integrated Water Resources Management turned field data and mapping into practical criteria for sprinkler-irrigation design and management in Cliza.','thesis.fullTitle':'Assessment of soil infiltrability as a criterion for sprinkler-irrigation design and management in the municipality of Cliza','thesis.intro':'Applied research connecting field measurement, quantitative analysis, soils, GIS mapping and irrigation design.','thesis.classes':'Infiltrability classes','thesis.irrigation':'Irrigation design & management','thesis.methods':'Analysis methods','thesis.maps':'GIS maps','thesis.conclusions':'Conclusions','thesis.area':'Municipal area','thesis.basic':'Basic infiltration','thesis.acc5h':'Accumulated infiltration · 5 h','thesis.maxTime':'Maximum irrigation time','thesis.source':'Master’s thesis · UMSS / Centro AGUA · 2019','thesis.rounding':'Percentages reported in the thesis are rounded and sum to 99.7%.','thesis.skills':'Demonstrated competencies','thesis.skillsText':'Data analytics · regression · infiltration modelling · soils · sprinkler irrigation · spatial analysis · GIS mapping · technical communication',
    'gis.title':'Territorial experience on an interactive map','gis.text':'The interactive map summarizes territorial experience, while the portfolio also includes original thesis maps of soil units and infiltrability in Cliza.','gis.coverage':'Professional coverage','gis.thesisTitle':'Thesis cartography included','gis.thesisText':'The Master’s section includes original location, soil-unit and infiltrability maps together with documented quantitative findings.',
    'experience.kicker':'Career','experience.title':'Multidisciplinary experience','experience.text':'Consulting, public sector, international cooperation, research and socio-environmental projects.',
    'education.kicker':'Education','education.title':'Education and specialization',
    'contact.kicker':'Contact','contact.title':'Need to turn technical data into a useful decision?','contact.text':'Available for data analytics, GIS, automation, water resources, applied research and remote technical support.','contact.name':'Name','contact.email':'Email','contact.company':'Company / organization','contact.type':'Project type','contact.message':'Message','contact.send':'Send message','contact.sending':'Sending…','contact.ok':'Message sent. Thanks for reaching out.','contact.error':'The message could not be sent. You can contact me directly by email or LinkedIn.','contact.required':'Please complete name, email and message.',
    'footer.tagline':'Data · GIS · Water Resources · Applied AI','footer.admin':'Manage portfolio',
    'lab.onionTitle':'Expected yield · onion','lab.onionMetric':'40 t/ha','lab.onionInsight':'Highest documented expected yield','lab.onionText':'Sintética 14 has the highest expected yield in the source table. The explorer also compares cycle, skin color, pungency and shelf life.','lab.tomatoTitle':'Research scope · tomato','lab.tomatoText':'The documentation reports 116 F1 hybrids obtained from parental material, 39 introduced varieties evaluated, 6 hybrids introduced in 2013 and 15 pure lines from Taiwan.','lab.garlicTitle':'Research coverage · garlic','lab.garlicText':'The document reports 9 research trials. Its narrative states 17 varieties or ecotypes while the visible table lists 16; v1.0 preserves that difference as a source-quality check.',
    'table.variety':'Variety','table.yield':'Expected yield (t/ha)','table.cycle':'Cycle (days)','table.skin':'Skin color','table.pungency':'Pungency','table.shelf':'Shelf life',
    'map.fallback':'The interactive map needs a network connection to load Leaflet. Locations remain available in the side list.'
  }
};

const esc = (value='') => String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
const tr = key => t[state.lang]?.[key] ?? t.es[key] ?? key;
const localized = (obj, key) => obj?.[`${key}_${state.lang}`] || obj?.[`${key}_es`] || obj?.[key] || '';

function mergeCaseStudies(localRows=[], remoteRows=[]){
  const byType = new Map();
  (localRows || []).forEach(row => { if(row?.type) byType.set(row.type, row); });
  (remoteRows || []).forEach(row => {
    if(!row?.type) return;
    const previous = byType.get(row.type) || {};
    const remoteData = row.data_json && typeof row.data_json === 'object' ? row.data_json : null;
    const previousData = previous.data_json && typeof previous.data_json === 'object' ? previous.data_json : {};
    byType.set(row.type, { ...previous, ...row, data_json: remoteData ? { ...previousData, ...remoteData } : previousData });
  });
  return [...byType.values()];
}

function mergeBootstrap(localData={}, remoteData={}){
  const out = { ...localData, ...remoteData };
  out.profile = { ...(localData.profile || {}), ...(remoteData.profile || {}) };
  for(const key of ['skills','education','experiences','projects']){
    const remoteRows = remoteData?.[key];
    out[key] = Array.isArray(remoteRows) && remoteRows.length ? remoteRows : (localData?.[key] || []);
  }
  out.case_studies = mergeCaseStudies(localData.case_studies || [], remoteData.case_studies || []);
  out._meta = { ...(localData._meta || {}), ...(remoteData._meta || {}), localFallbackMerged: true };
  return out;
}

async function loadData(){
  let localData = {};
  try{
    const localRes = await fetch('/data/seed.json', {cache:'no-store'});
    if(localRes.ok) localData = await localRes.json();
  }catch(err){
    console.warn('Static seed unavailable', err);
  }

  state.data = localData;
  try{
    const res = await fetch('/api/public/bootstrap', {headers:{'Accept':'application/json'}, cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const remoteData = await res.json();
    state.data = mergeBootstrap(localData, remoteData);
  }catch(err){
    console.warn('API unavailable; using static portfolio data', err);
  }

  if(!state.data || !Object.keys(state.data).length){
    state.data = {profile:{},skills:[],education:[],experiences:[],projects:[],case_studies:[]};
  }
  hydrate();
}

function applyTranslations(){
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if(tr(key)) el.textContent = tr(key);
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const active = btn.dataset.lang === state.lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

function hydrate(){
  applyTranslations();
  renderProfile();
  renderSkills();
  renderProjects();
  renderThesis();
  renderExperience();
  renderEducation();
  renderLab();
  renderMap();
  initReveal();
}

function renderProfile(){
  const p = state.data.profile || {};
  setText('profileEyebrow', localized(p,'eyebrow'));
  setText('profileName', p.name);
  setText('profileHeadline', localized(p,'headline'));
  setText('profileSummary', localized(p,'summary'));
  setText('profileLocation', localized(p,'location'));
  setText('cryptoNote', localized(p,'crypto_note'));
  const photo = document.getElementById('profilePhoto');
  if(photo){
    const formalPhoto = '/assets/img/willer-profile-formal.jpg';
    const sourcePhoto = '/assets/img/willer-profile-source.jpg';
    photo.onerror = () => {
      const current = photo.getAttribute('src') || '';
      if(!current.includes('willer-profile-formal.jpg')){
        photo.src = formalPhoto;
      }else if(!current.includes('willer-profile-source.jpg')){
        photo.src = sourcePhoto;
      }
    };
    photo.src = (p.photo_url || formalPhoto).trim() || formalPhoto;
  }
  const cv = document.getElementById('cvPrimary'); cv.href = state.lang === 'en' ? p.cv_en_url : p.cv_es_url;
  const links = [
    ['linkedinLink',p.linkedin_url],['contactLinkedin',p.linkedin_url],['githubLink',p.github_url],['contactGithub',p.github_url]
  ];
  links.forEach(([id,url])=>{const el=document.getElementById(id); if(el && url) el.href=url;});
  const mail = document.getElementById('emailLink'); if(mail && p.email){mail.href=`mailto:${p.email}`;}
}

function renderSkills(){
  const rows = [...(state.data.skills || [])].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  const visible = state.skillFilter === 'all' ? rows : rows.filter(x=>x.category===state.skillFilter);
  document.getElementById('skillsGrid').innerHTML = visible.map(s=>`
    <article class="skill-card reveal visible" data-category="${esc(s.category)}">
      <span class="skill-cat">${esc(s.category)}</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.detail)}</p>
    </article>`).join('');
}

function renderProjects(){
  const rows = [...(state.data.projects || [])].filter(x=>x.published!==false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  const visible = state.projectFilter === 'all' ? rows : rows.filter(x=>x.category===state.projectFilter);
  document.getElementById('projectsGrid').innerHTML = visible.map((p,i)=>`
    <article class="project-card ${p.featured?'featured':''} reveal visible" data-category="${esc(p.category)}">
      <div class="project-visual"><span class="project-type">${p.featured?`${tr('projects.featured')} · `:''}${esc(p.category)}</span></div>
      <div class="project-body">
        <span class="project-subtitle">${esc(localized(p,'subtitle'))}</span>
        <h3>${esc(localized(p,'title'))}</h3>
        <p>${esc(localized(p,'description'))}</p>
        <div class="tags">${(p.tags||[]).map(tag=>`<span class="tag">${esc(tag)}</span>`).join('')}</div>
        <button class="project-open" data-project-id="${esc(p.id)}">${tr('projects.open')} <span aria-hidden="true">→</span></button>
      </div>
    </article>`).join('');
  document.querySelectorAll('.project-open').forEach(btn=>btn.addEventListener('click',()=>openProject(btn.dataset.projectId)));
}

function openProject(id){
  const p = (state.data.projects || []).find(x=>String(x.id)===String(id));
  if(!p) return;
  const expMatches = (state.data.experiences||[]).filter(x=> {
    const d = localized(p,'description').toLowerCase();
    return d.includes((x.organization||'').split(' / ')[0].toLowerCase());
  });
  document.getElementById('dialogContent').innerHTML = `<div class="dialog-inner">
    <span class="section-kicker">${esc(p.category)} · ${(p.tags||[]).map(esc).join(' · ')}</span>
    <h2>${esc(localized(p,'title'))}</h2>
    <strong>${esc(localized(p,'subtitle'))}</strong>
    <p>${esc(localized(p,'description'))}</p>
    ${expMatches.length?`<p><b>${state.lang==='es'?'Experiencia vinculada':'Related experience'}:</b> ${expMatches.map(x=>esc(x.organization)).join(', ')}</p>`:''}
  </div>`;
  const dlg=document.getElementById('projectDialog');
  if(typeof dlg.showModal==='function') dlg.showModal(); else dlg.setAttribute('open','');
}

function renderExperience(){
  const rows = [...(state.data.experiences || [])].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  const visible = state.experienceFilter === 'all' ? rows : rows.filter(x=>(x.category||'').split(',').includes(state.experienceFilter));
  document.getElementById('experienceTimeline').innerHTML = visible.map(x=>`
    <article class="timeline-item reveal visible">
      <div class="timeline-date">${formatDateRange(x.start_date,x.end_date)}</div>
      <div class="timeline-card">
        <h3>${esc(localized(x,'role'))}</h3>
        <div class="timeline-meta">${esc(x.organization)} · ${esc(x.location)}</div>
        <p>${esc(localized(x,'summary'))}</p>
      </div>
    </article>`).join('');
}

function formatDateRange(start,end){
  const locale = state.lang === 'es' ? 'es-AR' : 'en-US';
  const fmt = d => {
    if(!d) return state.lang==='es'?'Actualidad':'Present';
    const date=new Date(`${d}T12:00:00`);
    return new Intl.DateTimeFormat(locale,{month:'short',year:'numeric'}).format(date);
  };
  return `${fmt(start)} — ${fmt(end)}`;
}

function renderEducation(){
  const rows=[...(state.data.education||[])].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
  document.getElementById('educationGrid').innerHTML=rows.map(e=>`
    <article class="edu-card reveal visible">
      <span class="edu-year">${esc(e.start_year)}${e.end_year && e.end_year!==e.start_year?` — ${esc(e.end_year)}`:''}</span>
      <h3>${esc(localized(e,'degree'))}</h3>
      <p>${esc(e.institution)}</p>
    </article>`).join('');
}

function getThesisCase(){return (state.data.case_studies||[]).find(x=>x.type==='thesis')?.data_json || {};}

function renderThesis(){
  const d=getThesisCase();
  const content=document.getElementById('thesisContent');
  const stats=document.getElementById('thesisStats');
  if(!content || !stats) return;
  if(!Array.isArray(d.classes) || !d.classes.length){
    stats.innerHTML='';
    content.innerHTML=`<div class="thesis-findings"><h3>${state.lang==='es'?'Datos de tesis temporalmente no disponibles':'Thesis data temporarily unavailable'}</h3><p>${state.lang==='es'?'El portfolio no recibió el conjunto de datos de la tesis. La v1.1.1 incluye una copia local de respaldo para evitar que esta sección quede vacía.':'The portfolio did not receive the thesis dataset. v1.1.1 includes a local fallback copy so this section does not render empty.'}</p></div>`;
    return;
  }

  const statItems=[
    [d.validated_soil_units, state.lang==='es'?'unidades de suelo validadas':'validated soil units'],
    [d.sampled_plots, state.lang==='es'?'parcelas muestreadas':'sampled plots'],
    [`${d.tests_per_observation}×`, state.lang==='es'?'pruebas por punto':'tests per point'],
    [d.test_duration_hours+' h', state.lang==='es'?'duración de prueba':'test duration'],
    [d.soil_density_g_cm3, 'g/cm³ · '+(state.lang==='es'?'densidad aparente':'bulk density')]
  ];
  stats.innerHTML=statItems.map(([v,l])=>`<div class="thesis-stat"><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`).join('');

  const classes=d.classes||[];
  if(state.thesisView==='classes'){
    const maxArea=Math.max(...classes.map(x=>x.area_pct||0),1);
    content.innerHTML=`
      <div class="thesis-panel-grid">
        <div class="thesis-chart-card">
          <div class="thesis-card-head"><div><span class="section-kicker">${tr('thesis.area')}</span><h3>${state.lang==='es'?'Distribución espacial por clase':'Spatial distribution by class'}</h3></div></div>
          <div class="thesis-bars">${classes.map(c=>`
            <div class="thesis-bar-row">
              <div class="thesis-bar-label"><b>${esc(localized(c,'name'))}</b><small>${esc(localized(c,'units'))}</small></div>
              <div class="thesis-bar-track"><span style="width:${(c.area_pct/maxArea)*100}%"></span></div>
              <strong>${c.area_pct}%</strong>
            </div>`).join('')}</div>
          <p class="thesis-note">${tr('thesis.rounding')}</p>
          <div class="thesis-static-charts">
            <figure><img src="/assets/thesis/area_distribution.png" alt="${state.lang==='es'?'Distribución de clases de infiltrabilidad':'Distribution of infiltrability classes'}" loading="lazy"><figcaption>${state.lang==='es'?'Superficie municipal por clase de infiltrabilidad':'Municipal area by infiltrability class'}</figcaption></figure>
            <figure><img src="/assets/thesis/basic_infiltration_ranges.png" alt="${state.lang==='es'?'Rangos de infiltración básica':'Basic infiltration ranges'}" loading="lazy"><figcaption>${state.lang==='es'?'Rangos documentados de infiltración básica':'Documented basic-infiltration ranges'}</figcaption></figure>
          </div>
        </div>
        <div class="thesis-class-cards">${classes.map(c=>`
          <article class="thesis-class-card">
            <span class="thesis-class-dot ${esc(c.key)}"></span>
            <h3>${esc(localized(c,'name'))}</h3>
            <dl>
              <div><dt>${tr('thesis.area')}</dt><dd>${c.area_pct}%</dd></div>
              <div><dt>${tr('thesis.basic')}</dt><dd>${esc(c.basic_range_mm_h)} mm/h</dd></div>
              <div><dt>${tr('thesis.acc5h')}</dt><dd>${esc(c.accumulated_5h_mm)} mm</dd></div>
            </dl>
          </article>`).join('')}</div>
      </div>`;
  } else if(state.thesisView==='irrigation'){
    const maxMin=Math.max(...classes.map(x=>x.max_irrigation_minutes||0),1);
    const findings=state.lang==='es'?d.design_findings_es:d.design_findings_en;
    content.innerHTML=`
      <div class="thesis-panel-grid">
        <div class="thesis-chart-card">
          <div class="thesis-card-head"><div><span class="section-kicker">${tr('thesis.maxTime')}</span><h3>${state.lang==='es'?'Comparación por clase de suelo':'Comparison by soil class'}</h3></div></div>
          <div class="irrigation-bars">${classes.map(c=>`
            <div class="irrigation-row">
              <div><b>${esc(localized(c,'name'))}</b><small>${esc(c.basic_range_mm_h)} mm/h</small></div>
              <div class="irrigation-track"><span style="width:${(c.max_irrigation_minutes/maxMin)*100}%"></span></div>
              <strong>${esc(c.max_irrigation)}</strong>
            </div>`).join('')}</div>
          <div class="thesis-static-charts">
            <figure><img src="/assets/thesis/irrigation_time_by_class.png" alt="${state.lang==='es'?'Tiempo máximo de riego por clase':'Maximum irrigation time by class'}" loading="lazy"><figcaption>${state.lang==='es'?'Tiempo máximo de riego documentado':'Documented maximum irrigation time'}</figcaption></figure>
            <figure><img src="/assets/thesis/accumulated_infiltration_5h.png" alt="${state.lang==='es'?'Infiltración acumulada a cinco horas':'Five-hour accumulated infiltration'}" loading="lazy"><figcaption>${state.lang==='es'?'Infiltración acumulada después de 5 horas':'Accumulated infiltration after 5 hours'}</figcaption></figure>
          </div>
        </div>
        <div class="thesis-findings">
          <span class="section-kicker">${state.lang==='es'?'Conclusiones de diseño':'Design findings'}</span>
          <ol>${(findings||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ol>
        </div>
      </div>`;
  } else if(state.thesisView==='methods'){
    const methods=state.lang==='es'?d.analysis_methods_es:d.analysis_methods_en;
    content.innerHTML=`
      <div class="methods-layout">
        <div class="methods-list">${(methods||[]).map((m,i)=>`<article><span>${i+1}</span><p>${esc(m)}</p></article>`).join('')}</div>
        <aside class="methods-proof">
          <span class="section-kicker">${tr('thesis.skills')}</span>
          <h3>${state.lang==='es'?'De datos de campo a una decisión de riego':'From field data to an irrigation decision'}</h3>
          <p>${tr('thesis.skillsText')}</p>
          <div class="method-flow">
            <b>${state.lang==='es'?'Muestreo':'Sampling'}</b><span>→</span>
            <b>${state.lang==='es'?'Modelado':'Modelling'}</b><span>→</span>
            <b>r²</b><span>→</span>
            <b>SIG</b><span>→</span>
            <b>${state.lang==='es'?'Diseño':'Design'}</b>
          </div>
        </aside>
      </div>`;
  } else if(state.thesisView==='maps'){
    content.innerHTML=`
      <div class="thesis-map-gallery">${(d.maps||[]).map((m,i)=>`
        <button class="thesis-map-card" type="button" data-thesis-map="${esc(m.url)}" data-thesis-title="${esc(localized(m,'title'))}" data-thesis-caption="${esc(localized(m,'caption'))}">
          <img src="${esc(m.url)}" alt="${esc(localized(m,'title'))}" loading="lazy">
          <span><b>${esc(localized(m,'title'))}</b><small>${esc(localized(m,'caption'))}</small></span>
        </button>`).join('')}</div>`;
    document.querySelectorAll('[data-thesis-map]').forEach(btn=>btn.addEventListener('click',()=>openThesisMap(btn)));
  } else {
    const conclusions=state.lang==='es'?d.conclusions_es:d.conclusions_en;
    content.innerHTML=`
      <div class="conclusion-layout">
        <div class="conclusion-list">${(conclusions||[]).map((x,i)=>`<article><span>${i+1}</span><p>${esc(x)}</p></article>`).join('')}</div>
        <aside class="conclusion-callout">
          <span class="section-kicker">Impact</span>
          <h3>${state.lang==='es'?'La tesis demuestra una cadena analítica completa':'The thesis demonstrates an end-to-end analytical workflow'}</h3>
          <p>${state.lang==='es'?'Trabajo de campo, control de calidad, modelado, análisis espacial y traducción de resultados a recomendaciones técnicas de riego.':'Fieldwork, quality control, modelling, spatial analysis and translation of results into technical irrigation recommendations.'}</p>
        </aside>
      </div>`;
  }
}

function openThesisMap(btn){
  const dlg=document.getElementById('projectDialog');
  document.getElementById('dialogContent').innerHTML=`<div class="dialog-inner thesis-map-dialog">
    <span class="section-kicker">${tr('thesis.source')}</span>
    <h2>${esc(btn.dataset.thesisTitle||'')}</h2>
    <img src="${esc(btn.dataset.thesisMap||'')}" alt="${esc(btn.dataset.thesisTitle||'')}">
    <p>${esc(btn.dataset.thesisCaption||'')}</p>
  </div>`;
  if(typeof dlg.showModal==='function') dlg.showModal(); else dlg.setAttribute('open','');
}

function getAgriCase(){return (state.data.case_studies||[]).find(x=>x.type==='agriculture')?.data_json || {};}

function renderLab(){
  const data=getAgriCase();
  const chart=document.getElementById('barChart');
  const tableWrap=document.getElementById('dataTableWrap');
  const insight=document.getElementById('labInsight');
  const title=document.getElementById('chartTitle');
  if(state.labDataset==='onion'){
    let rows=[...(data.onion||[])];
    const sort=document.getElementById('yieldSort')?.value || 'desc';
    if(sort==='desc') rows.sort((a,b)=>b.yield_t_ha-a.yield_t_ha);
    if(sort==='asc') rows.sort((a,b)=>a.yield_t_ha-b.yield_t_ha);
    if(sort==='name') rows.sort((a,b)=>a.name.localeCompare(b.name));
    const max=Math.max(...rows.map(r=>r.yield_t_ha),1);
    title.textContent=tr('lab.onionTitle');
    chart.innerHTML=rows.map(r=>`<div class="bar-row"><span class="bar-label" title="${esc(r.name)}">${esc(r.name)}</span><div class="bar-track"><div class="bar-fill" style="width:${(r.yield_t_ha/max)*100}%"></div></div><span class="bar-value">${r.yield_t_ha}</span></div>`).join('');
    insight.innerHTML=`<small class="section-kicker">Insight</small><div class="insight-metric">${tr('lab.onionMetric')}</div><h3>${tr('lab.onionInsight')}</h3><p>${tr('lab.onionText')}</p>`;
    tableWrap.innerHTML=`<table class="data-table"><thead><tr><th>${tr('table.variety')}</th><th>${tr('table.yield')}</th><th>${tr('table.cycle')}</th><th>${tr('table.skin')}</th><th>${tr('table.pungency')}</th><th>${tr('table.shelf')}</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.name)}</td><td>${r.yield_t_ha}</td><td>${esc(r.cycle)}</td><td>${esc(r.skin)}</td><td>${esc(r.pungency)}</td><td>${esc(r.shelf)}</td></tr>`).join('')}</tbody></table>`;
  }else if(state.labDataset==='tomato'){
    const d=data.tomato||{};
    const metrics=[
      [state.lang==='es'?'Híbridos F1':'F1 hybrids',d.f1_hybrids],
      [state.lang==='es'?'Variedades introducidas':'Introduced varieties',d.introduced_varieties],
      [state.lang==='es'?'Híbridos introducidos 2013':'Hybrids introduced in 2013',d.introduced_hybrids_2013],
      [state.lang==='es'?'Líneas puras (Taiwán)':'Pure lines (Taiwan)',d.pure_lines_taiwan]
    ];
    const max=Math.max(...metrics.map(x=>Number(x[1])||0),1);
    title.textContent=tr('lab.tomatoTitle');
    chart.innerHTML=metrics.map(([name,val])=>`<div class="bar-row"><span class="bar-label" title="${esc(name)}">${esc(name)}</span><div class="bar-track"><div class="bar-fill" style="width:${(val/max)*100}%"></div></div><span class="bar-value">${val}</span></div>`).join('');
    insight.innerHTML=`<small class="section-kicker">Scope</small><div class="insight-metric">116 F1</div><h3>${state.lang==='es'?'Cuatro líneas de acción-investigación':'Four research-action lines'}</h3><p>${tr('lab.tomatoText')}</p>`;
    tableWrap.innerHTML=`<table class="data-table"><thead><tr><th>${state.lang==='es'?'Indicador':'Indicator'}</th><th>${state.lang==='es'?'Valor documentado':'Documented value'}</th></tr></thead><tbody>${metrics.map(([n,v])=>`<tr><td>${esc(n)}</td><td>${v}</td></tr>`).join('')}</tbody></table>`;
  }else{
    const d=data.garlic||{};
    const metrics=[
      [state.lang==='es'?'Ensayos documentados':'Documented trials',d.research_trials_documented],
      [state.lang==='es'?'Variedades/ecotipos (narrativa)':'Varieties/ecotypes (narrative)',d.narrative_varieties_or_ecotypes],
      [state.lang==='es'?'Variedades listadas en tabla':'Varieties listed in table',d.table_varieties_listed],
      [state.lang==='es'?'Introducidas INTA Argentina':'Introduced from INTA Argentina',d.introduced_inta_argentina],
      [state.lang==='es'?'Locales/colectadas listadas':'Local/collected listed',d.local_or_collected_listed]
    ];
    const max=Math.max(...metrics.map(x=>Number(x[1])||0),1);
    title.textContent=tr('lab.garlicTitle');
    chart.innerHTML=metrics.map(([name,val])=>`<div class="bar-row"><span class="bar-label" title="${esc(name)}">${esc(name)}</span><div class="bar-track"><div class="bar-fill" style="width:${(val/max)*100}%"></div></div><span class="bar-value">${val}</span></div>`).join('');
    insight.innerHTML=`<small class="section-kicker">Data QA</small><div class="insight-metric">17 ↔ 16</div><h3>${state.lang==='es'?'Validación de consistencia':'Consistency validation'}</h3><p>${tr('lab.garlicText')}</p>`;
    tableWrap.innerHTML=`<table class="data-table"><thead><tr><th>${state.lang==='es'?'Indicador':'Indicator'}</th><th>${state.lang==='es'?'Valor':'Value'}</th></tr></thead><tbody>${metrics.map(([n,v])=>`<tr><td>${esc(n)}</td><td>${v}</td></tr>`).join('')}</tbody></table>`;
  }
}

function renderMap(){
  const c=(state.data.case_studies||[]).find(x=>x.type==='map');
  const points=c?.data_json?.points || [];
  const legend=document.getElementById('mapLegend');
  legend.innerHTML=points.map(p=>`<div class="map-legend-item"><b>${esc(p.name)}</b><span>${esc(localized(p,'note'))}</span></div>`).join('');
  const mapEl=document.getElementById('careerMap');
  if(!window.L){mapEl.innerHTML=`<div style="padding:24px;color:var(--muted)">${tr('map.fallback')}</div>`;return;}
  if(state.map){state.map.remove();state.map=null;}
  state.map=L.map('careerMap',{scrollWheelZoom:false}).setView([-18.5,-65.4],5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap contributors'}).addTo(state.map);
  points.forEach(p=>L.circleMarker([p.lat,p.lng],{radius:8,weight:2,fillOpacity:.8}).addTo(state.map).bindPopup(`<b>${esc(p.name)}</b><br>${esc(localized(p,'note'))}`));
  if(points.length){const group=L.featureGroup(points.map(p=>L.marker([p.lat,p.lng])));state.map.fitBounds(group.getBounds().pad(.25));}
}

function setText(id,value){const el=document.getElementById(id); if(el) el.textContent=value||'';}

function bindFilters(containerId,key,render){
  document.getElementById(containerId)?.addEventListener('click',e=>{
    const btn=e.target.closest('[data-filter]'); if(!btn) return;
    document.querySelectorAll(`#${containerId} [data-filter]`).forEach(x=>x.classList.remove('active'));
    btn.classList.add('active'); state[key]=btn.dataset.filter; render();
  });
}

function initReveal(){
  const els=[...document.querySelectorAll('.reveal:not(.visible)')];
  if(!('IntersectionObserver' in window)){els.forEach(x=>x.classList.add('visible'));return;}
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}}),{threshold:.12});
  els.forEach(el=>io.observe(el));
}

function setLanguage(lang){
  state.lang=lang; localStorage.setItem('portfolio-lang',lang); hydrate();
}

function setTheme(theme){state.theme=theme;document.documentElement.dataset.theme=theme;localStorage.setItem('portfolio-theme',theme);}

async function submitContact(e){
  e.preventDefault();
  const form=e.currentTarget,status=document.getElementById('contactStatus');
  const payload=Object.fromEntries(new FormData(form).entries());
  if(!payload.name?.trim()||!payload.email?.trim()||!payload.message?.trim()){status.textContent=tr('contact.required');status.className='form-status error';return;}
  status.textContent=tr('contact.sending');status.className='form-status';
  try{
    const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,language:state.lang})});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    status.textContent=tr('contact.ok');status.className='form-status success';form.reset();
  }catch(err){console.error(err);status.textContent=tr('contact.error');status.className='form-status error';}
}

function init(){
  setTheme(state.theme);
  document.querySelectorAll('.lang-btn').forEach(btn=>btn.addEventListener('click',()=>setLanguage(btn.dataset.lang)));
  document.getElementById('themeToggle')?.addEventListener('click',()=>setTheme(state.theme==='dark'?'light':'dark'));
  const menu=document.getElementById('menuBtn'),mobile=document.getElementById('mobileNav');
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));mobile.hidden=open;});
  mobile?.addEventListener('click',e=>{if(e.target.matches('a')){mobile.hidden=true;menu.setAttribute('aria-expanded','false');}});
  bindFilters('skillFilters','skillFilter',renderSkills);bindFilters('projectFilters','projectFilter',renderProjects);bindFilters('experienceFilters','experienceFilter',renderExperience);
  document.querySelector('.thesis-tabs')?.addEventListener('click',e=>{const btn=e.target.closest('[data-thesis-view]');if(!btn)return;document.querySelectorAll('.thesis-tab').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false')});btn.classList.add('active');btn.setAttribute('aria-selected','true');state.thesisView=btn.dataset.thesisView;renderThesis();});
  document.querySelector('.lab-tabs')?.addEventListener('click',e=>{const btn=e.target.closest('[data-dataset]');if(!btn)return;document.querySelectorAll('.lab-tab').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false')});btn.classList.add('active');btn.setAttribute('aria-selected','true');state.labDataset=btn.dataset.dataset;renderLab();});
  document.getElementById('yieldSort')?.addEventListener('change',renderLab);
  document.getElementById('contactForm')?.addEventListener('submit',submitContact);
  document.getElementById('dialogClose')?.addEventListener('click',()=>document.getElementById('projectDialog').close());
  document.getElementById('projectDialog')?.addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
  loadData();
}

document.addEventListener('DOMContentLoaded',init);
