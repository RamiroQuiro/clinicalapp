import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">{title}</h3>
    {children}
  </div>
);

const DataPair = ({ label, value }) => (
  <div className="flex flex-col mb-3">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <span className="text-base text-gray-900">{value || 'No disponible'}</span>
  </div>
);

export const SignosVitalesPantalla = ({ data }) => (
    <Section title="Signos Vitales">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DataPair label="Presión Arterial" value={data?.presionArterial} />
            <DataPair label="Frecuencia Cardíaca" value={data?.frecuenciaCardiaca} />
            <DataPair label="Frecuencia Respiratoria" value={data?.frecuenciaRespiratoria} />
            <DataPair label="Temperatura" value={`${data?.temperatura || 'N/A'} °C`} />
            <DataPair label="Saturación de Oxígeno" value={`${data?.saturacionOxigeno || 'N/A'} %`} />
            <DataPair label="Peso" value={`${data?.peso || 'N/A'} kg`} />
            <DataPair label="Altura" value={`${data?.altura || 'N/A'} cm`} />
            <DataPair label="IMC" value={data?.imc} />
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-md text-gray-700 mb-2">Evolución (Gráfico)</h4>
            <div className="h-40 bg-gray-200 rounded flex items-center justify-center">
                <p className="text-gray-500">Próximamente: Gráfico de evolución de signos vitales.</p>
            </div>
        </div>
    </Section>
);
