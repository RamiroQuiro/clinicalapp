import db from '@/db';
import { users, usersCentrosMedicos } from '@/db/schema';
import { and, eq, or } from 'drizzle-orm';

// tenemos aqui al fromatter de astro
const fetchDataProfesionalesEntidad = async (userId: string) => {
  let miembrosDelCentro;
  try {
    miembrosDelCentro = await db
      .select({
        id: usersCentrosMedicos.userId,
        nombre: users.nombre,
        apellido: users.apellido,
      })
      .from(usersCentrosMedicos)
      .innerJoin(users, eq(usersCentrosMedicos.userId, users.id))
      .where(
        and(
          eq(usersCentrosMedicos.userId, userId),
          or(
            eq(usersCentrosMedicos.rolEnCentro, 'profesional'),
            eq(usersCentrosMedicos.rolEnCentro, 'adminLocal')
          )
        )
      );

    return miembrosDelCentro;
  } catch (error) {
    console.log('error al obtener profesionales', error);
  }
  return miembrosDelCentro;
};

export { fetchDataProfesionalesEntidad };
