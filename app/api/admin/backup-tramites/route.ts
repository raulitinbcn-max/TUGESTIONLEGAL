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

    console.log('🔄 Iniciando backup de trámites en Drive...')

    // Obtener todos los trámites con sus datos
    const tramites = await db.tramite.findMany({
      include: {
        cliente: true,
        tramiteConfig: true,
        documentos: true,
        documentosGenerados: true,
        historialEstados: true,
        tasas: true,
        vencimientos: true,
        checklistItems: {
          include: {
            documento: true,
          },
        },
      },
    })

    let tramitesBackup = 0
    const today = new Date().toISOString().split('T')[0]

    for (const tramite of tramites) {
      if (!tramite.driveFolderId) {
        console.log(`⚠️ ${tramite.codigo}: No tiene carpeta en Drive`)
        continue
      }

      try {
        const backupTramite = {
          timestamp: new Date().toISOString(),
          tramite: {
            id: tramite.id,
            codigo: tramite.codigo,
            tipoTramite: tramite.tramiteConfig?.tipoTramite || 'Desconocido',
            estado: tramite.estado,
            honorarios: tramite.honorarios,
            formaPago: tramite.formaPago,
            suplidos: tramite.suplidos,
            planoPago: tramite.planoPago,
            notas: tramite.notas,
          },
          cliente: {
            id: tramite.cliente.id,
            nombreCompleto: tramite.cliente.nombreCompleto,
            email: tramite.cliente.email,
            telefono: tramite.cliente.telefono,
            nacionalidad: tramite.cliente.nacionalidad,
            direccion: tramite.cliente.direccion,
            profesion: tramite.cliente.profesion,
          },
          documentos: tramite.documentos,
          vencimientos: tramite.vencimientos,
          tasas: tramite.tasas,
          checklistItems: tramite.checklistItems,
          historialEstados: tramite.historialEstados,
        }

        const backupJson = JSON.stringify(backupTramite, null, 2)
        const backupFileName = `backup-tramite-${tramite.codigo}-${today}.json`

        // Verificar si ya existe el archivo
        const existingFiles = await drive.files.list({
          q: `name = '${backupFileName}' and '${tramite.driveFolderId}' in parents and trashed = false`,
          spaces: 'drive',
          fields: 'files(id)',
          supportsAllDrives: true,
        })

        if (existingFiles.data.files && existingFiles.data.files.length > 0) {
          // Actualizar archivo existente
          const fileId = existingFiles.data.files[0].id
          if (fileId) {
            await drive.files.update({
              fileId,
              media: {
                mimeType: 'application/json',
                body: backupJson,
              },
              supportsAllDrives: true,
            })
            console.log(`✅ ${tramite.codigo}: Backup actualizado`)
          }
        } else {
          // Crear archivo nuevo
          await drive.files.create({
            requestBody: {
              name: backupFileName,
              parents: [tramite.driveFolderId],
              mimeType: 'application/json',
              description: `Backup completo del trámite ${tramite.codigo} - ${tramite.cliente.nombreCompleto}`,
            },
            media: {
              mimeType: 'application/json',
              body: backupJson,
            },
            supportsAllDrives: true,
            fields: 'id',
          })
          console.log(`✅ ${tramite.codigo}: Backup creado`)
        }

        tramitesBackup++
      } catch (error) {
        console.error(`⚠️ Error en backup de ${tramite.codigo}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Backup de trámites completado',
      tramitesBackup,
      timestamp: new Date().toISOString(),
      details: `Se guardó un JSON por cada trámite en su carpeta de Drive con: honorarios, vencimientos, notas, checklist, historial de estados, etc.`,
    })
  } catch (error) {
    console.error('Error en backup de trámites:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en backup' },
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
      message: 'Para hacer backup de trámites, usa POST',
      usage: 'POST /api/admin/backup-tramites',
      description: 'Crea un JSON con datos completos de cada trámite en su carpeta de Drive',
      contenido: {
        tramite: 'código, tipo, estado, honorarios, forma de pago, suplidos, etc.',
        cliente: 'nombre, email, teléfono, nacionalidad, dirección, profesión',
        documentos: 'lista de documentos',
        vencimientos: 'lista de vencimientos',
        tasas: 'lista de tasas',
        checklist: 'items del checklist',
        historial: 'historial de cambios de estado',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
