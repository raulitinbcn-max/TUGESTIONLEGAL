const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function autoBackup() {
  try {
    const backupDir = path.join(__dirname, "../backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const today = new Date().toISOString().split("T")[0];
    const backupFile = path.join(backupDir, `config-backup-${today}.json`);

    // Si ya existe un backup de hoy, no hacer otro
    if (fs.existsSync(backupFile)) {
      console.log(`✅ Backup de hoy ya existe: ${today}`);
      await db.$disconnect();
      return;
    }

    console.log("💾 Creando backup automático...");

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

    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    console.log(`✅ Backup automático creado: config-backup-${today}.json`);
    console.log(`   📊 ${backup.categorias.length} categorías`);
    console.log(`   📋 ${backup.tramites.length} trámites`);
    console.log(`   📄 ${backup.tiposDocumento.length} tipos de documento`);
    console.log(`   ✅ ${backup.checkDocumentos.length} check documentos`);
    console.log(`   📑 ${backup.plantillas.length} plantillas`);
    console.log(`   💰 ${backup.tasas.length} tasas\n`);

    // Mantener solo los últimos 10 backups
    const allBackups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith("config-backup-"))
      .sort()
      .reverse();

    if (allBackups.length > 10) {
      console.log(`🗑️  Limpiando backups antiguos...`);
      allBackups.slice(10).forEach(oldBackup => {
        const oldPath = path.join(backupDir, oldBackup);
        fs.unlinkSync(oldPath);
      });
    }

  } catch (error) {
    console.error("⚠️  Error en backup automático:", error.message);
  } finally {
    await db.$disconnect();
  }
}

// Ejecutar inmediatamente
autoBackup();
