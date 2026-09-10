# 🔑 Setup OAuth 2.0 para Google Drive - TuGestiónLegal

La aplicación ahora usa **OAuth 2.0** en lugar de claves de servicio. Esto es más seguro y funciona sin restricciones de políticas de Google Cloud.

## ¿Cómo Funciona?

1. El usuario inicia sesión con su cuenta de Google
2. NextAuth obtiene el `accessToken` de Google
3. Ese token se usa para acceder a Google Drive y Docs
4. No necesitas clave JSON

## Requisitos

### 1. Scopes de Google OAuth Configurados

Ya está hecho en el código. NextAuth pide estos permisos:

```
- openid
- profile
- email
- https://www.googleapis.com/auth/drive
- https://www.googleapis.com/auth/documents
```

### 2. Usuario Debe Estar en Google Cloud Autenticado

Tu cuenta de Google debe tener acceso a:
- Google Drive (carpeta compartida o personal)
- Google Docs (para editar plantillas)

### 3. Configuración en Google Cloud Console

Asegúrate que tu OAuth 2.0 está bien configurado (ya lo debe estar):

1. Ve a: Google Cloud Console → APIs y servicios → Credenciales
2. Busca: "Aplicación web" o "Web application"
3. Verifica que tienes configurados:
   - **Client ID**: `GOOGLE_CLIENT_ID` ✅
   - **Client Secret**: `GOOGLE_CLIENT_SECRET` ✅
   - **URIs de redireccionamiento**: http://localhost:3000/api/auth/callback/google ✅

## Variables de Entorno Necesarias

En `.env.local`, **NECESITAS ESTAS** (las que ya tienes):

```env
# Google OAuth (YA CONFIGURADAS)
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"

# Google Drive (URLs de carpetas donde guardas los archivos)
DRIVE_FOLDER_ENTRADA_ID="id-de-carpeta-entrada"
DRIVE_FOLDER_PLANTILLAS_ID="id-de-carpeta-plantillas"
DRIVE_FOLDER_CLIENTES_ID="id-de-carpeta-clientes"
DRIVE_FOLDER_SIN_CLASIFICAR_ID="id-de-carpeta-sin-clasificar"

# Base de datos
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret"
```

### ⚠️ YA NO NECESITAS:

```
❌ GOOGLE_SERVICE_ACCOUNT_EMAIL
❌ GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
```

Puedes eliminarlas de `.env.local` si las tenías.

## Cómo Funciona en Práctica

### Primer Inicio

1. Usuario va a: http://localhost:3000
2. Ve botón: "Iniciar sesión con Google"
3. Haz clic → Google te pide permiso
4. Le muestras permisos de Drive y Docs
5. El usuario aprueba
6. ✅ Sesión creada con `accessToken`

### Crear un Trámite

1. Usuario autenticado va a: "Nuevo Trámite"
2. Rellena el formulario
3. Al hacer submit, el servidor:
   - Obtiene el `accessToken` de la sesión del usuario
   - Usa ese token para crear carpeta en Google Drive
   - Crea el trámite en la BD
4. ✅ Carpeta creada en Drive automáticamente

### Generar Documento

1. Usuario en "Detalle del Trámite"
2. Haz clic en: "Generar Checklist" o "Generar Contrato"
3. El servidor:
   - Obtiene el `accessToken`
   - Copia la plantilla de Google Docs
   - Reemplaza placeholders (nombre, etc.)
   - Guarda en carpeta del trámite
4. ✅ Documento generado

## Limitaciones de OAuth (vs Cuenta de Servicio)

### ✅ Ventajas
- No necesitas clave JSON
- Más seguro
- Funciona sin restricciones de políticas
- Credenciales se renuevan automáticamente

### ⚠️ Limitaciones
1. **Solo si hay sesión**: Solo funciona cuando el usuario está autenticado
2. **Solo sus carpetas**: Solo puede acceder a carpetas compartidas con su cuenta
3. **No funciona en cron jobs**: Si quieres clasificación automática, necesitas cuenta de servicio

## Consideraciones Importantes

### Para Desarrollo Local

✅ OAuth 2.0 funciona perfecto

### Para Producción

⚠️ Ten en cuenta:

