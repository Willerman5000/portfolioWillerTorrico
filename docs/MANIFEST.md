# Manifest - v1.0

## Frontend
- `frontend/index.html` - sitio público ES/EN.
- `frontend/admin.html` - CMS privado.
- `frontend/css/styles.css` - diseño responsive.
- `frontend/css/admin.css` - estilos del CMS.
- `frontend/js/app.js` - idioma, filtros, Data Lab, mapa, contacto.
- `frontend/js/admin.js` - login Supabase y CRUD.
- `frontend/data/seed.json` - fallback sin Supabase.
- `frontend/assets/img/willer-profile-source.jpg` - fotografía fuente usada con recorte/estilizado CSS.
- `frontend/assets/cv/*.pdf` - CVs ATS ES/EN.

## Backend
- `backend/app.py` - Flask API + hosting del frontend.
- `backend/requirements.txt`.
- `backend/.env.example`.
- `backend/data/seed.json`.

## Database
- `database/schema.sql` - tablas, índices, triggers, RLS, Storage y datos iniciales.

## Deployment / docs
- `render.yaml`.
- `README.md`.
- `docs/DEPLOY.md`.
- `docs/DATA_PROVENANCE.md`.
- `docs/portfolio-concept.png` - referencia visual generada durante el diseño.
