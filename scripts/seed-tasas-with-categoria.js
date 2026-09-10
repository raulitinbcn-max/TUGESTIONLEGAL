const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function seed() {
  const tasasConfig = {
    "Arraigo Sociolaboral": [],
    "Nacionalidad por residencia": [],
    "Cambio de nombre": []
  };

  for (const [tipoTramite, tasas] of Object.entries(tasasConfig)) {
    const tasasJson = JSON.stringify(tasas);
    await db.tasaConfiguracion.upsert({
      where: { tipoTramite },
      update: { nombre: tasasJson },
      create: {
        tipoTramite,
        nombre: tasasJson,
        importe: 0,
      }
    });
  }

  console.log("✅ Tasas configuration seeded!");
  await db.$disconnect();
}

seed()
  .catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  });
