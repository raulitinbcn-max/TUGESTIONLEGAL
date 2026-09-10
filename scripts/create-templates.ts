import { google } from 'googleapis'

const PLANTILLAS_FOLDER_ID = '1LtsqemeD6qK3e3bIJQeYa5qYj9xlLzWF'

const TEMPLATES = [
  {
    name: 'contrato_servicios',
    title: 'Contrato de Servicios de Gestoría',
    content: `CONTRATO DE SERVICIOS DE GESTORÍA

Entre {{nombreGestoria}} (en adelante, "GESTOR") y {{nombreCliente}} con pasaporte {{numeroPasaporte}} (en adelante, "CLIENTE").

Se acuerda lo siguiente:

1. OBJETO DEL CONTRATO
El GESTOR se compromete a prestar servicios de gestoría relacionados con {{tipoTramite}}.

2. HONORARIOS
Los honorarios acordados son de €{{honorarios}} + IVA (21%).
Forma de pago: {{formaPago}}

3. DURACIÓN
Este contrato tendrá una duración de {{duracion}} a partir de la fecha de firma.

4. OBLIGACIONES DEL GESTOR
- Realizar los trámites administrativos necesarios
- Comunicar periódicamente el estado de los trámites
- Mantener confidencialidad de los datos del cliente

5. OBLIGACIONES DEL CLIENTE
- Proporcionar documentación necesaria
- Realizar los pagos en el plazo establecido
- Comunicar cambios en sus datos

Firmado en {{ciudad}} a {{fecha}}

{{nombreGestoria}}                {{nombreCliente}}
_____________________            _____________________`,
  },
  {
    name: 'factura_proforma',
    title: 'Factura Proforma',
    content: `FACTURA PROFORMA

DATOS DEL EMISOR:
Gestoría: {{nombreGestoria}}
NIF/CIF: {{nifGestoria}}
Dirección: {{direccionGestoria}}
Teléfono: {{telefonoGestoria}}
Email: {{emailGestoria}}

DATOS DEL CLIENTE:
Nombre: {{nombreCliente}}
Pasaporte: {{numeroPasaporte}}
Dirección: {{direccionCliente}}
Email: {{emailCliente}}

NÚMERO DE FACTURA: {{numeroFactura}}
FECHA: {{fecha}}
FECHA DE VENCIMIENTO: {{fechaVencimiento}}

CONCEPTO DE SERVICIOS:
{{concepto}}

DETALLES:
Descripción: {{descripcionServicio}}
Cantidad: {{cantidad}}
Precio unitario: €{{precioUnitario}}
Subtotal: €{{subtotal}}

IVA (21%): €{{iva}}
TOTAL: €{{total}}

NOTAS:
{{notas}}

Banco: {{bancoGestoria}}
Cuenta: {{cuentaGestoria}}

Esta es una factura proforma. La factura definitiva se emitirá tras la confirmación del servicio.`,
  },
]

async function createTemplates() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/documents'],
  })

  const drive = google.drive({ version: 'v3', auth })
  const docs = google.docs({ version: 'v1', auth })

  for (const template of TEMPLATES) {
    try {
      // Crear documento
      const fileMetadata = {
        name: template.name,
        parents: [PLANTILLAS_FOLDER_ID],
        mimeType: 'application/vnd.google-apps.document',
      }

      const file = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      })

      const documentId = file.data.id
      console.log(`✅ Documento creado: ${template.name} (${documentId})`)

      // Insertar contenido
      if (documentId) {
        await docs.documents.batchUpdate({
          documentId: documentId,
          requestBody: {
            requests: [
              {
                insertText: {
                  text: template.content,
                  location: { index: 1 },
                },
              },
            ],
          },
        } as any)
      }

      console.log(`✅ Contenido insertado en: ${template.name}`)
    } catch (error) {
      console.error(`❌ Error creando ${template.name}:`, error)
    }
  }
}

createTemplates().catch(console.error)
