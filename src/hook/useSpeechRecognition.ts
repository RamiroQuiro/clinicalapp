import { useEffect, useState, useRef } from 'react';

// Definimos la interfaz para el objeto de reconocimiento de voz para mayor seguridad de tipos
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

// Declaramos el tipo global para que TypeScript no se queje
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [newFinalSegment, setNewFinalSegment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('El reconocimiento de voz no es soportado por este navegador.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-AR';

    recognition.onresult = (event) => {
      let latestFinalSegment = '';
      // Iterar desde el final para encontrar el último resultado final
      for (let i = event.results.length - 1; i >= event.resultIndex; --i) {
        const result = event.results[i];
        if (result.isFinal) {
          latestFinalSegment = result[0].transcript;
          break; // Encontrado el último segmento final, no es necesario ir más atrás
        }
      }

      if (latestFinalSegment) {
        setNewFinalSegment(latestFinalSegment + ' ');
      }
    };

    recognition.onerror = (event) => {
      setError(`Error en el reconocimiento: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setNewFinalSegment('');
      recognitionRef.current.start();
      setIsListening(true);
    } else if (!recognitionRef.current) {
      setError('API de reconocimiento de voz no inicializada. Asegúrate de que tu navegador la soporte y de haber dado permisos.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else if (!recognitionRef.current) {
      setError('API de reconocimiento de voz no inicializada. Asegúrate de que tu navegador la soporte y de haber dado permisos.');
    }
  };

  return {
    isListening,
    newFinalSegment,
    error,
    startListening,
    stopListening,
  };
};