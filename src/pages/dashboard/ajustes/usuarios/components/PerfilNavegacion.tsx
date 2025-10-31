import {
  perfilAjustesStore,
  setPestanaActiva,
  type PestanaPerfil,
} from '@/context/perfilAjustes.store';
import { useStore } from '@nanostores/react';

const navItems: { id: PestanaPerfil; label: string }[] = [
  { id: 'informacion', label: 'Información Personal' },
  { id: 'horarios', label: 'Horarios de Atención' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'seguridad', label: 'Seguridad' },
];

export default function PerfilNavegacion() {
  const { pestanaActiva } = useStore(perfilAjustesStore);

  return (
    <div className="border-b border-gray-200">
      <nav
        className="-mb-px border rounded-lg flex space-x-6 px-6 overflow-x-auto bg-white w-full items-center justify-around"
        aria-label="Tabs"
      >
        {navItems.map(tab => (
          <button
            key={tab.id}
            onClick={() => setPestanaActiva(tab.id)}
            className={`${
              pestanaActiva === tab.id
                ? 'border-primary-100 text-primary-100'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
