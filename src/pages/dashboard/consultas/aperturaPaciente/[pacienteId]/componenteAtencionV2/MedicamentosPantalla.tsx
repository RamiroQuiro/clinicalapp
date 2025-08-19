import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">{title}</h3>
    {children}
  </div>
);

export const MedicamentosPantalla = ({ data }) => (
    <Section title="Medicamentos Recetados">
        {data && data.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicamento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosis</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frecuencia</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map(med => (
                            <tr key={med.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.dosis}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.frecuencia}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : <p>No se han recetado medicamentos.</p>}
    </Section>
);
