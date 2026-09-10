import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { listFiles } from '@/lib/drive'
import { google } from 'googleapis'

export async function POST(req: NextRequest) {
  try {
    // Permitir sincronización sin autenticación (temporal para recuperar datos)
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const clientesFolderId = process.env.DRIVE_FOLDER_CLIENTES_ID
    if (!clientesFolderId) {
      return NextResponse.json(
        { error: 'DRIVE_FOLDER_CLIENTES_ID no configurado' },
        { status: 400 }
      )
    }

    console.log('🔄 Iniciando sincronización desde Drive...')

    // Obtener sesión del usuario autenticado
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Debes estar autenticado. Inicia sesión primero.' },
        { status: 401 }
      )
    }

    // Crear cliente de Drive con token del usuario
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })
    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    // Listar todas las carpetas en la carpeta de clientes
    const listResponse = await drive.files.list({
      q: `'${clientesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      spaces: 'drive',
      fields: 'files(id, name, mimeType)',
      pageSize: 100,
      supportsAllDrives: true,
    })

    const carpetas = listResponse.data.files || []

    let clientesCreados = 0
    let tramitesCreados = 0

    for (const carpeta of carpetas) {
      if (carpeta.mimeType !== 'application/vnd.google-apps.folder') {
        continue
      }

      // Intentar extraer datos del nombre de la carpeta
      // Formato esperado: "TR-00001 - NombreCliente" o similar
      const match = carpeta.name?.match(/TR-(\d+)\s*-?\s*(.+)/i)

      if (!match) {
        console.log(`⚠️  No se pudo parsear: ${carpeta.name}`)
        continue
      }

      const [, codigo, nombreCliente] = match
      const codigoTramite = `TR-${codigo.padStart(5, '0')}`

      // Buscar o crear cliente
      const clienteTrim = nombreCliente.trim()
      let cliente = await db.cliente.findFirst({
        where: {
          nombreCompleto: {
            contains: clienteTrim,
          },
        },
      })

      if (!cliente) {
        cliente = await db.cliente.create({
          data: {
            nombreCompleto: clienteTrim,
            email: 'contacto@example.com',
            nacionalidad: 'España',
            direccion: 'Sincronizado desde Drive',
            telefono: '000000000',
          },
        })
        clientesCreados++
      }

      // Crear un trámite por cada cliente encontrado
      // Usar el tipo de trámite del nombre de la carpeta o valor por defecto
      const tipoMatch = carpeta.name?.match(/([A-Za-z\s]+?)(?:\s*-|$)/)
      const tipoTramiteDefault = tipoMatch ? tipoMatch[1].trim() : 'Trámite'

      const tramiteExiste = await db.tramite.findFirst({
        where: {
          codigo: codigoTramite,
          clienteId: cliente.id,
        },
      })

      if (!tramiteExiste) {
        // Obtener tramiteConfigId por tipoTramite
        const tramiteConfig = await db.tramiteConfiguracion.findFirst({
          where: { tipoTramite: tipoTramiteDefault },
        })

        if (!tramiteConfig) {
          console.warn(`⚠️ Tipo de trámite "${tipoTramiteDefault}" no encontrado`)
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
        console.log(`   ✅ Trámite creado: ${codigoTramite}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sincronización completada',
      clientesCreados,
      tramitesCreados,
      timestamp: new Date().toISOString(),
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
      message: 'Para sincronizar desde Drive, usa POST',
      usage: 'POST /api/admin/sync-from-drive',
      description: 'Sincroniza clientes y trámites desde carpetas en Google Drive',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
