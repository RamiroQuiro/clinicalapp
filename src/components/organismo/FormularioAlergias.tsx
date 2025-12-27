import { TriangleAlert } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../atomos/Button';

export type Alergia = {
  sustancia: string;
  reaccion: string;
  severidad: 'leve' | 'moderada' | 'grave';
  activa: boolean;
  fechaDiagnostico?: string;
};

interface FormularioAlergiasProps {
  initialData?: Alergia | null;
  onSubmit: (data: Alergia) => void;
  onCancel: () => void;
}

export default function FormularioAlergias({
  initialData,
  onSubmit,
  onCancel,
}: FormularioAlergiasProps) {
  const [sustancia, setSustancia] = useState('');
  const [reaccion, setReaccion] = useState('');
  const [severidad, setSeveridad] = useState<'leve' | 'moderada' | 'grave'>('leve');
  const [activa, setActiva] = useState(true);

  useEffect(() => {
    if (initialData) {
      setSustancia(initialData.sustancia);
      setReaccion(initialData.reaccion);
      setSeveridad(initialData.severidad);
      setActiva(initialData.activa);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      sustancia,
      reaccion,
      severidad,
      activa,
      fechaDiagnostico: initialData?.fechaDiagnostico || new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-1 space-y-4">
      {/* Aviso de importancia */}
      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 flex items-start gap-2 text-sm text-yellow-800">
        <TriangleAlert className="w-5 h-5 shrink-0" />
        <p>
          La información de alergias es crítica para la seguridad del paciente. Asegúrese de
          registrar la severidad correcta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sustancia */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Sustancia / Alérgeno</label>
          <input
            type="text"
            required
            value={sustancia}
            onChange={e => setSustancia(e.target.value)}
            placeholder="Ej: Penicilina, Maní, Látex"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Severidad */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Severidad</label>
          <select
            value={severidad}
            onChange={e => setSeveridad(e.target.value as any)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            <option value="leve">Leve (Solo molestias)</option>
            <option value="moderada">Moderada (Requiere medicación)</option>
            <option value="grave">Grave (Posible anafilaxia)</option>
          </select>
        </div>
      </div>

      {/* Reacción */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Reacción Típica</label>
        <input
          type="text"
          required
          value={reaccion}
          onChange={e => setReaccion(e.target.value)}
          placeholder="Ej: Erupción cutánea, dificultad respiratoria"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Estado */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="activa"
          checked={activa}
          onChange={e => setActiva(e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="activa" className="text-sm text-gray-700">
          Alergia Activa
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          {initialData ? 'Guardar Cambios' : 'Registrar Alergia'}
        </Button>
      </div>
    </form>
  );
}
