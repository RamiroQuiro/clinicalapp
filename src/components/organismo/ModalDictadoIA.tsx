import { useSpeechRecognition } from '@/hook/useSpeechRecognition';
import { Mic, StopCircle, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../atomos/Button';
import { TextArea } from '../atomos/TextArea';
import ModalReact from '../moleculas/ModalReact';

interface ModalDictadoIAProps {
  isOpen: boolean;
  onClose: () => void;
  onProcesado: (resultado: any) => void;
}

const ModalDictadoIA = ({ isOpen, onClose, onProcesado }: ModalDictadoIAProps) => {
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error: speechError,
    setTranscript,
    clearTranscript, // NEW: Use dedicated clear function
  } = useSpeechRecognition();
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiProcessingError, setAiProcessingError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'groq'>('groq'); // Estado para el proveedor de IA

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      clearTranscript(); // FIXED: Use clearTranscript instead of setTranscript('')
      setAiProcessingError(null);
      setIsProcessingAI(false);
      if (isListening) {
        stopListening();
      }
    }
  }, [isOpen, isListening, stopListening, clearTranscript]);

  const processDictation = async () => {
    if (!transcript.trim()) return;

    setIsProcessingAI(true);
    setAiProcessingError(null);

    try {
      const response = await fetch('/api/atencion/process-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcript, provider: aiProvider }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar con IA');
      }

      const result = await response.json();

      // Pass the result to the parent component
      onProcesado(result);

      // Close the modal on success
      onClose();
    } catch (err: any) {
      console.error('Error processing dictation with AI:', err);
      setAiProcessingError(err.message);
    } finally {
      setIsProcessingAI(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalReact isOpen={isOpen} onClose={onClose} title="Dictado de Notas con IA">
      <div className="flex flex-col gap-4">
        <p className="text-gray-600">
          Dicta tus notas clínicas. La IA las analizará y rellenará automáticamente los campos
          correspondientes de la consulta.
        </p>
        <TextArea
          name="dictationInput"
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          placeholder="Dicta aquí o pega el texto para que la IA lo procese..."
          rows={8}
          className="w-full p-2 border rounded-md"
        />

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Proveedor de IA:</span>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="groq-provider"
              name="ai-provider"
              value="groq"
              checked={aiProvider === 'groq'}
              onChange={() => setAiProvider('groq')}
              className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="groq-provider" className="text-sm text-gray-900">
              Groq (Rápido)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="gemini-provider"
              name="ai-provider"
              value="gemini"
              checked={aiProvider === 'gemini'}
              onChange={() => setAiProvider('gemini')}
              className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="gemini-provider" className="text-sm text-gray-900">
              Gemini
            </label>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={startListening}
            disabled={isListening}
            className="flex-grow sm:flex-grow-0"
          >
            <Mic className="w-5 h-5" />
            {isListening ? 'Escuchando...' : 'Iniciar'}
          </Button>
          <Button
            onClick={stopListening}
            disabled={!isListening}
            variant="secondary"
            className="flex-grow sm:flex-grow-0"
          >
            <StopCircle className="w-5 h-5" />
            Detener
          </Button>
          <Button
            variant="cancel"
            onClick={clearTranscript} // FIXED: Use clearTranscript instead of setTranscript('')
            disabled={!isListening}
            className="flex-grow sm:flex-grow-0"
          >
            <Trash className="w-5 h-5 " />
            Borrar
          </Button>
          <Button
            onClick={processDictation}
            disabled={!transcript || isProcessingAI}
            className="flex-grow sm:flex-grow-0 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isProcessingAI ? 'Procesando...' : 'Procesar'}
          </Button>
        </div>
        {speechError && (
          <p className="text-red-500 text-sm mt-1">Error de dictado: {speechError}</p>
        )}
        {aiProcessingError && (
          <p className="text-red-500 text-sm mt-1">Error de IA: {aiProcessingError}</p>
        )}
      </div>
    </ModalReact>
  );
};

export default ModalDictadoIA;
