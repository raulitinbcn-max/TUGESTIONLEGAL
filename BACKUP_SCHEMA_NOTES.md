# ⚠️ IMPORTANTE: Cambios de Schema y Backups

## Estructura actual de clasificación de documentos

### Documentos de ENTRADA (que aporta el cliente)
- Se clasifican usando **CheckDocumento**
- Cada tipo de trámite tiene su lista de requisitos
- Ejemplo: Para Arraigo Sociolaboral: Pasaporte, Certificado antecedentes, Contrato trabajo

### Documentos de SALIDA (que genera el trámite)
- Se clasifican usando **TipoDocumento**
- Ejemplos: Resguardo presentación, Resolución, Requerimiento

### Relaciones
```
TramiteConfiguracion (ej: Arraigo Sociolaboral)
    ↓ checkDocumentos (lista de requisitos)
CheckDocumento (ej: Pasaporte)
    ↓ documentos (archivos subidos)
Documento (archivo que sube el cliente)
```

## Cuando modificas el Schema de Prisma

Si agregas o cambias campos en los modelos de Prisma, **DEBES actualizar también los scripts de backup**:

### Scripts que necesitan actualización:

#### 1. `scripts/auto-backup-drive.js`
- **Función:** Backup del sistema completo
- **Modifica:** La sección que hace `findMany()` de cada tabla
- **Qué cambiar:** Si agregas campos a Cliente, Tramite, etc., agrega los nuevos campos a la consulta

**Ejemplo - Línea ~30-50:**
```javascript
// Si agregas nuevo_campo a Cliente:
clientes: await db.cliente.findMany({
  include: {
    tramites: {
      include: {
        // ... actualizar include también si agrega relaciones
        nuevo_campo: true, // ← AGREGAR AQUI
      },
    },
  },
}),
```

#### 2. `scripts/auto-backup-tramites-drive.js`
- **Función:** Backup de datos de cada trámite
- **Modifica:** El objeto `backupTramite` (~línea 80-110)
- **Qué cambiar:** Agregar nuevos campos al objeto que se serializa

**Ejemplo:**
```javascript
const backupTramite = {
  timestamp: new Date().toISOString(),
  tramite: {
    // ... campos existentes
    nuevo_campo: tramite.nuevo_campo, // ← AGREGAR AQUI
  },
  // ...
}
```

#### 3. `app/api/admin/backup-clientes/route.ts`
- **Función:** Endpoint de backup manual (simplificado, solo sistema)
- **Modifica:** Similar a `auto-backup-drive.js`
- **Línea:** ~30-40

#### 4. `app/api/admin/backup-tramites/route.ts`
- **Función:** Endpoint de backup manual de trámites
- **Modifica:** Objeto `backupTramite` (~línea 50-80)
- **Línea:** Similar a `auto-backup-tramites-drive.js`

#### 5. `scripts/restore-manual.js`
- **Función:** Restaurar configuración desde backup local
- **Modifica:** Operaciones de upsert/create
- **Qué cambiar:** Si agregas campos, asegúrate que la restauración también los incluya

### Checklist cuando modificas schema:

1. ✅ Ejecutar `npx prisma db push --skip-generate`
2. ✅ Actualizar `auto-backup-drive.js` si agrega campos a tablas de config
3. ✅ Actualizar `auto-backup-tramites-drive.js` si agrega campos a Tramite/Cliente
4. ✅ Actualizar endpoints de backup (`backup-clientes/route.ts`, `backup-tramites/route.ts`)
5. ✅ Actualizar `restore-manual.js` si es necesario
6. ✅ Ejecutar al menos una vez `npm run dev` para generar primer backup con nuevos campos
7. ✅ Hacer un backup manual: `npm run backup`

### Ejemplo: Agregar campo "presupuesto" a Tramite

**Paso 1:** Modificar schema.prisma
```prisma
model Tramite {
  // ... campos existentes
  presupuesto      Float?    // ← NUEVO CAMPO
  // ...
}
```

**Paso 2:** Actualizar `auto-backup-tramites-drive.js`
```javascript
const backupTramite = {
  timestamp: new Date().toISOString(),
  tramite: {
    // ... campos existentes
    presupuesto: tramite.presupuesto,  // ← AGREGAR AQUI
  },
  // ...
}
```

**Paso 3:** Actualizar `app/api/admin/backup-tramites/route.ts`
```typescript
tramite: {
  // ... campos existentes
  presupuesto: tramite.presupuesto,  // ← AGREGAR AQUI
},
```

**Paso 4:** Actualizar `scripts/restore-manual.js` si es necesario

**Paso 5:** Ejecutar
```bash
npx prisma db push --skip-generate
npm run dev
```

## Razón de estos cambios

Los scripts de backup serializan los datos a JSON. Si cambias el schema pero no actualizas los scripts:

- ❌ Los nuevos campos NO se guardarán en el backup
- ❌ Si necesitas recuperar datos, perderás esos campos
- ❌ Inconsistencia entre BD y backups

## Comunicación importante

⚠️ **SIEMPRE actualizar estos scripts cuando modifiques el schema de Prisma**

Si olvidas actualizar un script:
1. Los datos nuevos se perderán en el backup
2. Necesitarás recuperar desde el archivo anterior
3. Perderás esos datos nuevos

## Automatización futura

Cuando sea posible, considerar:
- Script de validación que compare schema.prisma con backups
- Generación automática de campos desde schema
- Tests que verifiquen que todos los campos están en backups
