# ⚠️ Alternativas de Autenticación - Google Cloud

Si recibiste este error:
```
La creación de claves de la cuenta de servicio está inhabilitada
IDs de las políticas: iam.disableServiceAccountKeyCreation
```

Tienes 3 opciones:

---

## Opción 1: Pedir al Administrador que Inhabilite la Política ⭐ RECOMENDADO

**Ventaja**: Solución de largo plazo, más segura
**Tiempo**: Depende del administrador
**Costo**: Ninguno

**Pasos**:
1. Contacta al administrador de Google Cloud de tu organización
2. Pide que deshabilite la restricción: `iam.disableServiceAccountKeyCreation`
3. Una vez deshabilitado, sigue la guía original en `docs/SETUP_GOOGLE_CLOUD.md`

**Lo que el administrador debe hacer**:
- Ir a: Google Cloud Console → Políticas de la organización
- Buscar: `Disable service account key creation`
- Cambiar a: "No aplicar"
- Guardar

---

## Opción 2: Usar Identidad Federada de Workload (WIP) ⭐ MÁS SEGURO

**Ventaja**: Sin claves locales, más seguro, recomendado por Google
**Tiempo**: 20-30 minutos
**Costo**: Ninguno

### Paso 1: Crear Identidad Federada en Google Cloud

1. Ve a: Google Cloud Console → IAM y administración → Identidades federadas
2. Haz clic en "Crear configuración de acreditación"
3. Selecciona: "Proveedor de identidades OIDC"
4. Rellena:
   - **Nombre**: `local-dev`
   - **Emisor de proveedor OIDC**: `https://oidc.local.dev` (para desarrollo local)
5. Haz clic en "Crear"

### Paso 2: Vincular a Cuenta de Servicio

1. Ve a: IAM y administración → Cuentas de servicio
2. Haz clic en: `tugestionlegal-service`
3. Ve a: Pestaña "Federación de identidades"
4. Haz clic en "Añadir vínculo de federación"
5. Rellena:
   - **Proveedor de atributos**: `https://oidc.local.dev`
   - **Atributo de asunto**: `sub`
   - **Valor de atributo**: `local-dev`
6. Guarda

### Paso 3: Generar Token de Acceso (para desarrollo)

Para desarrollo local, crea un script que genere tokens en tiempo de ejecución:

**Script**: `lib/auth-federated.ts` (crear nuevo archivo)

```typescript
import { GoogleAuth } from 'google-auth-library'

const auth = new GoogleAuth({
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/documents',
  ],
  // Usa credenciales predeterminadas (local)
})

export const getCredentials = async () => {
  const credentials = await auth.getApplicationDefault()
  return credentials.credential
}
```

### Paso 4: Actualizar `.env.local`

```env
# NO necesitas: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

# Usa la autenticación predeterminada de Google Cloud:
GOOGLE_CLOUD_PROJECT=tu-project-id
GCLOUD_AUTH_TYPE=adc  # Application Default Credentials
```

### Paso 5: Configurar gcloud CLI Localmente

```bash
# Instala gcloud CLI (si no está)
# https://cloud.google.com/sdk/docs/install

# Autentica con tu cuenta
gcloud auth application-default login

# Esto genera credenciales locales sin necesidad de claves JSON
```

**Ventaja**: Las credenciales se renuevan automáticamente, no tienes que manejar claves.

---

## Opción 3: Usar OAuth 2.0 en Lugar de Cuenta de Servicio

**Ventaja**: Funciona sin restricciones de claves de servicio
**Tiempo**: 15-20 minutos
**Limitación**: Necesita interacción del usuario

### Pasos:

1. **Usa el mismo OAuth de Google que para login** (ya lo configuraste)

2. **Accede a Drive como usuario (no como servicio)**:

```typescript
// lib/drive-oauth.ts
import { google } from 'googleapis'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'

export async function getDriveClientAsUser() {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('Usuario no autenticado')
  }

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({
    access_token: session.accessToken,
  })

  return google.drive({ version: 'v3', auth: oauth2Client })
}
```

3. **Limitación**: Solo funciona con la carpeta del usuario o carpetas compartidas con él

4. **Para Shared Drive**: El usuario debe ser miembro del Shared Drive

**Ventaja**: No necesitas claves JSON, usa credenciales ya existentes

---

## Opción 4: Usar Cuenta Personal de Google (Desarrollo Local)

**Ventaja**: Rápido, sin restricciones
**Tiempo**: 5 minutos
**Limitación**: Solo para desarrollo, no es escalable

### Pasos:

