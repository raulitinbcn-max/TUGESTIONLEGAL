const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function fix() {
  try {
    // Obtener categoría DGT (Conductores y Vehículos)
    const categDGT = await db.categoriasTramite.findFirst({
      where: { codigo: 'DGT-' }
    });

    if (!categDGT) {
      console.error("No se encontró categoría DGT");
      process.exit(1);
    }

    // Actualizar Cambio de nombre
    await db.tramiteConfiguracion.update({
      where: { tipoTramite: 'Cambio de nombre' },
      data: { categoria: categDGT.id }
    });

    console.log(`✅ Cambio de nombre actualizado a categoría: ${categDGT.nombre}`);
    await db.$disconnect();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fix();
