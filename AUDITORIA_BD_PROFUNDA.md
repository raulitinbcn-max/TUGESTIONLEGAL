# 🔬 AUDITORÍA PROFUNDA DEL SISTEMA DE BASE DE DATOS - TuGestiónLegal

**Fecha:** 2026-09-10  
**Nivel de Análisis:** EXHAUSTIVO  
**Versión del Schema:** Post-correcciones

---

## 📋 RESUMEN EJECUTIVO

| Categoría | Status | Score |
|-----------|--------|-------|
| Integridad Referencial | ⚠️ CRÍTICO | 3/10 |
| Datos Redundantes | 🔴 CRÍTICO | 2/10 |
| Lógica de Negocio | 🟡 ADVERTENCIA | 5/10 |
| Performance | 🟢 BUENO | 7/10 |
| Constraints | 🟡 ADVERTENCIA | 4/10 |
| **CALIFICACIÓN GENERAL** | **⚠️ CRÍTICO** | **4.2/10** |

---

## 🔴 PROBLEMAS CRÍTICOS DESCUBIERTOS

### 1. **PROBLEMA FUNDAMENTAL: Incoherencia en TasaConfiguracion**

```
CRÍTICO - ARQUITECTURA INCORRECTA

Actual:
model TasaConfiguracion {
  id                String   @id
  tramiteConfigId   String   @unique  ← ¿Por qué @unique?
  tramiteConfig     TramiteConfiguracion
  nombre            String
  importe           Float
}

ISSUE: Si es 1-a-1 y @unique, significa que CADA TramiteConfiguracion 
        tiene UNA Y SOLO UNA tasa. Pero en la realidad:
        - Un trámite puede tener MÚLTIPLES tasas
        - El campo "nombre" sugiere varias tasas por trámite
        
RESULTADO: 
  ❌ No se pueden guardar múltiples tasas por trámite
  ❌ La segunda tasa para un trámite FALLA
  ❌ API /api/admin/tasas-config esperaba estructura diferente
```

**Solución correcta:**
```prisma
model TasaConfiguracion {
  id                String   @id
  tramiteConfigId   String   // Sin @unique
  tramiteConfig     TramiteConfiguracion @relation(fields: [tramiteConfigId], references: [id])
  nombre            String
  importe           Float
  
  @@unique([tramiteConfigId, nombre])  // Unique por trámite + nombre
}
```

---

### 2. **PROBLEMA CRÍTICO: Documento → CheckDocumento relación defectuosa**

```
CRÍTICO - LÓGICA DE NEGOCIO ROTA

Actual:
model Documento {
  checkDocumento    CheckDocumento? @relation(fields: [checkDocumentoId])
  checkDocumentoId  String?
}

model CheckDocumento {
  documentos        Documento[]  ← Relación inversa
}

ISSUE: CheckDocumento es una PLANTILLA (la definición de qué docs 
       se necesitan en un checklist). Documento es una INSTANCIA 
       (un doc real subido).
       
La relación debería ser: Documento pertenece a Tramite, 
y Tramite asocia Documento con su checklist mediante ChecklistItem

RESULTADO:
  ❌ Un CheckDocumento (plantilla) referencia múltiples Documentos (instancias)
  ❌ Cuando borras CheckDocumento, borras TODOS los documentos instanciados
  ❌ Clasificación de documentos quebrada
```

**Solución correcta:**
```
CheckDocumento → es plantilla de → ChecklistItem → referencia → Documento
No debe haber relación directa CheckDocumento → Documento
```

---

### 3. **PROBLEMA CRÍTICO: Tasa vs TasaConfiguracion confusión**

