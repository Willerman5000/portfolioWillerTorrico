# Portfolio Willer Torrico - v1.1.4

**v1.1.1 hotfix:** corrige fotografía y tesis.

# Portfolio Willer Torrico - v1.0

Portfolio profesional bilingüe (ES/EN) orientado a **Data Analytics, GIS, Water Resources, Applied AI y consultoría remota/internacional**.

La actividad de **trading de criptomonedas** aparece de forma secundaria, como una práctica analítica adicional vinculada con análisis técnico, gestión de riesgo, visualización de datos, Pine Script e IA; no domina el posicionamiento profesional.

## Incluye

- Frontend responsive, accesible y bilingüe.
- Dark / light mode.
- Proyectos filtrables y modal de detalle.
- Data Lab interactivo con información documentada de tomate, cebolla y ajo.
- Mapa interactivo de experiencia territorial con Leaflet / OpenStreetMap.
- Línea de tiempo profesional filtrable.
- Formación y stack técnico.
- Formulario de contacto.
- CV ATS en español e inglés en PDF.
- Panel privado `/admin.html` para agregar/editar trabajos, experiencia, perfil y revisar mensajes.
- Backend Flask con API REST y caché ligera.
- Supabase Auth + PostgreSQL + Storage, protegido con RLS.
- SQL completo con tablas, políticas, bucket y datos iniciales.
- Fallback local para que el sitio funcione incluso antes de configurar Supabase.

## Estructura

```text
portfolio_willer_v1_0/
├─ frontend/
│  ├─ index.html
│  ├─ admin.html
│  ├─ css/
│  ├─ js/
│  ├─ data/seed.json
│  └─ assets/
│     ├─ img/
│     └─ cv/
├─ backend/
│  ├─ app.py
│  ├─ requirements.txt
│  ├─ .env.example
│  └─ data/seed.json
├─ database/
│  └─ schema.sql
├─ docs/
│  ├─ DEPLOY.md
│  ├─ DATA_PROVENANCE.md
│  └─ portfolio-concept.png
├─ render.yaml
└─ README.md
```

## Inicio rápido local

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
# source .venv/bin/activate

pip install -r backend/requirements.txt
python backend/app.py
```

Abrir `http://localhost:10000`.

Sin `SUPABASE_ANON_KEY` el frontend usa `seed.json`. El panel admin requiere Supabase configurado.

## Configurar Supabase

1. Abrir Supabase > SQL Editor.
2. Ejecutar **todo** `database/schema.sql`.
3. Ir a Authentication > Users y crear el usuario administrador.
4. Copiar el UUID del usuario.
5. Ejecutar:

```sql
insert into public.portfolio_admins(user_id)
values ('PEGAR_UUID_AQUI')
on conflict do nothing;
```

6. Copiar la **anon/public key** de Supabase.
7. Crear `backend/.env` a partir de `backend/.env.example`.
8. El URL ya está preparado para el proyecto indicado por el usuario:

```env
SUPABASE_URL=https://kzmczlhfmrhhxopzpmze.supabase.co
SUPABASE_ANON_KEY=...
```

No se necesita `service_role` para el funcionamiento normal. El backend usa el token del usuario autenticado y las políticas RLS de Supabase.

## CV ATS

- `frontend/assets/cv/Willer_Torrico_CV_ATS_ES.pdf`
- `frontend/assets/cv/Willer_Torrico_ATS_Resume_EN.pdf`

Son documentos de una sola columna, sin foto, sin barras de habilidades y sin datos personales innecesarios.

## Tesis / mapas

La arquitectura v1.0 ya acepta GeoJSON, capas SIG y nuevos `case_studies`. Los archivos proporcionados de la maestría no contienen de forma identificable la tesis final ni sus mapas finales, por lo que **v1.0 no inventa resultados ni mapas de tesis**. El mapa actual representa experiencia territorial documentada en el CV.

Cuando se incorpore el PDF final de la tesis o SHP/GeoJSON originales, el módulo puede poblarse sin cambiar la arquitectura.

## Privacidad

La web pública omite documento de identidad, domicilio exacto, estado civil, fecha de nacimiento y teléfonos personales presentes en CVs antiguos. El contacto público usa email, LinkedIn y formulario.

## Datos y afirmaciones

La redacción inicial es deliberadamente conservadora. Donde los CVs fuente tenían diferencias (por ejemplo, institución financiera asociada a una experiencia), v1.0 prioriza el CV detallado en español y evita afirmaciones no respaldadas por esa fuente.

---

## v1.1 · Maestría + perfil profesional

Esta versión agrega un caso interactivo basado en la tesis de Maestría de Willer Torrico sobre infiltrabilidad de suelos y riego por aspersión en Cliza. Incluye análisis por clases de infiltrabilidad, metodología, criterios de diseño y manejo, conclusiones y mapas originales de la tesis.

También incorpora una versión formal de la fotografía de perfil en `frontend/assets/img/willer-profile-formal.jpg`.

### Base de datos

- Instalación nueva: ejecutar `database/schema.sql`.
- Base v1.0 ya instalada: ejecutar `database/migration_v1_1.sql`.

Ver `docs/V1_1.md` y `docs/DATA_PROVENANCE.md` para detalles.


## v1.1.3 · Media Stability Fix

- Evita que la respuesta tardía de Supabase reemplace la foto local por una URL antigua o rota.
- Los mapas de tesis usan como fuente canónica los assets incluidos en el repositorio.
- Todas las imágenes críticas tienen fallback encadenado.
- CSS, JS y JSON usan política no-cache para evitar que Render entregue una versión anterior después del deploy.
- Las rutas de assets críticos se hicieron relativas para mejorar portabilidad.


## v1.1.4 · Media self-contained

Esta entrega incluye todos los binarios en `frontend/assets/` y además un respaldo embebido en `frontend/js/embedded-media.js` para la fotografía y visuales críticos de la tesis. Si un asset estático falta o una ruta antigua de Supabase apunta a un archivo inexistente, el frontend usa automáticamente el respaldo embebido.

Diagnóstico online: `/api/media-check`. Todos los elementos deberían devolver `exists: true`.

**Para GitHub:** el ZIP `GITHUB_READY` no tiene carpeta envolvente; subir/reemplazar directamente su contenido en la raíz del repositorio.


## v1.1.5 · Media + Admin Stability

- La fotografía principal está embebida en `index.html`, también dentro de `app.js` y además disponible en `/api/media/profile`.
- Los mapas y gráficos críticos de tesis están embebidos en `app.js`; los archivos físicos siguen incluidos como respaldo.
- Se eliminó SRI de Leaflet porque el navegador estaba bloqueando `leaflet.css` por un digest distinto al declarado.
- El panel admin ya no vuelve al login si la autenticación fue correcta pero falla el render de un bloque posterior.
- `/api/health` y `/api/media-check` reportan `1.1.5`.
