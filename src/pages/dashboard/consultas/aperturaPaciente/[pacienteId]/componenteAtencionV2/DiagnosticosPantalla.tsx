import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">{title}</h3>
    {children}
  </div>
);

export const DiagnosticosPantalla = ({ data }) => (
    <Section title="Diagnósticos">
        {data && data.length > 0 ? (
            <ul className="divide-y divide-gray-200">
                {data.map(diag => (
                    <li key={diag.id} className="py-3">
                        <p className="font-semibold text-gray-900">{diag.nombre}</p>
                        <p className="text-sm text-gray-600 mt-1">{diag.observacion}</p>
                    </li>
                ))}
            </ul>
        ) : <p>No hay diagnósticos registrados para esta consulta.</p>}
    </Section>
);
