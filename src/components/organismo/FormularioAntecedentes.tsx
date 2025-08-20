import React, { useEffect, useState } from 'react';
import type { Antecedente } from '../../types'; // Adjust path as needed
import Button from '../atomos/Button';

interface FormularioAntecedentesProps {
  pacienteId: string;
  onSuccess: () => void; // Callback to refresh data or close modal
  initialData?: Antecedente | null; // Optional: data to pre-populate for editing
}

// Helper function to format dates for the input[type="date"]
const formatDateForInput = (dateString: string | Date): string => {
  if (!dateString) return '';
  return dateString.toISOString().split('T')[0];
};

const FormularioAntecedentes: React.FC<FormularioAntecedentesProps> = ({
  pacienteId,
  onSuccess,
  initialData,
}) => {
  const [antecedente, setAntecedente] = useState('');
  const [fechaDiagnostico, setFechaDiagnostico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [tipo, setTipo] = useState('personal'); // Default to 'personal'
  const [estado, setEstado] = useState('activo'); // Default to 'activo'

  useEffect(() => {
    if (initialData) {
      setAntecedente(initialData.antecedente || '');
      setFechaDiagnostico(formatDateForInput(initialData.fechaDiagnostico)); // Use the formatter
      setObservaciones(initialData.observaciones || '');
      setTipo(initialData.tipo || 'personal');
      setEstado(initialData.estado || 'activo');
    } else {
      // Reset form for new entry
      setAntecedente('');
      setFechaDiagnostico('');
      setObservaciones('');
      setTipo('personal');
      setEstado('activo');
    }
  }, [initialData]);

  const optionsTipo = [
    { id: 1, value: 'personal', label: 'Personal' },
    { id: 2, value: 'familiar', label: 'Familiar' },
  ];

  const optionsEstado = [
    { id: 1, value: 'activo', label: 'Activo' },
    { id: 2, value: 'controlado', label: 'Controlado' },
    { id: 4, value: 'critico', label: 'Crítico' },
    { id: 3, value: 'curado', label: 'Curado' },
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = {
      antecedente,
      fechaDiagnostico,
      observaciones,
      tipo,
      estado,
    };

    let url = '';
    let method = '';

    if (initialData && initialData.id) {
      // Assuming initialData has an 'id' for existing records
      url = `/api/pacientes/antecedentes/${pacienteId}?id=${initialData.id}`;
      method = 'PUT'; // Or 'PATCH' depending on your API
    } else {
      url = `/api/pacientes/antecedentes/${pacienteId}`;
      method = 'POST';
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Datos enviados con éxito:', data);
        if (data.status === 200) {
          onSuccess(); // Call the success callback
        }
      } else {
        console.error('Error al enviar los datos:', response.statusText);
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 rounded-lg shadow-">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full mb-4">
        <div className="flex flex-col w-full">
          <label htmlFor="antecedente" className="text-xs text-primary-texto capitalize mb-1">
            Antecedente
          </label>
          <input
            type="text"
            id="antecedente"
            name="antecedente"
            value={antecedente}
            onChange={e => setAntecedente(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm text-primary-texto bg-primary-bg-componentes outline-none"
            required
          />
        </div>
        <div className="flex flex-col w-full">
          <label htmlFor="fechaDiagnostico" className="text-xs text-primary-texto capitalize mb-1">
            Fecha del Diagnóstico
          </label>
          <input
            type="date"
            id="fechaDiagnostico"
            name="fechaDiagnostico"
            min="2020-01-01"
            max="2030-01-01"
            value={fechaDiagnostico}
            onChange={e => setFechaDiagnostico(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm text-primary-texto bg-primary-bg-componentes outline-none"
            required
          />
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 w-full justify-normal bg-primary-bg-componentes p-2 rounded mb-4">
        <label htmlFor="observaciones" className="text-xs text-primary-texto capitalize">
          Observaciones
        </label>
        <textarea
          id="observaciones"
          name="observaciones"
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
          className="w-full text-sm p-2 text-primary-texto bg-primary-bg-componentes outline-none ring-0 border border-gray-300 rounded"
          rows={5}
          placeholder="Escriba sus observaciones aquí"
        ></textarea>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 w-full mb-4">
        <div className="flex flex-col w-full">
          <label htmlFor="tipo" className="text-xs text-primary-texto capitalize mb-1">
            Tipo de Antecedente
          </label>
          <select
            id="tipo"
            name="tipo"
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm text-primary-texto bg-primary-bg-componentes outline-none"
          >
            {optionsTipo.map(option => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col w-full">
          <label htmlFor="estado" className="text-xs text-primary-texto capitalize mb-1">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm text-primary-texto bg-primary-bg-componentes outline-none"
          >
            {optionsEstado.map(option => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full flex justify-end py-2">
        <Button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {initialData ? 'Guardar Cambios' : 'Agregar'}
        </Button>
      </div>
    </form>
  );
};

export default FormularioAntecedentes;
