import { atom, map } from 'nanostores';
import { persistent } from '@nanostores/persistent';

// --- NOTA: Asegúrate de haber instalado la dependencia ---
// npm install @nanostores/persistent

/**
 * @description Guarda el ID del perfil activo en localStorage para persistir entre recargas.
 * La clave en localStorage será 'perfilActivoId'.
 */
export const perfilActivoId = persistent<string | null>('perfilActivoId', null);

/**
 * @description Almacena en memoria la lista completa de perfiles y el objeto del perfil activo.
 */
export const perfilesStore = map<{
  perfiles: any[]; // Deberías reemplazar 'any' con el tipo de tu perfil
  perfilActivo: any | null; // Deberías reemplazar 'any' con el tipo de tu perfil
}> ({
  perfiles: [],
  perfilActivo: null,
});

/**
 * @description Acción para poblar el store con los perfiles obtenidos de la API.
 * @param {any[]} perfiles - El array de perfiles del usuario.
 */
export function setPerfiles(perfiles: any[]) {
  // Busca un perfil activo en la BD, o usa el primero como defecto.
  const perfilActivoGuardadoId = perfilActivoId.get();
  let perfilPorDefecto = perfiles.find(p => p.id === perfilActivoGuardadoId) || perfiles.find(p => p.estado === 'activo') || perfiles[0];

  perfilesStore.set({
    perfiles: perfiles,
    perfilActivo: perfilPorDefecto,
  });

  if (perfilPorDefecto) {
    perfilActivoId.set(perfilPorDefecto.id);
  }
}

/**
 * @description Acción para cambiar el perfil activo, tanto en el UI como en la BD.
 * @param {string} nuevoPerfilId - El ID del nuevo perfil a activar.
 */
export async function setPerfilActivo(nuevoPerfilId: string) {
  const perfiles = perfilesStore.get().perfiles;
  const nuevoPerfilActivo = perfiles.find(p => p.id === nuevoPerfilId);

  if (nuevoPerfilActivo) {
    // 1. Actualización visual inmediata en el frontend.
    perfilesStore.setKey('perfilActivo', nuevoPerfilActivo);
    perfilActivoId.set(nuevoPerfilActivo.id); // Guarda en localStorage.

    // 2. Guardado en la base de datos para que sea el nuevo defecto.
    try {
      // TODO: Crear este endpoint en la API.
      await fetch('/api/perfiles/set-activo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfilId: nuevoPerfilId }),
      });
    } catch (error) {
      console.error("Error al guardar el perfil activo por defecto:", error);
    }
  }
}
