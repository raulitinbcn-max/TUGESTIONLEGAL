import { google } from 'googleapis'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PLANTILLAS_FOLDER_ID = '1LtsqemeD6qK3e3bIJQeYa5qYj9xlLzWF'

const TEMPLATES = [
  {
    name: 'mandato_representacion',
    title: 'Mandato de Representación',
    content: `MANDATO DE REPRESENTACIÓN

De una parte,
NOMBRE Y APELLIDOS: {{NOMBRE Y APELLIDOS}}
TIPO, PAÍS Y NÚMERO DE DOCUMENTO: {{TIPO, PAÍS Y NÚMERO DE DOCUMENTO}}
DIRECCIÓN: {{DIRECCIÓN}}
TELÉFONO: {{TELÉFONO}}
E-MAIL: {{E-MAIL}}

en adelante EL CLIENTE y en concepto de MANDANTE, dice y otorga:

Que por el presente documento confiere, con carácter general, MANDATO de representación, a favor del Graduado Social debidamente colegiado y perteneciente al Colegio Oficial de Graduados Sociales de Barcelona, Girona y Lleida, para que promuevan, soliciten y realicen todos los trámites necesarios para su actuación ante todos los órganos y entidades de la Administración del Estado, Autonómica, Provincial y Local que resulten competentes, y específicamente ante el Ministerio del Interior y el Ministerio de Justicia del Gobierno de España.

Autoriza de forma expresa al mandante a la expedición y uso de un certificado digital del cliente para la realización de los trámites que correspondan en su nombre.

El presente mandato, que se regirá por los artículos 1709 a 1739 del Código Civil, se confiere al amparo del artículo 5 de la Ley 39/2015, de 1 de Octubre, del Procedimiento Administrativo Común de las Administraciones Pública.

El mandante autoriza a los mandatarios para que nombre sustituto, en caso de necesidad justificada, a favor de otro profesional colegiado ejerciente.

El mandante declara bajo su responsabilidad que cumple con los requisitos establecidos en la normativa vigente para obtener el reconocimiento de un derecho o facultad o para su ejercicio, que dispone de la documentación que así lo acredita, que es auténtica y su contenido enteramente correcto.

En {{CIUDAD}}, a {{FECHA}}

EL MANDANTE                          EL MANDATARIO
_____________________               _____________________`,
  },
  {
    name: 'contrato_residencia',
    title: 'Contrato de Servicios - Solicitud de Residencia',
    content: `CONTRATO DE SERVICIOS DE GESTORÍA
Solicitud de Autorización de Residencia en España

Entre {{nombreGestoria}} (en adelante, "GESTOR") y {{nombreCliente}} con pasaporte {{numeroPasaporte}} (en adelante, "CLIENTE").

Se acuerda lo siguiente:

1. OBJETO DEL CONTRATO
El GESTOR se compromete a prestar servicios profesionales de gestoría y asesoramiento en la tramitación de solicitud de Autorización de Residencia en España, de conformidad con la normativa vigente en materia de extranjería.

2. SERVICIOS A PRESTAR
- Asesoramiento jurídico y administrativo en el trámite de residencia
- Revisión y preparación de documentación
- Presentación de solicitud ante las autoridades competentes
- Seguimiento del expediente administrativo
- Comunicación periódica sobre el estado del trámite

3. HONORARIOS Y FORMA DE PAGO
Los honorarios acordados son de €{{honorarios}} más IVA (21%), totalizando €{{totalConIva}}.
Forma de pago: {{formaPago}}
Plazo de pago: {{plazoPago}} días desde la factura

4. DURACIÓN DEL CONTRATO
Este contrato tendrá una duración de {{duracion}} meses a partir de la fecha de firma, prorrogable por acuerdo de ambas partes.

5. OBLIGACIONES DEL GESTOR
- Prestar los servicios con diligencia profesional
- Mantener confidencialidad respecto a los datos e información del cliente
- Informar periódicamente sobre el estado de la tramitación
- Actuar conforme a la normativa administrativa vigente

6. OBLIGACIONES DEL CLIENTE
- Proporcionar toda la documentación requerida de forma oportuna
- Comunicar cambios en sus datos personales o circunstancias
- Realizar los pagos en los plazos establecidos
- Facilitar la comunicación entre el gestor y las autoridades competentes

7. RESPONSABILIDADES
El GESTOR no es responsable de:
- Las resoluciones administrativas adoptadas por las autoridades competentes
- Retrasos en la resolución de trámites fuera de su control
- Cambios en la normativa de extranjería

8. RESOLUCIÓN DEL CONTRATO
Cualquiera de las partes podrá resolver este contrato mediante comunicación escrita con 15 días de anticipación, salvo que exista causa justificada que requiera resolución inmediata.

9. JURISDICCIÓN
Para cualquier controversia derivada de este contrato, las partes se someten a los juzgados y tribunales competentes.

Firmado en {{ciudad}} a {{fecha}}

El GESTOR                          El CLIENTE
{{nombreGestoria}}                 {{nombreCliente}}
NIF: {{nifGestoria}}              Pasaporte: {{numeroPasaporte}}
_____________________             _____________________`,
  },
  {
    name: 'contrato_servicios_general',
    title: 'Contrato de Servicios de Gestoría - General',
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
    name: 'autorizacion_recurso',
    title: 'Autorización para Recurso',
    content: `AUTORIZACIÓN PARA INTERPONER RECURSO

De una parte,
NOMBRE Y APELLIDOS: {{NOMBRE Y APELLIDOS}}
TIPO, PAÍS Y NÚMERO DE DOCUMENTO: {{TIPO, PAÍS Y NÚMERO DE DOCUMENTO}}
DIRECCIÓN: {{DIRECCIÓN}}
TELÉFONO: {{TELÉFONO}}
E-MAIL: {{E-MAIL}}

en adelante EL CLIENTE, dice y otorga:

Que autoriza expresamente al Graduado Social debidamente colegiado para que interponga, en su nombre y representación, los recursos administrativos y/o judiciales que estime oportunos contra las resoluciones administrativas dictadas por la Administración Pública en relación con los trámites de extranjería.

El presente documento confiere poderes amplios al Graduado Social para que actúe en defensa de los derechos e intereses del cliente, incluyendo la facultad de interponer recursos administrativos, de reposición, de alzada, contencioso-administrativos, o cualquier otra acción legal que resulte procedente.

El cliente se compromete a facilitar toda la información y documentación que le sea solicitada para la correcta tramitación del recurso.

En {{CIUDAD}}, a {{FECHA}}

EL CLIENTE                          EL GRADUADO SOCIAL
_____________________               _____________________`,
  },
  {
    name: 'renuncia_tramite',
    title: 'Renuncia al Trámite',
    content: `RENUNCIA AL TRÁMITE

De una parte,
NOMBRE Y APELLIDOS: {{NOMBRE Y APELLIDOS}}
TIPO, PAÍS Y NÚMERO DE DOCUMENTO: {{TIPO, PAÍS Y NÚMERO DE DOCUMENTO}}
DIRECCIÓN: {{DIRECCIÓN}}
TELÉFONO: {{TELÉFONO}}
E-MAIL: {{E-MAIL}}

en adelante EL CLIENTE, dice y otorga:

Que por el presente documento comunica su intención de renunciar al trámite administrativo en materia de extranjería iniciado con fecha {{FECHA}}, bajo el código de expediente {{CÓDIGO_TRAMITE}}.

El cliente es consciente de las consecuencias que puede tener esta renuncia y asume todas las responsabilidades derivadas de la misma.

Por este acto, se solicita formalmente la cancelación del expediente administrativo y la terminación de los servicios prestados por el Graduado Social en relación con el presente trámite.

En {{CIUDAD}}, a {{FECHA}}

EL CLIENTE
_____________________`,
  },
  {
    name: 'fraccionamiento_pago',
    title: 'Adenda de Fraccionamiento de Pago',
    content: `ADENDA AL CONTRATO PARA EL FRACCIONAMIENTO DE PAGO

En {{CIUDAD}}, a {{FECHA}}

REUNIDOS

De una parte, el Graduado Social debidamente colegiado en representación de Despacho Profesional, en adelante "EL PROFESIONAL".

Y de otra parte,

NOMBRE Y APELLIDOS: {{NOMBRE Y APELLIDOS}}
TIPO, PAÍS Y NÚMERO DE DOCUMENTO: {{TIPO, PAÍS Y NÚMERO DE DOCUMENTO}}

en adelante "EL CLIENTE".

Ambas partes se reconocen mutuamente capacidad legal suficiente para contratar y ampliar el contrato principal con las siguientes:

CLÁUSULAS

Primera. Objeto de la adenda

La presente adenda regula el fraccionamiento del pago de los honorarios y suplidos pactados en el contrato principal.

Segunda. Importe Total

El importe total de los servicios es de {{TOTAL A PAGAR EN LETRAS}}, desglosado de la siguiente forma:
- Honorarios: {{IMPORTE SIN IMPUESTO EN LETRAS}}
- IVA (21%): {{IMPORTE IVA EN LETRAS}}
- Tasas y Suplidos: {{SUPLIDOS EN LETRAS}}

Tercera. Plan de Fraccionamiento

El cliente se obliga al pago del importe anterior en los siguientes vencimientos:

{{DETALLE VENCIMIENTOS}}

Cuarta. Consecuencias del impago

En caso de incumplimiento de cualquiera de los plazos el profesional podrá:
1. Suspender temporal o definitivamente la prestación del servicio
2. Resolver el contrato, conservando los importes ya abonados
3. Entender por desistido el procedimiento administrativo

Quinta. Integración contractual

La presente adenda forma parte inseparable del contrato principal.

Y para que así conste, firman el presente contrato por duplicado y a un solo efecto, en el lugar y fecha arriba indicados.

EL PROFESIONAL                     EL CLIENTE
_____________________              _____________________`,
  },
  {
    name: 'factura_proforma',
    title: 'Factura Proforma',
    content: `FACTURA PROFORMA

DATOS DEL EMISOR:
Gestoría: {{nombreGestoria}}
NIF/CIF: {{nifGestoria}}
Dirección: {{direccionGestoria}}

DATOS DEL CLIENTE:
Nombre: {{nombreCliente}}
Pasaporte: {{numeroPasaporte}}
Email: {{emailCliente}}

NÚMERO DE FACTURA: {{numeroFactura}}
FECHA: {{fecha}}

CONCEPTO: {{concepto}}
Cantidad: {{cantidad}}
Precio unitario: €{{precioUnitario}}

Subtotal: €{{subtotal}}
IVA (21%): €{{iva}}
TOTAL: €{{total}}

NOTAS: {{notas}}

Esta es una factura proforma.`,
  },
]

