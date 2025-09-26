import { useState } from 'react';

type Props = {};
// --- Definición de Pestañas ---
const tabs = [
  { id: 'recepcion', name: 'Recepsión' },
  { id: 'salaEspera', name: 'Sala de Espera' },
  { id: 'pacientes', name: 'Pacientes' },
];

export default function MenuPestaña({}: Props) {
  const [activeTab, setActiveTab] = useState('recepcion');
  return (
    <div className="border-b border-gray-200 w-full flex-1">
      <nav
        className="-mb-px border rounded-lg flex space-x-6 px-6 overflow-x-auto bg-white w-full items-center justify-around"
        aria-label="Tabs"
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'border-primary-100 text-primary-100'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
