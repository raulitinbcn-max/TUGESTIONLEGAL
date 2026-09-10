const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function check() {
  console.log("=== TIPOS DE DOCUMENTO ===");
  const tipos = await db.tipoDocumento.findMany();
  console.log(`Total: ${tipos.length}`);
  tipos.forEach(t => console.log(`  ${t.nombre} (${t.icono})`));

  console.log("\n=== CHECK DOCUMENTOS ===");
  const checks = await db.checkDocumento.findMany();
  console.log(`Total: ${checks.length}`);
  checks.forEach(c => console.log(`  ${c.nombre} (${c.tipoTramite})`));

  console.log("\n=== CATEGORIAS ===");
  const cats = await db.categoriasTramite.findMany();
  console.log(`Total: ${cats.length}`);
  cats.forEach(c => console.log(`  ${c.nombre}`));

  console.log("\n=== TRAMITES ===");
  const tramites = await db.tramiteConfiguracion.findMany();
  console.log(`Total: ${tramites.length}`);
  tramites.forEach(t => console.log(`  ${t.tipoTramite}`));

  await db.$disconnect();
}

check();
