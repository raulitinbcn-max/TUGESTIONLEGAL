# Sistema de Backup con OAuth

## Resumen

El sistema de backups ahora **usa tus credenciales OAuth** (las que usas para iniciar sesión) en lugar de requerir una cuenta de servicio de Google Cloud.

**Ventajas:**
- ✅ No requiere configuración de cuenta de servicio
- ✅ Automático: se ejecuta cada vez que accedes a una ruta protegida
- ✅ Seguro: usa tus propias credenciales de Google
- ✅ Transparente: sin intervención manual

---

## Cómo Funciona

### Backup Automático
1. Inicias sesión en la app
2. Accedes a cualquier página protegida (dashboard, clientes, trámites, etc.)
3. **Automáticamente** se crea un backup en tu Drive
4. El componente `BackupTrigger` se ejecuta una sola vez por sesión
5. El backup se guarda en la carpeta `DRIVE_FOLDER_BACKUPS_ID`

### Backup Manual
Si necesitas hacer backup en cualquier momento:
1. Ve a **Admin** (en la navegación)
2. Haz clic en **Backup a Google Drive**
3. Haz clic en el botón **Hacer Backup Ahora**
4. Verás confirmación cuando se complete

---

## Archivos del Sistema

### Frontend
- **`components/BackupTrigger.tsx`** - Componente que dispara backup automático
- **`app/(protected)/admin/backup/page.tsx`** - Página de backup manual

### Backend
- **`app/api/admin/backup-oauth/route.ts`** - Endpoint que crea el backup usando OAuth
  - Lee tu `accessToken` de la sesión
  - Crea un cliente OAuth con Google
  - Sube el backup a Drive
  - Mantiene últimos 10 backups

### Configuración
- **`lib/auth.ts`** - Ya incluye los scopes de Drive en el OAuth
- **`.env.local`** - No requiere credenciales de servicio

---

## Contenido del Backup

Cada backup incluye:
- ✅ Categorías de trámites
- ✅ Tipos de trámites
- ✅ Tipos de documentos
- ✅ Checklist de documentos
- ✅ Plantillas
- ✅ Tasas
- ✅ **Todos los clientes**
- ✅ **Todos los trámites** (con relaciones)
- ✅ Historial de cambios de estado
- ✅ Documentos y documentos generados

Timestamp: ISO timestamp de cuándo se creó
Usuario: Email de quién hizo el backup

---

## Recuperar desde Backup

Si necesitas restaurar datos de un backup:

### Opción 1: Restaurar Configuración (Local)
```bash
npm run restore-config
```
Restaura: categorías, tipos de trámites, tipos de documentos, plantillas, tasas.

### Opción 2: Copiar Manualmente desde Drive
1. Ve a Google Drive → Carpeta de backups
2. Descarga el archivo `sistema-backup-YYYY-MM-DD.json`
3. Abre un terminal y modifica el script para importar los datos
4. O contacta al desarrollador para ayuda

---

## Troubleshooting

### "Error: No autenticado o sin acceso a Google Drive"
**Causa:** No hay sesión activa o faltan permisos de Drive
**Solución:**
1. Cierra sesión y vuelve a iniciar
2. Asegúrate de que aceptaste permisos de Drive en el login

### Backup no aparece en Drive
**Causa:** Posible fallo silencioso del cliente OAuth
**Solución:**
1. Verifica que `DRIVE_FOLDER_BACKUPS_ID` está en `.env.local`
2. Abre la consola del navegador (F12)
3. Mira la pestaña Network para ver si hay errores
4. Intenta backup manual desde la página de admin

### "DRIVE_FOLDER_BACKUPS_ID no configurado"
**Solución:**
En `.env.local`, agrega:
```
DRIVE_FOLDER_BACKUPS_ID="[ID-de-tu-carpeta-de-backups]"
```

Obtén el ID de https://drive.google.com/drive/folders/[ID-AQUI]

---

## Notas de Seguridad

- 🔒 Tu `accessToken` nunca se guarda en la BD
- 🔒 Solo se usa durante la petición HTTP
- 🔒 Los backups se guardan en **tu Drive** (no en un servidor central)
- 🔒 Debes tener permisos de editor en la carpeta de backups

---

## Diferencia vs. Sistema Anterior

| Característica | Anterior | Nuevo |
|---|---|---|
| Requiere cuenta de servicio | ✅ Sí | ❌ No |
| Automático | ✅ Solo al iniciar servidor | ✅ Cada acceso (una vez) |
| Puede ser manual | ❌ No | ✅ Sí |
| Seguridad | ⚠️ Credenciales en `.env` | ✅ OAuth de usuario |
| Configuración | Compleja | Simple |

---

## Flujo Técnico

```
Usuario inicia sesión
    ↓
NextAuth crea sesión con accessToken
    ↓
Usuario accede a ruta protegida (/dashboard, /clientes, etc.)
    ↓
Layout "(protected)" renderiza BackupTrigger
    ↓
BackupTrigger hace fetch a /api/admin/backup-oauth
    ↓
Endpoint lee accessToken de la sesión
    ↓
Crea cliente OAuth2 autenticado
    ↓
Recopila todos los datos de la BD
    ↓
Sube archivo JSON a Google Drive
    ↓
Limpia backups antiguos (mantiene últimos 10)
    ↓
Usuario sigue usando la app sin interrupciones
```

El proceso es **silencioso** - no hay notificaciones ni interrupciones.
