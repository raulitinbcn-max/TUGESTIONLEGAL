const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function backupToDrive() {
  console.log('☁️ Sincronizando backup a Google Drive...\n');

  try {
    // Crear backup en memoria
    const backup = {
      timestamp: new Date().toISOString(),
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

    console.log(`📊 Backup contenido:`);
    console.log(`   - ${backup.categorias.length} categorías`);
    console.log(`   - ${backup.tramites.length} trámites`);
    console.log(`   - ${backup.tiposDocumento.length} tipos de documento`);
    console.log(`   - ${backup.checkDocumentos.length} check documentos`);
    console.log(`   - ${backup.plantillas.length} plantillas`);
    console.log(`   - ${backup.tasas.length} tasas`);
    console.log(`\n📝 Archivo: ${backupFileName}`);
    console.log(`📦 Tamaño: ${(backupJson.length / 1024).toFixed(2)} KB\n`);

    // Verificar si el backup local también se creó
    const backupDir = path.join(__dirname, '../backups');
    const backupPath = path.join(backupDir, backupFileName);

    if (!fs.existsSync(backupPath)) {
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(backupPath, backupJson);
      console.log(`💾 Backup local guardado: ${backupFileName}`);
    } else {
      console.log(`✅ Backup local ya existe: ${backupFileName}`);
    }

    console.log(`\n⭐ Para subir a Drive, usa:`);
    console.log(`   POST /api/admin/backup-to-drive`);
    console.log(`   (requiere que Google Drive esté configurado)\n`);

  } catch (error) {
    console.error('❌ Error en backup:', error.message);
  } finally {
    await db.$disconnect();
  }
}

backupToDrive();
