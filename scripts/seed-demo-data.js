const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const db = new PrismaClient();

async function seedDemoData() {
  console.log('🌱 Agregando datos de demostración...\n');

  try {
    // Crear cliente de prueba
    const cliente = await db.cliente.create({
      data: {
        nombreCompleto: 'Juan García López',
        email: 'juan@example.com',
        numeroDocumento: '12345678A',
        tipoDocumento: 'DNI',
        nacionalidad: 'España',
        direccion: 'Calle Principal 123, Madrid',
        telefonoContacto: '600123456',
        profesion: 'Ingeniero',
      },
    });
    console.log('✅ Cliente creado:', cliente.nombreCompleto);

    // Crear trámite de prueba
    const tramite = await db.tramite.create({
      data: {
        codigo: 'TR-00001',
        clienteId: cliente.id,
        tipoTramite: 'Arraigo Sociolaboral',
        estado: 'en_proceso',
        honorarios: 500,
        carpetaDriveId: 'demo-folder-id',
        descripcion: 'Solicitud de arraigo sociolaboral para ciudadano extranjero',
      },
    });
    console.log('✅ Trámite creado:', tramite.codigo);

    // Crear historial de estado
    await db.historialEstado.create({
      data: {
        tramiteId: tramite.id,
        estadoAnterior: 'pendiente',
        estadoNuevo: 'en_proceso',
        cambiadoPor: 'admin',
      },
    });
    console.log('✅ Historial de estado creado');

    console.log('\n✨ Datos de demostración agregados exitosamente');
    console.log('   - Accede a http://localhost:3000/trámites para verlos\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

seedDemoData();