```
CRÍTICO - DOS MODELOS CON PROPÓSITOS CONTRADICTORIOS

Actual:
model Tasa {  // Tasas específicas de UN trámite
  tramiteId   String
  nombre      String
  importe     Float
}

model TasaConfiguracion {  // Tasas configuradas globalmente
  tramiteConfigId String
  nombre          String
  importe         Float
}

ISSUE: 
  - Tasa: Instancias reales de tasas asignadas a cada trámite
  - TasaConfiguracion: Plantillas de tasas configurables
  
Pero NO está claro cuál es la relación entre ellas:
  ❌ ¿Tasa hereda valores de TasaConfiguracion?
  ❌ ¿O son independientes?
  ❌ ¿Cuándo usar una u otra?
  ❌ ¿Qué pasa si borro TasaConfiguracion?

Código hace referencias a ambas indistintamente.
```

**Solución:** Definir claramente: TasaConfiguracion es plantilla, 
            Tasa es instancia. Tasa NO debe tener su propia tabla,
            sino que hereda de TasaConfiguracion.

---

### 4. **PROBLEMA CRÍTICO: Plantilla → Documento confusion**

```
CRÍTICO - TIPOS DE DOCUMENTOS SIN JERARQUÍA CLARA

Actual en Plantilla:
  tipo        String  ← Ej: "checklist", "contrato"
  nombre      String  ← Ej: "Checklist Arraigo"
  
En TipoDocumento:
  nombre      String  ← Ej: "Recibo", "Resolución"

En Documento:
  tipoDocumento   String  ← ¿Referencia a Plantilla.tipo o TipoDocumento.nombre?
  
ISSUE: No está claro qué es qué:
  ❌ ¿Plantilla.tipo es un tipo de documento?
  ❌ ¿O es una plantilla específica de un tipo?
  ❌ Documento.tipoDocumento debería ser FK, no String
  ❌ Clasificación manual (UI) vs automática sin jerarquía clara

RESULTADO: Imposible rastrear de qué plantilla vino un documento
```

---

### 5. **PROBLEMA CRÍTICO: ChecklistItem tiene información duplicada**

```
CRÍTICO - DATOS DUPLICADOS Y CONTRADICTORIOS

model ChecklistItem {
  nombre            String     ← Nombre del item
  tipoVencimiento   String?    ← ¿De dónde sacas esto?
  fechaCaducidad    DateTime?  ← ¿De dónde sacas esto?
}

model CheckDocumento {
  nombre            String     ← Es la misma cosa
  tipoVencimiento   String?    ← La plantilla tiene esto
  diasCaducidad     Int?       ← Aquí están los días
}

ISSUE:
  ❌ ChecklistItem.tipoVencimiento se DUPLICA de CheckDocumento
  ❌ ChecklistItem.fechaCaducidad debe calcularse de CheckDocumento.diasCaducidad
  ❌ ¿Quién actualiza esto? ¿Quién lo sincroniza?
  ❌ Si cambias CheckDocumento, ¿qué pasa con ChecklistItems existentes?

RESULTADO: Datos inconsistentes y desincronizados
```

---

## 🟡 PROBLEMAS GRAVES (Nivel Advertencia)

### 6. **Documento.tipoDocumento es String sin FK**

```
GRAVE - Sin validación de tipos

Actual:
  tipoDocumento     String   ← Libre
  
Debería:
  tipoDocumentoId   String   ← FK a TipoDocumento
  
IMPACTO:
  ❌ Cualquier string es válido ("faxtura", "reciboo", typos)
  ❌ Sin auditoría de cambios en tipo de documento
  ❌ Reportes por tipo de documento quebrados
  ❌ Búsquedas y filtros no confiables
```

---

### 7. **Documento.origen es String sin enum**

```
GRAVE - Sin validación

Actual:
  origen   String @default("manual")  ← Podría ser cualquier cosa
  
Debería:
  origen   String @default("manual")  ← Con validación en aplicación
  
PERO: SQLite no soporta ENUM nativamente en Prisma
SOLUCIÓN: Validar en API routes y enums en TypeScript
```

---

### 8. **DocumentoGenerado.plantillaId sin onDelete**

