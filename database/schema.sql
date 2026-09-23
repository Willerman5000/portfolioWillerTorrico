-- Portfolio Willer Torrico v1.0
-- Supabase / PostgreSQL
-- Ejecutar completo en Supabase > SQL Editor.
-- Después crear el usuario administrador en Authentication y ejecutar al final:
--   insert into public.portfolio_admins(user_id) values ('UUID_DEL_USUARIO');

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.portfolio_admins a where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;

create table if not exists public.portfolio_profile (
  id text primary key default 'main' check (id = 'main'),
  name text not null,
  eyebrow_es text,
  eyebrow_en text,
  headline_es text not null,
  headline_en text not null,
  summary_es text not null,
  summary_en text not null,
  location_es text,
  location_en text,
  email text,
  linkedin_url text,
  github_url text,
  cv_es_url text,
  cv_en_url text,
  photo_url text,
  availability boolean not null default true,
  crypto_note_es text,
  crypto_note_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_skills (
  id uuid primary key default gen_random_uuid(),
  source_key text unique,
  category text not null,
  name text not null,
  detail text,
  published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_education (
  id uuid primary key default gen_random_uuid(),
  source_key text unique,
  degree_es text not null,
  degree_en text not null,
  institution text not null,
  start_year integer,
  end_year integer,
  published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_experiences (
  id uuid primary key default gen_random_uuid(),
  source_key text unique,
  organization text not null,
  role_es text not null,
  role_en text not null,
  location text,
  start_date date,
  end_date date,
  category text,
  summary_es text not null,
  summary_en text not null,
  published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_es text not null,
  title_en text not null,
  subtitle_es text,
  subtitle_en text,
  description_es text not null,
  description_en text not null,
  category text not null default 'data',
  tags text[] not null default '{}',
  image_url text,
  project_url text,
  github_url text,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_es text not null,
  title_en text not null,
  type text not null,
  description_es text,
  description_en text,
  data_json jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 180),
  company text,
  project_type text,
  message text not null check (char_length(message) between 1 and 5000),
  language text not null default 'es',
  user_agent text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Índices de lectura frecuente
create index if not exists idx_portfolio_projects_public on public.portfolio_projects (published, sort_order);
create index if not exists idx_portfolio_experiences_public on public.portfolio_experiences (published, sort_order);
create index if not exists idx_portfolio_skills_public on public.portfolio_skills (published, sort_order);
create index if not exists idx_portfolio_case_studies_public on public.portfolio_case_studies (published, sort_order);
create index if not exists idx_portfolio_messages_created on public.portfolio_contact_messages (created_at desc);

-- Triggers de updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['portfolio_profile','portfolio_skills','portfolio_education','portfolio_experiences','portfolio_projects','portfolio_case_studies']
  LOOP
    EXECUTE format('drop trigger if exists %I on public.%I', 'trg_' || t || '_updated_at', t);
    EXECUTE format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', 'trg_' || t || '_updated_at', t);
  END LOOP;
END $$;

-- RLS
alter table public.portfolio_admins enable row level security;
alter table public.portfolio_profile enable row level security;
alter table public.portfolio_skills enable row level security;
alter table public.portfolio_education enable row level security;
alter table public.portfolio_experiences enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_case_studies enable row level security;
alter table public.portfolio_contact_messages enable row level security;

-- Limpiar políticas si el script se re-ejecuta
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN select schemaname, tablename, policyname from pg_policies where schemaname='public' and tablename like 'portfolio_%'
  LOOP
    EXECUTE format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

create policy "admin can see own authorization" on public.portfolio_admins
for select to authenticated using (user_id = auth.uid());

create policy "public reads profile" on public.portfolio_profile
for select to anon, authenticated using (true);
create policy "admins manage profile" on public.portfolio_profile
for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());

create policy "public reads published skills" on public.portfolio_skills
for select to anon, authenticated using (published = true or public.is_portfolio_admin());
create policy "admins manage skills" on public.portfolio_skills
for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());

create policy "public reads published education" on public.portfolio_education
for select to anon, authenticated using (published = true or public.is_portfolio_admin());
create policy "admins manage education" on public.portfolio_education
for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());

