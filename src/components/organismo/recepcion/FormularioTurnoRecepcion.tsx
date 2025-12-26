import Button from '@/components/atomos/Button';
import ModalReact from '@/components/moleculas/ModalReact';
import BuscadorGlobal from '@/components/organismo/BuscadorGlobal';
import APP_TIME_ZONE from '@/lib/timeZone';
import { showToast } from '@/utils/toast/toastShow';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import React, { useState } from 'react';
import { FormularioRapidoCargaPaciente } from '../pacientes/FormularioRapidoCargaPaciente';

interface PacienteResult {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
}

export const FormularioTurnoRecepcion: React.FC<Props> = ({ profesionalesRelacionados }) => {

  const initialState = {
    pacienteId: undefined,
    pacienteNombre: '',
    fechaTurno: format(new Date(), 'yyyy-MM-dd'),
    horaTurno: format(new Date(), 'HH:mm'),
    duracion: 15,
    motivoConsulta: '',
    tipoDeTurno: 'espontaneo',
    medicoId: profesionalesRelacionados?.[0]?.id || '', // Asignar el primer médico por defecto
  };

  const [form, setForm] = useState(initialState);
  const [isSearchingPaciente, setIsSearchingPaciente] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalNuevoPaciente, setIsModalNuevoPaciente] = useState(false);
  const [profesionalesDisponibles, setprofesionalesDisponibles] = useState(profesionalesRelacionados)



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
      const fechaTurnoUtc = toZonedTime(
        `${form.fechaTurno}T${form.horaTurno}`,
        APP_TIME_ZONE
      );

      const payload = {
        ...form,
        fechaTurno: fechaTurnoUtc.toISOString(),
        horaLlegadaPaciente: new Date().toISOString(),
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
    setIsModalNuevoPaciente(true);
    // TODO: Implementar la lógica para abrir un modal de creación de paciente
    showToast('Funcionalidad "Crear Nuevo Paciente" pendiente de conexión.', {
      background: 'bg-blue-600',
    });
  };

  if (isModalNuevoPaciente) {
    return (
      <ModalReact title='Crear Nuevo Paciente' id='modalNuevoPaciente' onClose={() => setIsModalNuevoPaciente(false)}>
        <FormularioRapidoCargaPaciente />
      </ModalReact>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <label className="block mb-1 font-medium text-gray-700 text-sm">Paciente</label>
        {form.pacienteId && form.pacienteNombre && !isSearchingPaciente ? (
          <div className="flex justify-between items-center bg-gray-50 shadow-sm p-3 border border-gray-300 rounded-md">
            <p className="font-semibold text-gray-800">{form.pacienteNombre}</p>
            <button
              type="button"
              onClick={handleClearPaciente}
              className="text-blue-600 hover:text-blue-800 text-sm"
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
            className="bg-green-600 hover:bg-green-500 mt-2 px-3 py-2 rounded-md w-full font-semibold text-white text-sm transition-colors duration-200"
          >
            Crear Nuevo Paciente
          </button>
        )}
      </div>

      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
        <div>
          <label htmlFor="medicoId" className="block mb-1 font-medium text-gray-700 text-sm">
            Asignar a Profesional
          </label>
          <select
            id="medicoId"
            value={form.medicoId}
            onChange={handleInputChange}
            className="shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:ring-indigo-500 w-full capitalize"
          >
            {profesionalesDisponibles.map(medico => (
              <option key={medico.id} value={medico.id} className='capi'>
                {medico.especialidad} {medico.abreviatura} {medico.nombre} {medico.apellido}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tipoDeTurno" className="block mb-1 font-medium text-gray-700 text-sm">
            Tipo de Turno
          </label>
          <select
            id="tipoDeTurno"
            value={form.tipoDeTurno}
            onChange={handleInputChange}
            className="shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:ring-indigo-500 w-full"
          >
            <option value="espontaneo">Turno Espontáneo</option>
            <option value="sobreturno">Sobreturno</option>
          </select>
        </div>
      </div>

      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
        <div>
          <label htmlFor="fechaTurno" className="block mb-1 font-medium text-gray-700 text-sm">
            Fecha
          </label>
          <input
            type="date"
            id="fechaTurno"
            value={form.fechaTurno}
            onChange={handleInputChange}
            className="shadow-sm px-3 py-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div>
          <label htmlFor="horaTurno" className="block mb-1 font-medium text-gray-700 text-sm">
            Hora
          </label>
          <input
            type="time"
            id="horaTurno"
            value={form.horaTurno}
            onChange={handleInputChange}
            className="shadow-sm px-3 py-2 border border-gray-300 rounded-md w-full"
          />
        </div>
      </div>

      <div>
        <label htmlFor="duracion" className="block mb-1 font-medium text-gray-700 text-sm">
          Duración (minutos)
        </label>
        <input
          type="number"
          id="duracion"
          value={form.duracion}
          onChange={handleNumberChange}
          className="shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:ring-indigo-500 w-full"
          required
        />
      </div>

      <div>
        <label htmlFor="motivoConsulta" className="block mb-1 font-medium text-gray-700 text-sm">
          Motivo de Consulta
        </label>
        <textarea
          id="motivoConsulta"
          value={form.motivoConsulta}
          onChange={handleInputChange}
          className="shadow-sm px-3 py-2 border border-gray-300 focus:border-indigo-500 rounded-md focus:ring-indigo-500 w-full"
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
