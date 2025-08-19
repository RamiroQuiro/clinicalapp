import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">{title}</h3>
    {children}
  </div>
);

export const AntecedentesPantalla = ({ data }) => (
  <Section title="Antecedentes del Paciente">
    {data && data.length > 0 ? (
      <ul className="list-disc list-inside space-y-2">
        {data.map(ante => (
          <li key={ante.id} className="text-gray-800">
            <span className="font-semibold">{ante.tipo}:</span> {ante.descripcion}
          </li>
        ))}
      </ul>
    ) : <p>No hay antecedentes registrados.</p>}
  </Section>
);