```
GRAVE - Cascada incompleta

model DocumentoGenerado {
  plantillaId  String
  plantilla    Plantilla @relation(fields: [plantillaId], references: [id])
                         ↑ Sin onDelete especificado
}

IMPACTO:
  ❌ Si borras Plantilla, quedan DocumentosGenerados huérfanos
  ❌ ¿Qué pasa con el documento en Drive?
  ❌ ¿Quebra la integridad?
```

---

### 9. **Vencimiento sin relación con Tasa**

```
GRAVE - Auditoría perdida

model Vencimiento {
  tramiteId     String
  numeroVencimiento Int
  importe       Float  ← ¿De dónde sacas el importe?
}

model Tasa {
  tramiteId     String
  importe       Float
}

IMPACTO:
  ❌ ¿Vencimiento.importe debe venir de Tasa?
  ❌ ¿O son independientes?
  ❌ Si cambias Tasa, ¿afecta Vencimientos existentes?
  ❌ No se puede rastrear: "este vencimiento viene de esta tasa"
```

---

### 10. **HistorialEstado.usuario es String sin auditoría**

```
GRAVE - Sin trazabilidad de usuario

model HistorialEstado {
  usuario     String  ← Solo nombre, sin FK
}

IMPACTO:
  ❌ Cualquiera puede decir que fue otro usuario
  ❌ Sin verificación de usuarios válidos
  ❌ Si borro usuario, registro queda con nombre inválido
  ❌ Sin auditoría de seguridad
```

---

## 🔍 INCONSISTENCIAS DE LÓGICA DE NEGOCIO

### 11. **TramiteConfiguracion.categoria es String**

```
Actual:
  categoria     String?  ← Nombre de categoría como string

Debería:
  categoriaId   String?  ← FK a CategoriasTramite
  
Pero: Tramite YA tiene categoriaId

CONFUSIÓN:
  ❌ ¿Un trámite tiene una categoría (Tramite.categoriaId)?
  ❌ ¿Y una configuración de trámite TAMBIÉN (TramiteConfiguracion.categoria como String)?
  ❌ ¿Cuál es la fuente de verdad?
```

---

### 12. **Cascada Restrict en Tramite → TramiteConfiguracion muy severa**

```
model Tramite {
  tramiteConfig   TramiteConfiguracion @relation(..., onDelete: Restrict)
}

IMPACTO:
  ❌ No puedes nunca borrar una TramiteConfiguracion si tiene Trámites
  ❌ La estructura queda "congelada" en production
  ❌ Imposible hacer soft-delete de tipos de trámite
  ❌ Acumula datos históricos sin poder limpiar
```

---

### 13. **Plantilla.tipo es STRING sin relación a nada**

```
model Plantilla {
  tipo              String  ← "checklist", "contrato", etc.
  tramiteConfigId   String  ← FK a TramiteConfiguracion
}

IMPACTO:
  ❌ ¿Qué valores son válidos para "tipo"?
  ❌ Si TramiteConfiguracion especifica qué tipos de plantilla 
     necesita, no está definido
  ❌ Sin validación = typos = documentos no generados
```

---

### 14. **Cliente.email sin @unique**

```
model Cliente {
  email   String?  ← Sin @unique
}

IMPACTO:
  ❌ Dos clientes pueden tener el mismo email
  ❌ Búsquedas de cliente por email devuelven múltiples resultados
  ❌ API /api/clientes/:email ambigua
```

---

### 15. **Documento sin índice compuesto (tramiteId, tipoDocumento)**

```
Actual:
  @@index([tramiteId])
  
Debería:
  @@index([tramiteId, tipoDocumento])  ← Para queries: 
                                          "dame todos los documentos 
                                           de este trámite de tipo X"
```

---

## 📊 TABLA DE INCONSISTENCIAS

