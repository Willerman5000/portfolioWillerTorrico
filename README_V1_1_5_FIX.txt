Portfolio Willer Torrico · v1.1.5 MEDIA + ADMIN STABILITY

DIAGNÓSTICO
1. El error SRI de Leaflet bloqueaba leaflet.css.
2. El 404 de willer-profile-formal.jpg confirma que el binario no está presente en el deploy activo.
3. Los logs POST /api/auth/login 200 + GET /api/admin/me 200 + GET /api/admin/bootstrap 200 prueban que la contraseña y la autorización de administrador sí fueron aceptadas; el fallo ocurre después, en el frontend del panel.

CAMBIOS
- index.html: retrato formal embebido en el HTML y sin SRI de Leaflet.
- app.js: incorpora dentro del propio JS todos los fallbacks críticos de imagen de la tesis y retrato.
- app.py: endpoint /api/media/profile y v1.1.5.
- admin.js: una falla de render ya no cierra una sesión válida.
- admin.css/admin.html: hidden robusto, mensajes de diagnóstico y cache busting.

DESPLIEGUE
Reemplazar los archivos del repositorio con este árbol completo, no sólo algunos archivos.
Verificar:
  /api/health       -> version 1.1.5
  /api/media-check  -> revisar exists=true
  /api/media/profile -> debe abrir directamente la foto
Luego hacer hard refresh (Ctrl+F5).
