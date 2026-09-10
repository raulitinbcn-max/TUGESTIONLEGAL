const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const db = new PrismaClient();

async function getServiceAccountAuth() {
  // Usar credenciales de cuenta de servicio si están disponibles
  // De lo contrario, usar credenciales de OAuth del usuario autenticado
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;

  if (keyFile && fs.existsSync(keyFile)) {
    const key = JSON.parse(fs.readFileSync(keyFile));
    return new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
  }

  throw new Error('No service account credentials found');
}

async function uploadBackupToDrive() {
  console.log('☁️ Ejecutando backup diario a Google Drive...\n');

  try {
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
      documentosGenerados: await db.documentoGenerado.findMany(),
    };

    const backupJson = JSON.stringify(backup, null, 2);
    const today = new Date().toISOString().split('T')[0];
    const backupFileName = `config-backup-${today}.json`;

    // Guardar localmente primero
    const backupDir = path.join(__dirname, '../backups');
    const backupPath = path.join(backupDir, backupFileName);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.writeFileSync(backupPath, backupJson);
    console.log(`✅ Backup local creado: ${backupFileName}`);

    // Subir a Google Drive
    const driveFolderId = process.env.DRIVE_FOLDER_BACKUPS_ID;
    if (!driveFolderId) {
      console.warn('⚠️  DRIVE_FOLDER_BACKUPS_ID no configurado - omitiendo upload a Drive');
      console.log(`📊 Contenido del backup:`);
      console.log(`   - ${backup.categorias.length} categorías`);
      console.log(`   - ${backup.tramites.length} trámites`);
      console.log(`   - ${backup.tiposDocumento.length} tipos de documento`);
      console.log(`   - ${backup.checkDocumentos.length} check documentos`);
      console.log(`   - ${backup.plantillas.length} plantillas`);
      console.log(`   - ${backup.tasas.length} tasas`);
      console.log(`\n✅ Backup completado (local únicamente)\n`);
      return;
    }

    try {
      // Intentar subir a Drive usando la API
      const auth = await getServiceAccountAuth();
      const drive = google.drive({ version: 'v3', auth });

      // Primero, verificar si ya existe un backup de hoy
      const query = `'${driveFolderId}' in parents and name = '${backupFileName}' and trashed = false`;
      const existingFiles = await drive.files.list({
        q: query,
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
        console.log(`🔄 Backup actualizado en Drive: ${backupFileName}`);
      } else {
        // Crear archivo nuevo
        const response = await drive.files.create({
          requestBody: {
            name: backupFileName,
            parents: [driveFolderId],
            mimeType: 'application/json',
            description: `Backup automático de configuración - ${new Date().toLocaleString('es-ES')}`,
          },
          media: {
            mimeType: 'application/json',
            body: backupJson,
          },
          supportsAllDrives: true,
          fields: 'id, webViewLink',
        });
        fileId = response.data.id;
        console.log(`☁️  Backup subido a Drive: ${backupFileName}`);
        console.log(`   Link: ${response.data.webViewLink}`);
      }

      console.log(`📊 Contenido del backup:`);
      console.log(`   - ${backup.categorias.length} categorías`);
      console.log(`   - ${backup.tramites.length} trámites`);
      console.log(`   - ${backup.tiposDocumento.length} tipos de documento`);
      console.log(`   - ${backup.checkDocumentos.length} check documentos`);
      console.log(`   - ${backup.plantillas.length} plantillas`);
      console.log(`   - ${backup.tasas.length} tasas`);
      console.log(`\n✅ Backup completado (local + Drive)\n`);

    } catch (driveError) {
      console.warn('⚠️  Error subiendo a Drive:', driveError.message);
      console.log(`📊 Backup guardado localmente: ${backupFileName}`);
      console.log(`📊 Contenido del backup:`);
      console.log(`   - ${backup.categorias.length} categorías`);
      console.log(`   - ${backup.tramites.length} trámites`);
      console.log(`   - ${backup.tiposDocumento.length} tipos de documento`);
      console.log(`   - ${backup.checkDocumentos.length} check documentos`);
      console.log(`   - ${backup.plantillas.length} plantillas`);
      console.log(`   - ${backup.tasas.length} tasas`);
      console.log(`\n✅ Backup completado (local únicamente)\n`);
    }

  } catch (error) {
    console.error('❌ Error en backup:', error.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Ejecutar inmediatamente si es llamado directamente
if (require.main === module) {
  uploadBackupToDrive().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = uploadBackupToDrive;
