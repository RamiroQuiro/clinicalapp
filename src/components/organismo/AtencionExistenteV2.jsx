import calcularEdad from '@/utils/calcularEdad';
import formatDate from '@/utils/formatDate';
import {
  Calendar,
  Calendar1,
  Clock,
  FilePenLine, // Añadido para el timeline
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

// --- Sub-componentes para mejorar la legibilidad ---

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <div className="flex-shrink-0 text-muted-foreground mt-1">{icon}</div>
    <div className="min-w-0">
      <p className="font-medium text-sm">{label}</p>
      <p className="text-muted-foreground text-sm truncate">{value || 'N/A'}</p>
    </div>
  </div>
);

// Componente para cada item en la línea de tiempo de enmiendas
const EnmiendaTimelineItem = ({ enmienda, isLast }) => {
  const renderHTML = htmlString => {
    return { __html: htmlString || '' };
  };

  return (
    <div className="relative pl-10">
      {/* Línea vertical de la timeline */}
      {!isLast && <div className="absolute left-4 top-5 h-full w-px bg-gray-300" />}

      {/* Círculo con ícono en la timeline */}
      <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 ring-8 ring-white">
        <FilePenLine className="h-4 w-4 text-gray-600" />
      </div>

      {/* Contenido de la enmienda */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h4 className="font-bold text-gray-800">{enmienda.justificacion}</h4>
        <p className="mb-3 text-xs text-gray-500">
          Realizada por: <span className="font-semibold">{enmienda.userIdMedico}</span> el{' '}
          {formatDate(enmienda.created_at)}
        </p>

        <div className="space-y-2 text-sm">
          <div className="bg-red-50 border-l-4 border-red-400 p-2 rounded-r-md">
            <p className="font-semibold text-red-800">Contenido Original:</p>
            <div
              className="prose prose-sm max-w-none text-red-700"
              dangerouslySetInnerHTML={renderHTML(enmienda.contenidoOriginal)}
            />
          </div>
          <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded-r-md">
            <p className="font-semibold text-green-800">Contenido Corregido:</p>
            <div
              className="prose prose-sm max-w-none text-green-700"
              dangerouslySetInnerHTML={renderHTML(enmienda.contenidoCorregido)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const AtencionExistenteV2 = ({ data, onClose }) => {
  if (!data) {
    return <div>Cargando datos de la atención...</div>;
  }
  const { atencion, paciente } = data;
  const edad = paciente?.fNacimiento ? calcularEdad(paciente?.fNacimiento) : 'N/A';

  return (
    <div className="space-y-2">
      {/* ... (Otras tarjetas como Header, Datos del Paciente, etc. se mantienen igual) ... */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Atención Finalizada</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem
              icon={<Calendar1 className="h-6 w-6 stroke-primary-100" />}
              label="Inicio de Consulta"
              value={atencion?.atencion?.inicioAtencion}
            />
            <InfoItem
              icon={<Calendar1 className="h-6 w-6 stroke-primary-100" />}
              label="Fin de Consulta"
              value={atencion?.atencion?.finAtencion}
            />
            <InfoItem
              icon={<Clock className="h-6 w-6 stroke-primary-100" />}
              label="Duración de la Atención"
              value={atencion?.atencion?.duracionAtencion}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Datos del Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem
              icon={<User className="h-6 stroke-primary-100 w-6" />}
              label="Nombre Completo"
              value={`${paciente?.nombre} ${paciente?.apellido}`}
            />
            <InfoItem
              icon={<User className="h-6 stroke-primary-100 w-6" />}
              label="DNI"
              value={paciente?.dni}
            />
            <InfoItem
              icon={<Calendar className="h-6 stroke-primary-100 w-6" />}
              label="Edad"
              value={`${edad} años`}
            />
            <InfoItem
              icon={<User className="h-6 stroke-primary-100 w-6" />}
              label="Sexo"
              value={paciente?.sexo}
            />
            <InfoItem
              icon={<Mail className="h-6 stroke-primary-100 w-6" />}
              label="Email"
              value={paciente?.email}
            />
            <InfoItem
              icon={<Phone className="h-6 stroke-primary-100 w-6" />}
              label="Celular"
              value={paciente?.celular}
            />
          </div>
        </CardContent>
      </Card>
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
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-gray-200">
                        {diag.codigoCIE}
                      </span>
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

      {/* SECCIÓN DE ENMIENDAS CON NUEVO DISEÑO */}
      {atencion?.enmiendas && atencion.enmiendas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Enmiendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {atencion.enmiendas.map((enmienda, index) => (
                <EnmiendaTimelineItem
                  key={enmienda.id}
                  enmienda={enmienda}
                  isLast={index === atencion.enmiendas.length - 1}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
