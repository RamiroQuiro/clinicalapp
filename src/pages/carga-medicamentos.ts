// scripts/cargar-medicamentos.ts
import db from '@/db';
import { medicamentoPrincipiosActivos, medicamentos, principiosActivos } from '@/db/schema';
import { medicamentosIniciales } from '@/pages/medicamentos-iniciales';

export async function cargarMedicamentosIniciales() {
  console.log('🏥 Iniciando carga de medicamentos...');

  try {
    let medicamentosCargados = 0;
    let principiosCargados = 0;

    // Primero, cargar todos los principios activos únicos
    const principiosUnicos = new Set<string>();
    medicamentosIniciales.forEach(med => {
      med.principiosActivos.forEach(pa => principiosUnicos.add(pa));
    });

    const principioMap = new Map();

    for (const principioNombre of principiosUnicos) {
      const [principio] = await db
        .insert(principiosActivos)
        .values({
          nombre: principioNombre,
          descripcion: `Principio activo: ${principioNombre}`,
          categoriaFarmacologica: 'POR_DEFINIR',
        })
        .returning();

      principioMap.set(principioNombre, principio.id);
      principiosCargados++;
    }

    console.log(`✅ ${principiosCargados} principios activos cargados`);

    // Cargar medicamentos
    for (const medData of medicamentosIniciales) {
      const [medicamento] = await db
        .insert(medicamentos)
        .values({
          nombreComercial: medData.nombreComercial,
          nombreGenerico: medData.nombreGenerico,
          formaFarmaceutica: medData.formaFarmaceutica,
          concentracion: medData.concentracion,
          laboratorio: medData.laboratorio,
          requiereReceta: medData.requiereReceta,
        })
        .returning();

      // Relacionar medicamento con principios activos
      for (const principioNombre of medData.principiosActivos) {
        await db.insert(medicamentoPrincipiosActivos).values({
          medicamentoId: medicamento.id,
          principioActivoId: principioMap.get(principioNombre),
          concentracion: medData.concentracion,
        });
      }

      medicamentosCargados++;
    }

    console.log(`✅ ${medicamentosCargados} medicamentos cargados exitosamente`);
    console.log(
      `🏁 Carga completada: ${principiosCargados} principios + ${medicamentosCargados} medicamentos`
    );
  } catch (error) {
    console.error('❌ Error cargando medicamentos:', error);
    throw error;
  }
}

// Ejecutar si es el módulo principal
if (require.main === module) {
  cargarMedicamentosIniciales();
}
