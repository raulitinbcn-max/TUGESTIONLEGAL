const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function clean() {
  await db.tramiteConfiguracion.deleteMany({});
  await db.tasaConfiguracion.deleteMany({});
  console.log("✅ Limpios!");
  await db.$disconnect();
}

clean();