1. **Carpeta Compartida**: La carpeta de Drive donde creas archivos debe ser compartida con la cuenta de Google del usuario
2. **Permisos**: El usuario debe tener permisos de "Editor" en esa carpeta
3. **Token Expiration**: NextAuth maneja la renovación automática, así que no hay problema

### Para Clasificación Automática (Fase 2)

Si quieres un job cron automático que mueva archivos sin usuario:
- Necesitarás una cuenta de servicio
- O: Desactiva el cron job y usa clasificación manual

## Estructura de Carpetas Recomendada

Con OAuth, hay dos opciones:

### Opción A: Carpeta Personal de Google Drive

```
Mi unidad
└── TuGestiónLegal/
    ├── Plantillas/
    ├── Entrada/
    └── Clientes/
```

**Ventaja**: Simple, no necesita Shared Drive
**Desventaja**: Solo accesible por ti

### Opción B: Shared Drive (Compartida)

```
Gestoria (Shared Drive)
├── Plantillas/
├── Entrada/
└── Clientes/
```

**Ventaja**: Compartida, accesible por múltiples usuarios
**Desventaja**: Necesita que el usuario esté en el Shared Drive

## Pasos de Setup Final

### 1. Verifica OAuth en Google Cloud

```
✅ GOOGLE_CLIENT_ID está en .env.local
✅ GOOGLE_CLIENT_SECRET está en .env.local
✅ URIs de redireccionamiento configuradas
✅ Scopes: drive + documents
```

### 2. Configura Carpetas en Google Drive

Crea o usa carpetas existentes:

```
TuGestiónLegal/
├── Plantillas/
│   ├── checklist_residencia.gdoc
│   ├── contrato_servicios.gdoc
├── Entrada/
│   └── Sin clasificar/
└── Clientes/
```

Copia los IDs en `.env.local`:

```env
DRIVE_FOLDER_PLANTILLAS_ID="..."
DRIVE_FOLDER_ENTRADA_ID="..."
DRIVE_FOLDER_CLIENTES_ID="..."
```

### 3. Instala Dependencias

```bash
npm install
```

### 4. Configura BD

```bash
npx prisma migrate dev --name init
```

### 5. Inicia Servidor

```bash
npm run dev
```

### 6. Prueba

1. Abre: http://localhost:3000
2. Haz clic en: "Iniciar sesión con Google"
3. Aprueba los permisos
4. Crea un trámite de prueba
5. Verifica que se creó carpeta en Google Drive

## Troubleshooting

### Error: "Usuario no autenticado"

**Causa**: El usuario no está logueado o la sesión expiró

**Solución**:
1. Haz clic en: "Iniciar sesión con Google"
2. Aprueba los permisos nuevamente

### Error: "El usuario no tiene permisos"

**Causa**: El usuario no tiene acceso a la carpeta en Google Drive

**Solución**:
1. Ve a Google Drive
2. Comparte la carpeta con tu usuario
3. Dale permisos de "Editor"
4. Intenta de nuevo

### Error: "Token inválido"

**Causa**: El token de Google expiró

**Solución**: NextAuth lo maneja automáticamente
1. Actualiza la página
2. O cierra sesión y vuelve a iniciar

### Error: "Folder not found"

**Causa**: El DRIVE_FOLDER_*_ID es incorrecto

**Solución**:
1. Ve a Google Drive
2. Abre la carpeta
3. Copia el ID de la URL: `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`
4. El ID es: `1a2b3c4d5e6f7g8h9i0j`
5. Actualiza `.env.local`
6. Reinicia servidor

## Código Modificado

El código ha sido actualizado:

- ✅ `lib/drive.ts` - Usa OAuth en lugar de JWT
- ✅ `lib/docs.ts` - Usa OAuth en lugar de JWT
- ✅ `lib/auth.ts` - Incluye scopes de Drive y Docs
- ✅ `types/next-auth.d.ts` - Tipos TypeScript para accessToken

## Próximos Pasos

1. ✅ Setup OAuth (ya hecho)
2. → Configura IDs de carpetas en `.env.local`
3. → Ejecuta: `npx prisma migrate dev --name init`
4. → Ejecuta: `npm run dev`
5. → Prueba la app

## Notas Finales

- OAuth es más seguro que claves JSON
- Funciona sin restricciones de políticas
- El usuario autoriza cada permiso explícitamente
- Credenciales se renuevan automáticamente

¡La app está lista para usar con OAuth! 🚀