create policy "public reads published experiences" on public.portfolio_experiences
for select to anon, authenticated using (published = true or public.is_portfolio_admin());
create policy "admins manage experiences" on public.portfolio_experiences
for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());

create policy "public reads published projects" on public.portfolio_projects
for select to anon, authenticated using (published = true or public.is_portfolio_admin());
create policy "admins manage projects" on public.portfolio_projects
for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());

create policy "public reads published case studies" on public.portfolio_case_studies
for select to anon, authenticated using (published = true or public.is_portfolio_admin());
create policy "admins manage case studies" on public.portfolio_case_studies
for all to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());

create policy "public can send contact message" on public.portfolio_contact_messages
for insert to anon, authenticated with check (true);
create policy "admins read contact messages" on public.portfolio_contact_messages
for select to authenticated using (public.is_portfolio_admin());
create policy "admins update contact messages" on public.portfolio_contact_messages
for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin());
create policy "admins delete contact messages" on public.portfolio_contact_messages
for delete to authenticated using (public.is_portfolio_admin());

-- Storage para imágenes de proyectos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media', 'portfolio-media', true, 6291456, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio admins upload media" on storage.objects;
drop policy if exists "portfolio admins update media" on storage.objects;
drop policy if exists "portfolio admins delete media" on storage.objects;
create policy "portfolio admins upload media" on storage.objects
for insert to authenticated with check (bucket_id='portfolio-media' and public.is_portfolio_admin());
create policy "portfolio admins update media" on storage.objects
for update to authenticated using (bucket_id='portfolio-media' and public.is_portfolio_admin()) with check (bucket_id='portfolio-media' and public.is_portfolio_admin());
create policy "portfolio admins delete media" on storage.objects
for delete to authenticated using (bucket_id='portfolio-media' and public.is_portfolio_admin());

-- Perfil
insert into public.portfolio_profile (
  id,name,eyebrow_es,eyebrow_en,headline_es,headline_en,summary_es,summary_en,
  location_es,location_en,email,linkedin_url,github_url,cv_es_url,cv_en_url,photo_url,
  availability,crypto_note_es,crypto_note_en
) values (
  'main','Willer Gianni Torrico Arispe',
  'Consultor internacional · Disponible para trabajo remoto',
  'International consultant · Available for remote work',
  'Analítica de Datos · SIG · Recursos Hídricos · IA Aplicada',
  'Data Analytics · GIS · Water Resources · Applied AI',
  'MSc. en Gestión Integral de Recursos Hídricos e Ingeniero Agrónomo con experiencia en análisis de datos, SIG, evaluación ambiental, investigación aplicada y sistemas de riego. Integro Python, SQL, QGIS, ArcGIS y herramientas de IA para transformar información técnica y geoespacial en decisiones claras.',
  'MSc. in Integrated Water Resources Management and Agricultural Engineer with experience in data analytics, GIS, environmental assessment, applied research and irrigation systems. I combine Python, SQL, QGIS, ArcGIS and AI tools to turn technical and geospatial information into clear decisions.',
  'Buenos Aires, Argentina · Remoto / Internacional',
  'Buenos Aires, Argentina · Remote / International',
  'wtorrico@gmail.com',
  'https://www.linkedin.com/in/willer-gianni-torrico-arispe',
  'https://github.com/Willer5000',
  '/assets/cv/Willer_Torrico_CV_ATS_ES.pdf',
  '/assets/cv/Willer_Torrico_ATS_Resume_EN.pdf',
  '/assets/img/willer-profile-source.jpg',
  true,
  'Actividad complementaria: trader de criptomonedas con enfoque en análisis técnico, gestión de riesgo y automatización de análisis.',
  'Additional activity: cryptocurrency trader focused on technical analysis, risk management and analytical automation.'
)
on conflict (id) do update set
  name=excluded.name, eyebrow_es=excluded.eyebrow_es, eyebrow_en=excluded.eyebrow_en,
  headline_es=excluded.headline_es, headline_en=excluded.headline_en,
  summary_es=excluded.summary_es, summary_en=excluded.summary_en,
  location_es=excluded.location_es, location_en=excluded.location_en,
  email=excluded.email, linkedin_url=excluded.linkedin_url, github_url=excluded.github_url,
  cv_es_url=excluded.cv_es_url, cv_en_url=excluded.cv_en_url, photo_url=excluded.photo_url,
  availability=excluded.availability, crypto_note_es=excluded.crypto_note_es, crypto_note_en=excluded.crypto_note_en;

