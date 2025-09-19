import Button from '@/components/atomos/Button';
import React, { useState } from 'react';

interface Props {
  onSave: (formData: { diagnosticoPresuntivo: string; estudiosSolicitados: string[] }) => void;
  onCancel: () => void;
}

export const FormularioOrdenEstudio: React.FC<Props> = ({ onSave, onCancel }) => {
  const [diagnosticoPresuntivo, setDiagnosticoPresuntivo] = useState('');
  const [estudios, setEstudios] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convertimos el string de estudios (separados por comas) a un array
    const estudiosSolicitados = estudios
      .split(',')
      .map(s => s.trim())
      .filter(s => s);
    if (!diagnosticoPresuntivo || estudiosSolicitados.length === 0) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    onSave({ diagnosticoPresuntivo, estudiosSolicitados });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label
          htmlFor="diagnosticoPresuntivo"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Diagnóstico Presuntivo
        </label>
        <input
          type="text"
          id="diagnosticoPresuntivo"
          value={diagnosticoPresuntivo}
          onChange={e => setDiagnosticoPresuntivo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label
          htmlFor="estudiosSolicitados"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Estudios Solicitados
        </label>
        <textarea
          id="estudiosSolicitados"
          value={estudios}
          onChange={e => setEstudios(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          rows={4}
          placeholder="Separar estudios por comas (ej: Radiografía de tórax, Análisis de sangre)"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Separe múltiples estudios con una coma.</p>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="grisClaro" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="blue" type="submit">
          Guardar Orden
        </Button>
      </div>
    </form>
  );
};
