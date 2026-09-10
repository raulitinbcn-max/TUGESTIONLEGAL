const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function fix() {
  const categEX = await db.categoriasTramite.findFirst({ where: { codigo: 'EX-' } });
  const categNE = await db.categoriasTramite.findFirst({ where: { codigo: 'NE-' } });
  const categTR = await db.categoriasTramite.findFirst({ where: { codigo: 'TR-' } });

  await db.tramiteConfiguracion.update({
    where: { tipoTramite: 'Arraigo Sociolaboral' },
    data: { categoria: categEX.id }
  });

  await db.tramiteConfiguracion.update({
    where: { tipoTramite: 'Nacionalidad por residencia' },
    data: { categoria: categNE.id }
  });

  await db.tramiteConfiguracion.update({
    where: { tipoTramite: 'Cambio de nombre' },
    data: { categoria: categTR.id }
  });

  console.log("✅ Categorías restauradas");
  await db.$disconnect();
}

fix();
