const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const db = new PrismaClient();

async function restore() {
  console.log("🔄 RESTAURANDO CONFIGURACIÓN DESDE BACKUP\n");

  try {
    const backupDir = path.join(__dirname, "../backups");

    if (!fs.existsSync(backupDir)) {
      console.error("❌ No se encontró directorio de backups");
      process.exit(1);
    }

    // Listar backups disponibles
    const backups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith("config-backup-"))
      .sort()
      .reverse();

    if (backups.length === 0) {
      console.error("❌ No hay backups disponibles");
      process.exit(1);
    }

    // Usar el más reciente
    const latestBackup = backups[0];
    const backupPath = path.join(backupDir, latestBackup);

    console.log(`📂 Restaurando desde: ${latestBackup}\n`);

    const backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));

    // Restaurar cada tabla
    console.log("🔄 Limpiando datos actuales...");
    await db.documentoGenerado.deleteMany({});
    await db.documento.deleteMany({});
    await db.checklistItem.deleteMany({});
    await db.checkDocumento.deleteMany({});
    await db.tipoDocumento.deleteMany({});
    await db.plantilla.deleteMany({});
    await db.tasaConfiguracion.deleteMany({});
    await db.tramiteConfiguracion.deleteMany({});

    console.log("✅ Datos limpios\n");

    console.log("📥 Restaurando categorías...");
    for (const cat of backupData.categorias) {
      await db.categoriasTramite.upsert({
        where: { codigo: cat.codigo },
        update: {
          clave: cat.clave,
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          icono: cat.icono,
          color: cat.color,
          orden: cat.orden,
        },
        create: {
          clave: cat.clave,
          codigo: cat.codigo,
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          icono: cat.icono,
          color: cat.color,
          orden: cat.orden,
        },
      });
    }
    console.log(`✅ ${backupData.categorias.length} categorías restauradas`);

    console.log("📥 Restaurando tipos de trámite...");
    for (const tramite of backupData.tramites) {
      await db.tramiteConfiguracion.create({
        data: {
          tipoTramite: tramite.tipoTramite,
          nombre: tramite.nombre,
          descripcion: tramite.descripcion,
          categoria: tramite.categoria,
          plantillasDisponibles: tramite.plantillasDisponibles,
          camposRequeridos: tramite.camposRequeridos,
          activo: tramite.activo ?? true,
        },
      });
    }
    console.log(`✅ ${backupData.tramites.length} tipos de trámite restaurados`);

    console.log("📥 Restaurando tipos de documento...");
    for (const tipo of backupData.tiposDocumento) {
      await db.tipoDocumento.create({
        data: {
          nombre: tipo.nombre,
          descripcion: tipo.descripcion,
          icono: tipo.icono,
          color: tipo.color,
          orden: tipo.orden,
          categoriaId: tipo.categoriaId,
        },
      });
    }
    console.log(`✅ ${backupData.tiposDocumento.length} tipos de documento restaurados`);

    console.log("📥 Restaurando check documentos...");
    for (const check of backupData.checkDocumentos) {
      await db.checkDocumento.create({
        data: {
          tipoTramite: check.tipoTramite,
          nombre: check.nombre,
          descripcion: check.descripcion,
          orden: check.orden,
          tipoVencimiento: check.tipoVencimiento,
          diasCaducidad: check.diasCaducidad,
        },
      });
    }
    console.log(`✅ ${backupData.checkDocumentos.length} check documentos restaurados`);

    console.log("📥 Restaurando plantillas...");
    for (const plantilla of backupData.plantillas) {
      await db.plantilla.create({
        data: {
          tipo: plantilla.tipo,
          tipoTramite: plantilla.tipoTramite,
          nombre: plantilla.nombre,
          driveFileId: plantilla.driveFileId,
        },
      });
    }
    console.log(`✅ ${backupData.plantillas.length} plantillas restauradas`);

    console.log("📥 Restaurando configuración de tasas...");
    for (const tasa of backupData.tasas) {
      await db.tasaConfiguracion.create({
        data: {
          tipoTramite: tasa.tipoTramite,
          nombre: tasa.nombre,
          importe: tasa.importe,
        },
      });
    }
    console.log(`✅ ${backupData.tasas.length} configuraciones de tasas restauradas`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ RESTAURACIÓN COMPLETADA\n");

  } catch (error) {
    console.error("❌ Error en restauración:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

restore();
