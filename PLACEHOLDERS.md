# Placeholders para Generación de Documentos

Este documento lista todos los placeholders disponibles para usar en las plantillas de Google Docs. Se reemplazan automáticamente al generar un documento.

## Placeholders de Cliente

| Placeholder | Descripción | Ejemplo |
|---|---|---|
| `{{NOMBRE_CLIENTE}}` | Nombre completo del cliente (MAYÚSCULAS para documentos formales) | JUAN GARCÍA PÉREZ |
| `{{NOMBRE_CLIENTE_NORMAL}}` | Nombre del cliente con capitalización normal | Juan García Pérez |
| `{{EMAIL_CLIENTE}}` | Email del cliente | juan@example.com |
| `{{TELEFONO_CLIENTE}}` | Teléfono de contacto | +34 912 345 678 |
| `{{NACIONALIDAD_CLIENTE}}` | Nacionalidad del cliente | Española |
| `{{NUMERO_PASAPORTE}}` | Número de pasaporte | 12345678A |
| `{{FECHA_NACIMIENTO}}` | Fecha de nacimiento (formato DD/MM/YYYY) | 15/03/1990 |

## Placeholders de Dirección

| Placeholder | Descripción | Ejemplo |
|---|---|---|
| `{{CALLE, NÚMERO, PISO Y PORTAL}}` | Calle, número, piso y portal | Calle Principal, 123, 3º B |
| `{{CÓDIGO POSTAL}}` | Código postal | 28001 |
| `{{POBLACIÓN}}` | Población/Ciudad | Madrid |
| `{{PROVINCIA}}` | Provincia | Madrid |
| `{{DIRECCIÓN COMPLETA}}` | Dirección ensamblada completa | Calle Principal, 123, 3º B, 28001 Madrid (Madrid) |

## Placeholders de Trámite

| Placeholder | Descripción | Ejemplo |
|---|---|---|
| `{{CODIGO_TRAMITE}}` | Código único del trámite | TR-00234 |
| `{{TIPO_TRAMITE}}` | Tipo de trámite | Arraigo Sociolaboral |
| `{{ESTADO_TRAMITE}}` | Estado actual del trámite | Pendiente respuesta |

## Placeholders Financieros

### Honorarios e Impuestos

| Placeholder | Descripción | Ejemplo |
|---|---|---|
| `{{HONORARIOS}}` | Importe de honorarios sin IVA | 500,00 € |
| `{{PORCENTAJE_IVA}}` | Porcentaje de IVA | 21% |
| `{{IMPORTE_IVA}}` | Importe del IVA | 105,00 € |
| `{{TOTAL_HONORARIOS}}` | Total honorarios + IVA | 605,00 € |
| `{{SUPLIDOS}}` | Total de suplidos/tasas | 38,28 € |
| `{{TOTAL_GENERAL}}` | Total general (honorarios + IVA + suplidos) | 643,28 € |

### Desglose de Tasas

| Placeholder | Descripción | Ejemplo |
|---|---|---|
| `{{NOMBRE_SUPLIDOS}}` | Nombre de los suplidos configurados | Tramitación, Registro |
| `{{TASAS_DESGLOSE}}` | Desglose completo de tasas | Tramitación: 38,28€, Registro: 150,00€ |

## Placeholders de Vencimientos

| Placeholder | Descripción | Ejemplo |
|---|---|---|
| `{{NÚMERO_VENCIMIENTO}}` | Número secuencial del vencimiento | 1 |
| `{{FECHA_VENCIMIENTO}}` | Fecha del vencimiento (DD/MM/YYYY) | 15/11/2026 |
| `{{IMPORTE_VENCIMIENTO}}` | Importe del vencimiento sin símbolo | 321,64 |
| `{{IMPORTE_VENCIMIENTO_LETRAS}}` | Importe en letras (español) | trescientos veintiuno euros con sesenta y cuatro céntimos |
| `{{IMPORTE_VENCIMIENTO_EURO}}` | Importe con símbolo € | 321,64 € |
| `{{FORMA_PAGO}}` | Forma de pago del vencimiento | Transferencia bancaria |
| `{{TABLA_VENCIMIENTOS}}` | Tabla completa de todos los vencimientos | (Ver formato más abajo) |

