# 🔧 Admin: Deshabilitar Restricción de Claves de Servicio

Como administrador, tienes que desactivar la política de organización que bloquea las claves JSON.

## Paso a Paso (5 minutos)

### Paso 1: Ir a Políticas de la Organización

1. Abre: [Google Cloud Console](https://console.cloud.google.com)
2. En la barra de búsqueda superior, busca: `Políticas de la organización`
3. Haz clic en el resultado
4. O ve a: **IAM y administración** → **Políticas de la organización**

### Paso 2: Encontrar la Política de Claves de Servicio

1. En la página de Políticas, ves una lista de políticas aplicadas
2. Busca: `Disable service account key creation`
3. Si no la ves, usa Ctrl+F y busca: `service account key`

### Paso 3: Desactivar la Política

**Opción A: Desactivar para toda la organización** (MÁS SIMPLE)

1. Haz clic en: `Disable service account key creation`
2. En la página que abre, verás el estado: **"Aplicado"**
3. Haz clic en el botón: **"Editar política"**
4. En el dropdown superior, cambia de: **"Aplicar"** a: **"No aplicar"**
5. Haz clic en: **"Actualizar política"**
6. Confirma el cambio
7. ✅ Listo

**Opción B: Permitir excepciones solo para tu proyecto** (MÁS SEGURO)

1. Haz clic en: `Disable service account key creation`
2. Haz clic en: **"Editar política"**
3. En la sección: **"Restricciones y excepciones"**
4. Haz clic en: **"Añadir excepción"**
5. Selecciona: **"Proyecto"**
6. Escribe el nombre o ID de tu proyecto: `tugestionlegal` o su ID
7. Haz clic en: **"Añadir"**
8. Haz clic en: **"Actualizar política"**
9. ✅ Listo

---

## Opción Recomendada

**Usa Opción B** (excepciones):
- ✅ Más seguro (solo tu proyecto puede crear claves)
- ✅ Mantiene la política para el resto de la organización
- ✅ Cumple políticas de seguridad empresarial

---

## Verificar que Funcionó

1. Vuelve a Google Cloud Console
2. Ve a: **IAM y administración** → **Cuentas de servicio**
3. Haz clic en tu cuenta: `tugestionlegal-service`
4. Ve a pestaña: **"Claves"**
5. Haz clic en: **"Agregar clave"** → **"Crear clave nueva"**
6. Selecciona: **"JSON"**
7. Haz clic en: **"Crear"**
8. Se descargará un archivo JSON
9. ✅ ¡Funcionó!

---

## Si No Ves la Opción "Editar Política"

Significa que NO tienes permisos suficientes. Necesitas:
- Rol: `Administrador de políticas de la organización`
- O rol: `Administrador de IAM`

Verifica tus permisos:
1. Ve a: **IAM y administración** → **IAM**
2. Busca tu cuenta (email)
3. Verifica que tiene rol: `organizationPolicy.policyAdmin` o similar

---

## Alternativa: Si NO es una Política de Organización

Si no ves "Políticas de la organización" o no aparece la restricción:

Puede ser una **política a nivel de proyecto** en lugar de organización:

1. Ve a: **IAM y administración** → **Políticas de la organización**
2. Busca pestañas o secciones para: **"A nivel de proyecto"**
3. Sigue los mismos pasos anteriores

---

## Después de Desactivar

Una vez desactivada la política:

1. Vuelve a: [docs/SETUP_GOOGLE_CLOUD.md](./SETUP_GOOGLE_CLOUD.md)
2. Sigue el paso: **4. Generar Clave JSON**
3. Descarga el archivo JSON
4. Copia las credenciales a `.env.local`
5. ¡Continúa con el setup!

---

## Tiempo Total

- Desactivar política: **2-3 minutos**
- Generar clave JSON: **2 minutos**
- Total: **5 minutos**

---

## ¿Problemas?

Si no puedes editar la política:

1. Verifica que eres Administrador de la Organización
2. Puede haber otra política adicional bloqueando cambios
3. Contacta a Google Cloud Support

---

## Resumen Rápido

```
1. Google Cloud Console
2. Búsqueda: "Políticas de la organización"
3. Busca: "Disable service account key creation"
4. Haz clic → Editar política
5. Cambia a: "No aplicar" O añade excepcción
6. Guarda
7. ✅ Listo en 5 minutos
```

¡Ahora puedes generar la clave JSON! 🎉