1. Ve a Google Cloud Console
2. Crea una **cuenta de servicio diferente** solo para desarrollo local
3. Genera la clave JSON para esa cuenta
4. Usa esa clave solo en desarrollo local
5. En producción, usa una de las opciones anteriores

---

## ¿Cuál Elegir?

| Opción | Tiempo | Seguridad | Producción | Recomendado |
|--------|--------|-----------|-----------|------------|
| 1. Pedir a Admin | Depende | ⭐⭐⭐⭐⭐ | ✅ | ⭐ MEJOR |
| 2. Identidad Federada | 20-30 min | ⭐⭐⭐⭐⭐ | ✅ | ⭐ MÁS SEGURO |
| 3. OAuth 2.0 | 15-20 min | ⭐⭐⭐⭐ | ⚠️ Parcial | 🔶 RÁPIDO |
| 4. Cuenta Personal | 5 min | ⭐⭐ | ❌ | SOLO DEV |

---

## Recomendación Final

### Para Desarrollo Inmediato
**Opción 3 (OAuth 2.0)** o **Opción 4 (Cuenta Personal)**
- Empiezas rápido
- Funciona sin restricciones

### Para Producción
**Opción 1 (Pedir Admin)** o **Opción 2 (Identidad Federada)**
- Más seguro
- Sostenible a largo plazo

---

## Opción 1 Detallada - Contactar al Administrador

### Información para el Administrador

Dile al administrador:

> "Necesito crear una clave JSON para una cuenta de servicio de Google Cloud que usará mi aplicación Next.js para acceder a Google Drive y Google Docs API.
> 
> La política de organización `iam.disableServiceAccountKeyCreation` está bloqueando la creación.
> 
> Por favor, deshabilita esta restricción solo para la cuenta de servicio `tugestionlegal-service` en el proyecto `[nombre del proyecto]`."

### Pasos del Administrador

1. Google Cloud Console → Políticas de la organización
2. Buscar: "Disable service account key creation"
3. Hacer clic en la política
4. Cambiar restricción a: "No aplicar"
5. O crear excepción para tu cuenta de servicio
6. Guardar cambios

Una vez hecho esto, podrás seguir la guía original.

---

## Opción 2 Detallada - Identidad Federada

### Ventajas
- ✅ Sin claves JSON almacenadas
- ✅ Credenciales se renuevan automáticamente
- ✅ Más seguro para producción
- ✅ Recomendado por Google

### Desventaja
- ⚠️ Setup más complejo

### Recursos Útiles
- [Documentación oficial](https://cloud.google.com/docs/authentication/federation)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation-portal)

---

## Opción 3 Detallada - OAuth 2.0

### Implementación Básica

```typescript
// En lib/drive-oauth.ts

import { google } from 'googleapis'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'

export async function createFolderAsUser(folderName: string, parentFolderId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('Usuario no autenticado')
  }

  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({
    access_token: session.accessToken,
  })

  const drive = google.drive({ version: 'v3', auth: oauth2Client })

  const response = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  })

  return response.data.id
}
```

### Limitación Importante

Solo funciona si el usuario está en el Shared Drive. Alternativa:

1. Usa una carpeta personal del usuario dentro de Drive
2. O comparte el Shared Drive con el usuario

---

## Pasos Inmediatos Recomendados

### Si Tienes Acceso al Admin
1. Contacta al administrador
2. Pide deshabilitar: `iam.disableServiceAccountKeyCreation`
3. Sigue guía original

### Si NO Tienes Acceso
1. Implementa Opción 3 (OAuth 2.0)
   - Modifica `lib/drive.ts` para usar session token
   - Cambia a carpeta personal del usuario
   - Más simple de implementar

2. O Opción 2 (Identidad Federada)
   - Más seguro
   - Setup único

---

## Actualización Necesaria en el Código

Dependiendo de la opción que elijas, actualizaré el código:

- **Opción 1**: Sin cambios necesarios (usa archivo JSON como está)
- **Opción 2**: Cambio en `lib/auth.ts` y `lib/drive.ts`
- **Opción 3**: Cambio en `lib/drive.ts` para usar session token
- **Opción 4**: Cambio mínimo, similar a Opción 1

¿Cuál prefieres implementar?

---

## Próximos Pasos

1. **Decide qué opción usar**
2. **Avísame cuál es**
3. **Actualizaré el código** para que funcione con esa opción
4. **Continuaremos con el setup**

Mientras tanto, puedes trabajar en el desarrollo del código frontend sin necesidad de credenciales de Google.
