const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function seed() {
  console.log("🌱 Sembrando CheckDocumentos...\n");

  // Obtener los tipos de trámite
  const tramites = await db.tramiteConfiguracion.findMany();

  const checkDocumentosBase = [
    {
      nombre: "Pasaporte válido",
      descripcion: "Pasaporte válido del solicitante",
      tipoVencimiento: "documento",
      diasCaducidad: 365,
      orden: 10,
    },
    {
      nombre: "Documentación de identidad",
      descripcion: "DNI u otro documento de identidad válido",
      tipoVencimiento: "documento",
      diasCaducidad: 365,
      orden: 20,
    },
    {
      nombre: "Certificado de empadronamiento",
      descripcion: "Certificado actual de empadronamiento",
      tipoVencimiento: "documento",
      diasCaducidad: 90,
      orden: 30,
    },
    {
      nombre: "Antecedentes penales",
      descripcion: "Certificado de antecedentes penales",
      tipoVencimiento: "documento",
      diasCaducidad: 180,
      orden: 40,
    },
    {
      nombre: "Comprobante de medios económicos",
      descripcion: "Extractos bancarios o declaración de renta",
      tipoVencimiento: "documento",
      diasCaducidad: 90,
      orden: 50,
    },
  ];

  for (const tramite of tramites) {
    console.log(`Creando checklist para: ${tramite.tipoTramite}`);

    for (const doc of checkDocumentosBase) {
      await db.checkDocumento.create({
        data: {
          tipoTramite: tramite.tipoTramite,
          nombre: doc.nombre,
          descripcion: doc.descripcion,
          tipoVencimiento: doc.tipoVencimiento,
          diasCaducidad: doc.diasCaducidad,
          orden: doc.orden,
        },
      });
    }
  }

  console.log("\n✅ CheckDocumentos creados exitosamente!");
  await db.$disconnect();
}

seed().catch(e => {
  console.error("❌ Error:", e);
  process.exit(1);
});
