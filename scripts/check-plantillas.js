const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function check() {
  const plantillas = await db.plantilla.findMany();
  console.log(`Total de plantillas: ${plantillas.length}`);
  plantillas.forEach(p => {
    console.log(`\n  Tipo: ${p.tipo}`);
    console.log(`  TipoTramite: ${p.tipoTramite}`);
    console.log(`  Nombre: ${p.nombre}`);
    console.log(`  Drive ID: ${p.driveFileId}`);
  });
  await db.$disconnect();
}

check();
