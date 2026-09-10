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
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Error creando cliente de Drive:', error.message);
    throw error;
  }
}

async function autoBackupDrive() {
  try {
    const drive = await getDriveClient();
    const backupsFolderId = process.env.DRIVE_FOLDER_BACKUPS_ID;

    if (!backupsFolderId) {
      console.log('⚠️  DRIVE_FOLDER_BACKUPS_ID no configurado - omitiendo backup a Drive');
      return;
    }

    console.log('☁️  Ejecutando backup automático a Google Drive...\n');

    // Crear backup en memoria
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      categorias: await db.categoriasTramite.findMany(),
      tramites: await db.tramiteConfiguracion.findMany(),
      tiposDocumento: await db.tipoDocumento.findMany(),
      checkDocumentos: await db.checkDocumento.findMany(),
      plantillas: await db.plantilla.findMany(),
      tasas: await db.tasaConfiguracion.findMany(),
      clientes: await db.cliente.findMany({
        include: {
          tramites: {
            include: {
              documentos: true,
              documentosGenerados: true,
              historialEstados: true,
              tasas: true,
              vencimientos: true,
              checklistItems: true,
            },
          },
        },
      }),
    };

    const backupJson = JSON.stringify(backup, null, 2);
    const today = new Date().toISOString().split('T')[0];
    const backupFileName = `sistema-backup-${today}.json`;

    // Verificar si ya existe backup de hoy
    const existingFiles = await drive.files.list({
      q: `'${backupsFolderId}' in parents and name = '${backupFileName}' and trashed = false`,
      spaces: 'drive',
      fields: 'files(id)',
      supportsAllDrives: true,
    });

    let fileId;
    if (existingFiles.data.files && existingFiles.data.files.length > 0) {
      // Actualizar archivo existente
      fileId = existingFiles.data.files[0].id;
      await drive.files.update({
        fileId,
        media: {
          mimeType: 'application/json',
          body: backupJson,
        },
        supportsAllDrives: true,
      });
      console.log(`🔄 Backup de hoy actualizado: ${backupFileName}`);
    } else {
      // Crear archivo nuevo
      const response = await drive.files.create({
        requestBody: {
          name: backupFileName,
          parents: [backupsFolderId],
          mimeType: 'application/json',
          description: `Backup automático del sistema - ${new Date().toLocaleString('es-ES')}`,
        },
        media: {
          mimeType: 'application/json',
          body: backupJson,
        },
        supportsAllDrives: true,
        fields: 'id',
      });
      fileId = response.data.id;
      console.log(`✅ Nuevo backup creado: ${backupFileName}`);
    }

    // Limpiar backups antiguos (mantener últimos 10)
    console.log('\n🧹 Limpiando backups antiguos...');

    const allBackups = await drive.files.list({
      q: `'${backupsFolderId}' in parents and name contains 'sistema-backup-' and trashed = false`,
      spaces: 'drive',
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 100,
      supportsAllDrives: true,
    });

    const backupFiles = allBackups.data.files || [];
    console.log(`   Backups totales en Drive: ${backupFiles.length}`);

    // Eliminar backups más antiguos que los últimos 10
    if (backupFiles.length > 10) {
      const filesToDelete = backupFiles.slice(10);
      console.log(`   Eliminando ${filesToDelete.length} backups antiguos...`);

      for (const file of filesToDelete) {
        await drive.files.delete({
          fileId: file.id,
          supportsAllDrives: true,
        });
        console.log(`   🗑️  Eliminado: ${file.name}`);
      }
    }

    console.log(`\n📊 Contenido del backup:`);
    console.log(`   - ${backup.categorias.length} categorías`);
    console.log(`   - ${backup.tramites.length} trámites configurados`);
    console.log(`   - ${backup.tiposDocumento.length} tipos de documento`);
    console.log(`   - ${backup.checkDocumentos.length} check documentos`);
    console.log(`   - ${backup.plantillas.length} plantillas`);
    console.log(`   - ${backup.tasas.length} tasas`);
    console.log(`   - ${backup.clientes.length} clientes con trámites`);
    console.log(`\n✨ Backup automático completado exitosamente\n`);

  } catch (error) {
    console.error('❌ Error en backup automático:', error.message);
    // No lanzar error - esto es un proceso de background
  } finally {
    await db.$disconnect();
  }
}

autoBackupDrive();
