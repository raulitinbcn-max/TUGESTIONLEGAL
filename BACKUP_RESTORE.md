# 💾 Sistema de Backup y Recuperación de Configuración

## ⚡ BACKUP AUTOMÁTICO ACTIVADO

✅ Cada vez que inicias el servidor con `npm run dev`, se crea automáticamente un backup diario.
- Se guarda con fecha: `config-backup-YYYY-MM-DD.json`
- Solo se crea UNO por día (no hace backups duplicados)
- Se mantienen los últimos 10 backups
- Los más antiguos se eliminan automáticamente

---

## ⚠️ IMPORTANTE: Nunca usar `prisma db push --force-reset`

El comando `prisma db push --force-reset` **BORRA TODA LA BASE DE DATOS**. Esto causó la pérdida de:
- Tipos de Documentos
- CheckDocumentos
- Plantillas
- Asociaciones de categorías

### Alternativa segura:
```bash
npx prisma db push --skip-generate
```

---

## ☁️ BACKUP EN GOOGLE DRIVE (Extra Seguridad)

Además del backup local, puedes respaldar la configuración en Google Drive:

```bash
# Subir backup a Google Drive
POST /api/admin/backup-to-drive
Content-Type: application/json

{
  "driveFolderId": "ID-DE-TU-CARPETA-EN-DRIVE"
}
```

**Ventajas:**
- ✓ Backup en la nube (Google Drive)
- ✓ Accesible desde cualquier lugar
- ✓ Integración con cuenta de Google
- ✓ Respaldo adicional al backup local

**Ubicación recomendada:** Crear carpeta `Backups` en Drive y usar su ID.

---

## 📚 Scripts de Backup y Recuperación

### 1. Crear Backup (RECOMENDADO: hacer regularmente)
```bash
npm run backup
# O manualmente:
node scripts/backup-config.js
```

**Qué se guarda:**
- ✓ Categorías de Trámite
- ✓ Tipos de Trámite
- ✓ Tipos de Documento
- ✓ CheckDocumentos
- ✓ Plantillas
- ✓ Configuración de Tasas
- ✓ Documentos Generados

**Ubicación:** `./backups/config-backup-YYYY-MM-DD.json`

**Nota:** Se guardan los últimos 10 backups automáticamente; los más antiguos se eliminan.

---

### 2. Restaurar desde Backup
```bash
npm run restore
# O manualmente:
node scripts/restore-backup.js
```

**Proceso:**
1. Identifica automáticamente el backup más reciente
2. Limpia la base de datos actual
3. Restaura todos los datos desde el backup

⚠️ **CUIDADO:** Esto sobrescribe todos los datos actuales.

---

### 3. Validar Integridad de Configuración
```bash
npm run validate
# O manualmente:
node scripts/validate-config.js
```

**Verifica:**
- ✓ Existencia de categorías
- ✓ Relaciones entre tablas
- ✓ Tipos de documento sin categoría
- ✓ CheckDocumentos asociados a trámites
- ✓ Plantillas válidas
- ✓ Configuración de tasas

**Salida:** Resumen de errores y advertencias

---

### 4. Auditoría Completa
```bash
node scripts/audit-config.js
```

**Muestra:**
- Categorías configuradas
- Tipos de trámite y sus categorías
- Tipos de documento (globales vs específicos)
- CheckDocumentos por tipo
- Plantillas disponibles
- Tasas configuradas
- Análisis de riesgos

---

## 📋 Scripts Disponibles en package.json

Agregar al `package.json`:
```json
{
  "scripts": {
    "backup": "node scripts/backup-config.js",
    "restore": "node scripts/restore-backup.js",
    "validate": "node scripts/validate-config.js",
    "audit": "node scripts/audit-config.js",
    "seed": "node scripts/seed-all.js"
  }
}
```

---

## 🔧 Procedimiento de Seguridad Recomendado

### Antes de cambios importantes:
1. Hacer backup
   ```bash
   npm run backup
   ```

2. Validar configuración actual
   ```bash
   npm run validate
   ```

### Después de cambios:
1. Validar nuevamente
   ```bash
   npm run validate
   ```

2. Si hay errores, restaurar
   ```bash
   npm run restore
   ```

---

## 🚨 En caso de Pérdida de Datos

### Paso 1: Auditar el daño
```bash
npm run audit
```

### Paso 2: Restaurar desde backup
```bash
npm run restore
```

### Paso 3: Validar restauración
```bash
npm run validate
```

### Paso 4: Hacer nuevo backup
```bash
npm run backup
```

---

## 📁 Estructura de Backups

```
TUGESTIONLEGAL/
├── backups/
│   ├── config-backup-2026-09-09.json
│   ├── config-backup-2026-09-08.json
│   └── config-backup-2026-09-07.json
└── scripts/
    ├── backup-config.js
    ├── restore-backup.js
    ├── validate-config.js
    ├── audit-config.js
    └── seed-all.js
```

---

## ✅ Checklist de Seguridad

- [ ] Backup automático antes de cambios importantes
- [ ] Validación después de cambios
- [ ] Auditoría semanal de configuración
- [ ] Mantener backups en lugar seguro (considerar cloud backup)
- [ ] NUNCA usar `prisma db push --force-reset`
- [ ] Usar `prisma db push --skip-generate` en cambios de schema

---

## 📝 Comandos Rápidos

```bash
# Hacer backup
npm run backup

# Validar todo
npm run validate

# Ver estado completo
npm run audit

# Restaurar (si algo se rompió)
npm run restore

# Recrear datos iniciales
npm run seed
```

---

## 🆘 Contacto / Soporte

Si hay pérdida de datos:
1. NO hacer más cambios
2. Hacer backup del estado actual (para análisis)
3. Restaurar desde el backup más reciente
4. Validar la restauración
5. Contactar soporte si hay problemas

---

**Última actualización:** 2026-09-09
**Versión:** 1.0
