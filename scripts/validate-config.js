const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function validate() {
  console.log("🔍 VALIDANDO INTEGRIDAD DE CONFIGURACIÓN\n");

  const errors = [];
  const warnings = [];

  try {
    // 1. Validar Categorías
    const categorias = await db.categoriasTramite.findMany();
    if (categorias.length === 0) {
      errors.push("No hay categorías de trámite");
    } else {
      // Verificar claves únicas
      const claves = new Set();
      const codigos = new Set();
      categorias.forEach(c => {
        if (claves.has(c.clave)) errors.push(`Clave duplicada: ${c.clave}`);
        if (codigos.has(c.codigo)) errors.push(`Código duplicado: ${c.codigo}`);
        claves.add(c.clave);
        codigos.add(c.codigo);
      });
    }

    // 2. Validar Tipos de Trámite
    const tramites = await db.tramiteConfiguracion.findMany();
    if (tramites.length === 0) {
      errors.push("No hay tipos de trámite configurados");
    } else {
      tramites.forEach(t => {
        // Verificar que tiene categoría
        if (!t.categoria) {
          warnings.push(`Tipo de trámite sin categoría: ${t.tipoTramite}`);
        }
        // Verificar que la categoría existe
        if (t.categoria && !categorias.find(c => c.id === t.categoria)) {
          errors.push(`Tipo de trámite con categoría inexistente: ${t.tipoTramite}`);
        }
      });
    }

    // 3. Validar Tipos de Documento
    const tiposDoc = await db.tipoDocumento.findMany();
    if (tiposDoc.length === 0) {
      warnings.push("No hay tipos de documento (usuarios no podrán crear documentos)");
    } else {
      tiposDoc.forEach(t => {
        // Verificar que si tiene categoría, existe
        if (t.categoriaId && !categorias.find(c => c.id === t.categoriaId)) {
          errors.push(`Tipo de documento con categoría inexistente: ${t.nombre}`);
        }
      });
    }

    // 4. Validar Check Documentos
    const checkDocs = await db.checkDocumento.findMany();
    const perTramite = {};
    checkDocs.forEach(c => {
      perTramite[c.tipoTramite] = (perTramite[c.tipoTramite] || 0) + 1;
    });

    tramites.forEach(t => {
      if (!perTramite[t.tipoTramite]) {
        warnings.push(`Tipo de trámite sin checklist: ${t.tipoTramite}`);
      }
    });

    // 5. Validar Plantillas
    const plantillas = await db.plantilla.findMany();
    plantillas.forEach(p => {
      if (!tramites.find(t => t.tipoTramite === p.tipoTramite)) {
        warnings.push(`Plantilla asociada a trámite inexistente: ${p.nombre}`);
      }
    });

    // 6. Validar Tasas
    const tasas = await db.tasaConfiguracion.findMany();
    tramites.forEach(t => {
      const tasa = tasas.find(ta => ta.tipoTramite === t.tipoTramite);
      if (!tasa) {
        warnings.push(`Tipo de trámite sin tasas configuradas: ${t.tipoTramite}`);
      }
    });

    // 7. Verificar relaciones en Tramites
    console.log("🔗 Verificando relaciones...\n");

    const clientes = await db.cliente.findMany();
    const clientesTramites = await db.tramite.findMany();

    console.log("📊 RESUMEN DE DATOS:\n");
    console.log(`   Categorías: ${categorias.length}`);
    console.log(`   Tipos de trámite: ${tramites.length}`);
    console.log(`   Tipos de documento: ${tiposDoc.length}`);
    console.log(`   Check documentos: ${checkDocs.length}`);
    console.log(`   Plantillas: ${plantillas.length}`);
    console.log(`   Configuraciones de tasas: ${tasas.length}`);
    console.log(`   Clientes: ${clientes.length}`);
    console.log(`   Trámites activos: ${clientesTramites.length}`);

  } catch (error) {
    console.error("❌ Error durante validación:", error);
    process.exit(1);
  } finally {
    // Mostrar errores y warnings
    console.log("\n" + "=".repeat(60));

    if (errors.length > 0) {
      console.log("\n❌ ERRORES CRÍTICOS:\n");
      errors.forEach((e, i) => console.log(`   ${i + 1}. ${e}`));
      console.log("\n");
    }

    if (warnings.length > 0) {
      console.log("⚠️  ADVERTENCIAS:\n");
      warnings.forEach((w, i) => console.log(`   ${i + 1}. ${w}`));
      console.log("\n");
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log("\n✅ CONFIGURACIÓN VÁLIDA\n");
    } else if (errors.length === 0) {
      console.log("✅ Sin errores críticos (revisar advertencias)\n");
    }

    console.log("=".repeat(60) + "\n");

    await db.$disconnect();

    process.exit(errors.length > 0 ? 1 : 0);
  }
}

validate();
