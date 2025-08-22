import React, { useState, useEffect } from 'react';
import Section from '@/components/moleculas/Section';
import { CardMedicamentoV2 } from '@/components/moleculas/CardMedicamentoV2';

// --- Datos de Ejemplo Hardcodeados ---
const mockMedicamentos = [
  {
    id: 'med1',
    fechaPrescripcion: '2024-05-15T10:00:00Z',
    nombre: 'Amoxicilina',
    dosis: '500mg',
    frecuencia: 'Cada 8 horas',
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
    {
    id: 'med4',
    fechaPrescripcion: '2023-11-20T11:00:00Z',
    nombre: 'Paracetamol',
    dosis: '1g',
    frecuencia: 'Cada 6 horas',
    medico: 'Dr. John Hammond',
    estado: 'Finalizado',
  },
];

// --- Componente Principal de la Pantalla ---
export const MedicamentosPantalla = ({ data }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      // Simulación de fetch
      const sortedData = mockMedicamentos.sort((a, b) => new Date(b.fechaPrescripcion) - new Date(a.fechaPrescripcion));
      setHistorial(sortedData);
      setLoading(false);
    };

    fetchHistorial();
  }, [data]);

  const handleStatusUpdate = (medicamentoId, nuevoEstado) => {
    setHistorial(currentHistorial =>
      currentHistorial.map(med =>
        med.id === medicamentoId ? { ...med, estado: nuevoEstado } : med
      )
    );
  };

  if (loading) {
    return <p className="text-center text-gray-500">Cargando historial de medicamentos...</p>;
  }

  return (
    <Section title="Historial de Medicamentos Recetados">
      {historial.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {historial.map(item => (
            <CardMedicamentoV2
              key={item.id}
              medicamento={item}
              onStatusChange={handleStatusUpdate}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No se encontraron medicamentos anteriores.</p>
      )}
    </Section>
  );
};
