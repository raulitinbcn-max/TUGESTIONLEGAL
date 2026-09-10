const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function check() {
  const categorias = await db.categoriasTramite.findMany();
  console.log("Categorías:", JSON.stringify(categorias, null, 2));
  await db.$disconnect();
}

check();