-- Skills
insert into public.portfolio_skills(source_key,category,name,detail,sort_order) values
('python','data','Python','pandas · NumPy · Matplotlib · Plotly',1),
('sql','data','SQL','consultas · modelado · PostgreSQL / Supabase',2),
('r-spss','data','R / SPSS','análisis estadístico e investigación',3),
('powerbi','data','Power BI','dashboards y comunicación de datos',4),
('qgis','gis','QGIS','análisis espacial · cartografía · geoprocesos',5),
('arcgis','gis','ArcGIS','SIG · geodatabases · evaluación territorial',6),
('gee','gis','Google Earth Engine','teledetección · series satelitales',7),
('gdal','gis','GDAL / OGR / PDAL','procesamiento geoespacial',8),
('water','water','Recursos hídricos','gestión integral · agrohidrología · riego',9),
('environment','environment','Evaluación ambiental','EIA · riesgo · análisis socioambiental',10),
('ai','ai','IA aplicada','LLM · automatización · apoyo a decisiones · prompting técnico',11),
('dev','dev','Flask / Supabase / Git','aplicaciones analíticas y APIs',12),
('crypto','markets','Trading de criptomonedas','análisis técnico · gestión de riesgo · Pine Script',13)
on conflict(source_key) do update set category=excluded.category,name=excluded.name,detail=excluded.detail,sort_order=excluded.sort_order,published=true;

-- Formación
insert into public.portfolio_education(source_key,degree_es,degree_en,institution,start_year,end_year,sort_order) values
('msc-water','MSc. Gestión Integral de Recursos Hídricos','MSc. Integrated Water Resources Management','Universidad Mayor de San Simón · Centro AGUA',2017,2020,1),
('agronomy','Ingeniero Agrónomo','Agricultural Engineer','Universidad Mayor de San Simón',2005,2011,2),
('ibm-ds','IBM Data Scientist Professional Certificate','IBM Data Scientist Professional Certificate','IBM',2022,2023,3),
('gis-diploma','Diplomado en Sistemas de Información Geográfica y Percepción Remota','Diploma in Geographic Information Systems and Remote Sensing','Universidad Mayor de San Simón',2013,2013,4),
('hydraulic','Diplomado en Diseño de Ingeniería Hidráulica','Diploma in Hydraulic Engineering Design','Universidad San Sebastián',2014,2014,5),
('environmental','Diplomado en Gestión Ambiental','Diploma in Environmental Management','Universidad Juan Misael Saracho',2012,2012,6),
('higher-ed-ai','Diplomado en Educación Superior con tecnologías emergentes e IA','Diploma in Higher Education with Emerging Technologies and AI','Universidad Mayor de San Andrés',2024,2025,7)
on conflict(source_key) do update set degree_es=excluded.degree_es,degree_en=excluded.degree_en,institution=excluded.institution,start_year=excluded.start_year,end_year=excluded.end_year,sort_order=excluded.sort_order,published=true;