| Tabla | Campo | Problema | Severidad |
|-------|-------|----------|-----------|
| TasaConfiguracion | tramiteConfigId | @unique incorrecto (debería ser múltiples) | 🔴 CRÍTICO |
| Documento | checkDocumentoId | Relación conceptual incorrecta | 🔴 CRÍTICO |
| ChecklistItem | tipoVencimiento, fechaCaducidad | Duplicados de CheckDocumento | 🔴 CRÍTICO |
| Documento | tipoDocumento | String en lugar de FK | 🟡 GRAVE |
| DocumentoGenerado | plantillaId | Sin onDelete | 🟡 GRAVE |
| HistorialEstado | usuario | Sin FK/validación | 🟡 GRAVE |
| Plantilla | tipo | String sin enum/validación | 🟡 GRAVE |
| Tramite | tramiteConfig | Cascada Restrict demasiado severa | 🟡 GRAVE |
| Cliente | email | Sin @unique | 🟡 GRAVE |
| Vencimiento | Sin relación Tasa | Auditoría perdida | 🟡 GRAVE |
| TramiteConfiguracion | categoria | String vs Tramite.categoriaId confuso | 🟡 GRAVE |

---

## 🛠️ PLAN DE ACCIÓN URGENTE

### **FASE 1: CRÍTICO (Debe hacerse YA)**

1. **Arreglar TasaConfiguracion**
   ```
   Quitar @unique de tramiteConfigId
   Agregar @@unique([tramiteConfigId, nombre])
   ```

2. **Eliminar relación Documento → CheckDocumento**
   ```
   Eliminar checkDocumentoId de Documento
   Eliminar documentos[] de CheckDocumento
   La relación debería ser solo a través de ChecklistItem
   ```

3. **Consolidar ChecklistItem**
   ```
   Eliminar tipoVencimiento duplicado (leer de CheckDocumento)
   Eliminar fechaCaducidad (calcularla en aplicación desde diasCaducidad)
   Agregar checkDocumentoId FK en lugar de guardar nombre
   ```

### **FASE 2: GRAVE (Próxima sprint)**

4. Documento.tipoDocumento → FK a TipoDocumento
5. Agregar Cliente.email @unique
6. DocumentoGenerado.plantillaId agregar onDelete: Cascade
7. Vencimiento → relación con Tasa

### **FASE 3: IMPORTANTE (Roadmap)**

8. HistorialEstado → relación User (cuando exista tabla)
9. Plantilla.tipo → definir valores válidos/constrain
10. Revisar Cascada Restrict → cambiar a SetNull o Cascade según negocio

---

## 📈 IMPACTO ACTUAL

- **APIs Afectadas:**
  - POST /api/admin/tasas-config (solo guarda 1 tasa por trámite)
  - POST /api/tramites (checkslistItem duplica datos)
  - GET /api/documentos (tipoDocumento sin validación)

- **UI Afectada:**
  - Formulario de nuevas tasas (no permite múltiples)
  - Clasificación de documentos (sin validación de tipos)
  - Búsqueda de clientes por email (devuelve múltiples)

- **Datos en Riesgo:**
  - ChecklistItems desincronizados si CheckDocumento cambia
  - Documentos huérfanos si eliminas Plantilla
  - Vencimientos sin trazabilidad a Tasas

---

## 🎯 CONCLUSIÓN

**Calificación ACTUAL: 4.2/10 (CRÍTICO)**

La corrección anterior (FK's) arregló la **integridad referencial** pero 
expuso problemas CONCEPTUALES más profundos:

- ❌ Modelos confusos (Tasa vs TasaConfiguracion, CheckDocumento vs Documento)
- ❌ Datos duplicados (ChecklistItem copia de CheckDocumento)
- ❌ Relaciones conceptuales incorrectas (Documento ↔ CheckDocumento)
- ❌ Falta validación (tipoDocumento, origen, plantillaType)
- ❌ Cascadas de borrado sin política clara

**Esto no es un schema incorrecto desde el punto de vista relacional,**
**sino un schema que no modela correctamente la REALIDAD DEL NEGOCIO.**

---

**Auditoría realizada:** 2026-09-10 16:30  
**Status:** ⚠️ REQUIERE REDISEÑO CONCEPTUAL  
**Prioridad:** ALTA - Afecta integridad de datos en producción

