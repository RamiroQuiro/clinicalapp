import { Clock, Stethoscope, User } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    demorado: { text: '¡Es tu turno!', color: 'bg-green-100 text-green-800 animate-pulse' },
    en_consulta: { text: 'En Consulta', color: 'bg-purple-100 text-purple-800' },
    finalizado: { text: 'Finalizado', color: 'bg-gray-100 text-gray-800' },
    confirmado: { text: 'Confirmado', color: 'bg-emerald-100 text-emerald-800' },
    pendiente: { text: 'Pendiente', color: 'bg-orange-100 text-orange-800' },
    cancelado: { text: 'Cancelado', color: 'bg-red-100 text-red-800' },
    ausente: { text: 'Ausente', color: 'bg-red-100 text-red-800' },
  };

  const info = statusInfo[estado as keyof typeof statusInfo] || { text: estado, color: 'bg-gray-100 text-gray-800' };

  return (
    <div className={`px-4 py-2 rounded-full font-semibold text-sm ${info.color}`}>
      {info.text}
    </div>
  );
};

export default function PatientPortal({ initialData }: { initialData: InitialData }) {
  const [turno, setTurno] = useState(initialData.turno);
  const [ahoraLlamando, setAhoraLlamando] = useState({ nombre: '-', consultorio: '-' });
  const [audioPreloaded, setAudioPreloaded] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  // Preload del audio y solicitar permisos al cargar
  useEffect(() => {
    const preloadAudio = async () => {
      try {
        // Crear AudioContext
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(context);

        // Intentar reanudar AudioContext (requerido por muchos navegadores)
        if (context.state === 'suspended') {
          await context.resume();
        }

        // Cargar audio
        const audio = new Audio('/sonido-alerta.mp3');
        audio.volume = 0.3;
        await audio.load();

        setAudioPreloaded(true);
        console.log('Audio preloaded successfully, context state:', context.state);
      } catch (error) {
        console.warn('Error preloading audio:', error);
      }
    };

    preloadAudio();
  }, []);

  // Detectar interacción del usuario (requerido para autoplay en móviles)
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteracted && audioContext?.state === 'suspended') {
        audioContext.resume();
        setUserInteracted(true);
        console.log('AudioContext resumed after user interaction');
      }
    };

    // Eventos que indican interacción del usuario
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [audioContext, userInteracted]);

  // Función para reproducir sonido con manejo mejorado para móviles
  const playAlertSound = async (data?: any) => {
    try {
      // Reanudar AudioContext si está suspendido
      if (audioContext?.state === 'suspended') {
        await audioContext.resume();
      }

      const audio = new Audio('/sonido-alerta.mp3');
      audio.volume = 0.5;

      // Intentar reproducir con diferentes estrategias
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        await playPromise;
      }

      // Cuando el sonido termine, reproducir voz con nombre del paciente
      audio.onended = () => {
        if ('speechSynthesis' in window && data?.nombrePaciente && data?.consultorio) {
          const utterance = new SpeechSynthesisUtterance(
            `${data.nombrePaciente}, por favor diríjase al ${data.consultorio}`
          );
          utterance.lang = 'es-AR';
          utterance.rate = 0.9;
          utterance.volume = 1.0;

          // Reanudar speechSynthesis si está suspendido
          window.speechSynthesis.cancel(); // Limpiar cola
          window.speechSynthesis.speak(utterance);
        } else if ('speechSynthesis' in window) {
          // Fallback si no hay datos
          const utterance = new SpeechSynthesisUtterance('Por favor, diríjase al consultorio indicado');
          utterance.lang = 'es-AR';
          utterance.rate = 0.9;
          utterance.volume = 1.0;

          window.speechSynthesis.cancel(); // Limpiar cola
          window.speechSynthesis.speak(utterance);
        }
      };

    } catch (error) {
      console.error('Error playing audio:', error);

      // Fallback: solo voz si el audio falla
      if ('speechSynthesis' in window && data?.nombrePaciente && data?.consultorio) {
        const utterance = new SpeechSynthesisUtterance(
          `${data.nombrePaciente}, por favor diríjase al ${data.consultorio}`
        );
        utterance.lang = 'es-AR';
        utterance.rate = 0.9;
        utterance.volume = 1.0;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } else if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Por favor, diríjase al consultorio indicado');
        utterance.lang = 'es-AR';
        utterance.rate = 0.9;
        utterance.volume = 1.0;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }
  };

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

      // Reproducir sonido y voz con datos del paciente
      playAlertSound(data);
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
    <div className="mx-auto max-w-2xl font-sans">
      {/* --- Tarjeta de Bienvenida --- */}
      <div className="bg-white shadow-lg p-6 border border-gray-200 rounded-xl text-center">
        <User className="bg-blue-50 mx-auto p-3 rounded-full w-16 h-16 text-blue-500" />
        <h1 className="mt-4 font-bold text-gray-800 text-2xl">
          Hola, {initialData.paciente.nombre}
        </h1>
        <p className="mt-1 text-gray-500">
          Bienvenido a tu portal de paciente.
        </p>
        <div className="mt-4">
          <StatusBadge estado={turno.estado} />
        </div>
      </div>

      {/* --- Tarjeta de "Ahora Llamando" --- */}
      <div className="bg-gray-800 shadow-lg mt-6 p-6 rounded-xl text-white">
        <h2 className="font-semibold text-gray-300 text-lg text-center">Ahora llamando</h2>
        <div className="mt-3 text-center">
          <p className="font-bold text-4xl tracking-wider">{ahoraLlamando.nombre}</p>
          <p className="mt-1 text-gray-400 text-lg">Consultorio {ahoraLlamando.consultorio}</p>
        </div>
      </div>

      {/* --- Detalles del Turno --- */}
      <div className="space-y-4 bg-white mt-6 p-6 border border-gray-200 rounded-xl">
        <div className="flex justify-between items-center">
          <div className='flex items-center gap-3'>
            <Stethoscope className="w-6 h-6 text-gray-500" />
            <span className="text-gray-700">Tu médico</span>
          </div>
          <span className="font-semibold text-gray-800">Dr. {initialData.medico.nombre} {initialData.medico.apellido}</span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
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
