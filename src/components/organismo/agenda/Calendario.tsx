import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ModalReact from '@/components/moleculas/ModalReact';
import { FormularioTurno } from './FormularioTurno';
import { showToast } from '@/utils/toast/toastShow';

// Setup the localizer by providing the moment Object
const localizer = momentLocalizer(moment);

// Define a type for our events
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

const Calendario = () => {
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null); // Para edición

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/turnos');
      if (!response.ok) {
        throw new Error('Error al cargar los turnos.');
      }
      const data = await response.json();
      
      // Asegurarse de que start y end sean objetos Date
      const formattedEvents: MyEvent[] = data.data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(formattedEvents);
    } catch (err: any) {
      console.error('Error al cargar los turnos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setSelectedEvent(null); // Asegurarse de que no estamos en modo edición
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: MyEvent) => {
    setSelectedEvent(event);
    setSelectedSlot({ start: event.start, end: event.end }); // Para pasar al formulario
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
    setSelectedEvent(null);
  };

  const handleSaveTurno = async (formData: any) => {
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `/api/turnos/${formData.id}` : '/api/turnos';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        showToast(`Turno ${formData.id ? 'actualizado' : 'creado'} exitosamente`, { background: 'bg-green-500' });
        fetchEvents(); // Recargar eventos para mostrar el nuevo/actualizado turno
      } else {
        showToast(`Error: ${result.msg || 'No se pudo guardar el turno'}`, { background: 'bg-red-500' });
      }
    } catch (error: any) {
      showToast(`Error de red: ${error.message}`, { background: 'bg-red-500' });
    }
    handleCloseModal();
  };

  const handleDeleteTurno = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar este turno?')) {
      return;
    }
    try {
      const response = await fetch(`/api/turnos/${id}/cancelar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (response.ok) {
        showToast('Turno cancelado exitosamente', { background: 'bg-green-500' });
        fetchEvents(); // Recargar eventos para mostrar el cambio
      } else {
        showToast(`Error: ${result.msg || 'No se pudo cancelar el turno'}`, { background: 'bg-red-500' });
      }
    } catch (error: any) {
      showToast(`Error de red: ${error.message}`, { background: 'bg-red-500' });
    }
    handleCloseModal();
  };

  if (loading) {
    return <div className="text-center py-4">Cargando agenda...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div style={{ height: 'calc(100vh - 150px)' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable // Permite seleccionar slots
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent} // Permite seleccionar eventos existentes
        style={{ margin: '20px' }}
        // Personalización de mensajes en español (opcional pero recomendado)
        messages={{
          allDay: 'Todo el día',
          previous: 'Anterior',
          next: 'Siguiente',
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          agenda: 'Agenda',
          date: 'Fecha',
          time: 'Hora',
          event: 'Turno', 
          noEventsInRange: 'No hay turnos en este rango.',
          showMore: total => `+${total} más`
        }}
      />

      {isModalOpen && selectedSlot && (
        <ModalReact 
          title={selectedEvent ? 'Editar Turno' : 'Crear Nuevo Turno'}
          id="modal-turno"
          onClose={handleCloseModal}
        >
          <div className="w-[80vw] md:w-[600px]">
            <FormularioTurno
              onSave={handleSaveTurno}
              onCancel={handleCloseModal}
              initialStart={selectedSlot.start}
              initialEnd={selectedSlot.end}
              initialData={selectedEvent}
              onDelete={handleDeleteTurno}
            />
          </div>
        </ModalReact>
      )}
    </div>
  );
};

export default Calendario;
