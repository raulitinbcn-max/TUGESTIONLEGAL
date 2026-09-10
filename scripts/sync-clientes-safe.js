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
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  return google.drive({ version: 'v3', auth });
}

async function syncClientesDesdeManual() {
  console.log('🔄 SINCRONIZACIÓN MANUAL DE CLIENTES (SEGURA)\n');
  console.log('Esta función sincroniza SOLO clientes y trámites desde Drive.\n');

  try {
    const drive = await getDriveClient();
    const clientesFolderId = process.env.DRIVE_FOLDER_CLIENTES_ID;

    if (!clientesFolderId) {
      throw new Error('DRIVE_FOLDER_CLIENTES_ID no configurado');
    }

    console.log('📁 Listando carpetas de clientes...\n');

    const response = await drive.files.list({
      q: `'${clientesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      spaces: 'drive',
      fields: 'files(id, name)',
      pageSize: 100,
      supportsAllDrives: true,
    });

    const carpetas = response.data.files || [];
    console.log(`✅ Encontradas ${carpetas.length} carpetas\n`);

    let clientesCreados = 0;
    let tramitesCreados = 0;

    for (const carpeta of carpetas) {
      console.log(`📂 Procesando: ${carpeta.name}`);

      const match = carpeta.name?.match(/TR-(\d+)\s*-?\s*(.+)/i);
      if (!match) {
        console.log(`   ⚠️  No se pudo parsear nombre\n`);
        continue;
      }

      const [, codigo, nombreCliente] = match;
      const codigoTramite = `TR-${codigo.padStart(5, '0')}`;
      const clienteTrim = nombreCliente.trim();

      // Buscar cliente existente
      let cliente = await db.cliente.findFirst({
        where: { nombreCompleto: { contains: clienteTrim } },
      });

      if (!cliente) {
        cliente = await db.cliente.create({
          data: {
            nombreCompleto: clienteTrim,
            email: 'contacto@example.com',
            nacionalidad: 'España',
            telefono: '000000000',
          },
        });
        clientesCreados++;
        console.log(`   ✅ Cliente creado: ${clienteTrim}`);
      } else {
        console.log(`   ℹ️  Cliente ya existe: ${clienteTrim}`);
      }

      // Crear trámite
      const tramiteExiste = await db.tramite.findFirst({
        where: {
          codigo: codigoTramite,
          clienteId: cliente.id,
        },
      });

      if (!tramiteExiste) {
        // Determinar tipo de trámite del nombre de la carpeta
        let tipoTramite = 'Trámite General';
        if (nombreCliente.toLowerCase().includes('arraigo')) {
          tipoTramite = 'Arraigo Sociolaboral';
        } else if (nombreCliente.toLowerCase().includes('nacionalidad')) {
          tipoTramite = 'Nacionalidad por residencia';
        } else if (nombreCliente.toLowerCase().includes('nombre')) {
          tipoTramite = 'Cambio de nombre';
        }

        await db.tramite.create({
          data: {
            codigo: codigoTramite,
            clienteId: cliente.id,
            tipoTramite,
            estado: 'en_proceso',
            honorarios: 0,
            driveFolderId: carpeta.id,
            descripcion: `Sincronizado desde Drive: ${carpeta.name}`,
          },
        });
        tramitesCreados++;
        console.log(`   ✅ Trámite creado: ${codigoTramite} (${tipoTramite})`);
      } else {
        console.log(`   ℹ️  Trámite ya existe: ${codigoTramite}`);
      }

      console.log('');
    }

    console.log(`✨ Sincronización completada:`);
    console.log(`   ✅ ${clientesCreados} clientes creados`);
    console.log(`   ✅ ${tramitesCreados} trámites creados\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n📋 Soluciones:\n');
    console.error('1. Verificar que DRIVE_FOLDER_CLIENTES_ID esté en .env.local');
    console.error('2. Configurar credenciales de servicio en GOOGLE_APPLICATION_CREDENTIALS\n');
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

syncClientesDesdeManual();
