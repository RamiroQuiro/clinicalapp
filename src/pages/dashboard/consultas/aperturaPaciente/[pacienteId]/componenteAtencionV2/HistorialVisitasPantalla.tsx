import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">{title}</h3>
    {children}
  </div>
);

export const HistorialVisitasPantalla = ({ data }) => (
  <Section title="Historial de Visitas">
      {data && data.length > 0 ? (
          <ul className="divide-y divide-gray-200">
              {data.map(visita => (
                  <li key={visita.id} className="py-3">
                      <div className="flex justify-between">
                          <span className="font-semibold text-gray-800">{visita.fecha}</span>
                          <span className="text-sm text-gray-600">Dr. {visita.doctor}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Motivo: {visita.motivo}</p>
                  </li>
              ))}
          </ul>
      ) : <p>No hay historial de visitas anteriores.</p>}
  </Section>
);
