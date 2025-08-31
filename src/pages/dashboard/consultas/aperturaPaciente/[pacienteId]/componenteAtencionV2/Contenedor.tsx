import { useState } from 'react';
import { RenderizacionPantalla } from './RenderizacionPantalla';

// --- Definición de Pestañas ---
const tabs = [
  { id: 'consultaActual', name: 'Consulta Actual' },
  { id: 'antecedentes', name: 'Antecedentes' },
  { id: 'signos', name: 'Signos Vitales' },
  { id: 'diagnostico', name: 'Diagnósticos' },
  { id: 'medicamentos', name: 'Medicamentos' },
  { id: 'historial', name: 'Historial de Visitas' },
];

// --- Componente Principal ---
export default function Contenedor({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState('consultaActual');

  return (
    <div className="w-full mt-2">
      <div className="border-b border-gray-200">
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

      <div className="w-full  mb-8 mt-2">
        <RenderizacionPantalla activeTab={activeTab} data={data} />
      </div>
    </div>
  );
}
