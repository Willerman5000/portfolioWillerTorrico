-- Portfolio Willer Torrico · v1.1.1 HOTFIX
-- Ejecutar después de database/schema.sql si Supabase ya existe.
-- Corrige la foto formal y garantiza que el caso de estudio de tesis esté publicado.

begin;

update public.portfolio_profile
set photo_url='/assets/img/willer-profile-formal.jpg',
    github_url='https://github.com/willtvbox5000-wq'
where id='main';

-- La fila de tesis completa ya está definida en schema.sql/migration_v1_1.sql.
-- Si no existe, aplicar primero schema.sql (instalación completa) o migration_v1_1.sql (base v1.0 válida).
update public.portfolio_case_studies
set published=true, sort_order=0
where slug='masters-thesis-cliza' or type='thesis';

commit;
