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

async function migrate() {
  console.log('🔄 Migrando CheckDocumento a nueva estructura...\n');

  try {
    // Obtener todos los CheckDocumentos
    const checkDocs = await db.checkDocumento.findMany();
    console.log(`Encontrados ${checkDocs.length} check documentos\n`);

    for (const checkDoc of checkDocs) {
      console.log(`Procesando: ${checkDoc.nombre} (tipo: ${checkDoc.tipoTramite})`);

      // Buscar el TramiteConfiguracion correspondiente
      const tramiteConfig = await db.tramiteConfiguracion.findFirst({
        where: { tipoTramite: checkDoc.tipoTramite },
      });

      if (tramiteConfig) {
        // Actualizar el CheckDocumento con la relación correcta
        await db.checkDocumento.update({
          where: { id: checkDoc.id },
          data: {
            tramiteConfigId: tramiteConfig.id,
          },
        });
        console.log(`✅ Asociado a: ${tramiteConfig.nombre}`);
      } else {
        console.warn(`⚠️ No se encontró TramiteConfiguracion para: ${checkDoc.tipoTramite}`);
      }
    }

    console.log('\n✨ Migración completada\n');

  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

migrate();
