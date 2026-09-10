# 🔧 Deshabilitar Política - Paso a Paso (CON SCREENSHOTS)

Ya encontraste la política. Ahora a desactivarla.

## Lo que ves ahora:

```
La restricción heredada "iam.disableServiceAccountKeyCreation" está activa.
Se aplica a: Proyecto "TUGESTIONLEGAL"
Estado: No aplicada
```

## Paso a Paso para Desactivarla

### 1. Busca el botón "Editar política"

En la página que ves ahora, debe haber un botón azul que dice:
- **"Editar política"** o
- **"Edit policy"** o
- Un lápiz ✏️ 

Si no lo ves, busca en la parte superior derecha de la pantalla.

### 2. Haz clic en "Editar política"

Se abrirá un panel o página de edición.

### 3. Busca la sección "Restricciones"

Verás algo como:
```
Restricciones activas:
- Disable service account key creation
```

### 4. Cambia el estado

Busca una opción que diga:
- **"Aplicar"** o **"Enforce"** (actualmente activada)
- Cámbialo a: **"No aplicar"** o **"Unenforce"**

### 5. Busca excepciones (Opcional pero Recomendado)

Si ves una sección de **"Excepciones"** o **"Custom constraints"**, haz clic en:
- **"Añadir excepción"** o **"Add exception"**
- Selecciona: **"Proyecto"** o **"Project"**
- Escribe: `TUGESTIONLEGAL` (tu proyecto)
- Haz clic en: **"Añadir"**

Esto permite que TU proyecto cree claves, pero el resto de la organización mantiene la restricción.

### 6. Guarda los cambios

Busca un botón:
- **"Guardar"** o **"Save"** o
- **"Actualizar política"** o **"Update policy"**

Haz clic en él.

### 7. Confirma

Si te pide confirmación, haz clic en **"Confirmar"** o **"Confirm"**.

## Espera a que se aplique

La política puede tardar **1-5 minutos** en aplicarse. Verás un mensaje:
- "Cambio procesándose..." o
- "Policy updating..."

Espera a que se complete.

## Verifica que funcionó

Después de que se aplique:

1. Ve a: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Haz clic en: `tugestionlegal-service`
3. Ve a pestaña: **"Claves"**
4. Haz clic en: **"Agregar clave"** → **"Crear clave nueva"**
5. Selecciona: **"JSON"**
6. Haz clic en: **"Crear"**

Si descarga un archivo JSON, ✅ **¡Funcionó!**

## Si No Funciona Todavía

### Problema 1: "Aún está activa"

Espera 5-10 minutos más. Las políticas tardan en propagarse.

### Problema 2: "Sigue diciendo que está heredada"

La restricción viene del elemento superior (tu organización).

**Solución**:
1. Sube un nivel en la jerarquía
2. Ve a: **Organización** (no proyecto)
3. Busca la misma política
4. Desactívala a nivel de organización

### Problema 3: "No veo botón de editar"

Puede ser que:
- No tienes permisos de admin
- O la política está bloqueada por otra política superior

**Solución**:
- Verifica que eres Administrador de la Organización
- Contacta al admin superior si la jerarquía es compleja

---

## Alternativa: Crear Excepción a Nivel de Organización

Si la política viene de la organización:

1. Ve a: https://console.cloud.google.com/iam-admin/orgpolicies
2. Busca: `Disable service account key creation`
3. Haz clic en ella
4. Haz clic en: **"Editar política"**
5. En **"Excepciones"**, añade tu proyecto
6. Guarda

---

## Resumen Rápido

```
1. Estás en la página de la política ✅
2. Busca: botón "Editar política"
3. Cambia "Aplicar" → "No aplicar"
4. O crea una excepción para tu proyecto
5. Guarda
6. Espera 1-5 minutos
7. Verifica en: Cuentas de servicio → Crear clave
```

---

## Si Aún Tienes Dudas

Cuéntame:
1. ¿Ves el botón "Editar política"?
2. ¿Qué opciones ves en el panel de edición?
3. ¿Hay una sección de "Restricciones" o "Exceptions"?

Con eso puedo ayudarte mejor. 🚀
