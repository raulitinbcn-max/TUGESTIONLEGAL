# TuGestiónLegal - Gestión de Trámites de Extranjería

Aplicación web para la gestión de trámites de extranjería en una gestoría, con integración con Google Drive y Google Docs.

## Stack Tecnológico

- **Frontend + Backend**: Next.js 15 con App Router y TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js con Google OAuth
- **Almacenamiento**: Google Drive API v3
- **Generación de Documentos**: Google Docs API
- **Estilos**: Tailwind CSS

## Configuración Inicial

### 1. Requisitos Previos

- Node.js 18+ y npm
- PostgreSQL instalado localmente o en la nube
- Cuenta de Google Cloud con APIs de Drive y Docs habilitadas
- Cuenta de Google para crear cuenta de servicio

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Configuración de Base de Datos

```bash
# Crear la base de datos (si usas PostgreSQL local)
createdb tugestionlegal

# Ejecutar migraciones de Prisma
npx prisma migrate dev --name init

# (Opcional) Abrir Prisma Studio para gestionar datos
npx prisma studio
```

### 4. Configuración de Google Cloud

#### 4.1 Crear Proyecto en Google Cloud

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear un nuevo proyecto
3. Habilitar las APIs:
   - Google Drive API
   - Google Docs API

#### 4.2 Crear Cuenta de Servicio

1. En la consola, ir a "Service Accounts"
2. Crear nueva cuenta de servicio
3. Generar clave JSON
4. Guardar el JSON con seguridad

#### 4.3 Crear Shared Drive (Unidad Compartida)

1. Ir a [Google Drive](https://drive.google.com)
2. Crear nueva "Unidad compartida"
3. Compartir acceso con el email de la cuenta de servicio
4. Crear la estructura de carpetas:
   ```
   /Gestoria (Shared Drive)
     /Plantillas
     /Entrada
       /Sin clasificar
     /Clientes
   ```

### 5. Variables de Entorno

Crear archivo `.env.local` (ya existe un template) y rellenar:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tugestionlegal"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generar-con-openssl-rand-hex-32"

# Google OAuth (para login de usuarios)
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxxxx"

# Google Service Account (para Drive API)
GOOGLE_SERVICE_ACCOUNT_EMAIL="xxx@yyy.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----"

# Google Drive
GOOGLE_SHARED_DRIVE_ID="xxxxx"
DRIVE_FOLDER_ENTRADA_ID="xxxxx"
DRIVE_FOLDER_PLANTILLAS_ID="xxxxx"
DRIVE_FOLDER_CLIENTES_ID="xxxxx"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generación de NEXTAUTH_SECRET:**
```bash
openssl rand -hex 32
```

### 6. Restricción de Dominio (Opcional pero Recomendado)

En `lib/auth.ts`, descomenta y modifica la línea de validación de email:

```typescript
if (!user.email?.endsWith('@tugestorian.com')) {
  return false
}
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Acceso

- Login: Google OAuth
- Primera visita: te redirige a `/login`
- Autenticado: acceso a `/dashboard` y demás rutas protegidas

## Estructura del Proyecto

```
/app
  /(auth)/login              - Página de login
  /(protected)/              - Rutas protegidas (requieren autenticación)
    /dashboard               - Panel de control
    /clientes                - Listado de clientes
    /clientes/[id]           - Detalle de cliente
    /tramites/nuevo          - Crear nuevo trámite
    /documentos-pendientes   - Cola de documentos sin clasificar
  /api
    /auth                    - NextAuth
    /tramites                - CRUD de trámites
    /documentos              - CRUD de documentos
    /clasificacion-automatica - Job de clasificación (Fase 2)

/lib
  /auth.ts                   - Configuración NextAuth
  /db.ts                     - Cliente Prisma
  /drive.ts                  - Funciones Google Drive API
  /docs.ts                   - Funciones Google Docs API
  /utils.ts                  - Utilidades generales

/components                  - Componentes React reutilizables

/prisma
  /schema.prisma             - Esquema de base de datos
```

## Fases de Desarrollo

### Fase 1 - MVP (Actual)
- ✅ Formulario de alta cliente/trámite
- ✅ Creación automática de carpeta en Drive
- ✅ Listado y ficha de detalle
- ⏳ Generación de documentos desde plantilla (próximo)

### Fase 2
- ⏳ Job automático de clasificación de documentos
- ⏳ Cola de revisión manual para documentos no identificados

### Fase 3
- ⏳ Notificaciones por email
- ⏳ Portal cliente para consultar estado

## Rutas API Disponibles

### Trámites
- `POST /api/tramites` - Crear nuevo trámite
- `GET /api/tramites` - Listar todos los trámites
- `GET /api/tramites/[id]` - Obtener detalle de trámite

### Documentos
- `GET /api/documentos?tramiteId=x` - Listar documentos de un trámite
- `POST /api/documentos` - Crear documento
- `GET /api/documentos/pendientes` - Listar documentos sin clasificar
- `POST /api/documentos/clasificar` - Clasificar documento en trámite

### Generación de Documentos
- `POST /api/tramites/generar-documento` - Generar documento desde plantilla (Fase 1)

## Documentación Adicional

- [Prisma ORM](https://www.prisma.io/docs/)
- [Next.js 15 App Router](https://nextjs.org/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Google Drive API](https://developers.google.com/drive/api)
- [Google Docs API](https://developers.google.com/docs/api)

## Notas de Seguridad

- ⚠️ Nunca expongas credenciales de servicio en el frontend
- ⚠️ Todas las llamadas a Drive/Docs deben ir en rutas de servidor (API routes)
- ⚠️ Habilita HTTPS en producción
- ⚠️ Restringe acceso por dominio de email si es posible
- ⚠️ Revisa regularmente permisos de la cuenta de servicio en Drive

## Troubleshooting

### Error: "Service account credentials not configured"
- Verifica que `GOOGLE_SERVICE_ACCOUNT_EMAIL` y `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` están en `.env.local`
- La clave privada debe tener saltos de línea correctos: `\n` en lugar de `\\n`

### Error: "DRIVE_FOLDER_CLIENTES_ID not configured"
- Verifica que todas las variables de Drive están configuradas
- Comprueba que la Shared Drive existe y es accesible

### Error de autenticación en Google Drive
- Asegúrate de que la cuenta de servicio tiene acceso a la Shared Drive
- Verifica permisos: debe tener al menos "Editor"

## Licencia

Privado - Proyecto de gestoría
