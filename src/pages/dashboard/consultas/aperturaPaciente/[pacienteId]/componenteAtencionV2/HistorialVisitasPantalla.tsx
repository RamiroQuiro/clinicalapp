import React, { useState, useEffect } from 'react';
import Section from '@/components/moleculas/Section';
import { InfoCard } from '@/components/moleculas/InfoCard';
import { ClipboardList } from 'lucide-react';

// --- Datos de Ejemplo Hardcodeados ---
const mockVisitas = [
  {
    id: 'vis1',
    fecha: '2024-05-15T10:00:00Z',
    motivoConsulta: 'Dolor de garganta y fiebre.',
    medico: 'Dr. Alan Grant',
    diagnosticoPrincipal: 'Faringitis Aguda',
  },
  {
    id: 'vis2',
    fecha: '2024-07-22T11:30:00Z',
    motivoConsulta: 'Seguimiento de esguince.',
    medico: 'Dr. Ian Malcolm',
    diagnosticoPrincipal: 'Esguince de Tobillo (Grado II)',
  },
  {
    id: 'vis3',
    fecha: '2025-01-10T09:00:00Z',
    motivoConsulta: 'Control de presión arterial.',
    medico: 'Dr. Ellie Sattler',
    diagnosticoPrincipal: 'Hipertensión Arterial',
  },
  {
    id: 'vis4',
    fecha: '2025-08-18T14:00:00Z',
    motivoConsulta: 'Consulta por alergia estacional.',
    medico: 'Dr. Ian Malcolm',
    diagnosticoPrincipal: 'Rinitis Alérgica',
  },
];

// --- Componente Principal de la Pantalla ---
export const HistorialVisitasPantalla = ({ data }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      // const response = await fetch(`/api/pacientes/${data.pacienteId}/visitas`);
      // const realData = await response.json();
      // setHistorial(realData);
      
      const sortedData = mockVisitas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setHistorial(sortedData);
      setLoading(false);
    };

    fetchHistorial();
  }, [data]);

  if (loading) {
    return <p className="text-center text-gray-500">Cargando historial de visitas...</p>;
  }

  return (
    <Section title="Historial de Visitas Anteriores">
      {historial.length > 0 ? (
        <div className="space-y-4">
          {historial.map(item => (
            <InfoCard
              key={item.id}
              icon={<ClipboardList size={20} className="text-gray-500" />}
              title={`Visita con ${item.medico}`}
              subtitle={`Motivo: ${item.motivoConsulta}`}
              date={new Date(item.fecha).toLocaleDateString()}
              bodyText={`Diagnóstico principal: ${item.diagnosticoPrincipal}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No se encontraron visitas anteriores.</p>
      )}
    </Section>
  );
};