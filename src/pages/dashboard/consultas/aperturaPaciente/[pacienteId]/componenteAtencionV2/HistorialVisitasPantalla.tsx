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
  const [error, setError] = useState(null); // NUEVO: Estado para manejar errores

  useEffect(() => {
    if (pacienteId) {
      const fetchHistorial = async () => {
        setLoading(true);
        setError(null); // Limpiar errores previos
        try {
          const response = await fetch(`/api/pacientes/${pacienteId}/atencionesHistory`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al cargar el historial de atenciones');
          }
          const fullData = await response.json();
          setHistorial(fullData.data);
        } catch (err) {
          console.error('Error al cargar el historial de atenciones:', err);
          setError(err.message || 'No se pudo cargar el historial de atenciones.');
          setHistorial([]); // Limpiar historial en caso de error
        } finally {
          setLoading(false);
        }
      };
      fetchHistorial();
    }
  }, [data]);

  const handleCardClick = async (e: React.MouseEvent<HTMLButtonElement>, atencionId: string) => {
    setIsModalOpen(true);
    e.stopPropagation();
    setSelectedAtencionData(null); // Limpiar datos previos
    setLoading(true);
    setError(null); // Limpiar errores previos
    try {
      const response = await fetch(`/api/pacientes/${pacienteId}/atenciones/${atencionId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar los detalles de la atención');
      }
      const fullData = await response.json();
      // Asegurarse de que fullData.data exista y no esté vacío antes de establecerlo
      if (fullData.data && Object.keys(fullData.data).length > 0) {
        setSelectedAtencionData(fullData.data);
      } else {
        // Si los datos son vacíos o nulos desde la API, establecer explícitamente a nulo
        setSelectedAtencionData(null);
        setError('No se encontraron datos detallados para esta atención.');
      }
    } catch (err) {
      console.error('Error fetching detalles de atención:', err);
      setError(err.message || 'No se pudieron cargar los detalles de la atención.');
      setSelectedAtencionData(null); // Asegurar que los datos se limpien en caso de error
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
      ) : error ? (
        <p className="text-center text-red-500 py-3">Error: {error}</p>
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
          ) : error ? (
            <p className="text-center text-red-500 py-3">Error: {error}</p>
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
