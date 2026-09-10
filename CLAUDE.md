# CLAUDE.md - TuGestiónLegal

## Descripción del Proyecto

TuGestiónLegal es una aplicación web para la gestión de trámites de extranjería en una gestoría. Permite crear y gestionar clientes, trámites, generar documentos automáticamente desde plantillas de Google Docs y clasificar documentos escaneados.

## Stack y Tecnologías

- **Frontend + Backend**: Next.js 15 App Router con TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js con Google OAuth
- **Almacenamiento**: Google Drive API v3
- **Documentos**: Google Docs API para generación automática
- **UI**: Tailwind CSS
- **Notificaciones**: React Hot Toast

## Estructura de la Aplicación

```
/app
  /(auth)/login              - Página de login con Google
  /(protected)/              - Rutas protegidas (requieren autenticación)
    /dashboard               - Panel de control (KPIs)
    /clientes                - Listado de clientes
    /clientes/[id]           - Detalle de cliente y sus trámites
    /tramites                - Listado de trámites
    /tramites/[id]           - Detalle de trámite con generación de documentos
    /tramites/nuevo          - Formulario para crear nuevo trámite
    /documentos-pendientes   - Cola de documentos sin clasificar (Fase 2)
  /api
    /auth/[...nextauth]      - NextAuth routes
    /tramites/route.ts       - CRUD trámites
    /tramites/[id]/route.ts  - Detail y actualización de trámite
    /tramites/generar-documento/route.ts - Generar docs desde plantilla
    /documentos/route.ts     - CRUD documentos
    /documentos/pendientes/route.ts - Listar docs sin clasificar
    /documentos/clasificar/route.ts - Clasificar manualmente

/lib
  /auth.ts                   - Configuración NextAuth (Google OAuth)
  /db.ts                     - Singleton de Prisma
  /drive.ts                  - Google Drive API utilities
  /docs.ts                   - Google Docs API utilities
  /utils.ts                  - Funciones auxiliares

/components                  - React components reutilizables
  /Navigation.tsx            - Navegación lateral
  /TramiteForm.tsx           - Formulario de alta cliente/trámite
  /ClienteDetail.tsx         - Detalle de cliente (client component)
  /TramiteDetail.tsx         - Detalle de trámite (client component)
  /DocumentosPendientes.tsx  - Cola de clasificación (Fase 2)

/prisma
  /schema.prisma             - Esquema de BD

.env.local                   - Variables de entorno (NO commitar)
```

## Modelo de Datos

### Entidades principales:
- **Cliente**: Datos personales, contacto
- **Tramite**: Vinculado a cliente, con estado, honorarios, carpeta Drive
- **Documento**: Archivos subidos (manual o clasificados automáticamente)
- **DocumentoGenerado**: Resultado de generar desde plantilla
- **Plantilla**: Template de Google Docs (checklist, contrato, etc.)
- **HistorialEstado**: Registro de cambios de estado del trámite

## Configuración Requerida

### Variables de entorno (.env.local)
```
DATABASE_URL              - PostgreSQL connection string
NEXTAUTH_URL              - URL de la app (ej: http://localhost:3000)
NEXTAUTH_SECRET           - Secreto para JWT (generar con openssl)
GOOGLE_CLIENT_ID          - OAuth app client ID
GOOGLE_CLIENT_SECRET      - OAuth app secret
GOOGLE_SERVICE_ACCOUNT_EMAIL    - Email de cuenta de servicio
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY - Clave privada (con \n reales)
GOOGLE_SHARED_DRIVE_ID    - ID de la Unidad Compartida en Drive
DRIVE_FOLDER_ENTRADA_ID   - ID carpeta /Entrada
DRIVE_FOLDER_PLANTILLAS_ID - ID carpeta /Plantillas
DRIVE_FOLDER_CLIENTES_ID  - ID carpeta /Clientes
```

### Setup Inicial
```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

## Fases de Desarrollo

### ✅ Fase 1 - MVP (Implementada)
- Formulario de alta cliente/trámite
- Creación automática de carpeta en Drive
- Listado y detalle de clientes/trámites
- Cambio de estado de trámite
- Base de generación de documentos desde plantilla (estructura lista)

### ⏳ Fase 2 - Clasificación Automática
- Job cron que lista archivos en /Entrada
- Extrae código de trámite del filename (ej: TR-00234_pasaporte.pdf)
- Mueve archivo a carpeta correspondiente
- Cola de revisión manual para docs no identificados

### ⏳ Fase 3 - Notificaciones y Portal Cliente
- Emails de notificación
- Portal de consulta para clientes

## Convenciones de Código

- **Nombres en BD**: snake_case (ej: numero_pasaporte)
- **Nombres en TS**: camelCase (ej: numeroPasaporte)
- **Componentes Client**: `'use client'` al inicio si necesitan hooks
- **API Routes**: Handlers POST/GET/PUT/DELETE en /api
- **Errores**: Siempre return JSON con status code apropiado
- **Dates**: Usar new Date() para crear, formatDate() para mostrar

## Puntos Clave

1. **Google Drive API**: 
   - Usar cuenta de servicio, no OAuth personal
   - Todas las operaciones en servidor (API routes)
   - Scopes: drive + documents

2. **Generación de Documentos**:
   - Copiar plantilla a carpeta del trámite
   - Reemplazar placeholders ({{nombre}}, etc.)
   - Registrar en DocumentoGenerado

3. **Seguridad**:
   - Nunca exponer credenciales en frontend
   - Verificar autenticación en rutas protegidas
   - Validar acceso a recursos (ej: usuario puede ver este trámite)

4. **Base de Datos**:
   - Cascada delete entre Cliente → Tramites
   - Creación automática createdAt/updatedAt
   - Usar findUnique para ID, findFirst para búsquedas

## 🔒 Sistema de Backup Automático con OAuth

### ✅ Backup Automático a Google Drive
**Cuándo:** Se ejecuta automáticamente cada vez que accedes a una ruta protegida (una sola vez por sesión)
**Ubicación:** Carpeta `DRIVE_FOLDER_BACKUPS_ID` en Google Drive
**Archivo:** `sistema-backup-YYYY-MM-DD.json`
**Retención:** Últimos 10 backups automáticos
**Autenticación:** Usa tus credenciales OAuth (no requiere cuenta de servicio)

### 📋 Contenido del Backup
- ✅ Todas las categorías de trámites
- ✅ Tipos de trámites configurados
- ✅ Tipos de documentos
- ✅ Checklist de documentos
- ✅ Plantillas
- ✅ Tasas
- ✅ Todos los clientes
- ✅ Todos los trámites con sus relaciones
- ✅ Historial de cambios de estado
- ✅ Documentos y documentos generados

### 🖱️ Backup Manual
```
Ir a Admin > Backup a Google Drive > Hacer Backup Ahora
```
Puedes hacer backup en cualquier momento desde la interfaz. Útil antes de cambios importantes.

### 🔄 Sincronización desde Drive
```bash
npm run sync-clientes         # Sincroniza clientes desde las carpetas de Drive
npm run restore-config        # Restaura configuración desde backup local
```

## Próximos Pasos (Después de Fase 1)

1. Setup de plantillas en Google Drive
2. Implementar generación de checklist y contrato
3. Tests unitarios para funciones de Drive/Docs
4. Implementar clasificación automática (job cron)
5. Restricción de dominio de email (@tugestorian.com)
6. Manejo de errores mejorado + logging
7. Paginación en listados grandes
8. Búsqueda y filtros avanzados
