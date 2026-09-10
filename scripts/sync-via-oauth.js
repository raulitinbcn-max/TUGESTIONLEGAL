const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

// Leer .env.local manualmente
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      let value = valueParts.join('=').trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key.trim()] = value;
    }
  }
}

const db = new PrismaClient();

// Configurar OAuth con las credenciales de Google
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/callback/google'
);

async function syncFromDrive() {
  console.log('🔄 Sincronizando datos desde Google Drive...\n');

  try {
    // Para usar OAuth desde script, necesitamos credenciales de servicio
    // Si no las tienes, el endpoint /api/admin/sync-from-drive es la mejor opción
    const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    let auth;

    if (keyFile && fs.existsSync(keyFile)) {
      // Usar archivo de credenciales
      auth = new google.auth.GoogleAuth({
        keyFile,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });
    } else if (serviceAccountKey) {
      // Usar clave privada desde variable de entorno
      const keyJson = JSON.parse(
        Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
      );
      auth = new google.auth.GoogleAuth({
        credentials: keyJson,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });
    } else {
      throw new Error(
        'No se encontraron credenciales de cuenta de servicio.\n\n' +
        'Para sincronizar desde Drive, necesitas una de estas opciones:\n\n' +
        '1. RECOMENDADO: Usar el endpoint vía web\n' +
        '   - Abre http://localhost:3000\n' +
        '   - Inicia sesión con Google\n' +
        '   - Ejecuta: npm run sync-api\n\n' +
        '2. ALTERNATIVA: Configurar cuenta de servicio\n' +
        '   - Descarga JSON de credenciales en Google Cloud Console\n' +
        '   - Guarda en: config/service-account.json\n' +
        '   - Configura: GOOGLE_SERVICE_ACCOUNT_KEY_FILE=config/service-account.json\n\n' +
        '3. O configura la clave privada en base64:\n' +
        '   - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=<base64-encoded-json>'
      );
    }

    const drive = google.drive({ version: 'v3', auth });
    const clientesFolderId = process.env.DRIVE_FOLDER_CLIENTES_ID;

    if (!clientesFolderId) {
      throw new Error('DRIVE_FOLDER_CLIENTES_ID no configurado');
    }

    console.log('📁 Buscando carpetas de clientes en Drive...\n');

    // Listar carpetas de clientes
    const response = await drive.files.list({
      q: `'${clientesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      spaces: 'drive',
      fields: 'files(id, name, createdTime)',
      pageSize: 100,
      supportsAllDrives: true,
    });

    const carpetas = response.data.files || [];
    console.log(`✅ Encontradas ${carpetas.length} carpetas\n`);

    let clientesCreados = 0;
    let tramitesCreados = 0;

    for (const carpeta of carpetas) {
      console.log(`📂 ${carpeta.name}`);

      const match = carpeta.name?.match(/TR-(\d+)\s*-?\s*(.+)/i);
      if (!match) {
        console.log(`   ⚠️  No se pudo parsear nombre\n`);
        continue;
      }

      const [, codigo, nombreCliente] = match;
      const codigoTramite = `TR-${codigo.padStart(5, '0')}`;

      // Buscar cliente existente
      let cliente = await db.cliente.findFirst({
        where: {
          nombreCompleto: {
            contains: nombreCliente.trim(),
            mode: 'insensitive',
          },
        },
      });

      if (!cliente) {
        cliente = await db.cliente.create({
          data: {
            nombreCompleto: nombreCliente.trim(),
            email: 'contacto@example.com',
            numeroDocumento: `SYNC-${codigoTramite}`,
            tipoDocumento: 'DNI',
            nacionalidad: 'España',
            direccion: 'Sincronizado desde Drive',
            telefonoContacto: '000000000',
          },
        });
        clientesCreados++;
        console.log(`   ✅ Cliente creado`);
      } else {
        console.log(`   ℹ️  Cliente ya existe`);
      }

      // Listar subcarpetas
      const subResponse = await drive.files.list({
        q: `'${carpeta.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        spaces: 'drive',
        fields: 'files(id, name)',
        pageSize: 50,
        supportsAllDrives: true,
      });

      const subCarpetas = subResponse.data.files || [];
      const tiposEncontrados = new Set();

      for (const sub of subCarpetas) {
        const tipoMatch = sub.name?.match(/([A-Za-z\s]+?)(?:\s*-|$)/);
        const tipoTramite = tipoMatch ? tipoMatch[1].trim() : 'Genérico';
        tiposEncontrados.add(tipoTramite);
      }

      for (const tipoTramite of tiposEncontrados) {
        const tramiteExiste = await db.tramite.findFirst({
          where: {
            codigo: codigoTramite,
            clienteId: cliente.id,
            tipoTramite,
          },
        });

        if (!tramiteExiste) {
          await db.tramite.create({
            data: {
              codigo: codigoTramite,
              clienteId: cliente.id,
              tipoTramite,
              estado: 'en_proceso',
              honorarios: 0,
              carpetaDriveId: carpeta.id,
              descripcion: `Sincronizado desde Drive: ${carpeta.name}`,
            },
          });
          tramitesCreados++;
        }
      }

      console.log('');
    }

    console.log(`✨ Sincronización completada:`);
    console.log(`   - ${clientesCreados} clientes creados`);
    console.log(`   - ${tramitesCreados} trámites creados\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

syncFromDrive();
