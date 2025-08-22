import calcularEdad from '@/utils/calcularEdad';
import formatDate from '@/utils/formatDate';
import {
  Calendar,
  ClipboardList,
  HeartPulse,
  Pill,
  Ruler,
  Stethoscope,
  Thermometer,
  User,
  Weight,
  Wind,
} from 'lucide-react';

// Componente para un item de información del paciente
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm text-gray-300">
    <div className="text-gray-400">{icon}</div>
    <span className="font-semibold text-gray-200">{label}:</span>
    <span>{value || 'N/A'}</span>
  </div>
);

// Componente para una sección
const Section = ({ title, children }) => (
  <div className="bg-gray-800/50 rounded-lg p-4 w-full">
    <h3 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">{title}</h3>
    {children}
  </div>
);

export const AtencionExistenteV2 = ({ data, onClose }) => {
  if (!data) {
    return <div>Cargando datos de la atención...</div>;
  }

  const { atencion, paciente } = data;
  const edad = paciente?.fNacimiento ? calcularEdad(paciente?.fNacimiento) : 'N/A';

  return (
    <div className="p-4  font-sans flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">
          Detalle de la Atención - {formatDate(atencion?.atencionData.fecha)}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          &times;
        </button>
      </div>

      {/* Datos del Paciente */}
      <Section title="Datos del Paciente">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem
            icon={<User size={16} />}
            label="Nombre"
            value={`${paciente?.nombre} ${paciente?.apellido}`}
          />
          <InfoItem icon={<User size={16} />} label="DNI" value={paciente?.dni} />
          <InfoItem icon={<Calendar size={16} />} label="Edad" value={`${edad} años`} />
          <InfoItem icon={<User size={16} />} label="Sexo" value={paciente?.sexo} />
          <InfoItem icon={<Stethoscope size={16} />} label="Email" value={paciente?.email} />
          <InfoItem icon={<Stethoscope size={16} />} label="Celular" value={paciente?.celular} />
        </div>
      </Section>

      {/* Detalles de la Consulta */}
      <Section title="Detalles de la Consulta">
        <p className="text-sm text-gray-300 mb-2">
          <span className="font-semibold text-gray-100">Médico:</span>{' '}
          {`${atencion?.atencionData?.medico?.nombre} ${atencion?.atencionData?.medico?.apellido}`}
        </p>
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold text-gray-100">Motivo de Consulta:</h4>
            <p className="text-sm text-gray-300 pl-2">{atencion?.atencionData?.motivoConsulta}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-100">Síntomas (Anamnesis):</h4>
            <p className="text-sm text-gray-300 pl-2">
              {atencion?.atencionData?.sintomas || 'No se registraron síntomas.'}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-100">Observaciones:</h4>
            <p className="text-sm text-gray-300 pl-2">
              {atencion?.atencionData?.observaciones || 'Sin observaciones.'}
            </p>
          </div>
        </div>
      </Section>

      {/* Signos Vitales */}
      {atencion?.signosVitales && (
        <Section title="Signos Vitales">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <InfoItem
              icon={<Thermometer size={16} />}
              label="Temperatura"
              value={`${atencion?.signosVitales?.temperatura}°C`}
            />
            <InfoItem
              icon={<HeartPulse size={16} />}
              label="Frec. Cardíaca"
              value={`${atencion?.signosVitales?.frecuenciaCardiaca} lpm`}
            />
            <InfoItem
              icon={<Wind size={16} />}
              label="Frec. Resp."
              value={`${atencion?.signosVitales?.frecuenciaRespiratoria} rpm`}
            />
            <InfoItem
              icon={<HeartPulse size={16} />}
              label="Tensión Arterial"
              value={atencion?.signosVitales?.tensionArterial}
            />
            <InfoItem
              icon={<Weight size={16} />}
              label="Peso"
              value={`${atencion?.signosVitales?.peso} kg`}
            />
            <InfoItem
              icon={<Ruler size={16} />}
              label="Talla"
              value={`${atencion?.signosVitales?.talla} cm`}
            />
          </div>
        </Section>
      )}

      {/* Diagnósticos */}
      <Section title="Diagnósticos">
        <ul className="space-y-2">
          {atencion?.diagnosticos?.length > 0 ? (
            atencion?.diagnosticos?.map(diag => (
              <li key={diag.id} className="bg-gray-800 p-2 rounded-md text-sm">
                <p className="font-bold text-white flex items-center gap-2">
                  <ClipboardList size={16} /> {diag.diagnostico}
                  {diag.codigoCIE && (
                    <span className="text-xs font-normal text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                      {diag.codigoCIE}
                    </span>
                  )}
                </p>
                {diag.observaciones && <p className="pl-8 text-gray-300">{diag.observaciones}</p>}
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-400">No se registraron diagnósticos.</p>
          )}
        </ul>
      </Section>

      {/* Medicamentos */}
      <Section title="Medicamentos Recetados">
        <ul className="space-y-2">
          {atencion?.medicamentos?.length > 0 ? (
            atencion?.medicamentos?.map(med => (
              <li key={med.id} className="bg-gray-800 p-2 rounded-md text-sm">
                <p className="font-bold text-white flex items-center gap-2">
                  <Pill size={16} /> {med.nombreComercial || med.nombreGenerico}
                </p>
                <div className="pl-8 text-gray-300 grid grid-cols-2 gap-x-4">
                  <p>Genérico: {med.nombreGenerico}</p>
                  <p>Dosis: {med.dosis}</p>
                  <p>Frecuencia: {med.frecuencia}</p>
                </div>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-400">No se recetaron medicamentos.</p>
          )}
        </ul>
      </Section>
    </div>
  );
};
