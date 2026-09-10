# 🔧 Scripts de Desarrollo - TuGestiónLegal

Estos scripts `.bat` facilitan la ejecución del proyecto durante la fase de desarrollo.

## 📋 Archivos Disponibles

### 1. `start.bat` - Iniciar el servidor

**Qué hace**:
- Verifica que estés en la carpeta correcta
- Instala dependencias si no existen (primer ejecución)
- Verifica que `.env.local` está configurado
- Inicia el servidor de desarrollo en `http://localhost:3000`

**Cuándo usarlo**:
- Después de completar la configuración inicial
- Cada vez que quieras trabajar en la app

**Uso**:
```bash
# Opción 1: Haz doble clic en start.bat
# Opción 2: En PowerShell
.\start.bat
```

---

### 2. `setup-db.bat` - Configurar la base de datos

**Qué hace**:
- Verifica que `.env.local` está configurado
- Instala dependencias si no existen
- Ejecuta las migraciones de Prisma
- Crea la base de datos y tablas

**Cuándo usarlo**:
- PRIMERA VEZ: Después de rellenar `.env.local`
- Si necesitas resetear la BD

**Uso**:
```bash
# Opción 1: Haz doble clic en setup-db.bat
# Opción 2: En PowerShell
.\setup-db.bat
```

**Requisito previo**:
- PostgreSQL debe estar corriendo
- `.env.local` debe estar rellenado con `DATABASE_URL`

---

### 3. `studio.bat` - Abrir Prisma Studio

**Qué hace**:
- Abre Prisma Studio en `http://localhost:5555`
- Permite ver y editar datos de la BD de forma visual
- No requiere servidor corriendo

**Cuándo usarlo**:
- Para ver/editar datos de la BD
- Para debuggear problemas de datos
- Para crear datos de prueba

**Uso**:
```bash
# Opción 1: Haz doble clic en studio.bat
# Opción 2: En PowerShell
.\studio.bat
```

---

## 🚀 Flujo de Configuración Inicial

Sigue estos pasos EN ORDEN:

### Paso 1: Configurar Google Cloud
```
Lee: docs/SETUP_GOOGLE_CLOUD.md
Tiempo: 30-45 minutos
```

### Paso 2: Rellenar `.env.local`
```
Copia: .env.example → .env.local
Edita: Con tus credenciales de Google
       Agrega: DATABASE_URL (PostgreSQL)
```

### Paso 3: Crear Base de Datos
```bash
# Ejecuta PRIMERO setup-db.bat
double-click setup-db.bat

# O en PowerShell:
.\setup-db.bat
```

### Paso 4: Iniciar Servidor
```bash
# Ejecuta DESPUÉS start.bat
double-click start.bat

# O en PowerShell:
.\start.bat
```

### Paso 5: Prueba
```
1. Abre: http://localhost:3000
2. Inicia sesión con Google
3. Crea un trámite de prueba
4. Verifica que se creó carpeta en Drive
```

---

## 🎯 Uso Diario

### Desarrollo Normal
```bash
# Día 1: Setup inicial
.\setup-db.bat          # Configura BD (SOLO PRIMERA VEZ)

# Día 2+: Desarrollo
.\start.bat             # Inicia servidor
                        # Haz cambios en el código
                        # El servidor se reinicia automáticamente
```

### Gestionar Datos
```bash
# En otra ventana (mientras start.bat está corriendo)
.\studio.bat            # Abre Prisma Studio
                        # Ver/editar datos
                        # Crear datos de prueba
```

---

## 📊 Prisma Studio

Interfaz visual para gestionar base de datos:

```
http://localhost:5555

Funcionalidades:
✅ Ver tablas (Cliente, Tramite, Documento, etc.)
✅ Crear registros
✅ Editar registros
✅ Eliminar registros
✅ Filtrar datos
✅ Buscar
```

---

## ⚠️ Problemas Comunes

### Error: "package.json no encontrado"
```
❌ Ejecutas el script desde carpeta incorrecta
✅ Haz doble clic en el .bat DENTRO de c:\Users\Raúl\TUGESTIONLEGAL
```

### Error: ".env.local no encontrado"
```
❌ No has creado .env.local
✅ Pasos:
   1. Copia .env.example a .env.local
   2. Edita .env.local
   3. Rellena DATABASE_URL y credenciales de Google
   4. Ejecuta setup-db.bat
```

### Error: "Cannot connect to database"
```
❌ PostgreSQL no está corriendo
✅ Soluciones:
   1. Instala PostgreSQL (si no está)
   2. Inicia el servicio de PostgreSQL
   3. Verifica DATABASE_URL en .env.local
   4. Verifica que la BD existe: createdb tugestionlegal
```

### Error: "Google credentials not configured"
```
❌ Falta rellenar variables de Google
✅ Edita .env.local y agrega:
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - GOOGLE_SERVICE_ACCOUNT_EMAIL
   - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
   (Ver docs/SETUP_GOOGLE_CLOUD.md)
```

---

## 🔄 Flujo de Desarrollo Típico

```
MAÑANA:
1. start.bat                    # Inicia servidor
2. Edita código (VS Code)
3. El servidor se reinicia automáticamente
4. Prueba cambios en http://localhost:3000
5. Repite paso 2-4

PARA PROBAR DATOS:
1. En otra ventana: studio.bat
2. Ver/crear datos en http://localhost:5555
3. Refresca la app en http://localhost:3000

AL TERMINAR:
1. Presiona Ctrl+C en ventana de start.bat
2. Cierra las ventanas
```

---

## 💡 Tips

### Reiniciar servidor manualmente
```bash
# En ventana de start.bat
Presiona: Ctrl+C
Luego ejecuta: npm run dev
```

### Ver logs del servidor
```bash
# Los logs aparecen en la ventana de start.bat
# Ayudan a debuggear problemas
```

### Crear nueva migración
```bash
# Si cambias schema.prisma:
npx prisma migrate dev --name nombre_de_cambio

# O ejecuta setup-db.bat de nuevo
```

### Resetear BD (perder datos)
```bash
# ⚠️ CUIDADO: Perderás todos los datos
npx prisma migrate reset

# O en PowerShell:
# Edita .env.local, cambia DATABASE_URL a una BD nueva
# Luego ejecuta setup-db.bat
```

---

## 📝 Nota

Los scripts están diseñados para **desarrollo local**.

Para **producción**, usa:
```bash
npm run build
npm run start
```

Consulta `docs/DEPLOYMENT.md` para más detalles.

---

## ✅ Checklist

Antes de usar los scripts:

- [ ] Leí `docs/SETUP_GOOGLE_CLOUD.md`
- [ ] Rellené `.env.local` con credenciales
- [ ] PostgreSQL está instalado
- [ ] PostgreSQL está corriendo
- [ ] npm install completó correctamente
- [ ] node_modules existe

Si marcaste todo ✅, estás listo:

```bash
.\start.bat
```

¡A desarrollar! 🚀
