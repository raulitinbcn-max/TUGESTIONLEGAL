const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function audit() {
  console.log("🔍 AUDIT COMPLETO DE CONFIGURACIÓN\n");
  console.log("=" .repeat(60));

  try {
    // 1. CATEGORÍAS DE TRÁMITE
    console.log("\n📁 CATEGORÍAS DE TRÁMITE");
    const categorias = await db.categoriasTramite.findMany();
    console.log(`   Total: ${categorias.length}`);
    categorias.forEach(c => {
      console.log(`   ✓ ${c.nombre} (${c.codigo})`);
    });

    // 2. TIPOS DE TRÁMITE
    console.log("\n📋 TIPOS DE TRÁMITE");
    const tramites = await db.tramiteConfiguracion.findMany();
    console.log(`   Total: ${tramites.length}`);
    tramites.forEach(t => {
      const catName = categorias.find(c => c.id === t.categoria)?.nombre || "SIN CATEGORÍA";
      const estado = t.activo ? "✓ ACTIVO" : "📦 ARCHIVADO";
      console.log(`   ${estado} ${t.nombre} → ${catName}`);
    });

    // 3. TIPOS DE DOCUMENTO
    console.log("\n📄 TIPOS DE DOCUMENTO");
    const tiposDoc = await db.tipoDocumento.findMany();
    console.log(`   Total: ${tiposDoc.length}`);
    const sinCategoria = tiposDoc.filter(t => !t.categoriaId).length;
    const conCategoria = tiposDoc.filter(t => t.categoriaId).length;
    console.log(`   - Globales (sin categoría): ${sinCategoria}`);
    console.log(`   - Específicas de categoría: ${conCategoria}`);
    tiposDoc.forEach(t => {
      const catName = t.categoriaId ?
        categorias.find(c => c.id === t.categoriaId)?.nombre : "GLOBAL";
      console.log(`   ✓ ${t.nombre} (${t.icono}) → ${catName}`);
    });

    // 4. CHECK DOCUMENTOS
    console.log("\n✅ CHECK DOCUMENTOS");
    const checkDocs = await db.checkDocumento.findMany();
    console.log(`   Total: ${checkDocs.length}`);
    const perTramite = {};
    checkDocs.forEach(c => {
      perTramite[c.tipoTramite] = (perTramite[c.tipoTramite] || 0) + 1;
    });
    Object.entries(perTramite).forEach(([tramite, count]) => {
      console.log(`   ✓ ${tramite}: ${count} items`);
    });

    // 5. PLANTILLAS
    console.log("\n📑 PLANTILLAS");
    const plantillas = await db.plantilla.findMany();
    console.log(`   Total: ${plantillas.length}`);
    if (plantillas.length === 0) {
      console.log(`   ⚠️  NO HAY PLANTILLAS (necesitan ser re-asociadas desde Drive)`);
    } else {
      const perTipo = {};
      plantillas.forEach(p => {
        perTipo[p.tipo] = (perTipo[p.tipo] || 0) + 1;
      });
      Object.entries(perTipo).forEach(([tipo, count]) => {
        console.log(`   ✓ ${tipo}: ${count} plantillas`);
      });
    }

    // 6. TASAS
    console.log("\n💰 CONFIGURACIÓN DE TASAS");
    const tasas = await db.tasaConfiguracion.findMany();
    console.log(`   Total: ${tasas.length}`);
    tasas.forEach(t => {
      try {
        const tasasArray = JSON.parse(t.nombre);
        console.log(`   ✓ ${t.tipoTramite}: ${tasasArray.length} tasas`);
      } catch {
        console.log(`   ⚠️  ${t.tipoTramite}: formato inválido`);
      }
    });

    // 7. RESUMEN DE RIESGOS
    console.log("\n" + "=" .repeat(60));
    console.log("⚠️  ANÁLISIS DE RIESGOS:\n");

    const riesgos = [];

    if (tramites.length === 0) {
      riesgos.push("CRÍTICO: No hay tipos de trámite configurados");
    }

    if (tiposDoc.length === 0) {
      riesgos.push("CRÍTICO: No hay tipos de documento");
    }

    if (checkDocs.length === 0) {
      riesgos.push("CRÍTICO: No hay checklist de documentos");
    }

    if (plantillas.length === 0) {
      riesgos.push("IMPORTANTE: No hay plantillas asociadas (se pueden recuperar desde Drive)");
    }

    const sinCategoriaTramites = tramites.filter(t => !t.categoria).length;
    if (sinCategoriaTramites > 0) {
      riesgos.push(`IMPORTANTE: ${sinCategoriaTramites} tipo(s) de trámite sin categoría asignada`);
    }

    if (riesgos.length === 0) {
      console.log("✅ No se detectaron riesgos críticos");
    } else {
      riesgos.forEach(r => console.log(`  • ${r}`));
    }

    console.log("\n" + "=" .repeat(60));
    console.log("✅ AUDIT COMPLETADO\n");

  } catch (error) {
    console.error("❌ Error durante audit:", error);
  } finally {
    await db.$disconnect();
  }
}

audit();
