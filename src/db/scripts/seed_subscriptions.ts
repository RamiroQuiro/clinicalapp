import { createClient } from '@libsql/client';
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { nanoid } from 'nanoid';
import { centrosMedicos } from '../schema/centrosMedicos';
import { planes } from '../schema/planes';
import { suscripciones } from '../schema/suscripciones';

// --- Configuración DB ---
const tursoUrl = process.env.TURSO_DB_URL;
const tursoToken = process.env.TURSO_DB_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
    console.error('❌ Error: Faltan credenciales en .env');
    process.exit(1);
}

const client = createClient({ url: tursoUrl, authToken: tursoToken });
const db = drizzle(client);

async function main() {
    console.log('🔄 Iniciando asignación de suscripciones a centros existentes...');

    try {
        // 1. Obtener un plan base (ej: Consultorio Digital) para asignar por defecto
        const [planBase] = await db
            .select()
            .from(planes)
            .where(eq(planes.nombre, 'Consultorio Digital'))
            .limit(1);

        if (!planBase) {
            console.error('❌ No se encontró el plan "Consultorio Digital". Ejecuta seed_planes.ts primero.');
            process.exit(1);
        }

        console.log(`📋 Plan seleccionado: ${planBase.nombre} (ID: ${planBase.id})`);

        // 2. Obtener todos los centros médicos
        const centros = await db.select().from(centrosMedicos);
        console.log(`🏥 Centros encontrados: ${centros.length}`);

        for (const centro of centros) {
            // Verificar si ya tiene suscripcion
            const [existingSub] = await db
                .select()
                .from(suscripciones)
                .where(eq(suscripciones.centroMedicoId, centro.id))
                .limit(1);

            if (existingSub) {
                console.log(`⏭️ Centro ${centro.nombre} ya tiene suscripción. Saltando.`);
                continue;
            }

            console.log(`➕ Asignando suscripción a: ${centro.nombre}...`);

            // Crear suscripción de prueba
            const fechaInicio = new Date();
            const fechaFin = new Date();
            fechaFin.setDate(fechaInicio.getDate() + (planBase.diasPrueba || 14)); // Sumar días de prueba

            await db.insert(suscripciones).values({
                id: `sub_${nanoid(12)}`,
                centroMedicoId: centro.id,
                planId: planBase.id,
                estado: 'prueba',
                fechaInicio: fechaInicio,
                fechaFin: fechaFin,
                renovacionAutomatica: true,
                // Opcional: Snapshot del plan si decidimos usarlo ahora
                // planSnapshot: JSON.stringify(planBase) 
            });
        }

        console.log('✅ Proceso completado.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

main();
