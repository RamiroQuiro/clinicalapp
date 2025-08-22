import ModalReact from '@/components/moleculas/ModalReact'; // Importar el Modal
import Section from '@/components/moleculas/Section';
import AtencionExistente from '@/components/organismo/AtencionExistente'; // Importar el componente de detalle
import { useEffect, useState } from 'react';
import { CardVisitaV2 } from '@/components/moleculas/CardVisitaV2';

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
        console.log('fullData', fullData);
        setHistorial(fullData.data);
        setLoading(false);
      };
      fetchHistorial();
    }
  }, [pacienteId]);

  const handleCardClick = async (visitId: string) => {
    setLoading(true); // Opcional: mostrar un loader mientras se cargan los detalles
    try {
      const response = await fetch(`/api/pacientes/${data.pacienteId}/atenciones/${visitId}`);
      if (!response.ok) throw new Error('Error al cargar los detalles de la atención');
      const fullData = await response.json();
      setSelectedAtencionData(fullData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching detalles de atención:', error);
      alert('No se pudieron cargar los detalles de la atención.');
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
                onClick={() => handleCardClick(item.id)}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No se encontraron visitas anteriores.</p>
      )}

      {isModalOpen && selectedAtencionData && (
        <ModalReact
          title={`Detalles de la Visita del ${new Date(selectedAtencionData.atencionData.created_at).toLocaleDateString()}`}
          id="modal-atencion-existente"
          onClose={() => setIsModalOpen(false)}
          className="md:min-w-[90vw] md:min-h-[90vh] w-full h-full" // Ajuste para pantalla completa
        >
          <AtencionExistente
            atencionData={selectedAtencionData}
            onClose={() => setIsModalOpen(false)}
          />
        </ModalReact>
      )}
    </Section>
  );
};
