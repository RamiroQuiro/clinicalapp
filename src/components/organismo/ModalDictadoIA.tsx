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
  const [dictationText, setDictationText] = useState('');
  const {
    isListening,
    newFinalSegment,
    startListening,
    stopListening,
    error: speechError,
  } = useSpeechRecognition();
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiProcessingError, setAiProcessingError] = useState<string | null>(null);

  useEffect(() => {
    if (newFinalSegment) {
      setDictationText(prev => prev + newFinalSegment + ' ');
    }
  }, [newFinalSegment]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setDictationText('');
      setAiProcessingError(null);
      setIsProcessingAI(false);
      if (isListening) {
        stopListening();
      }
    }
  }, [isOpen]);

  const processDictation = async () => {
    if (!dictationText.trim()) return;

    setIsProcessingAI(true);
    setAiProcessingError(null);

    try {
      const response = await fetch('/api/atencion/process-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: dictationText }),
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
          value={dictationText}
          onChange={e => setDictationText(e.target.value)}
          placeholder="Dicta aquí o pega el texto para que la IA lo procese..."
          rows={8}
          className="w-full p-2 border rounded-md"
        />
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
            onClick={() => setDictationText('')}
            disabled={!isListening}
            className="flex-grow sm:flex-grow-0"
          >
            <Trash className="w-5 h-5 " />
            Borrar
          </Button>
          <Button
            onClick={processDictation}
            disabled={!dictationText || isProcessingAI}
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
