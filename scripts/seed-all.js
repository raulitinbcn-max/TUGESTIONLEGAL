const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function seedAll() {
  console.log("🌱 Iniciando seed completo...\n");

  // 1. Crear categorías
  console.log("1️⃣ Creando categorías...");
  const CATEGORIAS = [
    {
      clave: 'EXTRANJERIA',
      codigo: 'EX-',
      nombre: 'Extranjería General',
      icono: '🌍',
      color: '#3b82f6',
      orden: 1,
    },
    {
      clave: 'EXTRANJERIA_MOVILIDAD',
      codigo: 'MI-',
      nombre: 'Extranjería (Movilidad)',
      icono: '✈️',
      color: '#06b6d4',
      orden: 2,
    },
    {
      clave: 'NACIONALIDAD',
      codigo: 'NE-',
      nombre: 'Nacionalidad',
      icono: '🇪🇸',
      color: '#ec4899',
      orden: 3,
    },
    {
      clave: 'TRANSPORTE_DGT',
      codigo: 'DGT-',
      nombre: 'Conductores y Vehículos',
      icono: '🚗',
      color: '#f59e0b',
      orden: 4,
    },
    {
      clave: 'LABORAL',
      codigo: 'LAB-',
      nombre: 'Trámites Laborales',
      icono: '💼',
      color: '#8b5cf6',
      orden: 5,
    },
    {
      clave: 'FISCAL',
      codigo: 'FIS-',
      nombre: 'Trámites Fiscales',
      icono: '💰',
      color: '#10b981',
      orden: 6,
    },
    {
      clave: 'OTROS',
      codigo: 'TR-',
      nombre: 'Otros Trámites',
      icono: '📌',
      color: '#6b7280',
      orden: 7,
    },
  ];

  for (const cat of CATEGORIAS) {
    await db.categoriasTramite.upsert({
      where: { codigo: cat.codigo },
      update: cat,
      create: cat,
    });
  }
  console.log("✅ Categorías creadas\n");

  // 2. Obtener categorías para asignar a trámites
  console.log("2️⃣ Creando trámites...");
  const categExtranjeria = await db.categoriasTramite.findUnique({
    where: { codigo: 'EX-' },
  });
  const categNacionalidad = await db.categoriasTramite.findUnique({
    where: { codigo: 'NE-' },
  });
  const categOtros = await db.categoriasTramite.findUnique({
    where: { codigo: 'TR-' },
  });

  const tramitesConfigs = [
    {
      tipoTramite: "Arraigo Sociolaboral",
      nombre: "Arraigo Sociolaboral",
      descripcion: "Solicitud de arraigo social o laboral en España",
      categoria: categExtranjeria.id,
      plantillasDisponibles: JSON.stringify([]),
      camposRequeridos: JSON.stringify([]),
      activo: true,
    },
    {
      tipoTramite: "Nacionalidad por residencia",
      nombre: "Nacionalidad por residencia",
      descripcion: "Solicitud de nacionalidad española por residencia",
      categoria: categNacionalidad.id,
      plantillasDisponibles: JSON.stringify([]),
      camposRequeridos: JSON.stringify([]),
      activo: true,
    },
    {
      tipoTramite: "Cambio de nombre",
      nombre: "Cambio de nombre",
      descripcion: "Trámite de cambio de nombre",
      categoria: categOtros.id,
      plantillasDisponibles: JSON.stringify([]),
      camposRequeridos: JSON.stringify([]),
      activo: true,
    },
  ];

  for (const config of tramitesConfigs) {
    await db.tramiteConfiguracion.upsert({
      where: { tipoTramite: config.tipoTramite },
      update: config,
      create: config,
    });
  }
  console.log("✅ Trámites creados\n");

  // 3. Crear tasas
  console.log("3️⃣ Creando tasas...");
  const tasasConfig = {
    "Arraigo Sociolaboral": [],
    "Nacionalidad por residencia": [],
    "Cambio de nombre": [],
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
      },
    });
  }
  console.log("✅ Tasas creadas\n");

  console.log("🎉 ¡Seed completado exitosamente!");
  await db.$disconnect();
}

seedAll().catch(e => {
  console.error("❌ Error:", e);
  process.exit(1);
});
