const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function check() {
  const tramites = await db.tramiteConfiguracion.findMany();
  console.log("Trámites en BD:");
  tramites.forEach(t => {
    console.log(`
Tipo: ${t.tipoTramite}
  Nombre: ${t.nombre}
  Descripción: ${t.descripcion}
  Categoría ID: ${t.categoria}
  Activo: ${t.activo}
    `);
  });
  await db.$disconnect();
}

check();
