const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function seed() {
  // Obtener categorías
  const categorias = await db.categoriasTramite.findMany();
  console.log("Categorías disponibles:");
  categorias.forEach(c => console.log(`  ${c.clave}: ${c.nombre}`));

  // Encontrar la categoría de Nacionalidad
  const categNacionalidad = categorias.find(c => c.clave === 'NACIONALIDAD');
  const categExtranjeria = categorias.find(c => c.clave === 'EXTRANJERIA');
  const categOtros = categorias.find(c => c.clave === 'OTROS');

  if (!categNacionalidad || !categExtranjeria) {
    console.error("No se encontraron las categorías necesarias");
    await db.$disconnect();
    return;
  }

  const tramitesConfigs = [
    {
      tipoTramite: "Arraigo Sociolaboral",
      nombre: "Arraigo Sociolaboral",
      descripcion: "Solicitud de arraigo social o laboral en España",
      categoria: categExtranjeria.id, // Extranjería General
      plantillasDisponibles: JSON.stringify([]),
      camposRequeridos: JSON.stringify([])
    },
    {
      tipoTramite: "Nacionalidad por residencia",
      nombre: "Nacionalidad por residencia",
      descripcion: "Solicitud de nacionalidad española por residencia",
      categoria: categNacionalidad.id, // Nacionalidad
      plantillasDisponibles: JSON.stringify([]),
      camposRequeridos: JSON.stringify([])
    },
    {
      tipoTramite: "Cambio de nombre",
      nombre: "Cambio de nombre",
      descripcion: "Trámite de cambio de nombre",
      categoria: categOtros.id, // Otros Trámites
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
    console.log(`✅ ${config.tipoTramite} guardado`);
  }

  console.log("✅ Configuración de trámites completada!");
  await db.$disconnect();
}

seed()
  .catch(e => {
    console.error("❌ Error:", e);
    process.exit(1);
  });
