import calcularEdad from '@/utils/calcularEdad';
import {
  Calendar,
  Calendar1,
  Clock,
  HeartPulse,
  Mail,
  Phone,
  Pill,
  Ruler,
  Stethoscope,
  Thermometer,
  User,
  Weight,
  Wind,
} from 'lucide-react';

// Componente para un item de información del paciente
const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 text-muted-foreground mt-1">{icon}</div>
    <div>
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">{value || 'N/A'}</p>
    </div>
  </div>
);

// Componente para una sección
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
    <h3 className="text-xl font-semibold text-foreground mb-4 border-b pb-3">{title}</h3>
    {children}
  </div>
);

// Mock data types - to avoid TypeScript errors in the component
type Medico = {
  nombre: string;
  apellido: string;
};

type Paciente = {
  nombre: string;
  apellido: string;
  dni: string;
  fNacimiento: string;
  sexo: string;
  email: string;
  celular: string;
};

type AtencionData = {
  fecha: string;
  medico: Medico;
  motivoConsulta: string;
  sintomas: string;
  observaciones: string;
};

type SignosVitales = {
  temperatura: number;
  frecuenciaCardiaca: number;
  frecuenciaRespiratoria: number;
  tensionArterial: string;
  peso: number;
  talla: number;
};

type Diagnostico = {
  id: string;
  diagnostico: string;
  codigoCIE: string;
  observaciones: string;
};

type Medicamento = {
  id: string;
  nombreComercial: string;
  nombreGenerico: string;
  dosis: string;
  frecuencia: string;
};

type Atencion = {
  atencionData: AtencionData;
  signosVitales: SignosVitales;
  diagnosticos: Diagnostico[];
  medicamentos: Medicamento[];
};

type ComponentProps = {
  data: {
    atencionData: Atencion;
    pacienteData: Paciente;
  } | null;
  onClose: () => void;
};

export const AtencionExistenteV3 = ({ data, onClose }: ComponentProps) => {
  console.log('esta es la data para la atencion existente', data);
  if (!data) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-card text-card-foreground rounded-lg p-8">
          Cargando datos de la atención...
        </div>
      </div>
    );
  }

  console.log('esta es la data para la atencion existente', data);
  const { atencionData: atencion, pacienteData: paciente } = data;
  const edad = paciente?.fNacimiento ? calcularEdad(paciente.fNacimiento) : 'N/A';

  return (
    <div className="overflow-y-auto">
      {/* Encabezado */}
      <div className="flex items-center justify-between w-full  pb-2">
        <InfoItem
          icon={<Calendar1 size={16} />}
          label="Incio de Consulta"
          value={atencion?.atencionData?.inicioConsulta}
        />
        <InfoItem
          icon={<Calendar1 size={16} />}
          label="Fin de Consulta"
          value={atencion?.atencionData?.finConsulta}
        />
        <InfoItem
          icon={<Clock size={16} />}
          label="Duración de la Atencion"
          value={atencion?.atencionData?.duracionAtencion}
        />
      </div>
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="overflow-y-auto p2 space-y-4">
          {/* Datos del Paciente */}
          <Section title={`Datos del Paciente`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <InfoItem
                icon={<User size={18} />}
                label="Nombre Completo"
                value={`${paciente?.nombre} ${paciente?.apellido}`}
              />
              <InfoItem icon={<User size={18} />} label="DNI" value={paciente?.dni} />
              <InfoItem icon={<Calendar size={18} />} label="Edad" value={`${edad} años`} />
              <InfoItem icon={<User size={18} />} label="Sexo" value={paciente?.sexo} />
              <InfoItem icon={<Mail size={18} />} label="Email" value={paciente?.email} />
              <InfoItem icon={<Phone size={18} />} label="Celular" value={paciente?.celular} />
            </div>
          </Section>
          {/* detalles de los sintomas de la consulta */}
          <Section title="Detalles de los Sintomas">
            <div className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
              <span className="font-semibold text-foreground">Atendido por:</span>{' '}
              <p className="capitalize ">{`${atencion?.nombreDoctor} ${atencion?.apellidoDoctor}`}</p>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Motivo de Consulta</h4>
                <p className="text-muted-foreground pl-4 border-l-2 border-primary">
                  {atencion?.motivoConsulta}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Síntomas (Anamnesis)</h4>
                <p className="text-muted-foreground pl-4">
                  {atencion?.sintomas || 'No se registraron síntomas.'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Observaciones</h4>
                <p className="text-muted-foreground pl-4">
                  {atencion?.observaciones || 'Sin observaciones.'}
                </p>
              </div>
            </div>
          </Section>

          {/* Signos Vitales */}
          {atencion?.signosVitales && (
            <Section title="Signos Vitales">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 text-sm">
                <InfoItem
                  icon={<Thermometer size={18} />}
                  label="Temperatura"
                  value={`${atencion?.signosVitales?.temperatura}°C`}
                />
                <InfoItem
                  icon={<HeartPulse size={18} />}
                  label="Frec. Cardíaca"
                  value={`${atencion?.signosVitales?.frecuenciaCardiaca} lpm`}
                />
                <InfoItem
                  icon={<Wind size={18} />}
                  label="Frec. Resp."
                  value={`${atencion?.signosVitales?.frecuenciaRespiratoria} rpm`}
                />
                <InfoItem
                  icon={<HeartPulse size={18} />}
                  label="Tensión Arterial"
                  value={atencion?.signosVitales?.tensionArterial}
                />
                <InfoItem
                  icon={<Weight size={18} />}
                  label="Peso"
                  value={`${atencion?.signosVitales?.peso} kg`}
                />
                <InfoItem
                  icon={<Ruler size={18} />}
                  label="Talla"
                  value={`${atencion?.signosVitales?.talla} cm`}
                />
              </div>
            </Section>
          )}

          {/* Diagnósticos */}
          <Section title="Diagnósticos">
            <ul className="space-y-3">
              {atencion?.diagnosticos?.length > 0 ? (
                atencion?.diagnosticos?.map(diag => (
                  <li key={diag.id} className="bg-background rounded-md p-3 border">
                    <div className="flex items-center gap-3 font-semibold text-foreground">
                      <Stethoscope size={18} className="text-primary" />
                      <span>{diag.diagnostico}</span>
                      {diag.codigoCIE && (
                        <span className="text-xs font-mono text-secondary-foreground bg-secondary px-2 py-1 rounded-full">
                          {diag.codigoCIE}
                        </span>
                      )}
                    </div>
                    {diag.observaciones && (
                      <p className="text-sm mt-2 pl-8 text-muted-foreground">
                        {diag.observaciones}
                      </p>
                    )}
                  </li>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No se registraron diagnósticos.</p>
              )}
            </ul>
          </Section>

          {/* Medicamentos */}
          <Section title="Medicamentos Recetados">
            <ul className="space-y-3">
              {atencion?.medicamentos?.length > 0 ? (
                atencion?.medicamentos?.map(med => (
                  <li key={med.id} className="bg-background rounded-md p-3 border">
                    <div className="flex items-center gap-3 font-semibold text-foreground">
                      <Pill size={18} className="text-primary" />
                      <span>{med.nombreComercial || med.nombreGenerico}</span>
                    </div>
                    <div className="pl-8 text-sm mt-2 text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
                      <p>
                        <span className="font-semibold text-foreground">Genérico:</span>{' '}
                        {med.nombreGenerico}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Dosis:</span> {med.dosis}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Frecuencia:</span>{' '}
                        {med.frecuencia}
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No se recetaron medicamentos.</p>
              )}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
};
