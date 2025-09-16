import { persistentMap } from '@nanostores/persistent';

// 1. Define la "forma" de tus preferencias para asegurar un tipado fuerte.
export type PreferenciasPerfil = {
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  notificationsEnabled: boolean;
  defaultDashboardView: 'agenda' | 'pacientes' | 'estadisticas';
};

// 2. Define las preferencias por defecto para un usuario nuevo o para cuando el localStorage está vacío.
const defaultPreferences: PreferenciasPerfil = {
  theme: 'system',
  language: 'es',
  notificationsEnabled: true,
  defaultDashboardView: 'agenda',
};

// 3. Crea el store utilizando `persistentMap`.
// El primer argumento ('user-preferences:') es la clave que se usará en localStorage.
// El segundo argumento son los valores por defecto.
export const preferenciasPerfilStore = persistentMap<PreferenciasPerfil>(
  'user-preferences:',
  defaultPreferences
);

// 4. (Opcional pero recomendado) Exporta acciones para modificar el store.
// Esto hace que la lógica de mutación sea centralizada y más fácil de mantener.

/**
 * Actualiza el tema de la aplicación.
 * @param theme El tema a establecer.
 */
export function setTheme(theme: PreferenciasPerfil['theme']) {
  preferenciasPerfilStore.setKey('theme', theme);
}

/**
 * Cambia el idioma de la interfaz.
 * @param language El idioma a establecer.
 */
export function setLanguage(language: PreferenciasPerfil['language']) {
  preferenciasPerfilStore.setKey('language', language);
}

/**
 * Activa o desactiva las notificaciones.
 */
export function toggleNotifications() {
  const currentStatus = preferenciasPerfilStore.get().notificationsEnabled;
  preferenciasPerfilStore.setKey('notificationsEnabled', !currentStatus);
}

/**
 * Establece la vista por defecto para el dashboard.
 * @param view La vista a establecer como por defecto.
 */
export function setDefaultDashboardView(view: PreferenciasPerfil['defaultDashboardView']) {
    preferenciasPerfilStore.setKey('defaultDashboardView', view);
}

// --- Cómo usarlo en un componente de React ---
//
// import { useStore } from '@nanostores/react';
// import { preferenciasPerfilStore, setTheme } from './preferenciasPerfilUser.store.ts';
//
// export const SettingsComponent = () => {
//   const prefs = useStore(preferenciasPerfilStore);
//
//   return (
//     <div>
//       <p>Tema actual: {prefs.theme}</p>
//       <button onClick={() => setTheme('dark')}>
//         Cambiar a Oscuro
//       </button>
//     </div>
//   );
// };