-- Experiencia (redacción conservadora basada en el CV detallado)
insert into public.portfolio_experiences(source_key,organization,role_es,role_en,location,start_date,end_date,category,summary_es,summary_en,sort_order) values
('greenlac-2024','greenLAC / Eco.Business Fund','Consultor','Consultant','Bolivia · proyecto regional','2024-05-01','2024-07-31','data,gis,environment','Colaboración en la actualización de estudios de deforestación, recopilando y estructurando información sobre riesgo de deforestación asociado a actividades agropecuarias en Bolivia.','Contributed to the update of deforestation studies by collecting and structuring information on deforestation risk associated with agricultural activities in Bolivia.',1),
('abc-2019','Administradora Boliviana de Carreteras / BID','Consultor','Consultant','Bolivia','2019-10-01','2020-03-31','gis,data,infrastructure','Levantamiento de video inventario básico de los principales corredores de la Red Vial Fundamental de Bolivia, con cobertura aproximada de 10.000 km de carreteras.','Supported a basic video inventory survey of Bolivia''s main Fundamental Road Network corridors, covering approximately 10,000 km of roads.',2),
('chirripo-2018','Chirripó Consultores / greenLAC','Consultor','Consultant','Bolivia','2018-02-01','2018-06-30','gis,data,environment','Apoyo al estudio de análisis de riesgo de deforestación por actividades agropecuarias y medidas de mitigación en Bolivia.','Supported a study on deforestation risk from agricultural activities and mitigation measures in Bolivia.',3),
('ende-guaracachi-2017','ENDE - Guaracachi','Asistente Técnico Socioambiental','Socio-Environmental Technical Assistant','Santa Cruz, Bolivia','2017-02-01','2017-07-31','gis,environment','Análisis de desarrollo productivo y problemas socioambientales, levantamiento geográfico con SIG y provisión de información territorial para el proyecto.','Analyzed productive development and socio-environmental issues, performed GIS-based geographic surveys and provided territorial information for the project.',4),
('rositas-2016','ENDE Corporación · Proyecto Hidroeléctrico Rositas','Profesional en Gestión Social, SIG y Medio Ambiente','Social Management, GIS and Environmental Professional','Abapó, Santa Cruz, Bolivia','2016-10-01','2016-12-31','gis,water,environment','Levantamiento geográfico de zonas del proyecto, análisis productivo y socioambiental y apoyo a la gestión de información territorial.','Mapped project areas, analyzed productive and socio-environmental conditions, and supported territorial information management.',5),
('iniaf-2015','INIAF · Programa Nacional de Hortalizas','Técnico en sistematización de información y manejo de paquetes estadísticos','Information Systematization and Statistical Software Technician','Sipe Sipe, Cochabamba, Bolivia','2015-09-01','2016-09-30','data,research,agriculture','Sistematización, análisis e interpretación de información del Programa Nacional de Hortalizas; elaboración de síntesis técnicas y apoyo a investigación en tomate, cebolla y ajo.','Systematized, analyzed and interpreted information from the National Horticulture Program; prepared technical syntheses and supported tomato, onion and garlic research.',6),
('sim-2015','Servicio de Ingeniería Multidisciplinaria','Consultor en Evaluación de Impacto Ambiental y Riego','Environmental Impact Assessment and Irrigation Consultant','Cochabamba, Bolivia','2015-01-01','2015-09-30','water,gis,environment','Elaboración de estudios de evaluación de impacto ambiental, SIG y diseños agronómicos de sistemas de riego.','Prepared environmental impact assessment studies, GIS analyses and agronomic designs for irrigation systems.',7),
('chuquisaca-2014','Gobierno Autónomo Departamental de Chuquisaca','Responsable de Gestión Ambiental y Técnico SIG','Environmental Management Coordinator and GIS Technician','Sucre, Bolivia','2014-05-01','2014-12-31','gis,environment','Inspecciones ambientales, revisión documental y elaboración de cartografía SIG para evaluación ambiental, forestación y reforestación.','Performed environmental inspections, document review and GIS mapping for environmental assessment, afforestation and reforestation.',8),
('giz-2013','Cooperación Alemana PROAGRO GIZ','Consultor en riego tecnificado','Technified Irrigation Consultant','Tarija, Bolivia','2013-09-01','2014-04-30','water,agriculture','Consultorías sobre monitoreo de eficiencias de riego y experiencias de riego tecnificado en el Chaco boliviano (Villa Montes y Entre Ríos).','Consulting assignments on irrigation-efficiency monitoring and technified irrigation experiences in the Bolivian Chaco (Villa Montes and Entre Ríos).',9),
('gadc-env-2012','Gobierno Autónomo Departamental de Cochabamba','Técnico de Medio Ambiente','Environmental Management Technician','Cochabamba, Bolivia','2012-05-01','2013-09-30','gis,environment,water','Inspecciones ambientales multisectoriales, revisión de documentos ambientales, SIG aplicado a evaluación ambiental y cartografía de áreas protegidas.','Performed multisector environmental inspections, reviewed environmental documents and applied GIS to environmental assessment and protected-area mapping.',10),
('gadc-risk-2011','Gobierno Autónomo Departamental de Cochabamba','Técnico · Unidad de Gestión de Riesgos','Risk Management Unit Technician','Cochabamba, Bolivia','2011-10-03','2012-05-06','gis,risk','Elaboración de mapas de riesgo e identificación SIG de zonas afectadas, vulnerables y amenazadas por eventos climáticos.','Prepared risk maps and used GIS to identify areas affected, vulnerable or threatened by climate-related hazards.',11)
on conflict(source_key) do update set organization=excluded.organization,role_es=excluded.role_es,role_en=excluded.role_en,location=excluded.location,start_date=excluded.start_date,end_date=excluded.end_date,category=excluded.category,summary_es=excluded.summary_es,summary_en=excluded.summary_en,sort_order=excluded.sort_order,published=true;

