# Deploy v1.0 - Render + Supabase

## 1. Supabase

Ejecutar `database/schema.sql` y habilitar un usuario administrador como se explica en el README.

## 2. GitHub

Subir la carpeta completa a un repositorio, por ejemplo:

```text
portfolio-willer
```

## 3. Render

El archivo `render.yaml` crea un Web Service Python.

Variables obligatorias:

```text
SUPABASE_URL=https://kzmczlhfmrhhxopzpmze.supabase.co
SUPABASE_ANON_KEY=<anon key>
```

Opcionales:

```text
PUBLIC_CACHE_SECONDS=60
CONTACT_LIMIT_PER_HOUR=5
MAX_UPLOAD_MB=6
```

El backend sirve el frontend; por tanto v1.0 necesita un solo servicio web.

## 4. Panel admin

Abrir:

```text
https://TU-DOMINIO/admin.html
```

El panel permite:

- Crear, editar y borrar proyectos/trabajos.
- Crear, editar y borrar experiencias.
- Editar el perfil principal.
- Subir imágenes al bucket `portfolio-media`.
- Leer mensajes recibidos desde el formulario público.

## 5. Seguridad

- No colocar `service_role` en el frontend.
- La `anon key` se configura sólo en el servidor en esta versión.
- RLS está activado para todas las tablas del portfolio.
- Sólo usuarios presentes en `portfolio_admins` pueden escribir contenido.
- El bucket permite escritura sólo a administradores.
