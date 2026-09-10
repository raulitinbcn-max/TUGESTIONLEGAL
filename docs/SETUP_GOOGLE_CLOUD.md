# Setup de Google Cloud - TuGestiónLegal

Esta guía paso a paso te ayudará a configurar todas las APIs y credenciales necesarias en Google Cloud.

## 1. Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. En la parte superior, haz clic en "Seleccionar un proyecto" → "Nuevo proyecto"
3. Nombre: `TuGestiónLegal` (o el que prefieras)
4. Haz clic en "Crear"

## 2. Habilitar APIs Necesarias

1. En la consola, ve a "APIs y servicios" → "Biblioteca"
2. Busca e habilita:
   - **Google Drive API**
   - **Google Docs API**
   - **Google Sheets API** (opcional, para futuras funcionalidades)

## 3. Crear Cuenta de Servicio

1. Ve a "APIs y servicios" → "Credenciales"
2. Haz clic en "Crear credenciales" → "Cuenta de servicio"
3. Rellena:
   - **Nombre de la cuenta de servicio**: `tugestionlegal-service`
   - **ID de la cuenta de servicio**: Se genera automáticamente
   - **Descripción**: `Cuenta de servicio para integración con Drive y Docs`
4. Haz clic en "Crear y continuar"
5. En la siguiente pantalla, haz clic en "Continuar" sin rellenar nada más

## 4. Generar Clave JSON

1. En "Credenciales", busca la cuenta de servicio que acabas de crear
2. Haz clic en su email
3. Ve a la pestaña "Claves"
4. Haz clic en "Agregar clave" → "Crear clave nueva"
5. Selecciona "JSON" y haz clic en "Crear"
6. Se descargará un archivo JSON. **Guárdalo en un lugar seguro**

El archivo contendrá algo así:
```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "tugestionlegal-service@...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

## 5. Crear OAuth 2.0 para Login de Usuarios

1. Ve a "APIs y servicios" → "Credenciales"
2. Haz clic en "Crear credenciales" → "ID de cliente de OAuth"
3. Selecciona "Aplicación web"
4. Rellena:
   - **Nombre**: `TuGestiónLegal Web App`
   - **URIs autorizados de JavaScript origen**: 
     - `http://localhost:3000` (desarrollo)
     - `https://tugestorian.com` (producción)
   - **URIs autorizados de redireccionamiento**:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://tugestorian.com/api/auth/callback/google`
5. Haz clic en "Crear"
6. Se mostrará tu Client ID y Client Secret. Cópia ambos

## 6. Crear Unidad Compartida (Shared Drive)

