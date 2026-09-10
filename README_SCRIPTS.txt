╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                   ⚡ SCRIPTS DE DESARROLLO CREADOS                          ║
║                                                                              ║
║                        TuGestiónLegal Fase 1 MVP                           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

✅ SE HAN CREADO 3 SCRIPTS WINDOWS (.BAT):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. start.bat
   Inicia el servidor de desarrollo en http://localhost:3000
   Uso: Doble clic o: .\start.bat
   Cuándo: Cada vez que quieras trabajar

2. setup-db.bat
   Configura la base de datos PostgreSQL
   Uso: Doble clic o: .\setup-db.bat
   Cuándo: PRIMERA VEZ (después de rellenar .env.local)
   Requiere: PostgreSQL corriendo

3. studio.bat
   Abre Prisma Studio (gestor visual de BD) en http://localhost:5555
   Uso: Doble clic o: .\studio.bat
   Cuándo: Para ver/editar datos sin SQL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 CONFIGURACIÓN INICIAL (PASO A PASO):

1. Lee documentación
   Archivo: docs/SETUP_GOOGLE_CLOUD.md
   Tiempo: 30-45 minutos

2. Configura .env.local
   Copia: .env.example → .env.local
   Edita: Rellena todas las variables
   CRÍTICO: DATABASE_URL y credenciales de Google

3. Configura base de datos
   Ejecuta: setup-db.bat (doble clic)
   Requiere: PostgreSQL corriendo

4. Inicia servidor
   Ejecuta: start.bat (doble clic)
   Acceso: http://localhost:3000

5. Prueba
   Login con Google
   Crea un trámite de prueba
   Verifica carpeta en Google Drive

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 USO DIARIO (DESPUÉS DE CONFIGURAR):

OPCIÓN A - Desarrollo Normal:
  1. Doble clic en start.bat
  2. Edita código en VS Code
  3. Los cambios se aplican automáticamente
  4. Prueba en http://localhost:3000

OPCIÓN B - Con Gestión de Datos:
  1. Doble clic en start.bat (en una ventana)
  2. Doble clic en studio.bat (en otra ventana)
  3. Edita código en VS Code
  4. Gestiona datos en http://localhost:5555
  5. Prueba en http://localhost:3000

OPCIÓN C - Solo Gestión de Datos:
  1. Doble clic en studio.bat
  2. Ver/crear/editar datos en http://localhost:5555

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 TROUBLESHOOTING:

ERROR: "package.json no encontrado"
  → Ejecuta desde: c:\Users\Raúl\TUGESTIONLEGAL

ERROR: ".env.local no encontrado"
  → Copia .env.example a .env.local
  → Rellena con tus variables

ERROR: "Cannot connect to database"
  → Inicia PostgreSQL
  → Verifica DATABASE_URL en .env.local

ERROR: "Google credentials not configured"
  → Rellena variables de Google en .env.local
  → Ve a: docs/SETUP_GOOGLE_CLOUD.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 TIPS:

• Hot-Reload: Los cambios en código se reflejan instantáneamente
• Múltiples Ventanas: Puedes ejecutar start.bat + studio.bat + PowerShell
• Logs de error: Aparecen en la ventana de start.bat
• Presiona Ctrl+C para detener cualquier script

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ LISTO PARA EMPEZAR:

1. Doble clic en: setup-db.bat (configura BD)
2. Doble clic en: start.bat (inicia server)
3. Abre: http://localhost:3000
4. Inicia sesión con Google
5. ¡A desarrollar!

Más detalles: Lee SCRIPTS.md

╔══════════════════════════════════════════════════════════════════════════════╗
║                   Los scripts manejan TODA la complejidad                    ║
║              Solo necesitas: .env.local configurado + dos clics              ║
║                       ¡Desarrollo sin complicaciones! ⚡                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
