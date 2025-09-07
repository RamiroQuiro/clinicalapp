import db from '@/db';
import {
  archivosAdjuntos,
  atenciones,
  diagnostico,
  historiaClinica,
  medicamento,
  notasMedicas,
  pacientes,
  signosVitales,
  tratamiento,
  users,
} from '@/db/schema';
import { antecedentes } from '@/db/schema/atecedentes';
import { desc, eq, sql } from 'drizzle-orm';

export async function getDatosNuevaAtencion(pacienteId: string, atencionId: string) {
  // 1. Buscar la atención principal. Esta es la única consulta que bloquea el resto.
  const atencionData = await db.query.atenciones.findFirst({
    where: eq(atenciones.id, atencionId),
    with: {
      medico: {
        columns: {
          nombre: true,
          apellido: true,
        },
      },
    },
  });

  if (!atencionData) {
    return { error: true, message: 'Atención no encontrada', data: null };
  }

  // 2. Definir todas las consultas secundarias de forma declarativa.
  // Estas consultas son promesas "frías", no se ejecutan hasta que se les hace un `await` o `then`.

  const pacienteQuery = db.query.pacientes.findFirst({
    where: eq(pacientes.id, pacienteId),
    with: {
      historiaClinica: true,
    },
  });

  const signosVitalesQuery = db.query.signosVitales.findFirst({
    where: eq(signosVitales.atencionId, atencionId),
    orderBy: desc(signosVitales.created_at),
  });

  const notasQuery = db.query.notasMedicas.findMany({
    where: eq(notasMedicas.atencionId, atencionId),
  });

  const diagnosticosQuery = db.query.diagnostico.findMany({
    where: eq(diagnostico.atencionId, atencionId),
  });

  const medicamentosQuery = db.query.medicamento.findMany({
    where: eq(medicamento.atencionId, atencionId),
  });

  const archivosQuery = db.query.archivosAdjuntos.findMany({
    where: eq(archivosAdjuntos.atencionId, atencionId),
  });

  // 3. Si la atención está finalizada, solo ejecutamos las consultas esenciales en paralelo.
  if (atencionData.estado === 'finalizada') {
    const [
      pacienteData,
      signosVitalesAtencion,
      notasAtencion,
      diagnosticosAtencion,
      medicamentosAtencion,
      archivosAtencion,
    ] = await Promise.all([
      pacienteQuery,
      signosVitalesQuery,
      notasQuery,
      diagnosticosQuery,
      medicamentosQuery,
      archivosQuery,
    ]);

    if (!pacienteData) {
      return { error: true, message: 'Paciente no encontrado', data: null };
    }

    return {
      error: false,
      message: 'Atención finalizada',
      data: {
        atencion: {
          ...atencionData,
          diagnosticos: diagnosticosAtencion,
          medicamentos: medicamentosAtencion,
          archivosAdjuntos: archivosAtencion,
          signosVitales: signosVitalesAtencion || {},
          notas: notasAtencion,
        },
        paciente: pacienteData,
        antecedentes: [], // No se cargan para la vista finalizada
        signosVitalesHistorial: [], // No se carga para la vista finalizada
      },
    };
  }

  // 4. Si la atención está en curso, definimos las consultas adicionales.
  const antecedentesQuery = db.query.antecedentes.findMany({
    where: eq(antecedentes.pacienteId, pacienteId),
  });

  const signosHistorialQuery = db.query.signosVitales.findMany({
    where: eq(signosVitales.pacienteId, pacienteId),
    orderBy: desc(signosVitales.created_at),
    limit: 4,
  });

  // 5. Ejecutamos TODAS las consultas en paralelo.
  const [
    pacienteData,
    signosVitalesAtencion,
    notasAtencion,
    diagnosticosAtencion,
    medicamentosAtencion,
    archivosAtencion,
    antecedentesData,
    fecthSignosVitalesData,
  ] = await Promise.all([
    pacienteQuery,
    signosVitalesQuery,
    notasQuery,
    diagnosticosQuery,
    medicamentosQuery,
    archivosQuery,
    antecedentesQuery,
    signosHistorialQuery,
  ]);

  if (!pacienteData) {
    return { error: true, message: 'Paciente no encontrado', data: null };
  }

  // 6. Procesamos los datos para los gráficos (esto es rápido, se hace después de las consultas).
  const signosVitalesData = [
    'temperatura',
    'pulso',
    'frecuenciaCardiaca',
    'frecuenciaRespiratoria',
    'tensionArterial',
    'saturacionOxigeno',
    'glucosa',
    'peso',
    'talla',
    'imc',
  ].map(tipo => {
    const historial = fecthSignosVitalesData.map(sv => ({
      valor: parseFloat(sv[tipo]),
      fecha: sv.created_at,
    }));
    return { tipo, historial };
  });

  // 7. Devolvemos el objeto de datos completo.
  return {
    error: false,
    message: 'Atención en curso',
    data: {
      atencion: {
        ...atencionData,
        diagnosticos: diagnosticosAtencion,
        medicamentos: medicamentosAtencion,
        archivosAdjuntos: archivosAtencion,
        signosVitales: signosVitalesAtencion || {},
        notas: notasAtencion,
      },
      paciente: pacienteData,
      antecedentes: antecedentesData,
      signosVitalesHistorial: signosVitalesData,
    },
  };
}
