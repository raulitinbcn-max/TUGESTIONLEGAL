const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const db = new PrismaClient();

async function backup() {
  console.log("💾 CREANDO BACKUP DE CONFIGURACIÓN...\n");

  try {
    const backupDir = path.join(__dirname, "../backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
    const backupFile = path.join(backupDir, `config-backup-${timestamp}.json`);

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

    console.log(`✅ Backup creado: ${backupFile}`);
    console.log(`   - ${backup.categorias.length} categorías`);
    console.log(`   - ${backup.tramites.length} tipos de trámite`);
    console.log(`   - ${backup.tiposDocumento.length} tipos de documento`);
    console.log(`   - ${backup.checkDocumentos.length} check documentos`);
    console.log(`   - ${backup.plantillas.length} plantillas`);
    console.log(`   - ${backup.tasas.length} configuraciones de tasas`);
    console.log(`   - ${backup.documentosGenerados.length} documentos generados`);

    // Mantener solo los últimos 10 backups
    const allBackups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith("config-backup-"))
      .sort()
      .reverse();

    if (allBackups.length > 10) {
      console.log(`\n📦 Limpiando backups antiguos...`);
      allBackups.slice(10).forEach(oldBackup => {
        const oldPath = path.join(backupDir, oldBackup);
        fs.unlinkSync(oldPath);
        console.log(`   Eliminado: ${oldBackup}`);
      });
    }

  } catch (error) {
    console.error("❌ Error en backup:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

backup();
