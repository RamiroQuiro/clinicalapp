import formatDate from '@/utils/formatDate';
import {
  Activity,
  AlertCircle,
  Calculator,
  Clock,
  Droplet,
  Heart,
  Pill,
  Ruler,
  Scale,
  Stethoscope,
  Syringe,
  Thermometer,
  User,
  Wind,
} from 'lucide-react';

const VITAL_SIGNS_CONFIG = [
  { key: 'temperatura', label: 'Temperatura', unit: '°C', icon: Thermometer, color: 'bg-rose-500' },
  {
    key: 'frecuenciaCardiaca',
    label: 'Frec. Cardíaca',
    unit: ' lpm',
    icon: Heart,
    color: 'bg-amber-500',
  },
  {
    key: 'presionSistolica',
    label: 'P. Sistólica',
    unit: ' mmHg',
    icon: Activity,
    color: 'bg-blue-600',
  },
  {
    key: 'presionDiastolica',
    label: 'P. Diastólica',
    unit: ' mmHg',
    icon: Activity,
    color: 'bg-blue-400',
  },
  {
    key: 'saturacionOxigeno',
    label: 'Saturación O2',
    unit: '%',
    icon: Activity,
    color: 'bg-emerald-500',
  },
  {
    key: 'frecuenciaRespiratoria',
    label: 'Frec. Resp.',
    unit: ' rpm',
    icon: Wind,
    color: 'bg-sky-500',
  },
  { key: 'peso', label: 'Peso', unit: ' kg', icon: Scale, color: 'bg-indigo-500' },
  { key: 'talla', label: 'Talla', unit: ' cm', icon: Ruler, color: 'bg-cyan-500' },
  { key: 'imc', label: 'IMC', unit: '', icon: Calculator, color: 'bg-purple-500' },
  { key: 'glucosa', label: 'Glucosa', unit: ' mg/dl', icon: Droplet, color: 'bg-orange-500' },
  {
    key: 'perimetroCefalico',
    label: 'P. Cefálico',
    unit: ' cm',
    icon: Ruler,
    color: 'bg-teal-500',
  },
  {
    key: 'perimetroAbdominal',
    label: 'P. Abdominal',
    unit: ' cm',
    icon: Ruler,
    color: 'bg-lime-500',
  },
  { key: 'dolor', label: 'Dolor (EVA)', unit: '/10', icon: AlertCircle, color: 'bg-red-600' },
];

const ClinicalSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2  pb-6 border-b border-gray-100 last:border-0 last:pb-0">
    <div className="flex items-center gap-2 text-xs font-bold text-primary-100 uppercase tracking-wider">
      <Icon className="w-4 h-4" />
      <span>{title}</span>
    </div>
    <div className="pl-6">{children}</div>
  </div>
);

const VitalCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) => (
  <div className={`p-3 rounded-xl border bg-white flex items-center gap-3 shadow-sm`}>
    <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
      <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-700 leading-none">{value}</p>
    </div>
  </div>
);

