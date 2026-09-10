# 🚀 TuGestiónLegal - Deploy a Vercel

## 📦 Estado del Proyecto

✅ **Build exitoso** - Compila sin errores
✅ **Web interface funciona** - http://localhost:3000/login
✅ **Listo para Vercel** - Toda la configuración está lista
✅ **Backup creado** - `TUGESTIONLEGAL-backup-20260910-131322.tar.gz`

---

## ⚡ Resumen Rápido (3 pasos principales)

### 1. Subir a GitHub
```bash
git remote add origin https://github.com/TU_USUARIO/TUGESTIONLEGAL.git
git branch -M main
git push -u origin main
```

### 2. Conectar Vercel
- Ve a https://vercel.com
- Click "Add New Project"
- Selecciona repositorio `TUGESTIONLEGAL`
- Click "Import"
- (Vercel va a fallar, es normal)

### 3. Configurar variables en Vercel
Settings → Environment Variables → Agregar:
```
DATABASE_URL = postgresql://...
NEXTAUTH_URL = https://tu-proyecto.vercel.app
NEXTAUTH_SECRET = (genera con: openssl rand -base64 32)
GOOGLE_CLIENT_ID = ...
GOOGLE_CLIENT_SECRET = ...
GOOGLE_SERVICE_ACCOUNT_EMAIL = ...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_SHARED_DRIVE_ID = ...
DRIVE_FOLDER_ENTRADA_ID = ...
DRIVE_FOLDER_PLANTILLAS_ID = ...
DRIVE_FOLDER_CLIENTES_ID = ...
```

Luego: Deployments → Redeploy

---

## 📚 Documentación Completa

Abre **`DEPLOY_VERCEL.md`** para la guía paso a paso con:
- Instrucciones detalladas para cada paso
- Dónde obtener cada variable
- Troubleshooting completo
- Verificación de deploy

---

## 🔑 Variables que Necesitas

### De Google Cloud Console
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
```

### De Google Drive
```
GOOGLE_SHARED_DRIVE_ID
DRIVE_FOLDER_ENTRADA_ID
DRIVE_FOLDER_PLANTILLAS_ID
DRIVE_FOLDER_CLIENTES_ID
```

### De PostgreSQL (en línea)
```
DATABASE_URL = postgresql://user:password@host:5432/dbname
```

### Generar (comandos)
```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# NEXTAUTH_URL (depende de tu dominio Vercel)
https://tu-proyecto.vercel.app
```

---

## 📁 Archivos Importantes

- **DEPLOY_VERCEL.md** - Guía completa paso a paso
- **scripts/generate-nextauth-secret.sh** - Genera secret seguro
- **.env.example** - Referencia de variables (ver en repo)
- **.gitignore** - Excluye .env.local automáticamente

---

## 🆘 Si algo no funciona

1. **Revisa logs de Vercel**: Deployments → click deployment → Logs
2. **Verifica variables**: Settings → Environment Variables
3. **Comprueba DATABASE_URL**: Debe estar accesible desde Vercel
4. **Confirma URLs**: NEXTAUTH_URL debe ser exacta

Ver sección "Troubleshooting" en `DEPLOY_VERCEL.md`

---

## ✅ Checklist Final Antes de Deploy

- [ ] Repositorio subido a GitHub
- [ ] Proyecto conectado en Vercel
- [ ] Todas las variables configuradas en Vercel
- [ ] DATABASE_URL apunta a BD en línea (no local)
- [ ] NEXTAUTH_URL es https://tu-proyecto.vercel.app
- [ ] Google OAuth autoriza el URL de Vercel
- [ ] Google Service Account tiene permisos en Drive
- [ ] Migraciones ejecutadas (npx prisma migrate deploy)

---

## 🎉 Después del Deploy

1. Accede a https://tu-proyecto.vercel.app/login
2. Verifica que cargue con estilos (Tailwind)
3. Crea usuario de prueba con Google OAuth
4. Prueba crear un cliente y un trámite

¡Listo! 🚀

