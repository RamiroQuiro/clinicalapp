import { atom } from 'nanostores';

export type PestanaPerfil = 'informacion' | 'horarios' | 'documentos' | 'seguridad';

export const perfilAjustesStore = atom({
  pestanaActiva: 'informacion' as PestanaPerfil,
});

export function setPestanaActiva(pestana: PestanaPerfil) {
  perfilAjustesStore.set({ pestanaActiva: pestana });
}
