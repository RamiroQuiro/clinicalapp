import { useEffect, useState } from 'react';
import { User, Clock, Stethoscope, ChevronRight } from 'lucide-react';

// Tipos para los datos iniciales
interface InitialData {
  paciente: { nombre: string; apellido: string; };
  medico: { nombre: string; apellido: string; };
  turno: { id: string; estado: string; horaTurno: string; };
}

// Componente para mostrar el estado actual del turno del paciente
const StatusBadge = ({ estado }: { estado: string }) => {
  const statusInfo = {
    sala_de_espera: { text: 'En Sala de Espera', color: 'bg-blue-100 text-blue-800' },
    'siendo-llamado': { text: '¡Es tu turno!', color: 'bg-green-100 text-green-800 animate-pulse' },
    demorado: { text: 'Demorado', color: 'bg-yellow-100 text-yellow-800' },
  };

  const info = statusInfo[estado] || { text: estado, color: 'bg-gray-100 text-gray-800' };

  return (
    <div className={`px-4 py-2 rounded-full font-semibold text-sm ${info.color}`}>
      {info.text}
    </div>
  );
};

export default function PatientPortal({ initialData }: { initialData: InitialData }) {
  const [turno, setTurno] = useState(initialData.turno);
  const [ahoraLlamando, setAhoraLlamando] = useState({ nombre: '-', consultorio: '-' });

  // Conexión a Server-Sent Events
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    // Escuchar actualizaciones generales de turnos
    eventSource.addEventListener('turno-actualizado', (event) => {
      const turnoActualizado = JSON.parse(event.data);
      // Si la actualización es para mi turno, actualizo mi estado
      if (turnoActualizado.id === turno.id) {
        setTurno(turnoActualizado);
      }
    });

    // Escuchar evento específico de llamado a pacientes
    eventSource.addEventListener('paciente-llamado', (event) => {
      const data = JSON.parse(event.data);
      setAhoraLlamando({ nombre: data.nombrePaciente, consultorio: data.consultorio });

      // --- LÓGICA DE SÍNTESIS DE VOZ ---
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Llamando a ${data.nombrePaciente}, consultorio ${data.consultorio}`
        );
        utterance.lang = 'es-AR'; // Establecer el idioma para la pronunciación correcta
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn('La síntesis de voz no es soportada en este navegador.');
      }
    });

    eventSource.onerror = () => {
      console.error('SSE Error');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [turno.id]);

  return (
    <div className="max-w-2xl mx-auto font-sans">
      {/* --- Tarjeta de Bienvenida --- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 text-center">
        <User className="w-16 h-16 mx-auto text-blue-500 bg-blue-50 p-3 rounded-full" />
        <h1 className="text-2xl font-bold mt-4 text-gray-800">
          Hola, {initialData.paciente.nombre}
        </h1>
        <p className="text-gray-500 mt-1">
          Bienvenido a tu portal de paciente.
        </p>
        <div className="mt-4">
            <StatusBadge estado={turno.estado} />
        </div>
      </div>

      {/* --- Tarjeta de "Ahora Llamando" --- */}
      <div className="mt-6 bg-gray-800 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-center text-gray-300">Ahora llamando</h2>
        <div className="text-center mt-3">
          <p className="text-4xl font-bold tracking-wider">{ahoraLlamando.nombre}</p>
          <p className="text-lg text-gray-400 mt-1">Consultorio {ahoraLlamando.consultorio}</p>
        </div>
      </div>

      {/* --- Detalles del Turno --- */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
            <div className='flex items-center gap-3'>
                <Stethoscope className="w-6 h-6 text-gray-500" />
                <span className="text-gray-700">Tu médico</span>
            </div>
            <span className="font-semibold text-gray-800">Dr. {initialData.medico.nombre} {initialData.medico.apellido}</span>
        </div>
         <div className="flex justify-between items-center border-t pt-4">
            <div className='flex items-center gap-3'>
                <Clock className="w-6 h-6 text-gray-500" />
                <span className="text-gray-700">Hora de tu turno</span>
            </div>
            <span className="font-semibold text-gray-800">{initialData.turno.horaTurno}</span>
        </div>
      </div>

    </div>
  );
}
