# 🔧 Cambios Realizados - OAuth Setup

## ✅ Lo Que YO Cambié (Código)

### 1. `lib/drive.ts`
- ❌ Eliminé: Autenticación con JWT (clave de servicio)
- ✅ Agregué: Autenticación con OAuth 2.0 (session.accessToken)
- ✅ Todas las funciones ahora usan `await getDriveClient()`
- ✅ Eliminé parámetros de `driveId` (Shared Drive)

### 2. `lib/docs.ts`
- ❌ Eliminé: Autenticación con JWT
- ✅ Agregué: Autenticación con OAuth 2.0
- ✅ Todas las funciones ahora usan `await getDocsClient()`

### 3. `lib/auth.ts`
- ✅ Agregué: `authorization.params.scope` para Drive y Docs
- ✅ Agregué: Callback de JWT para capturar `access_token`
- ✅ Agregué: Callback de session para pasar `accessToken` al cliente

### 4. `types/next-auth.d.ts` (NUEVO)
- ✅ Creado: Tipos TypeScript para `accessToken` en Session y JWT

### 5. `.env.local`
- ✅ Actualizado: Comentarios más claros
- ✅ Eliminé: Variables de cuenta de servicio
- ✅ Agregué: Variables de carpetas de Drive con explicaciones

### 6. `lib/clasificacion.ts`
- ✅ Agregué: Nota sobre limitación de OAuth en cron jobs

---

## ⚙️ Lo Que TÚ Debes Hacer (Configuración)

### PASO 1: Google Drive (5 minutos)

Crear esta estructura en Google Drive:

```
TuGestiónLegal/
├── Plantillas/
├── Entrada/
│   └── Sin clasificar/
└── Clientes/
```

### PASO 2: Copiar IDs de Carpetas (5 minutos)

Para cada carpeta, obtén su ID:
- URL: `https://drive.google.com/drive/folders/[ESTE-ES-EL-ID]`

Anota:
- `PLANTILLAS_ID`
- `ENTRADA_ID`
- `SIN_CLASIFICAR_ID`
- `CLIENTES_ID`

### PASO 3: Rellenar `.env.local` (5 minutos)

```env
GOOGLE_CLIENT_ID="..."          ← De Google Cloud
GOOGLE_CLIENT_SECRET="..."      ← De Google Cloud
DRIVE_FOLDER_PLANTILLAS_ID="..."
DRIVE_FOLDER_ENTRADA_ID="..."
DRIVE_FOLDER_SIN_CLASIFICAR_ID="..."
DRIVE_FOLDER_CLIENTES_ID="..."
```

### PASO 4: Ejecutar App (5 minutos)

```bash
npx prisma migrate dev --name init
npm run dev
```

---

## 📊 Comparación: Antes vs Después

### ANTES (Clave de Servicio)

```
❌ Necesitaba: Clave JSON
❌ Problema: Política de org bloqueaba creación
❌ Complejidad: Alta
```

### AHORA (OAuth 2.0)

```
✅ Usa: Token del usuario autenticado
✅ Funciona: Sin restricciones de políticas
✅ Simplicidad: Solo carpetas de Drive
✅ Seguridad: Credenciales renovadas automáticamente
```

---

## 🔐 Credenciales Antes vs Ahora

### ANTES
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL="xxx@yyy.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
```

### AHORA
```env
# ❌ Nada de lo anterior
# ✅ Solo esto:
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
DRIVE_FOLDER_*_ID="..."
```

---

## 🚀 Flujo de Autenticación

### ANTES (Clave de Servicio)
```
Usuario inicia app
    ↓
App usa clave de servicio (archivo JSON)
    ↓
Accede a Google Drive como "servicio"
    ↓
Crea carpetas/docs
```

### AHORA (OAuth 2.0)
```
Usuario abre app
    ↓
Usuario hace login con Google
    ↓
Aprueba permisos (Drive, Docs)
    ↓
App obtiene accessToken
    ↓
App usa token para Drive/Docs
    ↓
Crea carpetas/docs como usuario
```

---

## ✅ Verificación Final

Después de rellenar `.env.local`, verifica:

```bash
# 1. Variables configuradas
grep "GOOGLE_CLIENT_ID" .env.local
grep "DRIVE_FOLDER_" .env.local

# 2. Código actualizado
grep "getDriveClient" lib/drive.ts | head -1
# Debería mostrar: "export async function getDriveClient()"

# 3. NextAuth con scopes
grep "google\|documents" lib/auth.ts
# Debería mostrar scopes de Drive y Docs
```

---

## 📝 Archivos Que Cambié

```
✅ lib/drive.ts           - Usa OAuth
✅ lib/docs.ts            - Usa OAuth
✅ lib/auth.ts            - Agrega scopes
✅ types/next-auth.d.ts   - NUEVO: tipos
✅ .env.local             - Actualizado con comentarios
✅ lib/clasificacion.ts   - Nota sobre limitación
```

---

## 📝 Archivos que TÚ Editarás

```
⚙️ .env.local - Rellenar variables
```

## 📖 Guías que Crié

```
📄 GUIA_RAPIDA_OAUTH.md       - Comienza aquí
📄 docs/SETUP_OAUTH_SIMPLE.md - Paso a paso
📄 docs/SETUP_OAUTH_DRIVE.md  - Técnico
📄 TODO_OAUTH.txt              - Checklist
```

---

## 🎯 Resumen

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| Autenticación | Clave JSON | OAuth 2.0 |
| Complejidad | Alta | Baja |
| Variables | 8+ | 6 |
| Política bloqueaba? | ✅ Sí | ❌ No |
| Seguridad | ⚠️ Clave local | ✅ Token renovado |
| Tiempo de setup | 45 min | 20 min |

---

## 🚀 Próximo Paso

Lee: **`GUIA_RAPIDA_OAUTH.md`**

Toma 20 minutos y la app funciona.

¡Vamos! 🚀
