# 🚀 Setup Inicial - TuGestiónLegal

## ✅ Proyecto Creado

Se ha creado una aplicación web completa para la gestión de trámites de extranjería. El proyecto está listo para desarrollo y personalización.

## 📦 Instalación Completada

```bash
✅ Dependencies instaladas
✅ Estructura de carpetas creada
✅ Componentes base implementados
✅ Schema de BD configurado
```

## 🔧 Próximos Pasos

### 1. Configurar Google Cloud (IMPORTANTE)
Sigue la guía completa en `docs/SETUP_GOOGLE_CLOUD.md`:
- Crear proyecto en Google Cloud Console
- Habilitar APIs (Drive, Docs)
- Crear cuenta de servicio y generar clave JSON
- Crear OAuth 2.0 para login
- Crear Shared Drive y estructura de carpetas
- Copiar IDs de carpetas

**Tiempo estimado: 30-45 minutos**

### 2. Rellenar Variables de Entorno
Edita `.env.local` con los valores de Google Cloud:

```env
# Database - Reemplaza con tu PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/tugestionlegal"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -hex 32"

# Google OAuth (del paso 1)
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"

# Google Service Account (del paso 1, archivo JSON)
GOOGLE_SERVICE_ACCOUNT_EMAIL="xxxxx@yyyyy.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Google Drive IDs (del paso 1)
GOOGLE_SHARED_DRIVE_ID="tu-shared-drive-id"
DRIVE_FOLDER_ENTRADA_ID="id-carpeta-entrada"
DRIVE_FOLDER_PLANTILLAS_ID="id-carpeta-plantillas"
DRIVE_FOLDER_CLIENTES_ID="id-carpeta-clientes"
DRIVE_FOLDER_SIN_CLASIFICAR_ID="id-carpeta-sin-clasificar"
```

### 3. Configurar Base de Datos

```bash
# Asegúrate de tener PostgreSQL corriendo
# Luego ejecuta:
npx prisma migrate dev --name init
```

### 4. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará en: **http://localhost:3000**

## 🎯 Funcionalidades Implementadas (Fase 1)

### ✅ Autenticación
- Login con Google OAuth
- NextAuth.js configurado
- Rutas protegidas

### ✅ Gestión de Clientes
- Formulario de alta integrado con trámite
- Listado de clientes
- Ficha de detalle con todos los datos
- Historial de trámites por cliente

### ✅ Gestión de Trámites
- Crear trámite + cliente en un formulario único
- Creación automática de carpeta en Google Drive
- Listado de trámites con filtros
- Ficha de detalle con:
  - Cambio de estado
  - Historial de cambios
  - Gestión de documentos

### ✅ Integración Google Drive
- Creación de carpetas dinámicamente
- Funciones auxiliares (copy, move, list)
- Soporte para Shared Drives

### ✅ Estructura Base para Generación de Documentos
- Funciones Google Docs API configuradas
- Rutas API preparadas
- Validación de plantillas

### ✅ Panel de Control
- KPIs: clientes, trámites, en proceso

## 📊 Estructura del Proyecto

```
tugestionlegal/
├── app/
│   ├── (auth)/login
│   ├── (protected)/          [Rutas autenticadas]
│   │   ├── dashboard
│   │   ├── clientes/[id]
│   │   ├── tramites/[id]
│   │   └── documentos-pendientes
│   └── api/                  [Endpoints REST]
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── drive.ts
│   ├── docs.ts
│   ├── clasificacion.ts
│   └── utils.ts
├── components/               [Componentes React]
├── prisma/
│   └── schema.prisma
└── docs/
    └── SETUP_GOOGLE_CLOUD.md
```

## 📖 Documentación

- **README.md** - Descripción general y quick start
- **CLAUDE.md** - Guía interna para desarrollo
- **docs/SETUP_GOOGLE_CLOUD.md** - Setup detallado de Google Cloud
- **SETUP_INICIAL.md** - Este archivo

## 🚦 Próximas Fases

### Fase 2: Clasificación Automática
- Job cron que lista archivos en /Entrada
- Clasificación automática basada en nombre de archivo
- Cola manual de revisión

### Fase 3: Notificaciones y Portal Cliente
- Emails de notificación de cambios de estado
- Portal cliente para ver estado del trámite

## 🔒 Seguridad

- ✅ Credenciales en .env.local (NO en código)
- ✅ Autenticación requerida en todas las rutas
- ✅ Llamadas a Drive/Docs solo desde servidor
- ✅ HTTPS obligatorio en producción

## 💡 Tips de Desarrollo

### Abrir Prisma Studio
```bash
npm run prisma:studio
```

### Ejecutar migraciones
```bash
npm run prisma:migrate
```

### Generar cliente Prisma
```bash
npm run prisma:generate
```

### Lint
```bash
npm run lint
```

## ⚠️ Importante Antes de Usar

1. **NO subas .env.local a Git**
   - Está en .gitignore pero verifica
   - Mantén las credenciales seguras

2. **HTTPS en Producción**
   - Nunca usar HTTP en prod
   - Configurar redirect en servidor

3. **Dominio de Email (Opcional)**
   - En `lib/auth.ts` puedes restringir por dominio
   - Útil para acceso solo corporativo

## 🐛 Troubleshooting

### "Module not found"
```bash
npm install
```

### "Cannot connect to database"
- Verifica que PostgreSQL está corriendo
- Comprueba `DATABASE_URL` en .env.local

### "Google credentials not configured"
- Revisa que las variables de entorno están correctas
- La clave privada debe tener saltos de línea reales

### "Cannot create folder in Drive"
- Verifica que la Shared Drive existe
- Comprueba que `DRIVE_FOLDER_CLIENTES_ID` es válido
- Asegúrate que la cuenta de servicio es Editor

## 📞 Soporte

Consulta la documentación en:
- README.md para uso general
- CLAUDE.md para desarrollo
- docs/SETUP_GOOGLE_CLOUD.md para configuración

## 🎉 ¡Listo!

Tu aplicación TuGestiónLegal está lista para:
1. Configurar Google Cloud
2. Rellenar .env.local
3. Ejecutar `npm run dev`
4. ¡Empezar a gestionar trámites!

---

**Fecha de creación**: Septiembre 2026
**Versión**: 0.1.0 - Fase 1 MVP
