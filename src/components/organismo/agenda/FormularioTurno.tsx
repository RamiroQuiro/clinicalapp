import React, { useState, useEffect } from 'react';
import Button from '@/components/atomos/Button';

interface MyEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
  // Campos adicionales del turno
  pacienteId: string;
  duracion: number;
  tipoConsulta?: string;
  motivoConsulta?: string;
  motivoInicial?: string;
}

interface Props {
  onSave: (formData: any) => void;
  onCancel: () => void;
  initialStart: Date;
  initialEnd: Date;
  initialData?: MyEvent; // Datos del turno para edición
  onDelete?: (id: string) => void; // Función para eliminar
}

export const FormularioTurno: React.FC<Props> = ({ onSave, onCancel, initialStart, initialEnd, initialData, onDelete }) => {
  const [pacienteId, setPacienteId] = useState(initialData?.pacienteId || '');
  const [duracion, setDuracion] = useState(initialData?.duracion || 30);
  const [tipoConsulta, setTipoConsulta] = useState(initialData?.tipoConsulta || '');
  const [motivoConsulta, setMotivoConsulta] = useState(initialData?.motivoConsulta || '');
  const [motivoInicial, setMotivoInicial] = useState(initialData?.motivoInicial || '');
  const [fechaTurno, setFechaTurno] = useState(initialData?.start.getTime() || initialStart.getTime());

  useEffect(() => {
    if (initialData) {
      setPacienteId(initialData.pacienteId);
      setDuracion(initialData.duracion);
      setTipoConsulta(initialData.tipoConsulta || '');
      setMotivoConsulta(initialData.motivoConsulta || '');
      setMotivoInicial(initialData.motivoInicial || '');
      setFechaTurno(initialData.start.getTime());
    } else {
      setFechaTurno(initialStart.getTime());
      // Calcular duración inicial si initialEnd es diferente de initialStart
      if (initialEnd && initialEnd.getTime() !== initialStart.getTime()) {
        const calculatedDuration = Math.round((initialEnd.getTime() - initialStart.getTime()) / 60000);
        setDuracion(calculatedDuration);
      }
    }
  }, [initialData, initialStart, initialEnd]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteId || !fechaTurno || !duracion) {
      alert('Por favor, complete los campos obligatorios: Paciente, Fecha y Duración.');
      return;
    }

    onSave({
      id: initialData?.id, // Pasar el ID si estamos editando
      pacienteId,
      fechaTurno,
      duracion,
      tipoConsulta,
      motivoConsulta,
      motivoInicial,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label htmlFor="pacienteId" className="block text-sm font-medium text-gray-700 mb-1">
          ID Paciente (Temporal)
        </label>
        <input
          type="text"
          id="pacienteId"
          value={pacienteId}
          onChange={(e) => setPacienteId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="fechaTurno" className="block text-sm font-medium text-gray-700 mb-1">
          Fecha y Hora del Turno
        </label>
        <input
          type="datetime-local"
          id="fechaTurno"
          value={new Date(fechaTurno).toISOString().slice(0, 16)}
          onChange={(e) => setFechaTurno(new Date(e.target.value).getTime())}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="duracion" className="block text-sm font-medium text-gray-700 mb-1">
          Duración (minutos)
        </label>
        <input
          type="number"
          id="duracion"
          value={duracion}
          onChange={(e) => setDuracion(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="tipoConsulta" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Consulta
        </label>
        <input
          type="text"
          id="tipoConsulta"
          value={tipoConsulta}
          onChange={(e) => setTipoConsulta(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="motivoConsulta" className="block text-sm font-medium text-gray-700 mb-1">
          Motivo de Consulta
        </label>
        <textarea
          id="motivoConsulta"
          value={motivoConsulta}
          onChange={(e) => setMotivoConsulta(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
        />
      </div>
      <div>
        <label htmlFor="motivoInicial" className="block text-sm font-medium text-gray-700 mb-1">
          Motivo Inicial
        </label>
        <input
          type="text"
          id="motivoInicial"
          value={motivoInicial}
          onChange={(e) => setMotivoInicial(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        {initialData && onDelete && (
          <Button type="button" variant="cancel" onClick={() => onDelete(initialData.id)}>
            Eliminar Turno
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Actualizar Turno' : 'Guardar Turno'}
        </Button>
      </div>
    </form>
  );
};
