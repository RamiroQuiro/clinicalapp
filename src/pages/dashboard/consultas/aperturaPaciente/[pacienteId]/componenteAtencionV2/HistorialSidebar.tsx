import ModalReact from '@/components/moleculas/ModalReact';
import { AtencionExistenteV3 } from '@/components/organismo/AtencionExistenteV3';
import formatDate from '@/utils/formatDate';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export const HistorialSidebar = ({ data }: { data: any }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAtencion, setSelectedAtencion] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (data) {
      fetchHistorial();
    }
  }, [data]);

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pacientes/${data.atencion.pacienteId}/atencionesHistory`);
      if (!response.ok) throw new Error('Error al cargar historial');
      const result = await response.json();
      setHistorial(result.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = async (atencionId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/pacientes/${data.atencion.pacienteId}/atenciones/${atencionId}`
      );
      const result = await response.json();
      if (result.data) {
        setSelectedAtencion(result.data);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Historial de Visitas</h3>
        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
          {historial.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading && !selectedAtencion ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500 text-xs text-center">{error}</p>
        ) : historial.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Sin historial previo</p>
        ) : (
          <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pb-4">
            {historial.map((item: any) => (
              <div key={item.id} className="relative ml-4">
                {/* Timeline dot */}
                <div className="absolute -left-[25px] top-0 bg-white border-2 border-indigo-500 w-4 h-4 rounded-full"></div>

                <div
                  onClick={() => handleVerDetalle(item.id)}
                  className="group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors -mt-1"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{formatDate(item.fecha)}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {item.nombreDoctor} {item.apellidoDoctor}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </div>

                  {item.motivoConsulta && (
                    <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                      <span className="font-semibold text-gray-700 text-xs block mb-1">
                        Motivo:
                      </span>
                      {item.motivoConsulta}
                    </div>
                  )}

                  {item.diagnosticoPrincipal && (
                    <div className="mt-1">
                      <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100">
                        {item.diagnosticoPrincipal}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <ModalReact
          title="Detalle de Atención"
          id="modal-historial-detalle"
          onClose={() => setIsModalOpen(false)}
        >
          {selectedAtencion && (
            <AtencionExistenteV3 data={selectedAtencion} onClose={() => setIsModalOpen(false)} />
          )}
        </ModalReact>
      )}
    </div>
  );
};
