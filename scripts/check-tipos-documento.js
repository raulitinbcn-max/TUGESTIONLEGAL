const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function check() {
  const tipos = await db.tipoDocumento.findMany();
  console.log("Tipos de documento:");
  tipos.forEach(t => {
    console.log(`  ${t.nombre} - Categoría: ${t.categoriaId || 'SIN ASIGNAR'}`);
  });
  await db.$disconnect();
}

check();
