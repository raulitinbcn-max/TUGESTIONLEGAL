import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    ]

    let created = 0
    let existing = 0

    for (const cat of CATEGORIAS) {
      const exists = await db.categoriasTramite.findUnique({
        where: { codigo: cat.codigo },
      })

      if (!exists) {
        await db.categoriasTramite.create({ data: cat })
        created++
      } else {
        existing++
      }
    }

    return NextResponse.json({
      message: 'Inicialización completada',
      created,
      existing,
    })
  } catch (error) {
    console.error('Error initializing categorias:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al inicializar' },
      { status: 500 }
    )
  }
}