export const AtencionExistenteV3 = ({ data }: { data: any }) => {
  if (!data) return <div className="p-10 text-center text-gray-400">Cargando...</div>;

  const { atencionData: atencion } = data;

  // Filtrar signos vitales que tienen contenido
  const visibleVitalSigns = VITAL_SIGNS_CONFIG.filter(config => {
    const value = atencion?.signosVitales?.[config.key];
    return value !== null && value !== undefined && value !== '' && value !== 0;
  });

  return (
    <div className=" mx-auto border border-gray-100 rounded  ">
      {/* Encabezado Principal */}
      <div className="bg-primary-100 rounded-t py-3 px-5 text-white mb-4  flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded backdrop-blur-md">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">
              Dr. {atencion?.nombreDoctor} {atencion?.apellidoDoctor}
            </h2>
            <p className="text-indigo-100 text-sm opacity-90">{formatDate(atencion?.fecha)}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="p-2 flex flex-col items-center text-center">
            <p className="text-xs font-bold uppercase">Duración</p>
            <div className="flex items-center gap-1.5 font-thin">
              <Clock className="w-4 h-4" />
              <span>{atencion?.atencionData?.duracionAtencion} min</span>
            </div>
          </div>
        </div>
      </div>
      {/* contenedor principal */}
      <div className="flex gap-4 w-full ">
        <div className="lg:col-span-2 gap-4  flex-1   flex flex-col  p-5 m">
          <ClinicalSection title="Motivo Inicial" icon={User}>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-700 font-medium leading-relaxed italic border-l-3 border-indigo-500 pl-4">
                  "{atencion?.motivoInicial}"
                </p>
              </div>
            </div>
          </ClinicalSection>
          <ClinicalSection title="Motivo Consulta" icon={User}>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-700 font-medium leading-relaxed italic border-l-3 border-indigo-500 pl-4">
                  "{atencion?.motivoConsulta}"
                </p>
              </div>
            </div>
          </ClinicalSection>

          {atencion?.sintomas && (
            <ClinicalSection title="Anamnesis / Síntomas" icon={User}>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed">{atencion.sintomas}</p>
                </div>
              </div>
            </ClinicalSection>
          )}

          {atencion?.examenFisico && (
            <ClinicalSection title="Objetivo / Examen Físico" icon={Activity}>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {atencion.examenFisico}
              </p>
            </ClinicalSection>
          )}

          <ClinicalSection title="Diagnósticos" icon={Stethoscope}>
            <div className="flex flex-wrap gap-2">
              {atencion?.diagnosticos?.length > 0 ? (
                atencion.diagnosticos.map((diag: any) => (
                  <div
                    key={diag.id}
                    className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100 w-full group transition-all hover:bg-indigo-50/30 hover:border-indigo-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700">{diag.diagnostico}</span>
                    </div>
                    {diag.observaciones && (
                      <p className="text-[11px] text-gray-400 mt-1 italic pl-10">
                        "{diag.observaciones}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No se registraron diagnósticos.</p>
              )}
            </div>
          </ClinicalSection>

          <ClinicalSection title="Medicamentos" icon={Syringe}>
            {atencion?.medicamentos?.length > 0 ? (
              <div className="bg-indigo-50/30 rounded-2xl p-4 border border-indigo-100">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-700 uppercase">
                  <Pill className="w-3 h-3" />
                  <span>Prescripción de Medicamentos</span>
                </div>
                <div className="grid gap-3">
                  {atencion.medicamentos.map((med: any) => (
                    <div
                      key={med.id}
                      className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {med.nombreComercial || med.nombreGenerico}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          Genérico: {med.nombreGenerico}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                          {med.dosis} cada {med.frecuencia}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No se encontraron medicamentos prescritos.</p>
            )}
          </ClinicalSection>
          {atencion?.planSeguir && (
            <ClinicalSection title="Tratamiento / Plan a Seguir" icon={Syringe}>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-gray-100">
                {atencion.planSeguir}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-gray-100">
                {atencion.tratamiento}
              </p>
            </ClinicalSection>
          )}

          {atencion?.observaciones && (
            <ClinicalSection title="Observaciones Adicionales" icon={Activity}>
              <p className="text-sm text-gray-500 italic">"{atencion.observaciones}"</p>
            </ClinicalSection>
          )}
        </div>

        {/* Columna Derecha: Signos Vitales y Tags */}
        <div className="space-y-6 px-4 pb-4">
          <div className="bg-primary-bg-componentes rounded p-6 border border-gray-100 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-3 mb-4">
              Signos Vitales
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {visibleVitalSigns.length > 0 ? (
                visibleVitalSigns.map(config => (
                  <VitalCard
                    key={config.key}
                    label={config.label}
                    value={`${atencion.signosVitales[config.key]}${config.unit}`}
                    icon={config.icon}
                    color={config.color}
                  />
                ))
              ) : (
                <p className="text-[10px] text-gray-400 text-center italic">Sin registros</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
