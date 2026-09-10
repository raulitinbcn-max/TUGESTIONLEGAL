import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { google } from 'googleapis'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Crear cliente de Drive con token del usuario
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })
    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    const clientesFolderId = process.env.DRIVE_FOLDER_CLIENTES_ID
    if (!clientesFolderId) {
      return NextResponse.json(
        { error: 'DRIVE_FOLDER_CLIENTES_ID no configurado' },
        { status: 400 }
      )
    }

    console.log('🔄 Iniciando sincronización desde Drive...')

    // Listar carpetas de clientes
    const response = await drive.files.list({
      q: `'${clientesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      spaces: 'drive',
      fields: 'files(id, name)',
      pageSize: 100,
      supportsAllDrives: true,
    })

    const carpetas = response.data.files || []
    console.log(`Encontradas ${carpetas.length} carpetas`)

    let clientesCreados = 0
    let tramitesCreados = 0

    for (const carpeta of carpetas) {
      if (!carpeta.name) continue

      // Parsear: "TR-00001 - NombreCliente"
      const match = carpeta.name.match(/TR-(\d+)\s*-?\s*(.+)/i)
      if (!match) {
        console.log(`⚠️ No se pudo parsear: ${carpeta.name}`)
        continue
      }

      const [, codigo, nombreCliente] = match
      const codigoTramite = `TR-${codigo.padStart(5, '0')}`
      const clienteTrim = nombreCliente.trim()

      // Buscar cliente existente
      const clienteExistente = await db.cliente.findFirst({
        where: {
          nombreCompleto: {
            contains: clienteTrim,
          },
        },
      })

      let cliente
      if (!clienteExistente) {
        cliente = await db.cliente.create({
          data: {
            nombreCompleto: clienteTrim,
            email: 'contacto@example.com',
            nacionalidad: 'España',
            telefono: '000000000',
          },
        })
        clientesCreados++
        console.log(`✅ Cliente creado: ${clienteTrim}`)
      } else {
        cliente = clienteExistente
        console.log(`ℹ️ Cliente ya existe: ${clienteTrim}`)
      }

      // Crear trámite
      const tramiteExistente = await db.tramite.findFirst({
        where: {
          codigo: codigoTramite,
          clienteId: cliente.id,
        },
      })

      if (!tramiteExistente) {
        // Determinar tipo de trámite del nombre
        let tipoTramite = 'Trámite General'
        if (clienteTrim.toLowerCase().includes('arraigo')) {
          tipoTramite = 'Arraigo Sociolaboral'
        } else if (clienteTrim.toLowerCase().includes('nacionalidad')) {
          tipoTramite = 'Nacionalidad por residencia'
        } else if (clienteTrim.toLowerCase().includes('nombre')) {
          tipoTramite = 'Cambio de nombre'
        }

        // Obtener tramiteConfigId por tipoTramite
        const tramiteConfig = await db.tramiteConfiguracion.findFirst({
          where: { tipoTramite },
        })

        if (!tramiteConfig) {
          console.warn(`⚠️ Tipo de trámite "${tipoTramite}" no encontrado`)
          continue
        }

        await db.tramite.create({
          data: {
            codigo: codigoTramite,
            clienteId: cliente.id,
            tramiteConfigId: tramiteConfig.id,
            estado: 'en_proceso',
            honorarios: 0,
            driveFolderId: carpeta.id,
            notas: `Sincronizado desde Drive: ${carpeta.name}`,
          },
        })
        tramitesCreados++
        console.log(`✅ Trámite creado: ${codigoTramite}`)
      } else {
        console.log(`ℹ️ Trámite ya existe: ${codigoTramite}`)
      }
    }

    const timestamp = new Date().toISOString()
    console.log(`✨ Sincronización completada: ${clientesCreados} clientes, ${tramitesCreados} trámites`)

    return NextResponse.json({
      success: true,
      message: 'Sincronización completada',
      clientesCreados,
      tramitesCreados,
      timestamp,
    })
  } catch (error) {
    console.error('Error en sincronización:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en sincronización' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      message: 'Para sincronizar, usa POST',
      usage: 'POST /api/admin/sync-clientes-seguro',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
