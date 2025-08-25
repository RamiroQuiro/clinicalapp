import { CardVisitaV2 } from '@/components/moleculas/CardVisitaV2';
import ModalReact from '@/components/moleculas/ModalReact'; // Importar el Modal
import Section from '@/components/moleculas/Section';
import { AtencionExistenteV3 } from '@/components/organismo/AtencionExistenteV3';
import formatDate from '@/utils/formatDate';

import { useEffect, useState } from 'react';

// --- Componente Principal de la Pantalla ---
export const HistorialVisitasPantalla = ({ data, pacienteId }) => {
  const [historial, setHistorial] = useState(data || []);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAtencionData, setSelectedAtencionData] = useState<any>(null);

  useEffect(() => {
    if (pacienteId) {
      const fetchHistorial = async () => {
        setLoading(true);
        const response = await fetch(`/api/pacientes/${pacienteId}/atencionesHistory`);
        if (!response.ok) throw new Error('Error al cargar los detalles de la atención');

        const fullData = await response.json();
        setHistorial(fullData.data);
        setLoading(false);
      };
      fetchHistorial();
    }
  }, [data]);

  const handleCardClick = async (e: React.MouseEvent<HTMLButtonElement>, atencionId: string) => {
    setIsModalOpen(true);
    e.stopPropagation();
    setLoading(true); // Opcional: mostrar un loader mientras se cargan los detalles
    try {
      const response = await fetch(`/api/pacientes/${pacienteId}/atenciones/${atencionId}`);
      if (!response.ok) throw new Error('Error al cargar los detalles de la atención');
      const fullData = await response.json();
      setSelectedAtencionData(fullData.data);
    } catch (error) {
      console.error('Error fetching detalles de atención:', error);
      // alert('No se pudieron cargar los detalles de la atención.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="Historial de Visitas Anteriores">
      {loading ? (
        <p className="text-center text-primary-texto py-3 font-semibold animate-pulse">
          Cargando historial de atenciones previas...
        </p>
      ) : historial.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {historial.map(item => {
            const atencionParaCard = {
              estado: item.estado,
              motivoInicial: item.motivoInicial,
              id: item.id,
              fecha: item.fecha,
              motivoConsulta: item.motivoConsulta,
              medico: {
                nombreCompleto: `${item.nombreDoctor} ${item.apellidoDoctor}`,
              },
            };
            return (
              <CardVisitaV2
                key={item.id}
                atencion={atencionParaCard}
                onClick={e => handleCardClick(e, item.id)}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No se encontraron visitas anteriores.</p>
      )}

      {isModalOpen && (
        <ModalReact
          title={`Detalles de la atencion del día  ${formatDate(selectedAtencionData?.atencionData?.created_at)}`}
          id="modal-atencion-existente"
          onClose={() => setIsModalOpen(false)}
        >
          {loading ? (
            <p className="text-center text-primary-texto py-3 font-semibold animate-pulse">
              Cargando datos de la atención...
            </p>
          ) : selectedAtencionData ? (
            <AtencionExistenteV3
              data={selectedAtencionData}
              onClose={() => setIsModalOpen(false)}
            />
          ) : (
            <p>No se encontraron datos de la atención.</p>
          )}
        </ModalReact>
      )}
    </Section>
  );
};
