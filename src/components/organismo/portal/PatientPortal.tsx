import { showToast } from '@/utils/toast/toastShow';
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
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Crear el AudioContext al montar el componente
  useEffect(() => {
    try {
      // 1. AudioContext
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
      console.log('✅ AudioContext creado');

      // 2. Elemento de audio HTML
      const audio = new Audio('/sonido-alerta.mp3');
      audio.preload = 'auto'; // Importante para móviles
      audio.load(); // Forzar carga
      audioRef.current = audio;
      console.log('✅ Audio element creado y precargado');
    } catch (error) {
      console.log('Error creating AudioContext/Audio:', error);
    }
  }, []);
  // Referencia persistente para el elemento de audio (mejor para móviles)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // verificar si es movil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(mobile);
      console.log(`📱 Dispositivo: ${mobile ? 'Móvil' : 'Escritorio'}`);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  useEffect(() => {
    // Verificar y cargar voces al inicio
    const checkSpeechAvailability = () => {
      if (!('speechSynthesis' in window)) {
        console.warn('❌ Speech Synthesis no disponible');
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log(`✅ ${voices.length} voces disponibles`);
        setSpeechReady(true);
        return;
      }

      // Esperar a que las voces se carguen
      const onVoicesChanged = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          console.log(`✅ Voces cargadas: ${voices.length}`);
          setSpeechReady(true);
          window.speechSynthesis.onvoiceschanged = null;
        }
      };

      window.speechSynthesis.onvoiceschanged = onVoicesChanged;

      // Timeout de seguridad
      setTimeout(() => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setSpeechReady(true);
        } else {
          console.warn('⚠️ No se cargaron voces después del timeout');
        }
        window.speechSynthesis.onvoiceschanged = null;
      }, 3000);
    };

    checkSpeechAvailability();
  }, []);

  // Función para activar audio y voz con un gesto del usuario
  const handleActivateAudio = async () => {
    if (audioEnabled) return;

    try {
      console.log('🎵 Activando audio...');

      // 1. Desbloquear AudioContext
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('✅ AudioContext desbloqueado');
      }

      // 2. Reproducir un sonido de prueba SILENCIOSO pero efectivo
      // Esto es clave para desbloquear audio en iOS/Safari
      if (audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Sonido casi inaudible pero suficiente para desbloquear
        oscillator.frequency.setValueAtTime(1, audioContext.currentTime); // Frecuencia muy baja
        gainNode.gain.setValueAtTime(0.001, audioContext.currentTime); // Volumen casi cero

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);

        console.log('✅ Sonido de prueba ejecutado');
      }

      // 3. Intentar reproducir audio HTML (clave para iOS)
      if (audioRef.current) {
        // Configurar para reproducción silenciosa
        audioRef.current.volume = 0.01;
        audioRef.current.muted = false;

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise
            .then(() => {
              console.log('✅ Audio HTML desbloqueado');
              // Pausar inmediatamente
              setTimeout(() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                  audioRef.current.volume = 1.0;
                }
              }, 50);
            })
            .catch(e => {
              console.warn('⚠️ Audio HTML bloqueado:', e.message);
            });
        }
      }

      // 4. Probar Speech Synthesis con un mensaje muy corto
      if ('speechSynthesis' in window) {
        // Cancelar cualquier síntesis previa
        window.speechSynthesis.cancel();

        // Crear un utterance de prueba MUY CORTO
        const testUtterance = new SpeechSynthesisUtterance('');
        testUtterance.volume = 0.1; // Muy bajo volumen
        testUtterance.rate = 0.8;

        testUtterance.onend = () => {
          console.log('✅ Speech Synthesis probado exitosamente');
        };

        testUtterance.onerror = e => {
          console.warn('⚠️ Error probando Speech Synthesis:', e);
        };

        // Intentar hablar (aunque sea texto vacío, activa el sistema)
        window.speechSynthesis.speak(testUtterance);
      }

      // 5. Marcar como habilitado
      setAudioEnabled(true);
      setUserInteracted(true);

      console.log('✅ Audio completamente activado');

      // Mostrar feedback visual
      showToast('Audio activado');
    } catch (error) {
      console.error('❌ Error activando audio:', error);
      // Aún así marcar como interactuado para intentar reproducciones
      setUserInteracted(true);
      setAudioEnabled(true);
    }
  };

  // Función simplificada para reproducir solo el sonido de alerta
  const playAlertSound = async () => {
    if (!audioEnabled) return;

    // 1. AudioContext (Prioritario - Oscilador)
    if (audioContext) {
      try {
        if (audioContext.state === 'suspended') {
          audioContext.resume().catch(() => {});
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Sonido "Ding-Dong" más robusto
        const now = audioContext.currentTime;

        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.setValueAtTime(600, now + 0.2);

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);

        oscillator.start(now);
        oscillator.stop(now + 0.4);
      } catch (e) {
        console.warn('Fallo oscilador', e);
      }
    }

    // 2. HTML Audio Element (Respaldo MP3)
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.warn('Fallo MP3', e));
      } catch (e) {
        console.warn('Fallo audio ref', e);
      }
    }

    // 3. Vibración
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch (e) {}
    }

    console.log('🔔 Sonido de alerta invocado.');
  };

  // Función robusta para reproducir voz, esperando a que las voces carguen
  const reproducirVoz = (data?: any) => {
    // Verificaciones esenciales
    if (!audioEnabled) {
      console.log('🔇 Audio no habilitado, ignorando voz');
      return;
    }

    if (!('speechSynthesis' in window)) {
      console.error('❌ Speech Synthesis no soportado');
      return;
    }

    // Verificar que el usuario haya interactuado (especialmente en móviles)
    if (!userInteracted) {
      console.log('🖱️ Usuario no ha interactuado, ignorando voz');
      return;
    }

    // Crear texto
    let texto = 'Por favor, diríjase al consultorio indicado';
    if (data?.nombrePaciente && data?.consultorio) {
      texto = `${data.nombrePaciente}, por favor diríjase al ${data.consultorio}`;
    }

    console.log(`🗣️ Preparando voz: "${texto}"`);

    // Función principal para hablar
    const speak = () => {
      try {
        // Cancelar cualquier síntesis en curso
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'es-AR';
        utterance.rate = 0.9;
        utterance.volume = 1.0;
        utterance.pitch = 1.0;

        // Seleccionar mejor voz disponible
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Priorizar voces en español
          const spanishVoice = voices.find(
            v => v.lang === 'es-AR' || v.lang === 'es-ES' || v.lang.startsWith('es-')
          );
          if (spanishVoice) {
            utterance.voice = spanishVoice;
            console.log('🔊 Usando voz española:', spanishVoice.name);
          } else {
            // Usar la primera voz disponible
            utterance.voice = voices[0];
            console.log('🔊 Usando voz predeterminada:', voices[0].name);
          }
        }

        // Configurar callbacks
        utterance.onstart = () => {
          console.log('🎤 Comenzando síntesis de voz');
        };

        utterance.onend = () => {
          console.log('✅ Voz reproducida completamente');
        };

        utterance.onerror = event => {
          console.error('❌ Error en síntesis de voz:', event);
        };

        // Intentar hablar
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('❌ Error al crear utterance:', error);
      }
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.log('⏳ Esperando carga de voces...');

      // Esperar a que se carguen las voces
      const onVoicesChanged = () => {
        console.log('✅ Voces cargadas, procediendo a hablar');
        speak();
        window.speechSynthesis.onvoiceschanged = null;
      };

      window.speechSynthesis.onvoiceschanged = onVoicesChanged;

      // Timeout de seguridad
      setTimeout(() => {
        const currentVoices = window.speechSynthesis.getVoices();
        if (currentVoices.length > 0) {
          console.log('⏰ Voces cargadas después del timeout');
          speak();
        } else {
          console.error('❌ No se cargaron voces después del timeout');
          // Mostrar notificación visual como fallback
          showToast(texto);
        }
        window.speechSynthesis.onvoiceschanged = null;
      }, 2000);
    } else {
      speak();
    }
  };
  // Conexión a Server-Sent Events con reconexión automática
  useEffect(() => {
    console.log(' Iniciando conexión SSE desde el portal del paciente...');
    console.log(' Centro Médico ID:', initialData.centroMedicoId);

    // Construir URL con centroMedicoId
    const eventsUrl = `/api/public/public-events?centroMedicoId=${initialData.centroMedicoId}`;
    console.log(' URL de conexión SSE:', eventsUrl);

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
        console.log(' Evento turno-actualizado recibido:', turnoActualizado);
        // Si la actualización es para mi turno, actualizo mi estado
        if (turnoActualizado.id === turno.id) {
          setTurno(turnoActualizado);
        }
      });

      // Escuchar evento específico de llamado a pacientes
      eventSource.addEventListener('paciente-llamado', event => {
        const data = JSON.parse(event.data);
        console.log(' Evento paciente-llamado recibido:', data);

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
        console.log(' Página visible, verificando conexión SSE...');
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
          <div
            className={`mt-4 p-4 border rounded-lg ${isMobile ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}
          >
            <button
              onClick={handleActivateAudio}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                isMobile ? 'bg-blue-600 hover:bg-blue-700' : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              🔊 {isMobile ? 'Tocar para activar audio' : 'Activar notificaciones de audio'}
            </button>
            <p className="mt-2 text-sm text-gray-600">
              {isMobile
                ? 'En dispositivos móviles necesitas tocar este botón para permitir el audio'
                : 'Haz clic para activar las notificaciones de sonido y voz'}
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
