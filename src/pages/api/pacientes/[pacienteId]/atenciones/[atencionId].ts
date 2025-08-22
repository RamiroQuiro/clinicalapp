import db from '@/db';
import {
  atenciones,
  diagnostico,
  historiaClinica,
  medicamento,
  pacientes,
  signosVitales,
  users,
} from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { desc, eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params }) => {
  const { pacienteId, atencionId } = params;

  if (!pacienteId || !atencionId) {
    return createResponse(400, 'Se requieren el ID del paciente y de la atención');
  }

  try {
    // 1. Buscar la atención por ID
    const [atencionData] = await db
      .select({
        id: atenciones.id,
        motivoConsulta: atenciones.motivoConsulta,
        sintomas: atenciones.sintomas,
        observaciones: atenciones.observaciones,
        estado: atenciones.estado,
        created_at: atenciones.created_at,
        inicioAtencion: atenciones.inicioAtencion,
        finAtencion: atenciones.finAtencion,
        duracionAtencion: atenciones.duracionAtencion,
        nombreDoctor: users.nombre,
        apellidoDoctor: users.apellido,
      })
      .from(atenciones)
      .innerJoin(users, eq(users.id, atenciones.userIdMedico))
      .where(eq(atenciones.id, atencionId));

    if (!atencionData) {
      return createResponse(404, 'Atención no encontrada');
    }

    // 2. Obtener datos completos sin importar el estado
    const [pacienteData] = await db
      .select({
        id: pacientes.id,
        nombre: pacientes.nombre,
        apellido: pacientes.apellido,
        dni: pacientes.dni,
        sexo: pacientes.sexo,
        fNacimiento: pacientes.fNacimiento,
        celular: pacientes.celular,
        email: pacientes.email,
        domicilio: pacientes.domicilio,
        grupoSanguineo: historiaClinica.grupoSanguineo,
        historiaClinicaId: historiaClinica.id,
      })
      .from(pacientes)
      .leftJoin(historiaClinica, eq(historiaClinica.pacienteId, pacientes.id))
      .where(eq(pacientes.id, pacienteId));

    if (!pacienteData) {
      return createResponse(404, 'Paciente no encontrado');
    }

    const [signosVitalesAtencion] = await db
      .select()
      .from(signosVitales)
      .where(eq(signosVitales.atencionId, atencionId))
      .orderBy(desc(signosVitales.created_at));

    const diagnosticosAtencion = await db
      .select()
      .from(diagnostico)
      .where(eq(diagnostico.atencionId, atencionId));

    const medicamentosAtencion = await db
      .select()
      .from(medicamento)
      .where(eq(medicamento.atencionId, atencionId));

    const responseData = {
      atencionData: {
        ...atencionData,
        diagnosticos: diagnosticosAtencion,
        medicamentos: medicamentosAtencion,
        signosVitales: signosVitalesAtencion || null,
      },
      pacienteData: pacienteData,
    };

    return createResponse(200, 'Datos de la atención obtenidos correctamente', responseData);
  } catch (error) {
    console.error('Error al obtener los detalles de la atención:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
