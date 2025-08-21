import { InfoCard } from '@/components/moleculas/InfoCard';
import Section from '@/components/moleculas/Section';
import { useEffect, useState } from 'react';

// --- Datos de Ejemplo Hardcodeados ---
const mockDiagnosticos = [
  {
    id: 'diag1',
    fecha: '2024-05-15T10:00:00Z',
    diagnostico: 'Faringitis Aguda',
    observaciones: 'Paciente reporta dolor de garganta y fiebre. Se recomienda reposo.',
    doctor: 'Dr. Alan Grant',
    estado: 'Curado',
  },
  {
    id: 'diag2',
    fecha: '2024-07-22T11:30:00Z',
    diagnostico: 'Esguince de Tobillo (Grado II)',
    observaciones: 'Torcedura durante actividad deportiva. Se inmoviliza con férula.',
    doctor: 'Dr. Ian Malcolm',
    estado: 'Controlado',
  },
  {
    id: 'diag3',
    fecha: '2025-01-10T09:00:00Z',
    diagnostico: 'Hipertensión Arterial',
    observaciones: 'Detectada en control de rutina. Se inicia tratamiento y monitoreo.',
    doctor: 'Dr. Ellie Sattler',
    estado: 'Activo',
  },
  {
    id: 'diag4',
    fecha: '2025-08-18T14:00:00Z',
    diagnostico: 'Rinitis Alérgica',
    observaciones: 'Episodios estacionales. Se receta antihistamínico.',
    doctor: 'Dr. Ian Malcolm',
    estado: 'Activo',
  },
];

// --- Componente Principal de la Pantalla ---
export const DiagnosticosPantalla = ({ data }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'bg-red-100 text-red-800';
      case 'controlado':
        return 'bg-yellow-100 text-yellow-800';
      case 'curado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      const sortedData = mockDiagnosticos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setHistorial(sortedData);
      setLoading(false);
    };

    fetchHistorial();
  }, [data]);

  if (loading) {
    return <p className="text-center text-gray-500">Cargando historial de diagnósticos...</p>;
  }

  return (
    <Section title="Historial de Diagnósticos">
      {historial.length > 0 ? (
        <div className="space-y-4">
          {historial.map(item => (
            <InfoCard
              key={item.id}
              title={item.diagnostico}
              subtitle={`Diagnosticado por: ${item.doctor}`}
              date={new Date(item.fecha).toLocaleDateString()}
              status={{ text: item.estado, colorClass: getStatusColor(item.estado) }}
              bodyText={item.observaciones}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No se encontraron diagnósticos anteriores.</p>
      )}
    </Section>
  );
};
