# 🚀 START HERE - TuGestiónLegal

Bienvenido a **TuGestiónLegal**, tu aplicación web para la gestión de trámites de extranjería.

## ⚡ Quick Start (5 minutos)

```bash
# 1. Rellenar variables de entorno
# Edita .env.local con tus credenciales

# 2. Crear base de datos
npx prisma migrate dev --name init

# 3. Iniciar servidor
npm run dev

# 4. Abrir en navegador
# http://localhost:3000
```

## 📖 Documentación en Orden

### 1️⃣ **README.md** (Leer primero - 10 min)
Descripción general, stack tecnológico, configuración inicial.

### 2️⃣ **SETUP_INICIAL.md** (Guía de inicio - 15 min)
Próximos pasos, troubleshooting básico.

### 3️⃣ **docs/SETUP_GOOGLE_CLOUD.md** (MÁS IMPORTANTE - 30-45 min)
⚠️ **CRÍTICO**: Aquí configuras todas las credenciales de Google.

**Paso a paso**:
1. Crear proyecto en Google Cloud
2. Habilitar APIs (Drive, Docs)
3. Crear cuenta de servicio → Descargar JSON
4. Crear OAuth 2.0 para login
5. Crear Shared Drive en Google Drive
6. Crear estructura de carpetas
7. Copiar IDs de carpetas en `.env.local`

### 4️⃣ **CLAUDE.md** (Para desarrolladores)
Guía interna, estructura de código, convenciones.

### 5️⃣ **docs/DEPLOYMENT.md** (Cuando esté listo para producción)
Opciones de hosting, dominios, CI/CD.

## 🔧 Variables de Entorno Críticas

Abre `.env.local` y rellena **todas estas**:

```env
# Base de datos (PostgreSQL)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="(generar con: openssl rand -hex 32)"

# Google OAuth (para login)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Google Service Account (para Drive/Docs)
GOOGLE_SERVICE_ACCOUNT_EMAIL="..."
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="..."

# Google Drive
GOOGLE_SHARED_DRIVE_ID="..."
DRIVE_FOLDER_ENTRADA_ID="..."
DRIVE_FOLDER_PLANTILLAS_ID="..."
DRIVE_FOLDER_CLIENTES_ID="..."
DRIVE_FOLDER_SIN_CLASIFICAR_ID="..."
```

## ✨ Funcionalidades Principales

- 🔐 Login con Google
- 👥 Gestión de clientes
- 📋 Gestión de trámites
- 📁 Integración Google Drive (crear carpetas automáticamente)
- 📑 Estructura para generación de documentos
- 📊 Panel de control con KPIs

## 🎯 Tu Flujo de Trabajo

1. **Login** → Google OAuth
2. **Crear Trámite** → Automáticamente:
   - Se crea cliente (si no existe)
   - Se asigna código único (TR-00234)
   - Se crea carpeta en Google Drive
3. **Gestionar** → Ver documentos, cambiar estado
4. **Generar Docs** → Desde plantillas de Google Docs

## 📦 Qué Está Instalado

```
✅ Next.js 14 + React 18 + TypeScript
✅ Prisma ORM + PostgreSQL
✅ NextAuth.js (Google OAuth)
✅ Google APIs (Drive + Docs)
✅ Tailwind CSS (UI)
✅ React Hot Toast (notificaciones)
```

## ⚠️ Importante

**NO SUBAS A GIT**:
- `.env.local` (tiene credenciales)
- `node_modules/`
- `.next/`

Están en `.gitignore` pero verifica antes de hacer push.

## 🚨 Si Algo No Funciona

### Error: "Service account credentials not configured"
→ Verifica `.env.local` tiene `GOOGLE_SERVICE_ACCOUNT_EMAIL` y `PRIVATE_KEY`

### Error: "Cannot create folder in Drive"
→ Ve a `docs/SETUP_GOOGLE_CLOUD.md` sección 7 (Permisos)

### Error: "Cannot connect to database"
→ Verifica que PostgreSQL está corriendo y `DATABASE_URL` es correcto

## 🚀 Comandos Útiles

```bash
# Iniciar servidor desarrollo
npm run dev

# Abrir Prisma Studio (gestionar BD)
npm run prisma:studio

# Crear nueva migración
npm run prisma:migrate

# Build para producción
npm run build

# Lint/verificar código
npm run lint
```

## 📊 Estructura de Carpetas

```
app/              - Páginas y rutas API
components/       - Componentes React
lib/              - Funciones auxiliares
prisma/           - Schema de BD
docs/             - Documentación
.env.local        - Variables de entorno (NO git)
```

## 🎓 Próximas Fases

### Fase 2 (Próxima)
- Clasificación automática de documentos escaneados
- Cola de revisión manual

### Fase 3 (Luego)
- Notificaciones por email
- Portal cliente

## 📞 Ayuda

1. Lee el archivo correspondiente en `/docs`
2. Revisa `CLAUDE.md` para detalles técnicos
3. Consulta `SETUP_INICIAL.md` para troubleshooting

## ✅ Checklist Final

Antes de empezar:
- [ ] Leí README.md
- [ ] Completé docs/SETUP_GOOGLE_CLOUD.md
- [ ] Rellenè .env.local
- [ ] Ejecuté: `npx prisma migrate dev --name init`
- [ ] Ejecuté: `npm run dev`
- [ ] Logué con Google
- [ ] Creé un trámite de prueba

## 🎉 ¡Listo!

Tu aplicación está 100% configurada y lista para usar.

**Próximo paso**: Abre `docs/SETUP_GOOGLE_CLOUD.md`

---

**Tiempo total de setup**: 45-60 minutos (principalmente Google Cloud)

Cualquier duda, la documentación tiene todas las respuestas. 📚
