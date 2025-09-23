import Button from '@/components/atomos/Button';
import { datosNuevoTurno, resetNuevoTurno } from '@/context/agenda.store';
import { useStore } from '@nanostores/react';
import React, { useEffect, useState } from 'react';

export const FormularioTurno: React.FC = () => {
  const turnoDelStore = useStore(datosNuevoTurno);
  const [form, setForm] = useState(turnoDelStore);

  // Sincronizar el estado interno del formulario con el store cuando este cambie
  useEffect(() => {
    setForm(turnoDelStore);
  }, [turnoDelStore]);

  // Efecto para limpiar el formulario cuando se desmonta
  useEffect(() => {
    return () => {
      resetNuevoTurno();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [id]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [id]: parseInt(value, 10) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pacienteId || !form.fechaTurno || !form.duracion) {
      alert('Por favor, complete los campos obligatorios.');
      return;
    }
    // Aquí iría la lógica para guardar en la DB
    console.log('Guardando turno:', form);
    // Puedes llamar a una API aquí, por ejemplo:
    // fetch('/api/turnos', { method: 'POST', body: JSON.stringify(form) });

    // Después de guardar, puedes cerrar el modal y resetear el store
    const modal = document.getElementById('dialog-modal-modalNuevoTurno') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    resetNuevoTurno();
  };

  const handleCancel = () => {
    const modal = document.getElementById('dialog-modal-modalNuevoTurno') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    resetNuevoTurno();
  };

  // Formatear la fecha y hora para el input datetime-local
  const formatDateTimeLocal = (date: Date | undefined, time: string | undefined) => {
    if (!date || !time) return '';
    const [hours, minutes] = time.split(':');
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours), parseInt(minutes));
    // Truco para ajustar a la zona horaria local para el input
    const timezoneOffset = newDate.getTimezoneOffset() * 60000;
    const localDate = new Date(newDate.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {/* --- Campo Paciente (simplificado, necesita un buscador) --- */}
      <div>
        <label htmlFor="pacienteId" className="block text-sm font-medium text-gray-700 mb-1">
          Paciente
        </label>
        <input
          type="text"
          id="pacienteId"
          value={form.pacienteNombre || ''}
          onChange={handleInputChange}
          placeholder="Buscar paciente..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      {/* --- Campo Fecha y Hora --- */}
      <div>
        <label htmlFor="fechaTurno" className="block text-sm font-medium text-gray-700 mb-1">
          Fecha y Hora del Turno
        </label>
        <input
          type="datetime-local"
          id="fechaTurno"
          value={formatDateTimeLocal(form.fechaTurno, form.horaTurno)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
          readOnly // El usuario no debería cambiar esto directamente
        />
      </div>

      {/* --- Campo Duración --- */}
      <div>
        <label htmlFor="duracion" className="block text-sm font-medium text-gray-700 mb-1">
          Duración (minutos)
        </label>
        <input
          type="number"
          id="duracion"
          value={form.duracion}
          onChange={handleNumberChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      {/* --- Otros campos --- */}
      <div>
        <label htmlFor="motivoConsulta" className="block text-sm font-medium text-gray-700 mb-1">
          Motivo de Consulta
        </label>
        <textarea
          id="motivoConsulta"
          value={form.motivoConsulta}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
        />
      </div>

      {/* --- Botones de Acción --- */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar Turno
        </Button>
      </div>
    </form>
  );
};
