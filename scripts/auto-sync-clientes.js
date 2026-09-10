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
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.log('⚠️  No se pudo inicializar Google Drive (sin credenciales de servicio)');
    return null;
  }
}

async function autoSyncClientes() {
  try {
    // Verificar si ya hay clientes
    const clientCount = await db.cliente.count();

    if (clientCount > 0) {
      console.log(`✅ Clientes ya existen (${clientCount} encontrados)\n`);
      return;
    }

    console.log('🔄 No hay clientes en la BD. Sincronizando desde Drive...\n');

    const drive = await getDriveClient();
    if (!drive) {
      console.log('⚠️  Sincronización automática no disponible (falta Google Drive)\n');
      return;
    }

    const clientesFolderId = process.env.DRIVE_FOLDER_CLIENTES_ID;
    if (!clientesFolderId) {
      console.log('⚠️  DRIVE_FOLDER_CLIENTES_ID no configurado\n');
      return;
    }

    // Listar carpetas de clientes
    const response = await drive.files.list({
      q: `'${clientesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      spaces: 'drive',
      fields: 'files(id, name)',
      pageSize: 100,
      supportsAllDrives: true,
    });

    const carpetas = response.data.files || [];
    if (carpetas.length === 0) {
      console.log('⚠️  No hay carpetas de clientes en Drive\n');
      return;
    }

    console.log(`📁 Encontradas ${carpetas.length} carpetas de clientes\n`);

    let clientesCreados = 0;
    let tramitesCreados = 0;

    for (const carpeta of carpetas) {
      if (!carpeta.name) continue;

      const match = carpeta.name.match(/TR-(\d+)\s*-?\s*(.+)/i);
      if (!match) continue;

      const [, codigo, nombreCliente] = match;
      const codigoTramite = `TR-${codigo.padStart(5, '0')}`;
      const clienteTrim = nombreCliente.trim();

      // Crear cliente
      const cliente = await db.cliente.create({
        data: {
          nombreCompleto: clienteTrim,
          email: 'contacto@example.com',
          nacionalidad: 'España',
          telefono: '000000000',
        },
      });
      clientesCreados++;
      console.log(`✅ ${clienteTrim}`);

      // Crear trámite
      let tipoTramite = 'Trámite General';
      if (clienteTrim.toLowerCase().includes('arraigo')) {
        tipoTramite = 'Arraigo Sociolaboral';
      } else if (clienteTrim.toLowerCase().includes('nacionalidad')) {
        tipoTramite = 'Nacionalidad por residencia';
      } else if (clienteTrim.toLowerCase().includes('nombre')) {
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
          notas: `Sincronizado desde Drive: ${carpeta.name}`,
        },
      });
      tramitesCreados++;
    }

    if (clientesCreados > 0) {
      console.log(`\n✨ Sincronización automática completada`);
      console.log(`   - ${clientesCreados} clientes creados`);
      console.log(`   - ${tramitesCreados} trámites creados\n`);
    }

    // Nota: El backup a Drive se hace automáticamente cuando el usuario inicia sesión
    // usando la ruta POST /api/admin/backup-oauth con sus credenciales OAuth

  } catch (error) {
    console.error('❌ Error en sincronización automática:', error.message);
  } finally {
    await db.$disconnect();
  }
}

autoSyncClientes();
