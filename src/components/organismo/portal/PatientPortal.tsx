import { Clock, Stethoscope, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Tipos para los datos iniciales
interface InitialData {
  paciente: { nombre: string; apellido: string };
  medico: { nombre: string; apellido: string };
  turno: { id: string; estado: string; horaTurno: string };
  centroMedicoId: string; // Agregar centro médico
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

  const info = statusInfo[estado as keyof typeof statusInfo] || {
    text: estado,
    color: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className={`px-4 py-2 rounded-full font-semibold text-sm ${info.color}`}>{info.text}</div>
  );
};

export default function PatientPortal({ initialData }: { initialData: InitialData }) {
  const [turno, setTurno] = useState(initialData.turno);
  const [ahoraLlamando, setAhoraLlamando] = useState({ nombre: '-', consultorio: '-' });
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Crear el AudioContext al montar el componente
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

    audioContextRef.current = new AudioContextClass();

    const audio = new Audio('/sonido-alerta.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;
  }, []);

  // Función para activar audio y voz con un gesto del usuario
  const handleActivateAudio = async () => {
    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      // Desbloquear AudioContext
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Sonido corto de confirmación (obligatorio para móviles)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = 880;
      gain.gain.value = 0.2;

      osc.start();
      osc.stop(ctx.currentTime + 0.15);

      // Desbloquear HTMLAudio (iOS)
      if (audioRef.current) {
        audioRef.current.volume = 0.3;
        await audioRef.current.play();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 1;
      }

      // Confirmación por voz (opcional, pero útil)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance('Sonido activado');
        u.lang = 'es-AR';
        window.speechSynthesis.speak(u);
      }

      setAudioEnabled(true);
      console.log('✅ Audio habilitado correctamente');
    } catch (e) {
      console.error('Error activando audio:', e);
    }
  };

  // Función simplificada para reproducir solo el sonido de alerta
  const playAlertSound = () => {
    if (!audioEnabled) return;

    const ctx = audioContextRef.current;

    // 1. AudioContext (principal)
    if (!ctx) {
      console.error('AudioContext no disponible');
      return;
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(e => console.error('Error al activar AudioContext:', e));
    }

    if (ctx) {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        osc.frequency.setValueAtTime(900, now);
        osc.frequency.setValueAtTime(600, now + 0.25);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
      } catch {}
    }

    // 2. MP3 respaldo
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    // 3. Vibración
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  // Función robusta para reproducir voz, esperando a que las voces carguen
  const reproducirVoz = (data?: { nombrePaciente?: string; consultorio?: string }) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    let texto = 'Por favor diríjase al consultorio';
    if (data?.nombrePaciente && data?.consultorio) {
      texto = `${data.nombrePaciente}, por favor diríjase al ${data.consultorio}`;
    }

    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-AR';
    u.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const vozEs = voices.find(v => v.lang.startsWith('es'));
    if (vozEs) u.voice = vozEs;

    window.speechSynthesis.speak(u);
  };

  // Conexión a Server-Sent Events con reconexión automática
  useEffect(() => {
    console.log('Iniciando conexión SSE desde el portal del paciente...');
    console.log('Centro Médico ID:', initialData.centroMedicoId);

    // Construir URL con centroMedicoId
    const eventsUrl = `/api/public/public-events?centroMedicoId=${initialData.centroMedicoId}`;
    console.log('URL de conexión SSE:', eventsUrl);

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    const baseReconnectDelay = 1000; // 1 segundo base

    const connect = () => {
      if (eventSource) {
        eventSource.close();
      }

      eventSource = new EventSource(eventsUrl);

      // Logging para diagnóstico
      eventSource.onopen = () => {
        console.log('✅ SSE Conectado exitosamente');
        reconnectAttempts = 0; // Resetear contador en conexión exitosa
      };

      eventSource.onerror = error => {
        console.error('❌ Error en conexión SSE:', error);
        console.error('Estado del EventSource:', {
          readyState: eventSource?.readyState,
          url: eventSource?.url,
        });

        // Intentar reconectar si se perdió la conexión
        if (eventSource?.readyState === EventSource.CLOSED) {
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts - 1), 30000); // Max 30 segundos
            console.log(
              `🔄 Intentando reconectar SSE en ${delay}ms (intento ${reconnectAttempts}/${maxReconnectAttempts})...`
            );

            reconnectTimeout = setTimeout(() => {
              connect();
            }, delay);
          } else {
            console.error('❌ Máximo de intentos de reconexión alcanzado');
          }
        }
      };

      // Escuchar actualizaciones generales de turnos
      eventSource.addEventListener('turno-actualizado', event => {
        const turnoActualizado = JSON.parse(event.data);
        console.log('Turno actualizado:', turnoActualizado);
        // Si la actualización es para mi turno, actualizo mi estado
        if (turnoActualizado.id === turno.id) {
          setTurno(turnoActualizado);
        }
      });

      // Escuchar evento específico de llamado a pacientes
      eventSource.addEventListener('paciente-llamado', event => {
        const data = JSON.parse(event.data);
        console.log('Paciente llamado:', data);

        // Verificar si es para este paciente específico
        const esMiTurno =
          data.turnoId === turno.id ||
          data.nombrePaciente ===
            `${initialData.paciente.nombre} ${initialData.paciente.apellido}`.trim();

        if (esMiTurno || !data.turnoId) {
          // Solo actualizar si es mi turno o si no hay turnoId (llamado general)
          setAhoraLlamando({ nombre: data.nombrePaciente, consultorio: data.consultorio });

          // Actualizar estado del turno si viene en el evento
          if (data.turnoId === turno.id && data.estado) {
            setTurno(prev => ({ ...prev, estado: data.estado }));
          }

          // Reproducir sonido y, con un pequeño retardo, la voz
          playAlertSound();
          setTimeout(() => reproducirVoz(data), 800); // Retardo aumentado para móviles

          // Mostrar notificación web si está disponible y la página no está visible
          if ('Notification' in window && Notification.permission === 'granted') {
            if (document.hidden) {
              new Notification('Es tu turno!', {
                body: `${data.nombrePaciente}, diríjase al ${data.consultorio}`,
                icon: '/favicon.ico',
                tag: 'paciente-llamado', // Evitar múltiples notificaciones
                requireInteraction: true, // Mantener visible hasta interacción
              });
            }
          }
        }
      });
    };

    // Conectar inicialmente
    connect();

    // Reconectar cuando la página vuelve a estar visible (útil para móviles)
    const handleVisibilityChange = () => {
      if (!document.hidden && (!eventSource || eventSource.readyState === EventSource.CLOSED)) {
        console.log('👁️ Página visible, verificando conexión SSE...');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('🔌 Cerrando conexión SSE...');
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (eventSource) {
        eventSource.close();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    turno.id,
    initialData.centroMedicoId,
    initialData.paciente.nombre,
    initialData.paciente.apellido,
  ]); // Dependencias actualizadas

  return (
    <div className="mx-auto max-w-2xl font-sans">
      {/* --- Tarjeta de Bienvenida --- */}
      <div className="bg-white shadow-lg p-6 border border-gray-200 rounded-xl text-center">
        <User className="bg-blue-50 mx-auto p-3 rounded-full w-16 h-16 text-blue-500" />
        <h1 className="mt-4 font-bold text-gray-800 text-2xl">
          Hola, {initialData.paciente.nombre}
        </h1>
        <p className="mt-1 text-gray-500">Bienvenido a tu portal de paciente.</p>

        {/* Botón de activación de audio */}
        {!audioEnabled && (
          <div className="bg-yellow-50 mt-4 p-4 border border-yellow-200 rounded-lg">
            <button
              onClick={handleActivateAudio}
              className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg font-medium text-white transition-colors"
            >
              🔊 Activar notificaciones de audio
            </button>
            <p className="mt-2 text-yellow-700 text-sm">
              Haz clic para activar las notificaciones de sonido y voz
            </p>
          </div>
        )}

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
          <div className="flex items-center gap-3">
            <Stethoscope className="w-6 h-6 text-gray-500" />
            <span className="text-gray-700">Tu médico</span>
          </div>
          <span className="font-semibold text-gray-800">
            Dr. {initialData.medico.nombre} {initialData.medico.apellido}
          </span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-gray-500" />
            <span className="text-gray-700">Hora de tu turno</span>
          </div>
          <span className="font-semibold text-gray-800">{initialData.turno.horaTurno}</span>
        </div>
      </div>
    </div>
  );
}
