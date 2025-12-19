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

  // Función para reproducir sonido con manejo mejorado para móviles y compatibilidad
  const playAlertSound = async (data?: any) => {
    try {
      // Reanudar AudioContext si está suspendido
      if (audioContext?.state === 'suspended') {
        await audioContext.resume();
      }

      // Detectar navegador para ajustes específicos
      const isOpera = navigator.userAgent.includes('Opera');
      const isEdge = navigator.userAgent.includes('Edg');
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      console.log('Navegador detectado:', { isOpera, isEdge, isMobile });

      // Estrategia 1: Audio Context (más compatible)
      let audioPlayed = false;
      try {
        const audio = new Audio('/sonido-alerta.mp3');
        audio.volume = 0.5;

        // Para móviles, configurar preload
        if (isMobile) {
          audio.preload = 'auto';
        }

        const playPromise = audio.play();

        if (playPromise !== undefined) {
          await playPromise;
          audioPlayed = true;
          console.log('Audio reproducido con Audio API');
        }

        // Cuando el sonido termine, reproducir voz
        audio.onended = () => {
          reproducirVoz(data);
        };

      } catch (audioError) {
        console.warn('Error con Audio API:', audioError);

        // Estrategia 2: Web Audio API (fallback)
        if (!audioPlayed) {
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const response = await fetch('/sonido-alerta.mp3');
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);

            source.start(0);
            audioPlayed = true;
            console.log('Audio reproducido con Web Audio API');

            // Reproducir voz después del audio
            setTimeout(() => reproducirVoz(data), 2000);

          } catch (webAudioError) {
            console.warn('Error con Web Audio API:', webAudioError);

            // Estrategia 3: Solo voz (último fallback)
            reproducirVoz(data);
          }
        }
      }

    } catch (error) {
      console.error('Error general reproduciendo audio:', error);

      // Último fallback: solo voz
      reproducirVoz(data);
    }
  };

  // Función separada para reproducir voz
  const reproducirVoz = (data?: any) => {
    try {
      if ('speechSynthesis' in window) {
        // Limpiar cola primero
        window.speechSynthesis.cancel();

        let texto = 'Por favor, diríjase al consultorio indicado';
        if (data?.nombrePaciente && data?.consultorio) {
          texto = `${data.nombrePaciente}, por favor diríjase al ${data.consultorio}`;
        }

        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'es-AR';
        utterance.rate = 0.9;
        utterance.volume = 1.0;
        utterance.pitch = 1.0;

        // Para Opera y Edge, configuraciones específicas
        const isOpera = navigator.userAgent.includes('Opera');
        const isEdge = navigator.userAgent.includes('Edg');

        if (isOpera || isEdge) {
          utterance.rate = 0.8; // Más lento para Opera
          utterance.pitch = 0.9; // Pitch más bajo
        }

        window.speechSynthesis.speak(utterance);
        console.log('Voz reproducida con configuración para:', isOpera ? 'Opera' : isEdge ? 'Edge' : 'general');
      }
    } catch (error) {
      console.error('Error reproduciendo voz:', error);
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
