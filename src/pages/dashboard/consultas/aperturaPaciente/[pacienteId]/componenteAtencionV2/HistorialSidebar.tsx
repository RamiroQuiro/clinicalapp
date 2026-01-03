import { Badge } from '@/components/atomos/Badge';
import ModalReact from '@/components/moleculas/ModalReact';
import { AtencionExistenteV3 } from '@/components/organismo/AtencionExistenteV3';
import formatDate from '@/utils/formatDate';
import {
  Activity,
  Calendar,
  ChevronRight,
  FileText,
  Heart,
  Scale,
  Stethoscope,
  Thermometer,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const HoverPreview = ({ item }: { item: any }) => (
  <div className="space-y-3 px-2 bg-white border shadow-2xl rounded-2xl w-72 animate-aparecer py-4">
    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b pb-2">
      <Calendar className="h-3 w-3" />
      <span>Vista Previa • Historial</span>
    </div>

    <div className="space-y-2.5">
      <div className="flex items-center gap-2 text-sm">
        <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
          <User className="h-4 w-4" />
        </div>
        <span className="font-semibold text-gray-700 leading-tight">
          Dr. {item.nombreDoctor} {item.apellidoDoctor}
        </span>
      </div>

      {item.motivoConsulta && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase">
            <FileText className="h-3 w-3" />
            <span>Motivo</span>
          </div>
          <p className="text-xs text-gray-600 pl-5 italic line-clamp-3 leading-relaxed">
            "{item.motivoConsulta.replace(/<[^>]*>?/gm, '')}"
          </p>
        </div>
      )}

      {item.diagnosticoPrincipal && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase">
            <Stethoscope className="h-3 w-3" />
            <span>Diagnóstico</span>
          </div>
          <div className="pl-5">
            <Badge
              variant="outline"
              className="text-[10px] bg-indigo-50 border-indigo-200 text-indigo-700 font-bold"
            >
              {item.diagnosticoPrincipal}
            </Badge>
          </div>
        </div>
      )}

      {(item.temperatura || item.frecuenciaCardiaca || item.tensionArterial || item.peso) && (
        <div className="pt-3 border-t">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Signos vitales</p>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {item.temperatura && (
              <div className="flex items-center justify-between bg-rose-50 p-1.5 rounded-md border border-rose-100">
                <Thermometer className="h-3 w-3 text-rose-400" />
                <span className="font-bold text-rose-700">{item.temperatura}°C</span>
              </div>
            )}
            {item.tensionArterial && (
              <div className="flex items-center justify-between bg-blue-50 p-1.5 rounded-md border border-blue-100">
                <Activity className="h-3 w-3 text-blue-400" />
                <span className="font-bold text-blue-700">{item.tensionArterial}</span>
              </div>
            )}
            {item.frecuenciaCardiaca && (
              <div className="flex items-center justify-between bg-amber-50 p-1.5 rounded-md border border-amber-100">
                <Heart className="h-3 w-3 text-amber-400" />
                <span className="font-bold text-amber-700">{item.frecuenciaCardiaca} bpm</span>
              </div>
            )}
            {item.peso && (
              <div className="flex items-center justify-between bg-emerald-50 p-1.5 rounded-md border border-emerald-100">
                <Scale className="h-3 w-3 text-emerald-400" />
                <span className="font-bold text-emerald-700">{item.peso} kg</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

export const HistorialSidebar = ({ data }: { data: any }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAtencion, setSelectedAtencion] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para el hover preview
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [hoverPos, setHoverPos] = useState({ top: 0 });

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

  console.log(historial);
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="p-3 border-b bg-gray-50 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <h3 className="font-bold text-gray-700 text-sm">Historial de Visitas</h3>
        </div>
        <span className="text-[10px] font-bold bg-indigo-100 text-primary-100 px-2 py-0.5 rounded-full">
          {historial.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {loading && !selectedAtencion ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-24 bg-primary-bg-componentes animate-pulse rounded-xl border border-gray-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 rounded-xl text-center">
            <p className="text-red-500 text-xs font-bold">{error}</p>
          </div>
        ) : historial.length === 0 ? (
          <div className="text-center py-10 opacity-30">
            <Calendar className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm font-bold">Sin historial previo</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-100 ml-2.5 space-y-6 pb-6 pt-2">
            {historial.map((item: any) => (
              <div
                key={item.id}
                className="relative ml-5"
                onMouseEnter={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem(item);
                  setHoverPos({ top: rect.top });
                }}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* linea de tiempo */}
                <div className="absolute -left-[27px] top-1 bg-white border-2 border-primary-100 w-3.5 h-3.5 rounded-full z-10 shadow-sm" />

                <div
                  onClick={() => handleVerDetalle(item.id)}
                  className="group cursor-pointer bg-white hover:bg-primary-50/50 p-3 rounded-xl border border-transparent hover:border-primary-200 transition-all shadow-sm hover:shadow-md -mt-1"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-800 transition-colors group-hover:text-primary-600 leading-none">
                        {formatDate(item.fecha)}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">
                        Dr. {item.nombreDoctor} {item.apellidoDoctor}
                      </p>
                    </div>
                    <div className="p-1 rounded-lg bg-gray-50 group-hover:bg-indigo-100 transition-colors">
                      <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-indigo-600" />
                    </div>
                  </div>

                  {item.motivoConsulta && (
                    <div className="text-[11px] text-gray-500 line-clamp-2 italic leading-relaxed">
                      "{item.motivoConsulta.replace(/<[^>]*>?/gm, '')}"
                    </div>
                  )}

                  {item.diagnosticoPrincipal && (
                    <div className="mt-2.5 flex">
                      <Badge
                        variant="outline"
                        className="text-[9px] uppercase font-bold bg-gray-50 text-gray-500 border-gray-200 group-hover:bg-white group-hover:border-indigo-200 group-hover:text-indigo-600"
                      >
                        {item.diagnosticoPrincipal}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Flotante (Hover) */}
      {hoveredItem && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: Math.max(20, Math.min(window.innerHeight - 400, hoverPos.top - 50)),
            right: 360, // Sidebar width + margin
          }}
        >
          <HoverPreview item={hoveredItem} />
        </div>
      )}

      {isModalOpen && (
        <ModalReact
          title="Detalle de Atención"
          id="modal-historial-detalle"
          onClose={() => setIsModalOpen(false)}
          className="w-[90vw] h-[85vh]"
        >
          {selectedAtencion && (
            <AtencionExistenteV3 data={selectedAtencion} onClose={() => setIsModalOpen(false)} />
          )}
        </ModalReact>
      )}
    </div>
  );
};
