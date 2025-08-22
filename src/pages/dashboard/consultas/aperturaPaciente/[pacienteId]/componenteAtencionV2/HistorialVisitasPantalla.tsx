import { InfoCard } from '@/components/moleculas/InfoCard';
import ModalReact from '@/components/moleculas/ModalReact'; // Importar el Modal
import Section from '@/components/moleculas/Section';
import AtencionExistente from '@/components/organismo/AtencionExistente'; // Importar el componente de detalle
import { ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';

// --- Componente Principal de la Pantalla ---
export const HistorialVisitasPantalla = ({ data }) => {
  const [historial, setHistorial] = useState(data || []);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAtencionData, setSelectedAtencionData] = useState<any>(null);

  useEffect(() => {
    if (data?.pacienteId) {
      setHistorial(data);
    }
  }, [data?.pacienteId]);

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
      {historial.length > 0 ? (
        <div className="space-y-4">
          {historial.map(item => (
            <InfoCard
              key={item.id}
              icon={<ClipboardList size={20} className="text-gray-500" />}
              title={`Visita con ${item.nombreDoctor} ${item.apellidoDoctor}`}
              subtitle={`Motivo: ${item.motivoConsulta}`}
              date={new Date(item.fecha).toLocaleDateString()}
              bodyText={`Diagnóstico principal: ${item.diagnosticoPrincipal}`}
              onClick={() => handleCardClick(item.id)} // Hacer la tarjeta clicable
            />
          ))}
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