async function checkAndDeleteDuplicates(drive: any, plantillaFolderId: string) {
  try {
    const response = await drive.files.list({
      q: `'${plantillaFolderId}' in parents and trashed=false and mimeType='application/vnd.google-apps.document'`,
      fields: 'files(id, name)',
      pageSize: 100,
    })

    const filesByName: { [key: string]: string[] } = {}
    for (const file of response.data.files || []) {
      if (!filesByName[file.name]) {
        filesByName[file.name] = []
      }
      filesByName[file.name].push(file.id)
    }

    for (const [name, ids] of Object.entries(filesByName)) {
      if (ids.length > 1) {
        for (let i = 1; i < ids.length; i++) {
          await drive.files.delete({ fileId: ids[i] })
        }
      }
    }
  } catch (error) {
    console.error('Error checking duplicates:', error)
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    const docs = google.docs({ version: 'v1', auth: oauth2Client })

    await checkAndDeleteDuplicates(drive, PLANTILLAS_FOLDER_ID)

    const results = []

    for (const template of TEMPLATES) {
      try {
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
        if (!documentId) throw new Error('No document ID returned from Google')

        await docs.documents.batchUpdate({
          documentId,
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
        })

        results.push({
          name: template.name,
          documentId,
          status: 'success',
        })
      } catch (error) {
        results.push({
          name: template.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido',
        })
      }
    }

    return NextResponse.json({
      message: 'Plantillas creadas',
      results,
    })
  } catch (error) {
    console.error('Error creando plantillas:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear plantillas' },
      { status: 500 }
    )
  }
}
