# 🚀 Deployment - TuGestiónLegal

Guía para desplegar TuGestiónLegal en producción.

## Opciones de Hosting

### Opción 1: Vercel (Recomendado para Next.js)

Vercel es la opción más sencilla para desplegar Next.js.

#### Pasos:
1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) y conecta tu repositorio
3. Vercel detectará automáticamente que es Next.js
4. Configura las variables de entorno en Vercel
5. Deploy automático en cada push a `main`

**Ventajas**:
- Setup automático
- Builds y deploys rápidos
- Serverless functions
- CDN global
- Gratis hasta cierto límite

**Coste**: ~$20-100/mes para uso moderado

### Opción 2: Railway

Railway es una plataforma moderna de hosting PaaS.

#### Pasos:
1. Sube el proyecto a GitHub
2. Ve a [railway.app](https://railway.app) y conecta tu repositorio
3. Crea un nuevo proyecto
4. Añade PostgreSQL como servicio
5. Configura variables de entorno
6. Deploy

**Ventajas**:
- PostgreSQL incluido
- Interfaz amigable
- Pricing por uso
- Deploys automáticos

**Coste**: ~$15-50/mes

### Opción 3: DigitalOcean App Platform

Plataforma tradicional con más control.

#### Pasos:
1. Crea una app nueva en DigitalOcean
2. Conecta tu repositorio de GitHub
3. Configura variables de entorno
4. Crea una BD PostgreSQL por separado
5. Deploy

**Ventajas**:
- Más control
- Droplets para máquinas dedicadas
- Espacios para archivos estáticos
- Reputación establecida

**Coste**: ~$25-100/mes

## Variables de Entorno en Producción

### Vercel/Railway
1. Ve a "Settings" → "Environment Variables"
2. Añade cada variable:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://tugestorian.com
NEXTAUTH_SECRET=(generar nuevo con openssl)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=...
GOOGLE_SHARED_DRIVE_ID=...
DRIVE_FOLDER_ENTRADA_ID=...
DRIVE_FOLDER_PLANTILLAS_ID=...
DRIVE_FOLDER_CLIENTES_ID=...
DRIVE_FOLDER_SIN_CLASIFICAR_ID=...
```

### NEXTAUTH_SECRET
Genera uno nuevo para producción:
```bash
openssl rand -hex 32
```

## Configuración de Dominio

### 1. Compra/Configura tu Dominio
- En tu registrador (Namecheap, etc.)
- Apunta los nameservers a tu proveedor de hosting

### 2. Configura en Vercel
1. En "Domains", añade tu dominio
2. Sigue las instrucciones de DNS
3. Configura redirección de www → dominio principal

### 3. HTTPS Automático
- Vercel configura SSL automáticamente
- Railway también ofrece HTTPS gratis
- DigitalOcean con Let's Encrypt

## Seguridad en Producción

### ✅ Checklist

- [ ] HTTPS habilitado (obligatorio)
- [ ] Dominio corporativo configurado
- [ ] Restricción de email por dominio en `lib/auth.ts`
- [ ] Variables de entorno seguras
- [ ] Base de datos con backup automático
- [ ] Logs configurados
- [ ] Monitoreo de errores (Sentry, etc.)

### Restricción de Dominio

En `lib/auth.ts`:
```typescript
async signIn({ user, account, profile }) {
  // Solo permite emails del dominio corporativo
  if (!user.email?.endsWith('@tugestorian.com')) {
    return false
  }
  return true
}
```

## Base de Datos

### Backup Automático

Para Vercel + Railway:
- Railway hace backups diarios automáticamente
- Mantiene últimos 30 días de backups

Para DigitalOcean:
- Configura backups automáticos en la BD
- Costo: ~$2-5/semana

### Migración

Para cambiar BD en producción:
```bash
# 1. Exporta datos (sin credenciales)
pg_dump URL_PRODUCCION > backup.sql

# 2. Modifica schema si es necesario
npx prisma migrate deploy

# 3. Importa datos nuevos
psql URL_NUEVA < backup.sql
```

## Logs y Monitoring

### Vercel
- Logs automáticos en el dashboard
- Sentry.io para error tracking

### Railway
- Logs integrados en el dashboard
- Exportación a servicios externos

### Setup de Sentry (Recomendado)

```bash
npm install @sentry/nextjs
```

En `next.config.js`:
```javascript
const withSentry = require("@sentry/nextjs/withSentry");

module.exports = withSentry({
  // tu configuración
}, {
  org: "tu-org",
  project: "tugestorian",
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
```

## Performance

### Optimizaciones

1. **Imágenes**: Usa `next/image`
2. **Bundle**: Verifica con `npm run build` y `next/bundle-analyzer`
3. **Base de datos**: Índices en campos frecuentes
4. **Caching**: NextAuth maneja sessiones con JWT

### Métricas Importantes

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

Verifica en [PageSpeed Insights](https://pagespeed.web.dev)

## CI/CD con GitHub Actions

Archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npx prisma migrate deploy
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: npx vercel deploy --prod --token $VERCEL_TOKEN
```

## Rollback

### Si algo sale mal:

**Vercel**:
1. Ve al proyecto en Vercel
2. "Deployments" → elige anterior
3. Haz clic en los 3 puntos → "Promote to Production"

**Railway**:
1. En "Deploys", selecciona el anterior
2. Click en los 3 puntos → "Redeploy"

## Mantenimiento Producción

### Diario
- Revisar logs de errores
- Monitorear performance

### Semanal
- Verificar backups
- Revisar uso de recursos

### Mensual
- Actualizar dependencias seguras
- Revisar seguridad
- Análisis de datos

## Contacto y Soporte

Si necesitas ayuda:
1. Revisa los logs en tu plataforma
2. Consulta la documentación de Next.js
3. Verifica variables de entorno
4. Contacta al proveedor de hosting

---

**Nota**: Esta guía es general. Cada plataforma tiene matices específicos. Consulta su documentación oficial.
