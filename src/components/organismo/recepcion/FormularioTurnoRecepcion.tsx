import Button from '@/components/atomos/Button';
import BuscadorGlobal from '@/components/organismo/BuscadorGlobal';
import APP_TIME_ZONE from '@/lib/timeZone';
import { showToast } from '@/utils/toast/toastShow';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import React, { useState } from 'react';



// TODO: Reemplazar con la lista de médicos del centro médico obtenida de la API
const medicosDeEjemplo = [
  { id: 'sqss31m17w99rkj', nombre: 'Dr. Ramiro' },
  { id: 'another-doc-id', nombre: 'Dra. Lucia' }, // ID Corregido
];

interface PacienteResult {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
}

const initialState = {
  pacienteId: undefined,
  pacienteNombre: '',
  fechaTurno: format(new Date(), 'yyyy-MM-dd'),
  horaTurno: format(new Date(), 'HH:mm'),
  duracion: 15,
  motivoConsulta: '',
  tipoDeTurno: 'espontaneo',
  medicoId: medicosDeEjemplo[0].id, // Default al primer médico
};

export const FormularioTurnoRecepcion: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [isSearchingPaciente, setIsSearchingPaciente] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [id]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [id]: parseInt(value, 10) || 0 }));
  };

  const handlePacienteSelect = (paciente: PacienteResult) => {
    setForm(prevForm => ({
      ...prevForm,
      pacienteId: paciente.id,
      pacienteNombre: `${paciente.nombre} ${paciente.apellido}`,
    }));
    setIsSearchingPaciente(false);
  };

  const handleClearPaciente = () => {
    setForm(prevForm => ({ ...prevForm, pacienteId: undefined, pacienteNombre: '' }));
    setIsSearchingPaciente(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pacienteId || !form.fechaTurno || !form.horaTurno || !form.duracion) {
      showToast('Por favor, complete los campos obligatorios.', { background: 'bg-red-600' });
      return;
    }

    setLoading(true);
    try {
      console.log('fechaTurno', form.fechaTurno);
      console.log('horaTurno', form.horaTurno); const fechaTurnoUtc = toZonedTime(
        `${format(new Date(form.fechaTurno), 'yyyy-MM-dd')}T${form.horaTurno}`,
        APP_TIME_ZONE
      );

      const payload = {
        ...form,
        fechaTurno: fechaTurnoUtc.toISOString(),
        horaLlegadaPaciente: fechaTurnoUtc.toISOString(),
        estado: 'sala_de_espera',
      };
      console.log('ESTE ES EL payload del formulairo de espontaneas ->', payload);
      const response = await fetch('/api/recepcion/turnos/createEspontanea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Error al crear el turno');
      }

      showToast('Turno creado con éxito y paciente en sala de espera.', {
        background: 'bg-green-600',
      });

      // TODO: Emitir evento SSE para actualizar la sala de espera en tiempo real

      const modal = document.getElementById('dialog-modal-modal-agregar') as HTMLDialogElement;
      if (modal) {
        modal.close();
      }
      setForm(initialState); // Resetear formulario
    } catch (error: any) {
      showToast(`Error: ${error.message}`, { background: 'bg-red-600' });
      console.error('Error al crear el turno:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const modal = document.getElementById('dialog-modal-modal-agregar') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    setForm(initialState);
  };

  const handleModalPaciente = () => {
    // TODO: Implementar la lógica para abrir un modal de creación de paciente
    showToast('Funcionalidad "Crear Nuevo Paciente" pendiente de conexión.', {
      background: 'bg-blue-600',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-1 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
        {form.pacienteId && form.pacienteNombre && !isSearchingPaciente ? (
          <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md shadow-sm bg-gray-50">
            <p className="font-semibold text-gray-800">{form.pacienteNombre}</p>
            <button
              type="button"
              onClick={handleClearPaciente}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <BuscadorGlobal onSelectPaciente={handlePacienteSelect} hideActions={true} />
        )}
        {!form.pacienteId && !isSearchingPaciente && (
          <button
            type="button"
            onClick={handleModalPaciente}
            className="mt-2 w-full px-3 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 rounded-md transition-colors duration-200"
          >
            Crear Nuevo Paciente
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="medicoId" className="block text-sm font-medium text-gray-700 mb-1">
            Asignar a Profesional
          </label>
          <select
            id="medicoId"
            value={form.medicoId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {medicosDeEjemplo.map(medico => (
              <option key={medico.id} value={medico.id}>
                {medico.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tipoDeTurno" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Turno
          </label>
          <select
            id="tipoDeTurno"
            value={form.tipoDeTurno}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="espontaneo">Turno Espontáneo</option>
            <option value="sobreturno">Sobreturno</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fechaTurno" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            id="fechaTurno"
            value={form.fechaTurno}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="horaTurno" className="block text-sm font-medium text-gray-700 mb-1">
            Hora
          </label>
          <input
            type="time"
            id="horaTurno"
            value={form.horaTurno}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
      </div>

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

      <div>
        <label htmlFor="motivoConsulta" className="block text-sm font-medium text-gray-700 mb-1">
          Motivo de Consulta
        </label>
        <textarea
          id="motivoConsulta"
          value={form.motivoConsulta}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          rows={2}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button disabled={loading} type="submit" variant="primary">
          Crear y Poner en Espera
        </Button>
      </div>
    </form>
  );
};