### Formato de TABLA_VENCIMIENTOS

```
Nº | Fecha Vencimiento | Importe
1  | 15/11/2026       | 321,64 €
2  | 15/12/2026       | 321,64 €
3  | 15/01/2027       | 321,64 €
```

## Placeholders de Pago (Recibos)

| Placeholder | Descripción | Ejemplo |
|---|---|---|
| `{{FECHA_PAGO}}` | Fecha en que se realizó el pago | 20/11/2026 |
| `{{NOTAS_PAGO}}` | Notas o concepto del pago | Pago realizado en efectivo en oficina |

## Placeholders de Fechas

| Placeholder | Descripción | Ejemplo |
|---|---|---|
| `{{FECHA_HOY}}` | Fecha actual (DD/MM/YYYY) | 09/09/2026 |
| `{{FECHA_HORA_HOY}}` | Fecha y hora actual | 09/09/2026 15:30 |

## Placeholders de Plan de Pago

| Placeholder | Descripción | Ejemplo |
|---|---|---|
| `{{PLAN_PAGO}}` | Tipo de plan de pago configurado | Fraccionado |
| `{{NUMERO_CUOTAS}}` | Número total de cuotas/vencimientos | 3 |
| `{{IMPORTE_CUOTA}}` | Importe de cada cuota | 321,64 € |

## Notas de Implementación

### Formatos Decimales
- Todos los importes usan **coma (,)** como separador decimal
- Formato: `XXX,XX` (ej: 1.234,56)
- El símbolo € va separado por un espacio: `1.234,56 €`

### Fechas
- Formato estándar: `DD/MM/YYYY`
- Ejemplo: `15/11/2026`
- Meses en español: Enero, Febrero, etc.

### Texto en Mayúsculas
- **Documentos formales** (Mandato, Contrato, Fraccionamiento, Autorización, Renuncia): Nombre cliente en MAYÚSCULAS
- **Recibos**: Nombre cliente con capitalización normal (Primera letra mayúscula de cada palabra)
- **Facturas/Proformas**: Nombre cliente en MAYÚSCULAS

### Números a Letras
- Se usa para `{{IMPORTE_VENCIMIENTO_LETRAS}}`
- Siempre en **minúsculas**
- Formato: `trescientos veintiuno euros con sesenta y cuatro céntimos`
- Rango soportado: 0,01€ - 999.999,99€

## Ejemplo de Uso en Plantilla

```
Estimado/a {{NOMBRE_CLIENTE}},

Por este medio confirmamos que ha recibido el pago correspondiente al vencimiento {{NÚMERO_VENCIMIENTO}} de su trámite {{CODIGO_TRAMITE}}.

DATOS DEL PAGO:
- Vencimiento: {{NÚMERO_VENCIMIENTO}}
- Fecha de vencimiento: {{FECHA_VENCIMIENTO}}
- Importe: {{IMPORTE_VENCIMIENTO_LETRAS}}
- Forma de pago: {{FORMA_PAGO}}
- Fecha del pago: {{FECHA_PAGO}}

DESGLOSE FINANCIERO:
- Honorarios: {{HONORARIOS}}
- IVA (21%): {{IMPORTE_IVA}}
- Suplidos: {{SUPLIDOS}}
- TOTAL: {{TOTAL_GENERAL}}

Atentamente,
TuGestiónLegal
```

## Placeholders por Tipo de Documento

### Mandato
- Cliente: todos
- Dirección: todos
- Trámite: tipo, código
- Fechas: hoy

### Contrato de Prestación
- Cliente: todos
- Honorarios: todos (excepto vencimientos)
- Plan de pago: plan, número cuotas
- Fechas: hoy

### Fraccionamiento
- Honorarios: todos
- Vencimientos: tabla completa
- Fechas: hoy

### Factura/Proforma
- Cliente: todos
- Honorarios: todos
- Tasas: desglose
- Fechas: hoy

### Recibo
- Vencimiento: número, fecha, importe (letras)
- Pago: fecha, forma, notas
- Cliente: nombre normal (NO mayúsculas)
- Fechas: hoy
