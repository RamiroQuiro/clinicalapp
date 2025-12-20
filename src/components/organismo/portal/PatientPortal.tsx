import { Clock, Stethoscope, User } from 'lucide-react';
import { useEffect, useState } from 'react';

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

// --- Singleton de Audio (Fuera del componente para persistencia absoluta) ---
const audioController = {
  ctx: null as AudioContext | null,
  audioElement: null as HTMLAudioElement | null,
  isUnlocked: false,

  init() {
    if (this.ctx) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.audioElement = new Audio('/sonido-alerta.mp3');
      this.audioElement.preload = 'auto';
    } catch (e) {
      console.error('Error init audio:', e);
    }
  },

  async unlock() {
    this.init();
    const ctx = this.ctx;
    const audio = this.audioElement;
    if (!ctx || !audio) return false;

    try {
      // 1. Resume Context (AWAIT es crucial aquí si estamos en un evento de usuario)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // 2. Beep Fuerte y Claro
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(880, ctx.currentTime);
        // Volumen más alto para confirmar
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {
        console.warn('Osc unlock warn', e);
      }

      // 3. Desbloqueo HTML Audio
      audio.volume = 0.05;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setTimeout(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.volume = 1.0;
            }, 100);
          })
          .catch(() => {});
      }

      // 4. Feedback de Voz (Restaurado por petición implícita)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance('Sistema de audio listo');
        u.lang = 'es-AR';
        window.speechSynthesis.speak(u);
      }

      this.isUnlocked = true;
      return true;
    } catch (err) {
      console.error('Unlock failed:', err);
      return false;
    }
  },

  playAlert() {
    if (!this.ctx) this.init();

    // Intento agresivo de despertar
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.ctx) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        // Secuencia "Ding-Dong" más larga
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.setValueAtTime(500, now + 0.3);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0, now + 1.0);

        osc.start(now);
        osc.stop(now + 1.0);
      } catch (e) {
        console.error('Osc play error', e);
      }
    }

    if (this.audioElement) {
      // Asegurar volumen
      this.audioElement.volume = 1.0;
      this.audioElement.currentTime = 0;
      this.audioElement.play().catch(e => console.warn('MP3 fail', e));
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 200, 200]);
    }
  },
};

export default function PatientPortal({ initialData }: { initialData: InitialData }) {
  const [turno, setTurno] = useState(initialData.turno);
  const [ahoraLlamando, setAhoraLlamando] = useState({ nombre: '-', consultorio: '-' });
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    audioController.init();

    // Asegurar que las voces estén cargadas (crítico para Chrome/Edge)
    if ('speechSynthesis' in window) {
      // Trigger para cargar voces
      window.speechSynthesis.getVoices();

      // Listener para cuando las voces estén listas
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('🎤 Voces cargadas:', voices.length);
      };
    }
  }, []);

  const handleActivateAudio = async () => {
    await audioController.unlock();
    setAudioEnabled(true);
  };

  const playAlertSound = () => {
    if (!audioEnabled) return;
    audioController.playAlert();
    console.log('🔔 Alerta invocada (Singleton)');
  };

  // Función robusta para reproducir voz, esperando a que las voces carguen
  const reproducirVoz = (data?: { nombrePaciente?: string; consultorio?: string }) => {
    console.log('🗣️ reproducirVoz llamada con data:', data);
    console.log('🔊 audioEnabled:', audioEnabled);

    if (!audioEnabled || !('speechSynthesis' in window)) {
      console.warn('⚠️ Audio no habilitado o speechSynthesis no disponible');
      return;
    }

    window.speechSynthesis.cancel();

    let texto = 'Por favor diríjase al consultorio';
    if (data?.nombrePaciente && data?.consultorio) {
      texto = `${data.nombrePaciente}, por favor diríjase al ${data.consultorio}`;
    }

    console.log('📢 Texto a decir:', texto);

    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-AR';
    u.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    console.log('🎤 Voces disponibles:', voices.length);

    // Prioridad: AR -> ES -> Cualquier español
    const vozEs =
      voices.find(v => v.lang === 'es-AR') ||
      voices.find(v => v.lang === 'es-ES') ||
      voices.find(v => v.lang.startsWith('es'));

    if (vozEs) {
      u.voice = vozEs;
      console.log('✅ Voz seleccionada:', vozEs.name, vozEs.lang);
    } else {
      console.warn('⚠️ No se encontró voz en español');
    }

    window.speechSynthesis.speak(u);
    console.log('🎙️ speechSynthesis.speak() ejecutado');
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
    playAlertSound,
    reproducirVoz,
  ]); // Dependencias actualizadas + funciones de audio

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
