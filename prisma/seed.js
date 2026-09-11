const { PrismaClient } = require('@prisma/client')

const db = new PrismaClient()

async function seed() {
  const categorias = [
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
  ]

  console.log('🌱 Seeding categorías de trámites...')

  for (const cat of categorias) {
    const exists = await db.categoriasTramite.findUnique({
      where: { codigo: cat.codigo },
    })

    if (!exists) {
      await db.categoriasTramite.create({
        data: cat,
      })
      console.log(`✅ ${cat.icono} ${cat.nombre}`)
    } else {
      console.log(`⏭️  ${cat.icono} ${cat.nombre} (ya existe)`)
    }
  }

  console.log('✨ Seed categorías completado')

  // Agregar usuarios autorizados
  console.log('🌱 Agregando usuarios autorizados...')
  const usuarios = [
    { email: 'raulitinbcn@gmail.com', nombre: 'Raúl Admin', rol: 'admin' },
    { email: 'raul@pestcontrol2000.com', nombre: 'Raúl', rol: 'admin' },
    { email: 'pau.iglesias@travesialegal.com', nombre: 'Pau Iglesias', rol: 'admin' },
  ]

  for (const user of usuarios) {
    const usuarioAutorizado = await db.usuarioAutorizado.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        activo: true,
      },
    })
    console.log(`✅ Usuario autorizado: ${usuarioAutorizado.email}`)
  }
}

seed()
  .then(() => {
    console.log('✨ Seed completado')
    process.exit(0)
  })
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