-- Proyectos
insert into public.portfolio_projects(slug,title_es,title_en,subtitle_es,subtitle_en,description_es,description_en,category,tags,featured,published,sort_order) values
('agricultural-data-iniaf','Sistematización y análisis de investigación hortícola','Horticultural Research Data Systematization','Tomate · Cebolla · Ajo','Tomato · Onion · Garlic','Caso de análisis basado en documentación del Programa Nacional de Hortalizas: organización de resultados, exploración de variedades, comparación de rendimientos esperados y comunicación de evidencia técnica.','Analytics case based on National Horticulture Program documentation: result organization, variety exploration, expected-yield comparison and technical evidence communication.','data',array['Data Analysis','Agriculture','Statistics','Research'],true,true,1),
('deforestation-risk','Análisis de riesgo de deforestación','Deforestation Risk Analysis','Datos geoespaciales y actividades agropecuarias','Geospatial data and agricultural activity','Experiencia de consultoría en recopilación, estructuración y análisis territorial de información relacionada con riesgo de deforestación por actividades agropecuarias en Bolivia.','Consulting experience collecting, structuring and analyzing territorial information related to deforestation risk from agricultural activities in Bolivia.','gis',array['GIS','Environment','Data','Deforestation'],true,true,2),
('road-network-gis','Inventario geoespacial de red vial','Geospatial Road Network Inventory','≈ 10.000 km de corredores viales','≈ 10,000 km of road corridors','Trabajo de levantamiento e inventario básico sobre corredores de la Red Vial Fundamental de Bolivia, con énfasis en organización territorial y evidencia georreferenciada.','Survey and basic inventory work across Bolivia''s Fundamental Road Network corridors, focused on territorial organization and georeferenced evidence.','gis',array['GIS','Infrastructure','Field Data','Data Management'],true,true,3),
('smart-trading-review','Sistema analítico asistido por IA','AI-Assisted Analytics System','Python · Flask · Supabase · Plotly · LLM','Python · Flask · Supabase · Plotly · LLM','Proyecto personal de ingeniería de datos y software para análisis de mercados de criptomonedas, visualización interactiva, persistencia en Supabase y asistencia mediante modelos de IA. Se presenta por su arquitectura y trabajo analítico, no como promesa de resultados financieros.','Personal data/software engineering project for cryptocurrency-market analytics, interactive visualization, Supabase persistence and LLM-assisted interpretation. Presented for its architecture and analytics work, not as a claim of financial performance.','ai',array['AI','Python','Flask','Supabase','Plotly'],false,true,4),
('technified-irrigation','Riego tecnificado y eficiencia','Technified Irrigation and Efficiency','Chaco boliviano · GIZ PROAGRO','Bolivian Chaco · GIZ PROAGRO','Consultorías técnicas sobre monitoreo de eficiencias de riego y sistematización de experiencias de riego tecnificado en Villa Montes y Entre Ríos.','Technical consulting on irrigation-efficiency monitoring and systematization of technified irrigation experiences in Villa Montes and Entre Ríos.','water',array['Water','Irrigation','Agronomy','Consulting'],false,true,5)
on conflict(slug) do update set title_es=excluded.title_es,title_en=excluded.title_en,subtitle_es=excluded.subtitle_es,subtitle_en=excluded.subtitle_en,description_es=excluded.description_es,description_en=excluded.description_en,category=excluded.category,tags=excluded.tags,featured=excluded.featured,published=excluded.published,sort_order=excluded.sort_order;

