const http = require('http');

async function syncFromDrive() {
  console.log('🔄 Sincronizando datos desde Google Drive...\n');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/sync-from-drive',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': 0,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);

          if (res.statusCode === 401) {
            console.error('❌ Error de autenticación. Necesitas estar logueado.');
            console.log('\n⚠️  Este script requiere que hayas iniciado sesión en la web.');
            console.log('   1. Abre http://localhost:3000 en el navegador');
            console.log('   2. Inicia sesión con Google');
            console.log('   3. Intenta de nuevo\n');
            reject(new Error('Not authenticated'));
          } else if (result.success) {
            console.log('✨ Sincronización completada:\n');
            console.log(`   ✅ Clientes creados: ${result.clientesCreados}`);
            console.log(`   ✅ Trámites creados: ${result.tramitesCreados}`);
            console.log(`   📅 Timestamp: ${result.timestamp}\n`);
            resolve(result);
          } else {
            console.error('❌ Error:', result.error);
            reject(new Error(result.error));
          }
        } catch (e) {
          console.error('❌ Error al parsear respuesta:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error de conexión:', error.message);
      console.log('\n⚠️  ¿El servidor está corriendo? Intenta:');
      console.log('   npm run dev\n');
      reject(error);
    });

    req.end();
  });
}

syncFromDrive()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Sincronización fallida');
    process.exit(1);
  });
