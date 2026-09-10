import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { uploadBackupToDriver } from '@/lib/drive'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { driveFolderId } = await req.json()

    if (!driveFolderId) {
      return NextResponse.json(
        { error: 'driveFolderId requerido' },
        { status: 400 }
      )
    }

    // Crear backup en memoria
    const backup = {
      timestamp: new Date().toISOString(),
      categorias: await db.categoriasTramite.findMany(),
      tramites: await db.tramiteConfiguracion.findMany(),
      tiposDocumento: await db.tipoDocumento.findMany(),
      checkDocumentos: await db.checkDocumento.findMany(),
      plantillas: await db.plantilla.findMany(),
      tasas: await db.tasaConfiguracion.findMany(),
      documentosGenerados: await db.documentoGenerado.findMany(),
    }

    const backupJson = JSON.stringify(backup, null, 2)
    const today = new Date().toISOString().split('T')[0]
    const backupFileName = `config-backup-${today}.json`

    // Subir a Drive
    const fileId = await uploadBackupToDriver(
      driveFolderId,
      backupFileName,
      backupJson
    )

    return NextResponse.json({
      message: 'Backup subido a Google Drive exitosamente',
      success: true,
      fileId,
      fileName: backupFileName,
      timestamp: backup.timestamp,
      summary: {
        categorias: backup.categorias.length,
        tramites: backup.tramites.length,
        tiposDocumento: backup.tiposDocumento.length,
        checkDocumentos: backup.checkDocumentos.length,
        plantillas: backup.plantillas.length,
        tasas: backup.tasas.length,
      },
    })
  } catch (error) {
    console.error('Error subiendo backup a Drive:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al subir backup' },
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
      message: 'Para subir backup a Drive, usa POST con driveFolderId',
      example: {
        method: 'POST',
        body: {
          driveFolderId: 'ID-DE-TU-CARPETA-EN-DRIVE',
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error' },
      { status: 500 }
    )
  }
}
