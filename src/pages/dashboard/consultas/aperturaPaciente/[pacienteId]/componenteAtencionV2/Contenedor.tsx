import { consultaStore } from '@/context/consultaAtencion.store';
import { useState } from 'react';
import { RenderizacionPantalla } from './RenderizacionPantalla';

// --- Definición de Pestañas ---
const tabs = [
  { id: 'consultaActual', name: 'Consulta Actual' },
  { id: 'antecedentes', name: 'Antecedentes' },
  { id: 'signos', name: 'Signos Vitales' },
  { id: 'diagnostico', name: 'Diagnósticos' },
  { id: 'medicamentos', name: 'Medicamentos' },
  { id: 'solicitudes', name: 'Solicitudes' },
  { id: 'historial', name: 'Historial de Visitas' },
];

// --- Componente Principal ---
export default function Contenedor({ data, esFinalizada }: { data: any; esFinalizada: boolean }) {
  const [activeTab, setActiveTab] = useState('consultaActual');
  consultaStore.set(data);

  return (
    <div className="mt-2 w-full">
      {!esFinalizada && (
        <div className="border-gray-200 border-b">
          <nav
            className="flex justify-around items-center space-x-6 bg-white -mb-px px-6 border rounded-lg w-full overflow-x-auto"
            aria-label="Tabs"
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${activeTab === tab.id
                    ? 'border-primary-100 text-primary-100'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      )}
      <div className="mt-2 mb-8 w-full">
        <RenderizacionPantalla activeTab={activeTab} data={data} esFinalizada={esFinalizada} />
      </div>
    </div>
  );
}
