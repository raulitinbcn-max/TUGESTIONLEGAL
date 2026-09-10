const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function seed() {
  const tramitesConfigs = [
    {
      tipoTramite: "Residencia",
      nombre: "Residencia",
      descripcion: "Solicitud de autorización de residencia en España",
      plantillasDisponibles: JSON.stringify(["mandato", "contrato"]),
      camposRequeridos: JSON.stringify(["nacionalidad", "numero_pasaporte"])
    },
    {
      tipoTramite: "Trabajo",
      nombre: "Trabajo",
      descripcion: "Solicitud de permiso de trabajo",
      plantillasDisponibles: JSON.stringify(["mandato", "contrato"]),
      camposRequeridos: JSON.stringify(["nacionalidad", "numero_pasaporte"])
    },
    {
      tipoTramite: "Reagrupación Familiar",
      nombre: "Reagrupación Familiar",
      descripcion: "Solicitud de reagrupación familiar",
      plantillasDisponibles: JSON.stringify(["mandato"]),
      camposRequeridos: JSON.stringify(["nacionalidad"])
    },
    {
      tipoTramite: "Nacionalidad",
      nombre: "Nacionalidad",
      descripcion: "Solicitud de nacionalidad española",
      plantillasDisponibles: JSON.stringify(["mandato", "contrato"]),
      camposRequeridos: JSON.stringify(["nacionalidad", "numero_pasaporte"])
    },
    {
      tipoTramite: "Visado",
      nombre: "Visado",
      descripcion: "Gestión de visados",
      plantillasDisponibles: JSON.stringify(["mandato"]),
      camposRequeridos: JSON.stringify(["nacionalidad"])
    },
    {
      tipoTramite: "Autorización de Estancia",
      nombre: "Autorización de Estancia",
      descripcion: "Solicitud de autorización de estancia temporal",
      plantillasDisponibles: JSON.stringify(["mandato"]),
      camposRequeridos: JSON.stringify(["nacionalidad", "numero_pasaporte"])
    },
    {
      tipoTramite: "Arraigo",
      nombre: "Arraigo",
      descripcion: "Solicitud de arraigo social o laboral",
      plantillasDisponibles: JSON.stringify(["mandato", "contrato"]),
      camposRequeridos: JSON.stringify(["nacionalidad", "numero_pasaporte"])
    },
    {
      tipoTramite: "Otro",
      nombre: "Otro",
      descripcion: "Otros trámites",
      plantillasDisponibles: JSON.stringify([]),
      camposRequeridos: JSON.stringify([])
    }
  ];

  for (const config of tramitesConfigs) {
    await db.tramiteConfiguracion.upsert({
      where: { tipoTramite: config.tipoTramite },
      update: config,
      create: config
    });
  }

  console.log("✅ Tramites configuration seeded!");
  await db.$disconnect();
}

seed()
  .catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  });
