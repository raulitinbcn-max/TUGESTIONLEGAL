const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const db = new PrismaClient();

// Leer .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      let value = valueParts.join('=').trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key.trim()] = value;
    }
  }
}

async function getDriveClient() {
  // Crear cliente OAuth con scope de drive
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/auth/callback/google'
  );

  // Usar refresh token si existe, sino generar código de autorización
  // Para este script, usaremos las credenciales directas

  // Alternativamente, si tienes cuenta de servicio, úsala
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    return google.drive({ version: 'v3', auth });
  } catch (e) {
    console.error('No se pudo usar credenciales de servicio');
    throw e;
  }
}

async function syncFromDrive() {
  console.log('🔄 Sincronizando datos desde Google Drive...\n');

  try {
    // Intenta usar Application Default Credentials
    // (requiere GOOGLE_APPLICATION_CREDENTIALS configurado)
    let drive;

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
      drive = google.drive({ version: 'v3', auth });
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      // Parse la clave privada desde JSON
      const keyJson = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
      const auth = new google.auth.GoogleAuth({
        credentials: keyJson,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
      drive = google.drive({ version: 'v3', auth });
    } else {
      throw new Error(
        'No hay credenciales configuradas.\n\n' +
        'Configurar una de estas opciones:\n' +
        '1. GOOGLE_APPLICATION_CREDENTIALS=ruta/a/service-account.json\n' +
        '2. GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY={"type":"service_account",...}'
      );
    }

    const clientesFolderId = process.env.DRIVE_FOLDER_CLIENTES_ID;
    if (!clientesFolderId) {
      throw new Error('DRIVE_FOLDER_CLIENTES_ID no configurado');
    }

    console.log('📁 Listando carpetas de clientes en Drive...\n');

    // Listar carpetas
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

      // Parsear: "TR-00001 - NombreCliente"
      const match = carpeta.name?.match(/TR-(\d+)\s*-?\s*(.+)/i);
      if (!match) {
        console.log(`   ⚠️  No se pudo parsear nombre\n`);
        continue;
      }

      const [, codigo, nombreCliente] = match;
      const codigoTramite = `TR-${codigo.padStart(5, '0')}`;

      // Buscar o crear cliente
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

      // Listar subcarpetas de documentos
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

      // Crear trámites
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
    console.log(`   ✅ ${clientesCreados} clientes creados`);
    console.log(`   ✅ ${tramitesCreados} trámites creados\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n📋 Soluciones:\n');
    console.error('1. Descargar JSON de credenciales de servicio desde:');
    console.error('   Google Cloud Console → APIs y servicios → Credenciales');
    console.error('');
    console.error('2. Guardar como: config/service-account.json\n');
    console.error('3. Configurar en .env.local:');
    console.error('   GOOGLE_APPLICATION_CREDENTIALS=config/service-account.json\n');
    console.error('4. Ejecutar de nuevo: npm run sync-direct\n');
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

syncFromDrive();
