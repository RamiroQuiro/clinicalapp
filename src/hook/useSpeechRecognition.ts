import { useEffect, useRef, useState } from 'react';

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
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // NEW: Ref to accumulate finalized text across sessions
  const accumulatedTranscriptRef = useRef('');

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
      let currentSessionFinal = '';
      let interimTranscript = '';

      // FIXED: Use event.resultIndex to only process new results
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentSessionFinal += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // FIXED: Accumulate final results across sessions
      if (currentSessionFinal) {
        accumulatedTranscriptRef.current += currentSessionFinal;
      }

      // Display: accumulated + interim
      setTranscript(accumulatedTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event) => {
      setError(`Error en el reconocimiento: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
      // FIXED: Keep accumulated text visible after recognition ends
      setTranscript(accumulatedTranscriptRef.current);
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
      // FIXED: DON'T clear transcript here - preserve accumulated text
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

  // NEW: Function to manually clear all accumulated text
  const clearTranscript = () => {
    accumulatedTranscriptRef.current = '';
    setTranscript('');
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    setTranscript, // Keep for backward compatibility
    clearTranscript, // NEW: Expose clear function
  };
};