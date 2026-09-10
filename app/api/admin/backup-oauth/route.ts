import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { google } from 'googleapis'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'No autenticado o sin acceso a Google Drive' },
        { status: 401 }
      )
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    )
    oauth2Client.setCredentials({ access_token: session.accessToken })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    // Crear backup completo
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      usuario: session.user?.email,
      categorias: await db.categoriasTramite.findMany(),
      tramites: await db.tramiteConfiguracion.findMany(),
      tiposDocumento: await db.tipoDocumento.findMany(),
      checkDocumentos: await db.checkDocumento.findMany({
        include: { tramiteConfig: true },
      }),
      plantillas: await db.plantilla.findMany(),
      tasas: await db.tasaConfiguracion.findMany(),
      clientes: await db.cliente.findMany({
        include: {
          tramites: {
            include: {
              documentos: true,
              documentosGenerados: true,
              historialEstados: true,
              tasas: true,
              vencimientos: true,
              checklistItems: true,
            },
          },
        },
      }),
    }

    const backupJson = JSON.stringify(backup, null, 2)
    const today = new Date().toISOString().split('T')[0]
    const backupFileName = `sistema-backup-${today}.json`
    const backupsFolderId = process.env.DRIVE_FOLDER_BACKUPS_ID

    if (!backupsFolderId) {
      return NextResponse.json(
        { error: 'DRIVE_FOLDER_BACKUPS_ID no configurado' },
        { status: 500 }
      )
    }

    // Verificar si ya existe backup de hoy
    const existingFiles = await drive.files.list({
      q: `'${backupsFolderId}' in parents and name = '${backupFileName}' and trashed = false`,
      spaces: 'drive',
      fields: 'files(id)',
      supportsAllDrives: true,
    })

    let fileId
    if (existingFiles.data.files && existingFiles.data.files.length > 0) {
      // Actualizar
      fileId = existingFiles.data.files[0].id!
      await drive.files.update({
        fileId,
        media: {
          mimeType: 'application/json',
          body: backupJson,
        },
        supportsAllDrives: true,
      })
    } else {
      // Crear nuevo
      const response = await drive.files.create({
        requestBody: {
          name: backupFileName,
          parents: [backupsFolderId],
          mimeType: 'application/json',
          description: `Backup automático del sistema - ${new Date().toLocaleString('es-ES')}`,
        },
        media: {
          mimeType: 'application/json',
          body: backupJson,
        },
        supportsAllDrives: true,
        fields: 'id',
      })
      fileId = response.data.id
    }

    // Limpiar backups antiguos (mantener últimos 10)
    const allBackups = await drive.files.list({
      q: `'${backupsFolderId}' in parents and name contains 'sistema-backup-' and trashed = false`,
      spaces: 'drive',
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 100,
      supportsAllDrives: true,
    })

    const backupFiles = allBackups.data.files || []
    if (backupFiles.length > 10) {
      const filesToDelete = backupFiles.slice(10)
      for (const file of filesToDelete) {
        await drive.files.delete({
          fileId: file.id!,
          supportsAllDrives: true,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Backup completado',
      fileName: backupFileName,
      timestamp: backup.timestamp,
      backupsRemaining: Math.min(backupFiles.length + 1, 10),
    })
  } catch (error) {
    console.error('Error en backup OAuth:', error)
    return NextResponse.json(
      { error: 'Error al crear backup', details: String(error) },
      { status: 500 }
    )
  }
}
