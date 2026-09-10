import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categorias = await db.categoriasTramite.findMany({
      orderBy: { orden: 'asc' },
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error('Error fetching categorias:', error)
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clave, codigo, nombre, descripcion, icono, color, orden } = await req.json()

    if (!clave || !codigo || !nombre) {
      return NextResponse.json(
        { error: 'clave, codigo y nombre son requeridos' },
        { status: 400 }
      )
    }

    const categoria = await db.categoriasTramite.create({
      data: {
        clave,
        codigo,
        nombre,
        descripcion: descripcion || null,
        icono: icono || null,
        color: color || null,
        orden: orden || 0,
      },
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    console.error('Error creating categoria:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear categoría' },
      { status: 500 }
    )
  }
}
