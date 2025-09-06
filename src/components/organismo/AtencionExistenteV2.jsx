import calcularEdad from '@/utils/calcularEdad';
import { getDurationInMinutes } from '@/utils/timesUtils'; // ADDED
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
import { Card, CardContent, CardHeader, CardTitle } from './Card';

// Componente para un item de información del paciente
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <div className="flex-shrink-0 text-muted-foreground mt-1">{icon}</div>
    <div className="min-w-0">
      <p className="font-medium text-sm">{label}</p>
      <p className="text-muted-foreground text-sm truncate">{value || 'N/A'}</p>
    </div>
  </div>
);

// Componente para una sección
const Section = ({ title, children }) => (
  <div className="bg-white rounded-lg p-4 w-full">
    <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">{title}</h3>
    {children}
  </div>
);

export const AtencionExistenteV2 = ({ data, onClose }) => {
  if (!data) {
    return <div>Cargando datos de la atención...</div>;
  }
  console.log('data del atencion existente', data);
  const { atencion, paciente } = data;
  const edad = paciente?.fNacimiento ? calcularEdad(paciente?.fNacimiento) : 'N/A';

  // Calculate duration for display
  const displayDuration =
    atencion?.inicioConsulta && atencion?.finConsulta
      ? `${Math.round(getDurationInMinutes(atencion.inicioConsulta, atencion.finConsulta))} minutos`
      : 'N/A';

  const onEnmienda = () => {
    console.log('Enmienda');
  };
  if (!data) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">Cargando datos de la atención...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información de tiempo y botón de enmienda */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Atención Finalizada</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem
              icon={<Calendar1 className="h-4 w-4" />}
              label="Inicio de Consulta"
              value={atencion?.atencionData?.inicioConsulta}
            />
            <InfoItem
              icon={<Calendar1 className="h-4 w-4" />}
              label="Fin de Consulta"
              value={atencion?.atencionData?.finConsulta}
            />
            <InfoItem
              icon={<Clock className="h-4 w-4" />}
              label="Duración de la Atención"
              value={atencion?.atencionData?.duracionAtencion}
            />
          </div>
        </CardContent>
      </Card>

      {/* Datos del Paciente */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem
              icon={<User className="h-5 stroke-primary-100 w-5" />}
              label="Nombre Completo"
              value={`${paciente?.nombre} ${paciente?.apellido}`}
            />
            <InfoItem
              icon={<User className="h-5 stroke-primary-100 w-5" />}
              label="DNI"
              value={paciente?.dni}
            />
            <InfoItem
              icon={<Calendar className="h-5 stroke-primary-100 w-5" />}
              label="Edad"
              value={`${edad} años`}
            />
            <InfoItem
              icon={<User className="h-5 stroke-primary-100 w-5" />}
              label="Sexo"
              value={paciente?.sexo}
            />
            <InfoItem
              icon={<Mail className="h-5 stroke-primary-100 w-5" />}
              label="Email"
              value={paciente?.email}
            />
            <InfoItem
              icon={<Phone className="h-5 stroke-primary-100 w-5" />}
              label="Celular"
              value={paciente?.celular}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detalles de los Síntomas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de Atención</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Atendido por:</span>
            <span className="capitalize">{`${atencion?.nombreDoctor} ${atencion?.apellidoDoctor}`}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Motivo de Consulta</h4>
            <div className="pl-4 border-l-2 border-primary-100  bg-primary-bg-componentes/50 p-3 rounded-r">
              <p className="text-muted-foreground">{atencion?.motivoConsulta}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Síntomas (Anamnesis)</h4>
            <p className="text-muted-foreground ">
              <div className="pl-4 border-l-2 border-primary-100  bg-primary-bg-componentes/50 p-3 rounded-r">
                {atencion?.sintomas || 'No se registraron síntomas.'}
              </div>
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Observaciones</h4>
            <p className="text-muted-foreground">
              <div className="pl-4 border-l-2 border-primary-100  bg-primary-bg-componentes/50 p-3 rounded-r">
                {atencion?.observaciones || 'Sin observaciones.'}
              </div>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Signos Vitales */}
      {atencion?.signosVitales && (
        <Card>
          <CardHeader>
            <CardTitle>Signos Vitales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <InfoItem
                icon={<Thermometer className="h-5 stroke-primary-100 w-5" />}
                label="Temperatura"
                value={`${atencion?.signosVitales?.temperatura}°C`}
              />
              <InfoItem
                icon={<HeartPulse className="h-5 stroke-primary-100 w-5" />}
                label="Frec. Cardíaca"
                value={`${atencion?.signosVitales?.frecuenciaCardiaca} lpm`}
              />
              <InfoItem
                icon={<Wind className="h-5 stroke-primary-100 w-5" />}
                label="Frec. Resp."
                value={`${atencion?.signosVitales?.frecuenciaRespiratoria} rpm`}
              />
              <InfoItem
                icon={<HeartPulse className="h-5 stroke-primary-100 w-5" />}
                label="Tensión Arterial"
                value={atencion?.signosVitales?.tensionArterial}
              />
              <InfoItem
                icon={<Weight className="h-5 stroke-primary-100 w-5" />}
                label="Peso"
                value={`${atencion?.signosVitales?.peso} kg`}
              />
              <InfoItem
                icon={<Ruler className="h-5 stroke-primary-100 w-5" />}
                label="Talla"
                value={`${atencion?.signosVitales?.talla} cm`}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnósticos */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnósticos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {atencion?.diagnosticos?.length > 0 ? (
              atencion?.diagnosticos?.map(diag => (
                <div key={diag.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{diag.diagnostico}</span>
                    {diag.codigoCIE && (
                      <Badge variant="secondary" className="text-xs">
                        {diag.codigoCIE}
                      </Badge>
                    )}
                  </div>
                  {diag.observaciones && (
                    <p className="text-sm text-muted-foreground ml-7">{diag.observaciones}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No se registraron diagnósticos.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medicamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Medicamentos Recetados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {atencion?.medicamentos?.length > 0 ? (
              atencion?.medicamentos?.map(med => (
                <div key={med.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Pill className="h-4 w-4 text-primary" />
                    <span className="font-semibold">
                      {med.nombreComercial || med.nombreGenerico}
                    </span>
                  </div>
                  <div className="ml-7 text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
                    <p>
                      <span className="font-medium text-foreground">Genérico:</span>{' '}
                      {med.nombreGenerico}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Dosis:</span> {med.dosis}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Frecuencia:</span>{' '}
                      {med.frecuencia}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No se recetaron medicamentos.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
