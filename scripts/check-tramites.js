const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function check() {
  const plantillas = await db.plantilla.findMany();
  const tiposUnicos = [...new Set(plantillas.map(p => p.tipoTramite))];
  console.log("Tipos de trámite en plantillas:", tiposUnicos);

  const tramitesConfig = await db.tramiteConfiguracion.findMany();
  console.log("\nTipos de trámite en configuración:", tramitesConfig.map(t => t.tipoTramite));

  await db.$disconnect();
}

check();
