const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function seed() {
  const tasasConfig = {
    "Residencia": [
      { nombre: "Tasa de Tramitación", importe: 100 },
      { nombre: "Tasa de Registro", importe: 50 },
    ],
    "Trabajo": [
      { nombre: "Tasa de Tramitación", importe: 80 },
      { nombre: "Tasa de Registro", importe: 40 },
    ],
    "Reagrupación Familiar": [
      { nombre: "Tasa de Tramitación", importe: 120 },
    ],
    "Nacionalidad": [
      { nombre: "Tasa de Tramitación", importe: 150 },
      { nombre: "Tasa Judicial", importe: 75 },
    ],
    "Visado": [
      { nombre: "Tasa de Tramitación", importe: 90 },
    ],
    "Autorización de Estancia": [
      { nombre: "Tasa de Tramitación", importe: 100 },
    ],
    "Arraigo": [
      { nombre: "Tasa de Tramitación", importe: 110 },
    ],
    "Otro": [],
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
