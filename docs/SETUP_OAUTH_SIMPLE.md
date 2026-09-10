# 🔑 Setup OAuth para TuGestiónLegal - GUÍA SIMPLE

Esta es la guía ESPECÍFICA para usar OAuth 2.0 (sin clave JSON).

## Lo Que YA Está Hecho

✅ Código actualizado para OAuth
✅ NextAuth configurado con Google OAuth
✅ Scopes de Drive y Docs incluidos
✅ TypeScript types configurados

## Lo Que TÚ Debes Hacer (3 Pasos)

### PASO 1: Verificar Google OAuth en Google Cloud

**Tiempo: 5 minutos**

1. Abre: https://console.cloud.google.com
2. Ve a: **APIs y servicios** → **Credenciales**
3. Busca tu credencial de OAuth (tipo "Aplicación web")
4. Haz clic en ella
5. Verifica que tienes:
   ```
   ✅ Client ID: GOOGLE_CLIENT_ID
   ✅ Client Secret: GOOGLE_CLIENT_SECRET
   ✅ Authorized redirect URIs: 
      - http://localhost:3000/api/auth/callback/google
      - https://tudominio.com/api/auth/callback/google (producción)
   ```

6. Si falta algo, agrega el URI de redireccionamiento

**Copiar estos valores para el siguiente paso**

### PASO 2: Crear Carpetas en Google Drive

**Tiempo: 10 minutos**

1. Abre: https://drive.google.com
2. Crea una carpeta llamada: `TuGestiónLegal` (o usa una existente)
3. Dentro, crea 4 subcarpetas:

```
TuGestiónLegal/
├── Plantillas/
├── Entrada/
│   └── Sin clasificar/
└── Clientes/
```

**Para cada carpeta, copia su ID:**

- Abre la carpeta
- Mira la URL del navegador:
  ```
  https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j
  ```
- El ID es: `1a2b3c4d5e6f7g8h9i0j`

**Copia los IDs de:**
- Plantillas → `DRIVE_FOLDER_PLANTILLAS_ID`
- Entrada → `DRIVE_FOLDER_ENTRADA_ID`
- Sin clasificar → `DRIVE_FOLDER_SIN_CLASIFICAR_ID`
- Clientes → `DRIVE_FOLDER_CLIENTES_ID`

### PASO 3: Rellenar `.env.local`

**Tiempo: 5 minutos**

Abre: `c:\Users\Raúl\TUGESTIONLEGAL\.env.local`

Rellena EXACTAMENTE así:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/tugestionlegal"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generar-con-openssl-rand-hex-32"

# Google OAuth (del Paso 1)
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"

# Google Drive (del Paso 2)
DRIVE_FOLDER_PLANTILLAS_ID="id-de-plantillas"
DRIVE_FOLDER_ENTRADA_ID="id-de-entrada"
DRIVE_FOLDER_SIN_CLASIFICAR_ID="id-de-sin-clasificar"
DRIVE_FOLDER_CLIENTES_ID="id-de-clientes"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Generar NEXTAUTH_SECRET

En PowerShell, ejecuta:

```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Maximum 1000000).ToString())) | ForEach-Object { $_ -replace '[^a-zA-Z0-9]','a' }
```

O usa online: https://generate-secret.vercel.app/32

Copia el resultado en `NEXTAUTH_SECRET`

---

## Eso es TODO

✅ Paso 1: Verificar OAuth (5 min)
✅ Paso 2: Crear carpetas Drive (10 min)
✅ Paso 3: Rellenar .env.local (5 min)

**Total: 20 minutos**

---

## Siguiente: Ejecutar la App

Una vez rellenado `.env.local`:

```bash
# 1. Configura BD
npx prisma migrate dev --name init

# 2. Inicia servidor
npm run dev

# 3. Abre http://localhost:3000
# 4. Login con Google
# 5. Aprueba permisos
# 6. ¡Crea tu primer trámite!
```

---

## Formato de IDs de Drive (Ejemplo)

Si tu carpeta está en: 
```
https://drive.google.com/drive/folders/1PxV5QzVq0lK2mN3oP4qR5sTuVwXyZ1a2b3c4d
```

El ID es:
```
1PxV5QzVq0lK2mN3oP4qR5sTuVwXyZ1a2b3c4d
```

Ese es el valor que pones en `.env.local`

---

## Si Tienes Duda

Lee: `docs/SETUP_OAUTH_DRIVE.md` para explicación completa

---

## Checklist Final

Antes de ejecutar:

- [ ] GOOGLE_CLIENT_ID rellenado
- [ ] GOOGLE_CLIENT_SECRET rellenado
- [ ] Todos los DRIVE_FOLDER_* rellenados
- [ ] DATABASE_URL rellenado
- [ ] NEXTAUTH_SECRET rellenado
- [ ] Carpetas creadas en Drive

Si marcaste todo ✅:

```bash
npm run dev
```

¡Listo! 🚀
