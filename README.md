# Portfolio Willer Torrico · v1.1.6

Portfolio profesional bilingüe ES/EN orientado a Data Analytics, GIS, Water Resources, Applied AI y consultoría remota/internacional.

## Estado de esta entrega

Esta versión corrige específicamente el despliegue de medios y administración:

- fotografía profesional con fallback embebido y endpoint backend;
- mapas y gráficos de tesis incluidos en `frontend/assets/thesis/`;
- Leaflet sin atributo SRI/integrity conflictivo;
- frontend y admin con cache-busting v1.1.6;
- panel admin v1.1.6;
- `/api/diagnostics` para verificar qué versión y qué archivos está ejecutando Render;
- `/api/media-check` para verificar los assets;
- `DEPLOY_MARKER_v1.1.6.txt` como prueba de que GitHub recibió esta entrega.

## Comprobación obligatoria después de subir a GitHub

Antes de desplegar Render, el repositorio debe mostrar:

- `VERSION` = `1.1.6`
- `DEPLOY_MARKER_v1.1.6.txt`
- `frontend/assets/img/willer-profile-formal.jpg`
- `frontend/assets/thesis/infiltrability_map.jpeg`
- `frontend/admin.html` con `Portfolio CMS · v1.1.6`

Después del deploy:

- `/api/health` debe devolver `version: 1.1.6`
- `/api/diagnostics` debe mostrar `index_has_v116: true`, `admin_has_v116: true` e `index_has_integrity_attribute: false`
- `/api/media-check` debe devolver `ok: true`
- `/assets/img/willer-profile-formal.jpg` debe responder 200 incluso si el binario faltara, gracias al fallback backend.

## Estructura

```text
backend/
database/
docs/
frontend/
  assets/
    img/
    thesis/
    cv/
  css/
  data/
  js/
render.yaml
VERSION
DEPLOY_MARKER_v1.1.6.txt
README.md
```

## Render

Build command:

```text
pip install -r backend/requirements.txt
```

Start command:

```text
gunicorn --chdir backend app:app --workers 2 --threads 4 --timeout 60
```

Health check:

```text
/api/health
```

Environment variables mínimas:

```text
SUPABASE_URL=https://kzmczlhfmrhhxopzpmze.supabase.co
SUPABASE_ANON_KEY=<tu clave anon/public>
```
