# ✅ LISTO PARA EJECUTAR

## Lo que está hecho:

✅ Código actualizado para OAuth 2.0
✅ IDs de carpetas de Drive agregados en `.env.local`:
   - DRIVE_FOLDER_PLANTILLAS_ID = `1LtsqemeD6qK3e3bIJQeYa5qYj9xlLzWF`
   - DRIVE_FOLDER_ENTRADA_ID = `1_04l-6YfTC3Mb5tV3YNJgW2NBMNHfH0P`
   - DRIVE_FOLDER_SIN_CLASIFICAR_ID = `1OVgPY_bZVHnh4hPAKvWmIPlVKzN2ibH7`
   - DRIVE_FOLDER_CLIENTES_ID = `11E3He-GnVDccEDdIIowuh0ol31VcSUqz`

## Lo que FALTA (2 variables en `.env.local`):

1. **GOOGLE_CLIENT_ID** - De Google Cloud Console
   ```env
   GOOGLE_CLIENT_ID="tu-id.apps.googleusercontent.com"
   ```

2. **GOOGLE_CLIENT_SECRET** - De Google Cloud Console
   ```env
   GOOGLE_CLIENT_SECRET="tu-secret"
   ```

## Dónde obtener Google Client ID y Secret:

1. Abre: https://console.cloud.google.com/iam-admin/settings/account
2. Ve a: **IAM y administración** → **Credenciales**
3. Busca: Tu aplicación OAuth (tipo "Aplicación web")
4. Copia:
   - **Client ID** → En `GOOGLE_CLIENT_ID`
   - **Client Secret** → En `GOOGLE_CLIENT_SECRET`

## Una vez rellenes esos 2 campos:

```bash
# En PowerShell, en la carpeta del proyecto
npx prisma migrate dev --name init

npm run dev
```

¡La app funciona! 🚀

## Verificación Rápida:

- [ ] `.env.local` tiene GOOGLE_CLIENT_ID
- [ ] `.env.local` tiene GOOGLE_CLIENT_SECRET
- [ ] Los 4 DRIVE_FOLDER_* están rellenos (✅ ya están)
- [ ] DATABASE_URL está configurado (ya está)

Si marcaste todo ✅, ejecuta:

```bash
npm run dev
```

Abre: http://localhost:3000

¡Listo! 🎉
