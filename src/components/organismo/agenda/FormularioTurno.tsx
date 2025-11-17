import Button from '@/components/atomos/Button';
import BuscadorGlobal from '@/components/organismo/BuscadorGlobal';

import type { AgendaSlot, DatosTurno } from '@/context/agenda.store';
import APP_TIME_ZONE from '@/lib/timeZone';
import { formatUtcToAppTime } from '@/utils/agendaTimeUtils';
import { showToast } from '@/utils/toast/toastShow';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Moon, Sun } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import BotonHora from './BotonHora';
import { HorariosSkeletonLoader } from './HorariosDisponibles';


// --- Interfaces ---
interface PacienteResult {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
}

interface User {
  id: string;
  nombre: string;
  apellido: string;
}

interface Props {
  user: User;

  agenda: any;
  datosNuevoTurno: DatosTurno;
  onSeleccionarHorario: (slot: AgendaSlot) => void;
  setPaciente: (paciente: any) => void;
  resetNuevoTurno: () => void;
  seleccionarFecha: (date: Date | undefined) => void;
  handleDatosNuevoTurno: (user: any) => void;
  isLoading: boolean;
}

// --- Componente ---
export const FormularioTurno: React.FC<Props> = ({ user, agenda, datosNuevoTurno, seleccionarFecha, onSeleccionarHorario, setPaciente, resetNuevoTurno, handleDatosNuevoTurno, isLoading }) => {
  const [form, setForm] = useState({ ...datosNuevoTurno });
  const [isSearchingPaciente, setIsSearchingPaciente] = useState(false);
  const [loading, setLoading] = useState(false);
  const isReagendar = Boolean(form?.id);

  const horariosDisponibles = useMemo(() => agenda?.filter(slot => slot.disponible), [agenda]);
  const horariosAgrupados = useMemo(
    () => ({
      mañana: horariosDisponibles?.filter(
        slot => parseInt(formatUtcToAppTime(slot.hora, 'HH')) < 12
      ),
      tarde: horariosDisponibles?.filter(
        slot => parseInt(formatUtcToAppTime(slot.hora, 'HH')) >= 12
      ),
    }),
    [horariosDisponibles]
  );

  console.log('antes del useEfect form..', form);

  useEffect(() => {
    if (!form.userMedicoId) {
      handleDatosNuevoTurno(user);
    }
    return () => {
      resetNuevoTurno();
    };
  }, []);
  useEffect(() => {
    setForm(prevForm => ({ ...prevForm, ...datosNuevoTurno }));
  }, [datosNuevoTurno]);

  console.log('despues del useEfect form..', form);
  useEffect(() => {
    return () => {
      resetNuevoTurno();
    };
  }, []);

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
    setPaciente({ id: paciente.id, nombre: `${paciente.nombre} ${paciente.apellido}` });

    setIsSearchingPaciente(false);
  };

  const handleClearPaciente = () => {
    setForm(prevForm => ({ ...prevForm, pacienteId: undefined, pacienteNombre: '' }));
    setPaciente({ id: '', nombre: '' });
    setIsSearchingPaciente(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pacienteId || !form.fechaTurno || !form.duracion || !form.userMedicoId) {
      showToast('Por favor, complete los campos obligatorios.', { background: 'bg-red-600' });
      return;
    }

    setLoading(true);
    try {

      const fechaTurnoUtc = toZonedTime(
        `${format(new Date(form.fechaTurno!), 'yyyy-MM-dd')}T${form.horaTurno}`,
        APP_TIME_ZONE
      );

      const payload = {
        ...form,
        fechaTurno: fechaTurnoUtc.toISOString(),
      };

      const response = await fetch('/api/agenda/turnos/create', {
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
      // agendaDelDia.set([
      //   ...agendaDelDia.get(),
      //   { disponible: false, hora: fechaTurnoUtc.toISOString(), turnoInfo: data.data.turnoInfo },
      // ]);
      showToast('Turno creado con éxito', { background: 'bg-green-600' });

      const modal = document.getElementById('dialog-modal-modalNuevoTurno') as HTMLDialogElement;
      if (modal) {
        modal.close();
      }
      resetNuevoTurno();
    } catch (error: any) {
      showToast(`Error: ${error.message}`, { background: 'bg-red-600' });
      console.error('Error al crear el turno:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReagendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pacienteId || !form.fechaTurno || !form.duracion || !form.userMedicoId) {
      showToast('Por favor, complete los campos obligatorios.', { background: 'bg-red-600' });
      return;
    }

    setLoading(true);
    try {

      const fechaTurnoUtc = toZonedTime(
        `${format(new Date(form.fechaTurno!), 'yyyy-MM-dd')}T${form.horaTurno}`,
        APP_TIME_ZONE
      );

      const payload = {
        ...form,
        fechaTurno: fechaTurnoUtc.toISOString(),
      };

      const response = await fetch('/api/agenda/turnos/reagendar', {
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

      showToast('Turno reagendado con éxito', { background: 'bg-green-600' });

      const modal = document.getElementById('dialog-modal-modalNuevoTurno') as HTMLDialogElement;
      if (modal) {
        modal.close();
      }
      resetNuevoTurno();
    } catch (error: any) {
      showToast(`Error: ${error.message}`, { background: 'bg-red-600' });
      console.error('Error al crear el turno:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    const modal = document.getElementById('dialog-modal-modalNuevoTurno') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
    resetNuevoTurno();
  };

  const handleModalPaciente = () => {
    const modal = document.getElementById('dialog-modal-modalNuevoPaciente') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  const formatDateTimeLocal = (date: Date | undefined, time: string | undefined) => {
    if (!date || !time) return '';
    const dateString = format(new Date(date), 'yyyy-MM-dd');
    return `${dateString}T${time}`;
  };

  const handleSelect = (date: Date | undefined) => {

    seleccionarFecha(date);

  };
  return (
    <form className="p-4 space-y-4">
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


      {/* para reagendar */}
      {datosNuevoTurno.id ? (
        <div>
          <label htmlFor="fechaTurno" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha y Hora del Turno
          </label>
          <input
            type="date"
            id="fechaTurno"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
            onChange={e => handleSelect(e.target.value)}
          />
        </div>
      ) : (
        <div>
          <label htmlFor="fechaTurno" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha y Hora del Turno
          </label>
          <input
            type="datetime-local"
            id="fechaTurno"
            value={formatDateTimeLocal(form.fechaTurno, form.horaTurno)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
            readOnly
          />
        </div>
      )}

      {


        isReagendar ?

          (
            <div className="w-full space-y-2">

              {isLoading && (
                <HorariosSkeletonLoader />
              )}
              {!isLoading && horariosAgrupados?.mañana?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Sun className="w-4 h-4 mr-2 text-yellow-500" />
                    Turno Mañana
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {horariosAgrupados?.mañana?.map(slot => (
                      <BotonHora onClick={onSeleccionarHorario} key={slot.hora} slot={slot} />
                    ))}
                  </div>
                </div>
              )}

              {!isLoading && horariosAgrupados?.tarde?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Moon className="w-4 h-4 mr-2 text-blue-500" />
                    Turno Tarde
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {horariosAgrupados?.tarde?.map(slot => (
                      <BotonHora onClick={onSeleccionarHorario} key={slot.hora} slot={slot} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
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
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button onClick={isReagendar ? handleReagendar : handleSubmit} disabled={loading} variant="primary">
          {isReagendar ? 'Reagendar' : 'Guardar Turno'}
        </Button>
      </div>
    </form>
  );
};