-- Casos interactivos
insert into public.portfolio_case_studies(slug,title_es,title_en,type,description_es,description_en,data_json,published,sort_order) values
('agri-explorer','Agricultural Data Explorer','Agricultural Data Explorer','agriculture','Explorador interactivo construido con datos documentados en resúmenes de ensayos de tomate, cebolla y ajo del INIAF.','Interactive explorer built from documented INIAF summaries of tomato, onion and garlic trials.',
'{"tomato":{"f1_hybrids":116,"introduced_varieties":39,"introduced_hybrids_2013":6,"pure_lines_taiwan":15},"onion":[{"name":"Mizqueña","yield_t_ha":20,"cycle":"120","skin":"Rojo","pungency":"Alta","shelf":"3 meses"},{"name":"Valencianita","yield_t_ha":30,"cycle":"100-110","skin":"Amarilla","pungency":"Baja","shelf":"4 meses"},{"name":"Angaco","yield_t_ha":35,"cycle":"12-130","skin":"Amarilla","pungency":"Baja","shelf":"4 meses"},{"name":"Yali","yield_t_ha":20,"cycle":"110-120","skin":"Rojo","pungency":"Alta","shelf":"5 meses"},{"name":"Prema","yield_t_ha":20,"cycle":"110-120","skin":"Rosada","pungency":"Media","shelf":"2-3 meses"},{"name":"Dayo","yield_t_ha":20,"cycle":"110-120","skin":"Rosada","pungency":"Media","shelf":"3-4 meses"},{"name":"Globosa","yield_t_ha":30,"cycle":"150","skin":"Rojo intenso","pungency":"Media","shelf":"3 meses"},{"name":"Criolla Rosada","yield_t_ha":20,"cycle":"120","skin":"Rosada","pungency":"Media","shelf":"3 meses"},{"name":"Navideña","yield_t_ha":35,"cycle":"120","skin":"Amarilla","pungency":"Baja","shelf":"4 meses"},{"name":"Sintética 14","yield_t_ha":40,"cycle":"120","skin":"Amarilla","pungency":"Baja","shelf":"6 meses"}],"garlic":{"research_trials_documented":9,"narrative_varieties_or_ecotypes":17,"table_varieties_listed":16,"introduced_inta_argentina":11,"local_or_collected_listed":5}}'::jsonb,true,1),
('career-gis-map','Mapa de experiencia territorial','Territorial Experience Map','map','Mapa interactivo de ciudades y regiones asociadas a experiencias profesionales documentadas en el CV.','Interactive map of cities and regions associated with professional experience documented in the CV.',
'{"points":[{"name":"Cochabamba","lat":-17.3935,"lng":-66.1570,"note_es":"Gestión de riesgos, medio ambiente, consultoría e investigación","note_en":"Risk management, environment, consulting and research"},{"name":"Sucre","lat":-19.0196,"lng":-65.2619,"note_es":"Gestión ambiental y SIG","note_en":"Environmental management and GIS"},{"name":"Villa Montes","lat":-21.2647,"lng":-63.4677,"note_es":"Riego tecnificado · GIZ","note_en":"Technified irrigation · GIZ"},{"name":"Santa Cruz de la Sierra","lat":-17.7833,"lng":-63.1821,"note_es":"Proyectos socioambientales y energéticos","note_en":"Socio-environmental and energy projects"},{"name":"La Paz","lat":-16.4897,"lng":-68.1193,"note_es":"Consultoría y estudios territoriales","note_en":"Consulting and territorial studies"}]}'::jsonb,true,2)
on conflict(slug) do update set title_es=excluded.title_es,title_en=excluded.title_en,type=excluded.type,description_es=excluded.description_es,description_en=excluded.description_en,data_json=excluded.data_json,published=excluded.published,sort_order=excluded.sort_order;

commit;

-- PASO MANUAL ÚNICO PARA HABILITAR EL ADMIN:
-- 1) Supabase > Authentication > Users > Add user.
-- 2) Copiar el UUID del usuario.
-- 3) Ejecutar (fuera de una transacción si se desea):
-- insert into public.portfolio_admins(user_id) values ('PEGAR_UUID_AQUI') on conflict do nothing;
