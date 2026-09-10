# ⚡ GUÍA RÁPIDA - Setup OAuth (20 minutos)

## TL;DR

1. Copia IDs de carpetas de Google Drive → `.env.local`
2. Verifica Google OAuth en Google Cloud
3. Ejecuta app
4. Haz login con Google

## PASO 1: Crear Carpetas en Google Drive (5 min)

Abre: https://drive.google.com

Crea esta estructura:

```
TuGestiónLegal/                    ← Carpeta principal
├── Plantillas/                    ← Aquí pones plantillas de Google Docs
├── Entrada/                       ← Aquí se suben escaneos
│   └── Sin clasificar/            ← Docs que no se identificaron
└── Clientes/                      ← Aquí se crean carpetas de cada trámite
```

## PASO 2: Copiar IDs de Carpetas (5 min)

Para cada carpeta (Plantillas, Entrada, Sin clasificar, Clientes):

1. Abre la carpeta en Drive
2. Mira la URL en el navegador:
   ```
   https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j
                                          ↑↑↑ ESTE ES EL ID
   ```
3. Copia el ID
4. Pega en `.env.local` en la variable correspondiente

## PASO 3: Rellenar `.env.local` (5 min)

Abre: `c:\Users\Raúl\TUGESTIONLEGAL\.env.local`

Rellena solo ESTOS campos (el resto ya están):

```env
# Google OAuth
GOOGLE_CLIENT_ID="tu-client-id-aqui.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret-aqui"

# Google Drive (los IDs que copiaste)
DRIVE_FOLDER_PLANTILLAS_ID="id-que-copiaste-de-plantillas"
DRIVE_FOLDER_ENTRADA_ID="id-que-copiaste-de-entrada"
DRIVE_FOLDER_SIN_CLASIFICAR_ID="id-que-copiaste-de-sin-clasificar"
DRIVE_FOLDER_CLIENTES_ID="id-que-copiaste-de-clientes"

# Base de datos (si no la has cambiado, déjalo igual)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="generar-nuevo-o-dejar-igual"
```

### ¿Dónde está GOOGLE_CLIENT_ID?

Ve a: https://console.cloud.google.com/iam-admin/settings/account

- Click en tu proyecto
- IAM y administración → Credenciales
- Busca "Aplicación web" (tipo OAuth)
- Copia: Client ID y Client Secret

## PASO 4: Ejecutar App (5 min)

En PowerShell, en la carpeta del proyecto:

```powershell
# 1. Configurar BD
npx prisma migrate dev --name init

# 2. Iniciar servidor
npm run dev

# 3. Abre en navegador
# http://localhost:3000

# 4. Haz click en: "Iniciar sesión con Google"

# 5. Aprueba los permisos que pide

# 6. ¡Ya estás dentro! Crea tu primer trámite
```

## ✅ Checklist Antes de Ejecutar

- [ ] Carpetas creadas en Google Drive
- [ ] IDs copiados de las 4 carpetas
- [ ] `.env.local` rellenado con los IDs
- [ ] GOOGLE_CLIENT_ID rellenado
- [ ] GOOGLE_CLIENT_SECRET rellenado
- [ ] DATABASE_URL apunta a PostgreSQL

Si todo ✅, ejecuta:

```powershell
npm run dev
```

## 🎯 Lo Que Pasa Cuando Funciona

1. Abres http://localhost:3000
2. Ves botón "Iniciar sesión con Google"
3. Haces click
4. Te lleva a login de Google
5. Apruebas permisos (Drive, Docs, perfil)
6. ¡Vuelta a la app, ya estás dentro!
7. Creas un trámite
8. Se crea automáticamente en Google Drive

## 🆘 Si Algo Falla

### Error: "Google credentials not configured"
→ Verifica GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en `.env.local`

### Error: "Cannot create folder in Drive"
→ Verifica que copiaste correctamente los DRIVE_FOLDER_* IDs

### Error: "Cannot connect to database"
→ Verifica que PostgreSQL está corriendo y DATABASE_URL es correcto

### Error: "You don't have permission"
→ El usuario no tiene acceso a esa carpeta en Drive
→ Solución: Comparte la carpeta de Drive con tu usuario de Google

## 📖 Documentación Completa

- `docs/SETUP_OAUTH_SIMPLE.md` - Guía detallada
- `docs/SETUP_OAUTH_DRIVE.md` - Explicación técnica completa
- `CLAUDE.md` - Guía interna para desarrolladores

## ⏱️ Tiempo Total

```
Crear carpetas:        5 min
Copiar IDs:            5 min
Rellenar .env.local:   5 min
Ejecutar app:          5 min
─────────────────────────────
TOTAL:                20 minutos
```

## 🚀 Siguientes Pasos (Después de que funcione)

1. ✅ Crea unos trámites de prueba
2. ✅ Verifica que se crean carpetas en Drive
3. ✅ Intenta generar documentos
4. → Luego: Setup de plantillas de Google Docs
5. → Luego: Fase 2 (clasificación automática)

---

**¡Eso es todo lo que necesitas hacer!** 🎉

El código ya está actualizado. Solo necesitas:
1. Carpetas en Drive
2. Rellenar `.env.local`
3. Ejecutar `npm run dev`

¿Preguntas?