1. Ve a [Google Drive](https://drive.google.com)
2. En la barra lateral izquierda, haz clic en "Unidades compartidas"
3. Haz clic en "Crear unidad compartida"
4. Nombre: `Gestoria` (o el nombre de tu gestoría)
5. Haz clic en "Crear"

## 7. Configurar Permisos de la Cuenta de Servicio

1. Abre la Unidad Compartida que acabas de crear
2. Haz clic en "Añadir miembros"
3. Pega el `client_email` de la cuenta de servicio (ej: `tugestionlegal-service@...`)
4. Asigna el rol de **Editor**
5. Haz clic en "Añadir"

## 8. Crear Estructura de Carpetas en Drive

Dentro de la Unidad Compartida, crea esta estructura:

```
Gestoria/
├── Plantillas/
│   ├── checklist_residencia.gdoc
│   ├── checklist_trabajo.gdoc
│   ├── contrato_servicios.gdoc
│   └── ...
├── Entrada/
│   └── Sin clasificar/
└── Clientes/
    └── (aquí se crearán carpetas dinámicamente)
```

## 9. Copiar IDs de Carpetas

Para cada carpeta, copia su ID de la URL:
- URL: `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`
- ID: `1a2b3c4d5e6f7g8h9i0j`

Necesitas:
- `GOOGLE_SHARED_DRIVE_ID` - ID de la Unidad Compartida
- `DRIVE_FOLDER_PLANTILLAS_ID` - ID de /Plantillas
- `DRIVE_FOLDER_ENTRADA_ID` - ID de /Entrada
- `DRIVE_FOLDER_SIN_CLASIFICAR_ID` - ID de /Entrada/Sin clasificar
- `DRIVE_FOLDER_CLIENTES_ID` - ID de /Clientes

## 10. Configurar Variables de Entorno

En tu archivo `.env.local`:

```env
# Google Service Account (desde JSON)
GOOGLE_SERVICE_ACCOUNT_EMAIL="tugestionlegal-service@proyecto.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"

# Google OAuth
GOOGLE_CLIENT_ID="123456789.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxx"

# Google Drive
GOOGLE_SHARED_DRIVE_ID="1a2b3c4d5e6f7g8h9i0j"
DRIVE_FOLDER_ENTRADA_ID="1k9i8h7g6f5e4d3c2b1a"
DRIVE_FOLDER_PLANTILLAS_ID="1j0i9h8g7f6e5d4c3b2a"
DRIVE_FOLDER_CLIENTES_ID="1a1b2c3d4e5f6g7h8i9j"
DRIVE_FOLDER_SIN_CLASIFICAR_ID="1z0y9x8w7v6u5t4s3r2q"
```

⚠️ **IMPORTANTE**: 
- La clave privada debe tener saltos de línea reales (`\n`), no literales
- No compartas nunca estas credenciales en Git
- El archivo `private_key` del JSON ya tiene el formato correcto

## 11. Crear Plantillas en Google Docs

En la carpeta `/Plantillas`, crea 3 documentos Google Docs:

### checklist_residencia.gdoc
```
CHECKLIST - TRÁMITE DE RESIDENCIA

Cliente: {{nombre_cliente}}
Código: {{codigo_tramite}}
Tipo: {{tipo_tramite}}

DOCUMENTACIÓN REQUERIDA:
☐ Pasaporte original o fotocopia
☐ Certificado de antecedentes penales
☐ Seguro médico privado
☐ Justificante de medios económicos
☐ Prueba de alojamiento
☐ Solicitud cumplimentada

Honorarios: {{honorarios}} EUR
Forma de pago: {{forma_pago}}
```

### contrato_servicios.gdoc
```
CONTRATO DE PRESTACIÓN DE SERVICIOS

PARTES:
- GESTORÍA: TuGestiónLegal
- CLIENTE: {{nombre_cliente}}

SERVICIOS A PRESTAR:
Realización de trámite de {{tipo_tramite}} según normativa vigente.

HONORARIOS:
Cantidad: {{honorarios}} EUR
Forma de pago: {{forma_pago}}

DATOS DEL CLIENTE:
Email: {{email}}
Teléfono: {{telefono}}
Nacionalidad: {{nacionalidad}}
Pasaporte: {{pasaporte}}
Dirección: {{direccion}}

Fecha: {{fecha}}
```

### contrato_residencia.gdoc, contrato_trabajo.gdoc, etc.
Crea plantillas específicas por tipo de trámite si lo necesitas.

## 12. Prueba de Conexión

Ejecuta este script para verificar que todo funciona:

```bash
npm run dev
# Visita http://localhost:3000/login
# Inicia sesión con tu cuenta de Google
# Ve a "Nuevo Trámite" y crea un cliente
# Verifica que se creó una carpeta en Drive
```

## Troubleshooting

### Error: "The user does not have sufficient permissions for this file."
- Verifica que la cuenta de servicio es Editor en la Unidad Compartida
- Intenta compartir la carpeta específica también

### Error: "Service account credentials not configured"
- Revisa que `GOOGLE_SERVICE_ACCOUNT_EMAIL` y `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` están en `.env.local`
- Comprueba que la clave privada tiene `\n` reales (no literales)

### El login con Google no funciona
- Verifica `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
- Asegúrate de que `http://localhost:3000/api/auth/callback/google` está en los URIs autorizados

### No se crea la carpeta en Drive
- Verifica `DRIVE_FOLDER_CLIENTES_ID` es un ID válido
- Comprueba que la carpeta existe en la Unidad Compartida
- Intenta dar permisos a toda la Shared Drive, no solo carpetas específicas

## Seguridad

- 🔒 **No compartas nunca** `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- 🔒 Usa variables de entorno, nunca hardcodes
- 🔒 Rota las claves de servicio periódicamente
- 🔒 Auditea quién tiene acceso a la Shared Drive
- 🔒 En producción, habilita HTTPS y verifica dominios

## Próximos Pasos

1. Copia los IDs de las carpetas en `.env.local`
2. Ejecuta `npm run dev` e inicia sesión
3. Crea un trámite de prueba
4. Verifica que aparece la carpeta en Drive
5. Prueba la generación de documentos
