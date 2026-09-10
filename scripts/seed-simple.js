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

async function seed() {
  try {
    console.log('🌱 Creando datos de ejemplo...\n');

    // Crear cliente
    const cliente = await db.cliente.create({
      data: {
        nombreCompleto: 'Juan García López',
        email: 'juan@example.com',
        nacionalidad: 'España',
        telefono: '600123456',
        profesion: 'Ingeniero',
      },
    });
    console.log(`✅ Cliente creado: ${cliente.nombreCompleto}`);

    // Crear o buscar categoría
    const categoria = await db.categoriasTramite.upsert({
      where: { codigo: 'TRAB' },
      update: {},
      create: {
        clave: 'trabajo',
        codigo: 'TRAB',
        nombre: 'Trámites de Trabajo',
        icono: '💼',
        color: '#3b82f6',
      },
    });
    console.log(`✅ Categoría creada: ${categoria.nombre}`);

    // Crear o buscar tipo de trámite
    const tramiteConfig = await db.tramiteConfiguracion.upsert({
      where: { tipoTramite: 'Arraigo Sociolaboral' },
      update: {},
      create: {
        tipoTramite: 'Arraigo Sociolaboral',
        nombre: 'Arraigo Sociolaboral',
        descripcion: 'Solicitud de arraigo social o laboral en España',
        categoria: 'trabajo',
        plantillasDisponibles: null,
        camposRequeridos: null,
        activo: true,
      },
    });
    console.log(`✅ Tipo de trámite creado: ${tramiteConfig.tipoTramite}`);

    // Crear trámite
    const tramite = await db.tramite.create({
      data: {
        codigo: 'TR-00001',
        clienteId: cliente.id,
        tipoTramite: 'Arraigo Sociolaboral',
        estado: 'en_proceso',
        honorarios: 500,
        notas: 'Trámite de prueba',
        driveFolderId: 'folder-123',
      },
    });
    console.log(`✅ Trámite creado: ${tramite.codigo}`);

    // Crear tipo de documento
    const tipoDoc = await db.tipoDocumento.create({
      data: {
        nombre: 'Resguardo de Presentación',
        icono: '📄',
        color: '#10b981',
        orden: 1,
      },
    });
    console.log(`✅ Tipo de documento creado: ${tipoDoc.nombre}`);

    // Crear check documento (requisito)
    const checkDoc = await db.checkDocumento.create({
      data: {
        nombre: 'Pasaporte',
        tramiteConfigId: tramiteConfig.id,
        orden: 1,
      },
    });
    console.log(`✅ Check documento creado: ${checkDoc.nombre}`);

    console.log('\n✨ Datos de ejemplo creados exitosamente\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

seed();
