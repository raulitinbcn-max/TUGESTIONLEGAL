const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function fixTramites() {
  // Eliminar los tipos de trámite incorrectos
  const incorrectos = [
    "Residencia",
    "Trabajo",
    "Reagrupación Familiar",
    "Nacionalidad",
    "Visado",
    "Autorización de Estancia",
    "Otro"
  ];

  for (const tipo of incorrectos) {
    await db.tramiteConfiguracion.delete({
      where: { tipoTramite: tipo }
    }).catch(() => {});
  }

  // Agregar los tipos correctos
  const correctos = [
    {
      tipoTramite: "Arraigo Sociolaboral",
      nombre: "Arraigo Sociolaboral",
      descripcion: "Solicitud de arraigo social o laboral en España",
      categoria: "",
      plantillasDisponibles: JSON.stringify([]),
      camposRequeridos: JSON.stringify([])
    },
    {
      tipoTramite: "Nacionalidad por residencia",
      nombre: "Nacionalidad por residencia",
      descripcion: "Solicitud de nacionalidad española por residencia",
      categoria: "",
      plantillasDisponibles: JSON.stringify([]),
      camposRequeridos: JSON.stringify([])
    },
    {
      tipoTramite: "Cambio de nombre",
      nombre: "Cambio de nombre",
      descripcion: "Trámite de cambio de nombre",
      categoria: "",
      plantillasDisponibles: JSON.stringify([]),
      camposRequeridos: JSON.stringify([])
    }
  ];

  for (const config of correctos) {
    await db.tramiteConfiguracion.upsert({
      where: { tipoTramite: config.tipoTramite },
      update: config,
      create: config
    });
  }

  console.log("✅ Tipos de trámite corregidos!");

  // También corregir las tasas
  const tasasIncorrectas = [
    "Residencia",
    "Trabajo",
    "Reagrupación Familiar",
    "Nacionalidad",
    "Visado",
    "Autorización de Estancia",
    "Otro"
  ];

  for (const tipo of tasasIncorrectas) {
    await db.tasaConfiguracion.delete({
      where: { tipoTramite: tipo }
    }).catch(() => {});
  }

  // Agregar tasas correctas
  const tasasCorrectas = {
    "Arraigo Sociolaboral": [],
    "Nacionalidad por residencia": [],
    "Cambio de nombre": []
  };

  for (const [tipoTramite, tasas] of Object.entries(tasasCorrectas)) {
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

  console.log("✅ Tasas corregidas!");
  await db.$disconnect();
}

fixTramites().catch(e => {
  console.error("❌ Error:", e);
  process.exit(1);
});
