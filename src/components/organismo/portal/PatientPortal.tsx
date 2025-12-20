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

export default function PatientPortal({ initialData }: { initialData: InitialData }) {
  const [turno, setTurno] = useState(initialData.turno);
  const [ahoraLlamando, setAhoraLlamando] = useState({ nombre: '-', consultorio: '-' });
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Crear el AudioContext al montar el componente
  useEffect(() => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
    } catch (error) {
      console.log('Error creating AudioContext:', error);
    }
  }, []);

  // Función para activar audio y voz con un gesto del usuario
  const handleActivateAudio = async () => {
    if (audioEnabled || !audioContext) return;

    try {
      // 1. Solicitar permisos de notificación (para móviles)
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // 2. Reanudar AudioContext (clave para móviles)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // 3. Crear y reproducir un sonido de prueba para "desbloquear" el audio
      // Usar un oscilador en lugar de un archivo para mejor compatibilidad móvil
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 440; // La nota A4
      gainNode.gain.setValueAtTime(0.01, audioContext.currentTime); // Muy bajo volumen
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);

      // 4. También probar con Audio element como fallback
      try {
        const audio = new Audio('/sonido-alerta.mp3');
        audio.volume = 0.01;
        await audio.play();
        audio.pause();
      } catch (e) {
        console.warn('Audio element fallback falló:', e);
      }

      // 5. "Calentar" el motor de Speech Synthesis con un texto silencioso
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Limpiar cola
        const utterance = new SpeechSynthesisUtterance(' '); // Un espacio en blanco
        utterance.volume = 0; // Sin volumen
        window.speechSynthesis.speak(utterance);
      }

      setAudioEnabled(true);
      setUserInteracted(true);
      console.log('✅ Audio y Voz activados por el usuario.');
    } catch (error) {
      console.error(
        '⚠️ Error al activar audio/voz. El usuario debe interactuar con la página.',
        error
      );
      // Igualmente se marca como activado para ocultar el botón
      setAudioEnabled(true);
      setUserInteracted(true);
    }
  };

  // Función simplificada para reproducir solo el sonido de alerta
  const playAlertSound = async () => {
    if (!audioEnabled) return;

    try {
      // 1. Intentar con AudioContext primero (mejor para móviles)
      if (audioContext) {
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Crear un sonido de alerta más audible
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Sonido de alerta: dos tonos rápidos
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }

      // 2. Fallback con Audio element
      try {
        const audio = new Audio('/sonido-alerta.mp3');
        audio.volume = 0.7;
        // En móviles, asegurar que se reproduzca incluso en background
        audio.play().catch(err => {
          console.warn('Error reproduciendo audio element:', err);
        });
      } catch (error) {
        console.warn('Audio element no disponible:', error);
      }

      // 3. Vibración para móviles (si está disponible)
      if ('vibrate' in navigator) {
        try {
          // Patrón: vibrar 200ms, pausa 100ms, vibrar 200ms
          navigator.vibrate([200, 100, 200]);
        } catch (e) {
          console.warn('Vibración no disponible:', e);
        }
      }

      console.log('🔔 Sonido de alerta reproducido.');
    } catch (error) {
      console.error('Error reproduciendo sonido de alerta:', error);
    }
  };

  // Función robusta para reproducir voz, esperando a que las voces carguen
  const reproducirVoz = (data?: any) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;

    const speak = () => {
      window.speechSynthesis.cancel(); // Limpiar cola antes de hablar

      let texto = 'Por favor, diríjase al consultorio indicado';
      if (data?.nombrePaciente && data?.consultorio) {
        texto = `${data.nombrePaciente}, por favor diríjase al ${data.consultorio}`;
      }

      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-AR';
      utterance.rate = 0.85; // Un poco más lento para mejor comprensión en móviles
      utterance.volume = 1.0;
      utterance.pitch = 1.0;

      // Intentar seleccionar una voz en español para mejorar la calidad
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(
        voice => voice.lang === 'es-AR' || voice.lang === 'es-ES' || voice.lang.startsWith('es')
      );
      if (spanishVoice) {
        utterance.voice = spanishVoice;
        console.log('Voz en español encontrada:', spanishVoice.name);
      }

      // Manejar errores de síntesis de voz
      utterance.onerror = event => {
        console.error('Error en síntesis de voz:', event);
      };

      utterance.onend = () => {
        console.log('🗣️ Voz reproducida completamente');
      };

      window.speechSynthesis.speak(utterance);
      console.log(`🗣️ Intentando decir: "${texto}"`);
    };

    // La carga de voces puede ser asíncrona, especialmente en móviles
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.log('Voces del sintetizador no cargadas, esperando evento onvoiceschanged...');

      // Usar una función auxiliar para evitar múltiples listeners
      const handleVoicesChanged = () => {
        console.log('Voces cargadas, procediendo a hablar.');
        speak();
        window.speechSynthesis.onvoiceschanged = null; // Limpiar listener
      };

      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

      // Timeout de seguridad para navegadores que no disparan el evento
      setTimeout(() => {
        if (window.speechSynthesis.getVoices().length > 0) {
          window.speechSynthesis.onvoiceschanged = null; // Limpiar si ya se ejecutó
          speak();
        }
      }, 1000); // Aumentado a 1 segundo para móviles más lentos
    } else {
      speak();
    }
  };

  // Conexión a Server-Sent Events con reconexión automática
  useEffect(() => {
    console.log('🔗 Iniciando conexión SSE desde el portal del paciente...');
    console.log('🏥 Centro Médico ID:', initialData.centroMedicoId);

    // Construir URL con centroMedicoId
    const eventsUrl = `/api/publiv/public-events?centroMedicoId=${initialData.centroMedicoId}`;
    console.log('📡 URL de conexión SSE:', eventsUrl);

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
        console.log('📝 Evento turno-actualizado recibido:', turnoActualizado);
        // Si la actualización es para mi turno, actualizo mi estado
        if (turnoActualizado.id === turno.id) {
          setTurno(turnoActualizado);
        }
      });

      // Escuchar evento específico de llamado a pacientes
      eventSource.addEventListener('paciente-llamado', event => {
        const data = JSON.parse(event.data);
        console.log('📢 Evento paciente-llamado recibido:', data);

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
