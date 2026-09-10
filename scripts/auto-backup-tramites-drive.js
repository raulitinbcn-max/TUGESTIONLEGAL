const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const db = new PrismaClient();

// Leer .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      let value = valueParts.join('=').trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key.trim()] = value;
    }
  }
}

async function getDriveClient() {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Error creando cliente de Drive:', error.message);
    throw error;
  }
}

async function autoBackupTramitesDrive() {
  try {
    const drive = await getDriveClient();

    console.log('🔄 Ejecutando backup automático de trámites en Drive...\n');

    // Obtener todos los trámites con sus datos
    const tramites = await db.tramite.findMany({
      include: {
        cliente: true,
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
    });

    let tramitesBackup = 0;
    const today = new Date().toISOString().split('T')[0];

    for (const tramite of tramites) {
      if (!tramite.driveFolderId) {
        continue;
      }

      try {
        const backupTramite = {
          timestamp: new Date().toISOString(),
          tramite: {
            id: tramite.id,
            codigo: tramite.codigo,
            tipoTramite: tramite.tipoTramite,
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
        };

        const backupJson = JSON.stringify(backupTramite, null, 2);
        const backupFileName = `backup-tramite-${tramite.codigo}-${today}.json`;

        // Verificar si ya existe el archivo de hoy
        const existingFiles = await drive.files.list({
          q: `name = '${backupFileName}' and '${tramite.driveFolderId}' in parents and trashed = false`,
          spaces: 'drive',
          fields: 'files(id)',
          supportsAllDrives: true,
        });

        if (existingFiles.data.files && existingFiles.data.files.length > 0) {
          // Actualizar archivo existente
          await drive.files.update({
            fileId: existingFiles.data.files[0].id,
            media: {
              mimeType: 'application/json',
              body: backupJson,
            },
            supportsAllDrives: true,
          });
        } else {
          // Crear archivo nuevo
          await drive.files.create({
            requestBody: {
              name: backupFileName,
              parents: [tramite.driveFolderId],
              mimeType: 'application/json',
              description: `Backup automático del trámite ${tramite.codigo} - ${tramite.cliente.nombreCompleto}`,
            },
            media: {
              mimeType: 'application/json',
              body: backupJson,
            },
            supportsAllDrives: true,
            fields: 'id',
          });
        }

        tramitesBackup++;

        // Limpiar backups antiguos (mantener últimos 3)
        const allBackups = await drive.files.list({
          q: `name contains 'backup-tramite-${tramite.codigo}-' and '${tramite.driveFolderId}' in parents and trashed = false`,
          spaces: 'drive',
          fields: 'files(id, name, createdTime)',
          orderBy: 'createdTime desc',
          pageSize: 10,
          supportsAllDrives: true,
        });

        const backupFiles = allBackups.data.files || [];
        if (backupFiles.length > 3) {
          const filesToDelete = backupFiles.slice(3);
          for (const file of filesToDelete) {
            await drive.files.delete({
              fileId: file.id,
              supportsAllDrives: true,
            });
          }
        }
      } catch (error) {
        console.error(`⚠️ Error en backup de ${tramite.codigo}:`, error.message);
      }
    }

    if (tramitesBackup > 0) {
      console.log(`✨ Backup automático de trámites completado: ${tramitesBackup} trámites guardados\n`);
    }

  } catch (error) {
    console.error('❌ Error en backup automático de trámites:', error.message);
    // No lanzar error - esto es un proceso de background
  } finally {
    await db.$disconnect();
  }
}

autoBackupTramitesDrive();
