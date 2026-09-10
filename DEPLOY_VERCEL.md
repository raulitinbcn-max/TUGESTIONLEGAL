# 🚀 Deploy en Vercel - TuGestiónLegal

## Requisitos Previos

- [ ] Cuenta en GitHub
- [ ] Cuenta en Vercel (puedes registrarte con GitHub)
- [ ] PostgreSQL en línea (Vercel Postgres o similar)
- [ ] Credenciales de Google OAuth configuradas
- [ ] Carpetas en Google Drive creadas y con IDs conocidos

---

## Paso 1: Preparar el Repositorio

### 1.1 Subir a GitHub

```bash
cd c:\Users\Raúl\TUGESTIONLEGAL

# Crear repo en GitHub primero (https://github.com/new)
# Luego:
git remote add origin https://github.com/TU_USUARIO/TUGESTIONLEGAL.git
git branch -M main
git push -u origin main
```

**Lo que sube:**
- ✅ Código fuente
- ✅ Configuración
- ✅ Migrations
- ❌ `.env.local` (excluido por .gitignore)
- ❌ `node_modules/` (excluido)
- ❌ `.next/` (excluido, se genera en build)

---

## Paso 2: Crear Proyecto en Vercel

### 2.1 Ir a Vercel

1. Ve a https://vercel.com
2. Click en "Sign Up" → Conecta con GitHub
3. Autoriza acceso a tus repositorios

### 2.2 Importar Proyecto

1. Dashboard de Vercel → "Add New Project"
2. Busca `TUGESTIONLEGAL`
3. Click en "Import"
4. **Settings:**
   - Framework: `Next.js` (auto-detectado)
   - Root Directory: `.` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
5. **NO configurar variables aquí aún**, click "Deploy"

---

## Paso 3: Configurar Variables de Entorno

Una vez que el proyecto esté en Vercel (aunque falle el deploy inicial):

### 3.1 Ir a Settings → Environment Variables

Agregar **TODAS** estas variables:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname

NEXTAUTH_URL=https://tu-proyecto.vercel.app

NEXTAUTH_SECRET=(generar: openssl rand -base64 32)

GOOGLE_CLIENT_ID=xxxxxxxxx.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxx

GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@iam.gserviceaccount.com

GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBAAKCAQEA...\n-----END PRIVATE KEY-----\n"

GOOGLE_SHARED_DRIVE_ID=xxxxxxxxx

DRIVE_FOLDER_ENTRADA_ID=xxxxxxxxx

DRIVE_FOLDER_PLANTILLAS_ID=xxxxxxxxx

DRIVE_FOLDER_CLIENTES_ID=xxxxxxxxx
```

**⚠️ IMPORTANTE - PRIVATE_KEY:**
```
Formato correcto para Vercel:
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"

NO es:
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBg...
-----END PRIVATE KEY-----
```

### 3.2 Verificar Configuración

Vercel mostrará las variables en Settings → Environment Variables con estado ✓

---

## Paso 4: Ejecutar Migraciones

### 4.1 Primera vez - Base de datos nueva

Tienes dos opciones:

**Opción A: Via CLI de Vercel (más fácil)**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Ejecutar migraciones en el deployment
vercel env pull
npx prisma migrate deploy
```

**Opción B: Via Vercel Deploy Hooks**
1. Settings → Deploy Hooks
2. Crear hook POST que ejecute: `npx prisma migrate deploy && npm run build`

**Opción C: Ejecutar después del primer deploy**
```bash
# Si usas Vercel Postgres:
vercel env pull
npx prisma migrate deploy
```

---

## Paso 5: Redeploy

Una vez configuradas las variables:

### 5.1 Forzar redeploy

En Vercel:
1. Ve a "Deployments"
2. Click en el deployment inicial (que probablemente falló)
3. Click en "..." → "Redeploy"

O via CLI:
```bash
vercel --prod
```

---

## Paso 6: Verificar Deploy

### 6.1 Checkeo de salud

Vercel mostrará:
- ✅ Build successful
- ✅ Deployments active

### 6.2 Test en navegador

```
https://tu-proyecto.vercel.app/login
```

Debería mostrar:
- Página de login con estilos (Tailwind)
- Botón "Iniciar sesión con Google"

---

## Variables de Entorno - Dónde Obtenerlas

### DATABASE_URL
Si usas **Vercel Postgres**:
1. En dashboard de Vercel
2. Storage → Create Database → Postgres
3. Conectar a proyecto
4. Variable se auto-configura

Si usas **externa** (Railway, Supabase, etc):
```
postgresql://user:password@host:5432/database
```

### NEXTAUTH_SECRET
Generar nuevo:
```bash
openssl rand -base64 32
```

### GOOGLE_CLIENT_ID / SECRET
De Google Cloud Console (ya deberías tenerlos):
1. https://console.cloud.google.com
2. OAuth 2.0 Client IDs
3. Copiar ID y Secret

### GOOGLE_SERVICE_ACCOUNT_*
De Google Cloud Console:
1. Service Accounts
2. Seleccionar cuenta de servicio
3. Keys → Create new JSON key
4. EMAIL: copiar email
5. PRIVATE_KEY: copiar clave (reemplazar saltos por \n)

### DRIVE_FOLDER_*
En Google Drive:
- Crear carpetas: `/Entrada`, `/Plantillas`, `/Clientes`
- Copiar ID de cada carpeta desde URL:
  ```
  https://drive.google.com/drive/folders/1FOLDER_ID_AQUI
                                         ^^^^^^^^^^^^
  ```

---

## Troubleshooting

### ❌ "Build failed"
- Revisa logs: Vercel → Deployments → click en deployment
- Probablemente falta variable de entorno

### ❌ "Cannot connect to database"
- Verifica DATABASE_URL está correcta
- Firewall: asegúrate que Vercel IPs pueden acceder a BD
- PostgreSQL debe estar en línea

### ❌ "Google OAuth error"
- Verifica NEXTAUTH_URL es exacta: `https://tu-proyecto.vercel.app`
- En Google Cloud Console, autoriza este URL en OAuth settings
- Redirect URIs debe incluir: `https://tu-proyecto.vercel.app/api/auth/callback/google`

### ❌ "Página sin estilos"
- Tailwind CSS no se compiló
- Verifica que `npm run build` ejecutó bien
- Redeploy: Deployments → Redeploy

---

## Próximos Pasos

1. ✅ Deploy completado
2. Crear carpetas en Google Drive (si no existen)
3. Crear algunos clientes de prueba
4. Probar flujo completo de creación de trámite

¡Listo para producción! 🎉

