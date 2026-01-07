import { Badge } from '@/components/atomos/Badge';
import ModalReact from '@/components/moleculas/ModalReact';
import { AtencionExistenteV3 } from '@/components/organismo/AtencionExistenteV3';
import formatDate from '@/utils/formatDate';
import {
  Activity,
  AlertCircle,
  BarChart3,
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
import PercentilesPantallaConsulta from './PercentilesPantallaConsulta';

const VITAL_PREVIEW_CONFIG = [
  {
    key: 'temperatura',
    label: 'Temp.',
    unit: '°C',
    icon: Thermometer,
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    text: 'text-rose-700',
    iconColor: 'text-rose-400',
  },
  {
    key: 'tensionArterial',
    label: 'T.A.',
    unit: '',
    icon: Activity,
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-700',
    iconColor: 'text-blue-400',
  },
  {
    key: 'frecuenciaCardiaca',
    label: 'F.C.',
    unit: ' bpm',
    icon: Heart,
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-700',
    iconColor: 'text-amber-400',
  },
  {
    key: 'peso',
    label: 'Peso',
    unit: ' kg',
    icon: Scale,
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-700',
    iconColor: 'text-emerald-400',
  },
  {
    key: 'saturacionOxigeno',
    label: 'Sat.',
    unit: '%',
    icon: Activity,
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    text: 'text-indigo-700',
    iconColor: 'text-indigo-400',
  },
];

const HoverPreview = ({ item }: { item: any }) => {
  const visibleVitals = VITAL_PREVIEW_CONFIG.filter(config => {
    const value = item[config.key];
    return value !== null && value !== undefined && value !== '' && value !== 0;
  });

  return (
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

        {item.diagnosticos && item.diagnosticos.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase">
              <Stethoscope className="h-3 w-3" />
              <span>Diagnósticos</span>
            </div>
            <div className="pl-5 flex flex-wrap gap-1">
              {item.diagnosticos.map((diag: string, idx: number) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-[10px] bg-indigo-50 border-indigo-100 text-indigo-700 font-bold"
                >
                  {diag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.medicamentos && item.medicamentos.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase">
              <Activity className="h-3 w-3" />
              <span>Medicamentos</span>
            </div>
            <div className="pl-5 flex flex-wrap gap-1">
              {item.medicamentos.map((med: string, idx: number) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-[10px] bg-emerald-50 border-emerald-100 text-emerald-700 font-bold"
                >
                  {med}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {visibleVitals.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Signos vitales</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {visibleVitals.map(config => (
                <div
                  key={config.key}
                  className={`flex items-center justify-between ${config.bg} p-1.5 rounded-md border ${config.border}`}
                >
                  <config.icon className={`h-3 w-3 ${config.iconColor}`} />
                  <span className={`font-bold ${config.text}`}>
                    {item[config.key]}
                    {config.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const HistorialSidebar = ({
  data,
  $consulta,
  activeTab = 'historial',
  onTabChange
}: {
  data: any;
  $consulta: any;
  activeTab?: 'percentiles' | 'historial';
  onTabChange?: (tab: 'percentiles' | 'historial') => void;
}) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAtencion, setSelectedAtencion] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isAllProfessionals, setIsAllProfessionals] = useState<boolean>(false);
  // Estado para el hover preview
  const [hoveredItem, setHoveredItem] = useState<any>(null);
  const [hoverPos, setHoverPos] = useState({ top: 0 });

  // Procesar antecedentes destacados (se muestran todos por pedido del usuario)
  const antecedentesDestacados = data?.antecedentes || [];

  const rawAlergias = data?.paciente?.alergias;
  const textoAlergias = Array.isArray(rawAlergias)
    ? rawAlergias.map((a: any) => (typeof a === 'string' ? a : a.sustancia)).join(', ')
    : typeof rawAlergias === 'string'
      ? rawAlergias
      : '';

  useEffect(() => {
    if (data) {
      fetchHistorial();
    }
  }, [data, isAllProfessionals]);

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        excludeAtencionId: data.atencion.id,
        soloMisAtenciones: (!isAllProfessionals).toString(),
      });
      const response = await fetch(
        `/api/pacientes/${data.atencion.pacienteId}/atencionesHistory?${params}`
      );
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
    setDetailLoading(true);
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
      setDetailLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Tabs para alternar entre Percentiles e Historial */}
      <div className="flex border-b border-gray-200 shrink-0 bg-gray-50">
        <button
          onClick={() => onTabChange?.('percentiles')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-sm transition-colors ${activeTab === 'percentiles'
            ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Percentiles</span>
        </button>
        <button
          onClick={() => onTabChange?.('historial')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-sm transition-colors ${activeTab === 'historial'
            ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Historial</span>
        </button>
      </div>

      {/* Contenido según tab activo */}
      {activeTab === 'percentiles' ? (
        <div className="flex-1 overflow-y-auto">
          <PercentilesPantallaConsulta $consulta={$consulta} data={data} verticalLayout={true} />
        </div>
      ) : (
        <>

          {/* Hub de Contexto Clínico (Fijo arriba) */}
          {(textoAlergias || antecedentesDestacados.length > 0) && (
            <div className="p-3 bg-indigo-50/40 border-b border-indigo-100/50 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3.5 h-3.5 text-primary-100" />
                <h3 className="text-[10px] font-bold text-primary-textoTitle uppercase tracking-wider">
                  Antecedentes / Alergias
                </h3>
              </div>
              <div className="space-y-1.5">
                {textoAlergias && (
                  <div className="flex border-b border-black/20 pb-1 gap-2 items-center">
                    <span className="text-[9px] text-rose-600 inline-flex items-center gap-2  font-bold uppercase mr-1">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Alergias:
                    </span>
                    <p className="text-sm text-red-700 font-bold leading-tight">{textoAlergias}</p>
                  </div>
                )}
                {antecedentesDestacados.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center pt-1">
                    <span className="text-[9px] text-gray-400 font-bold uppercase mr-1">
                      Antecedentes:
                    </span>
                    {antecedentesDestacados.map((ant: any, idx: number) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-white border-indigo-200 text-indigo-700 font-bold py-0 h-4 px-1.5"
                      >
                        {ant.antecedente}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-3 border-b bg-gray-50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-100" />
              <h3 className="font-bold text-primary-textoTitle">Historial de Visitas</h3>
            </div>
            <span className="text-[10px] font-bold bg-indigo-100 text-primary-100 px-2 py-0.5 rounded-full">
              {historial.length}
            </span>
            <button
              onClick={() => setIsAllProfessionals(!isAllProfessionals)}
              className="text-[10px] font-bold bg-indigo-100 text-primary-100 px-2 py-0.5 rounded-full"
            >
              {isAllProfessionals ? 'mis atenciones' : 'todas atenciones'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar" style={{ minHeight: 0 }}>
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

        </>
      )}

      {isModalOpen && (
        <ModalReact
          title="Ficha de Atención Clínica"
          id="modal-historial-detalle"
          onClose={() => setIsModalOpen(false)}
          className="w-[90vw] h-[85vh] max-w-5xl"
        >
          {detailLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 py-20">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Cargando Historia...
              </p>
            </div>
          ) : (
            selectedAtencion && <AtencionExistenteV3 data={selectedAtencion} />
          )}
        </ModalReact>
      )}
    </div>
  );
};
