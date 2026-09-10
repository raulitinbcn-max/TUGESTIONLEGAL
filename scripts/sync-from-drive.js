const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const db = new PrismaClient();

// Usar credenciales de cuenta de servicio si están disponibles
async function getDriveClient() {
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;

  if (keyFile) {
    const fs = require('fs');
    if (fs.existsSync(keyFile)) {
      const key = JSON.parse(fs.readFileSync(keyFile));
      const auth = new google.auth.GoogleAuth({
        keyFile,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
      return google.drive({ version: 'v3', auth });
    }
  }

  throw new Error('No service account credentials found in GOOGLE_SERVICE_ACCOUNT_KEY_FILE');
}

async function syncFromDrive() {
  console.log('🔄 Sincronizando datos desde Google Drive...\n');

  try {
    const drive = await getDriveClient();
    const clientesFolderId = process.env.DRIVE_FOLDER_CLIENTES_ID;

    if (!clientesFolderId) {
      throw new Error('DRIVE_FOLDER_CLIENTES_ID no configurado');
    }

    console.log('📁 Buscando carpetas de clientes en Drive...\n');

    // Listar todas las carpetas en la carpeta de clientes
    const response = await drive.files.list({
      q: `'${clientesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      spaces: 'drive',
      fields: 'files(id, name, createdTime)',
      pageSize: 100,
      supportsAllDrives: true,
    });

    const carpetas = response.data.files || [];
    console.log(`✅ Encontradas ${carpetas.length} carpetas de clientes\n`);

    if (carpetas.length === 0) {
      console.log('⚠️  No hay carpetas de clientes en Drive');
      return;
    }

    let clientesCreados = 0;
    let tramitesCreados = 0;

    // Procesar cada carpeta de cliente
    for (const carpeta of carpetas) {
      console.log(`📂 Procesando carpeta: ${carpeta.name}`);

      // Intentar extraer datos del nombre de la carpeta
      // Formato esperado: "TR-00001 - NombreCliente" o similar
      const match = carpeta.name.match(/TR-(\d+)\s*-?\s*(.+)/i);

      if (!match) {
        console.log(`   ⚠️  No se pudo parsear nombre: ${carpeta.name}`);
        continue;
      }

      const [, codigo, nombreCliente] = match;
      const codigoTramite = `TR-${codigo.padStart(5, '0')}`;

      // Listar subcarpetas (trámites) dentro de la carpeta del cliente
      const subResponse = await drive.files.list({
        q: `'${carpeta.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        spaces: 'drive',
        fields: 'files(id, name)',
        pageSize: 50,
        supportsAllDrives: true,
      });

      const subcarpetas = subResponse.data.files || [];
      console.log(`   ├─ ${subcarpetas.length} subcarpetas encontradas`);

      // Crear o actualizar cliente
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
            numeroDocumento: 'SYNC-' + codigoTramite,
            tipoDocumento: 'DNI',
            nacionalidad: 'España',
            direccion: 'Sincronizado desde Drive',
            telefonoContacto: '000000000',
          },
        });
        clientesCreados++;
        console.log(`   ✅ Cliente creado: ${cliente.nombreCompleto}`);
      } else {
        console.log(`   ℹ️  Cliente ya existe: ${cliente.nombreCompleto}`);
      }

      // Crear trámite por cada subcarpeta
      for (const sub of subcarpetas) {
        const tipoTramite = sub.name.split('-')[0].trim();

        const tramite = await db.tramite.findFirst({
          where: {
            codigo: codigoTramite,
            clienteId: cliente.id,
          },
        });

        if (!tramite) {
          await db.tramite.create({
            data: {
              codigo: codigoTramite,
              clienteId: cliente.id,
              tipoTramite: tipoTramite || 'Genérico',
              estado: 'en_proceso',
              honorarios: 0,
              carpetaDriveId: sub.id,
              descripcion: `Sincronizado desde Drive: ${sub.name}`,
            },
          });
          tramitesCreados++;
          console.log(`   ✅ Trámite creado: ${codigoTramite}`);
        } else {
          console.log(`   ℹ️  Trámite ya existe: ${codigoTramite}`);
        }
      }

      console.log('');
    }

    console.log(`\n✨ Sincronización completada:`);
    console.log(`   - ${clientesCreados} clientes creados`);
    console.log(`   - ${tramitesCreados} trámites creados\n`);

  } catch (error) {
    console.error('❌ Error en sincronización:', error.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

syncFromDrive();
