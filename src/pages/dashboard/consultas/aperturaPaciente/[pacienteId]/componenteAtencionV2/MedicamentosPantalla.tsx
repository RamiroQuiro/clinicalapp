import React, { useState, useEffect } from 'react';
import Section from '@/components/moleculas/Section';
import { InfoCard } from '@/components/moleculas/InfoCard';
import { Pill } from 'lucide-react';

// --- Datos de Ejemplo Hardcodeados ---
const mockMedicamentos = [
  {
    id: 'med1',
    fechaPrescripcion: '2024-05-15T10:00:00Z',
    nombre: 'Amoxicilina',
    dosis: '500mg',
    frecuencia: 'Cada 8 horas por 7 días',
    medico: 'Dr. Alan Grant',
    estado: 'Finalizado',
  },
  {
    id: 'med2',
    fechaPrescripcion: '2025-01-10T09:00:00Z',
    nombre: 'Losartán',
    dosis: '50mg',
    frecuencia: '1 por día',
    medico: 'Dr. Ellie Sattler',
    estado: 'Activo',
  },
  {
    id: 'med3',
    fechaPrescripcion: '2025-08-18T14:00:00Z',
    nombre: 'Loratadina',
    dosis: '10mg',
    frecuencia: 'Según necesidad',
    medico: 'Dr. Ian Malcolm',
    estado: 'Activo',
  },
];

// --- Componente Principal de la Pantalla ---
export const MedicamentosPantalla = ({ data }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusInfo = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return { text: 'Activo', colorClass: 'bg-green-100 text-green-800' };
      case 'finalizado':
        return { text: 'Finalizado', colorClass: 'bg-gray-100 text-gray-800' };
      default:
        return { text: estado, colorClass: 'bg-blue-100 text-blue-800' };
    }
  };

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      // const response = await fetch(`/api/pacientes/${data.pacienteId}/medicamentos`);
      // const realData = await response.json();
      // setHistorial(realData);
      
      const sortedData = mockMedicamentos.sort((a, b) => new Date(b.fechaPrescripcion) - new Date(a.fechaPrescripcion));
      setHistorial(sortedData);
      setLoading(false);
    };

    fetchHistorial();
  }, [data]);

  if (loading) {
    return <p className="text-center text-gray-500">Cargando historial de medicamentos...</p>;
  }

  return (
    <Section title="Historial de Medicamentos Recetados">
      {historial.length > 0 ? (
        <div className="space-y-4">
          {historial.map(item => (
            <InfoCard
              key={item.id}
              icon={<Pill size={20} className="text-gray-500" />}
              title={item.nombre}
              subtitle={`Recetado por: ${item.medico}`}
              date={new Date(item.fechaPrescripcion).toLocaleDateString()}
              status={getStatusInfo(item.estado)}
              bodyText={`Dosis: ${item.dosis} - Frecuencia: ${item.frecuencia}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No se encontraron medicamentos anteriores.</p>
      )}
    </Section>
  );
};