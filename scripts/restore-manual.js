const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

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

const db = new PrismaClient();

async function restore() {
  console.log('🔄 Restaurando desde backup...\n');

  try {
    const backupPath = path.resolve(__dirname, '../backups/config-backup-2026-09-09.json');
    if (!fs.existsSync(backupPath)) {
      throw new Error('No se encontró backup');
    }

    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

    // Restaurar categorías
    console.log('📂 Restaurando categorías...');
    for (const cat of backup.categorias || []) {
      await db.categoriasTramite.upsert({
        where: { codigo: cat.codigo },
        update: cat,
        create: cat,
      });
    }
    console.log(`✅ ${backup.categorias?.length || 0} categorías restauradas\n`);

    // Restaurar tipos de documento
    console.log('📄 Restaurando tipos de documento...');
    for (const tipo of backup.tiposDocumento || []) {
      await db.tipoDocumento.upsert({
        where: { nombre: tipo.nombre },
        update: tipo,
        create: tipo,
      });
    }
    console.log(`✅ ${backup.tiposDocumento?.length || 0} tipos de documento restaurados\n`);

    // Restaurar configuración de trámites PRIMERO (necesaria para CheckDocumento)
    console.log('⚙️ Restaurando configuración de trámites...');
    for (const tramite of backup.tramites || []) {
      await db.tramiteConfiguracion.upsert({
        where: { tipoTramite: tramite.tipoTramite },
        update: tramite,
        create: tramite,
      });
    }
    console.log(`✅ ${backup.tramites?.length || 0} trámites configurados restaurados\n`);

    // Restaurar check documentos (después de trámites)
    console.log('☑️ Restaurando check documentos...');
    for (const check of backup.checkDocumentos || []) {
      // Buscar el TramiteConfiguracion correspondiente
      const tramiteConfig = await db.tramiteConfiguracion.findFirst({
        where: { tipoTramite: check.tipoTramite },
      });

      if (tramiteConfig) {
        // Borrar si existe (para recrearlo con datos nuevos)
        await db.checkDocumento.deleteMany({
          where: { id: check.id },
        });

        // Crear nuevo con estructura correcta
        await db.checkDocumento.create({
          data: {
            id: check.id,
            nombre: check.nombre,
            descripcion: check.descripcion || null,
            orden: check.orden || 0,
            tipoVencimiento: check.tipoVencimiento || null,
            diasCaducidad: check.diasCaducidad || null,
            tramiteConfigId: tramiteConfig.id,
          },
        });
      }
    }
    console.log(`✅ ${backup.checkDocumentos?.length || 0} check documentos restaurados\n`);

    // Restaurar plantillas
    console.log('📋 Restaurando plantillas...');
    for (const plantilla of backup.plantillas || []) {
      await db.plantilla.upsert({
        where: { id: plantilla.id },
        update: plantilla,
        create: plantilla,
      });
    }
    console.log(`✅ ${backup.plantillas?.length || 0} plantillas restauradas\n`);

    // Restaurar tasas
    console.log('💰 Restaurando tasas...');
    for (const tasa of backup.tasas || []) {
      await db.tasaConfiguracion.upsert({
        where: { tipoTramite: tasa.tipoTramite },
        update: tasa,
        create: tasa,
      });
    }
    console.log(`✅ ${backup.tasas?.length || 0} tasas restauradas\n`);

    console.log('✨ Restauración completada exitosamente\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

restore();
