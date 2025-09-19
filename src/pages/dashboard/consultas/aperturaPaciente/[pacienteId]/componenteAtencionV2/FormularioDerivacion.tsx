import Button from '@/components/atomos/Button';
import React, { useState } from 'react';

interface Props {
  onSave: (formData: {
    especialidadDestino: string;
    motivoDerivacion: string;
    nombreProfesionalExterno?: string;
  }) => void;
  onCancel: () => void;
}

export const FormularioDerivacion: React.FC<Props> = ({ onSave, onCancel }) => {
  const [especialidadDestino, setEspecialidadDestino] = useState('');
  const [motivoDerivacion, setMotivoDerivacion] = useState('');
  const [nombreProfesionalExterno, setNombreProfesionalExterno] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!especialidadDestino || !motivoDerivacion) {
      alert('Por favor, complete la especialidad y el motivo.');
      return;
    }
    onSave({ especialidadDestino, motivoDerivacion, nombreProfesionalExterno });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label
          htmlFor="especialidadDestino"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Especialidad de Destino
        </label>
        <input
          type="text"
          id="especialidadDestino"
          value={especialidadDestino}
          onChange={e => setEspecialidadDestino(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ej: Cardiología, Traumatología"
          required
        />
      </div>
      <div>
        <label htmlFor="motivoDerivacion" className="block text-sm font-medium text-gray-700 mb-1">
          Motivo de la Derivación
        </label>
        <textarea
          id="motivoDerivacion"
          value={motivoDerivacion}
          onChange={e => setMotivoDerivacion(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          rows={5}
          placeholder="Resumen del caso y motivo de la consulta con el especialista."
          required
        />
      </div>
      <div>
        <label
          htmlFor="nombreProfesionalExterno"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nombre del Profesional Externo (Opcional)
        </label>
        <input
          type="text"
          id="nombreProfesionalExterno"
          value={nombreProfesionalExterno}
          onChange={e => setNombreProfesionalExterno(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Dr. Juan Pérez"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="grisClaro" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="blue" type="submit">
          Guardar Derivación
        </Button>
      </div>
    </form>
  );
};
