import RichTextEditor from '@/components/moleculas/RichTextEditor';
import { useSpeechRecognition } from '@/hook/useSpeechRecognition';
import { showToast } from '@/utils/toast/toastShow';
import React, { useCallback, useEffect, useState } from 'react';
import Input from '../atomos/Input';

interface EvolucionClinicaProps {
  value: string;
  onChange: (value: string) => void;
  onProcesadoIA: (result: any) => void;
  motivoInicial?: string;
  onMotivoChange?: (value: string) => void;
  initialMotivos?: string[];
  pacienteId?: string;
  userId?: string;
  atencionId?: string;
  // Callbacks para exponer funciones al componente padre
  onExposeFunctions?: (functions: {
    isListening: boolean;
    startListening: () => void;
    stopListening: () => void;
    isAiProcessing: boolean;
    handleAIAutofill: () => void;
  }) => void;
  hideToolbar?: boolean;
}

export default function FormNotaEvolucionClinica({
  value,
  onChange,
  onProcesadoIA,
  motivoInicial,
  onMotivoChange,
  initialMotivos = [],
  pacienteId,
  userId,
  atencionId,
  onExposeFunctions,
  hideToolbar = false,
}: EvolucionClinicaProps) {
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [motivosDB, setMotivosDB] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load Motivos for autocomplete from API
  useEffect(() => {
    fetch('/api/motivos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMotivosDB(data);
        }
      })
      .catch(err => console.error('Error loading motives:', err));
  }, []);

  const filteredMotivos = motivosDB.filter(m =>
    m.nombre.toLowerCase().includes((motivoInicial || '').toLowerCase())
  );

  const handleSelectMotivo = (nombre: string) => {
    if (onMotivoChange) onMotivoChange(nombre);
    setShowDropdown(false);
  };

  // Use callback-based dictation to safely append text
  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onFinalSegment: text => {
      const spacer = value && value.length > 0 ? ' ' : '';
      onChange((value || '') + spacer + text);
    },
  });

  const handleAIAutofill = useCallback(async () => {
    const textToProcess = value?.replace(/<[^>]*>?/gm, '') || '';
    if (!textToProcess.trim()) return;

    setIsAiProcessing(true);
    try {
      const response = await fetch('/api/atencion/process-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToProcess, provider: 'gemini' }),
      });

      if (!response.ok) throw new Error('Error al procesar con IA');
      const result = await response.json();

      onProcesadoIA(result);
      showToast('Datos extraídos con IA correctamente', { background: 'bg-green-500' });
    } catch (err) {
      console.error(err);
      showToast('Error al procesar con IA', { background: 'bg-red-500' });
    } finally {
      setIsAiProcessing(false);
    }
  }, [value, onProcesadoIA]);


  // Exponer funciones al componente padre
  useEffect(() => {
    if (onExposeFunctions) {
      onExposeFunctions({
        isListening,
        startListening,
        stopListening,
        isAiProcessing,
        handleAIAutofill,
      });
    }
  }, [isListening, isAiProcessing, handleAIAutofill, onExposeFunctions, startListening, stopListening]);

  return (
    <div className="h-full flex flex-col items-stretch">

      {/* Input de motivo inicial con autocompletado */}
      <div className="mb-4 px-1 relative z-">
        <div className="relative">
          <Input
            label="Motivo de la Consulta"
            type="text"
            value={motivoInicial || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (onMotivoChange) onMotivoChange(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Ej: Dolor de cabeza, Control rutinario..."
            autoComplete="off"
          />
          {/* Dropdown Results */}
          {showDropdown && (motivoInicial || '').length > 0 && filteredMotivos.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-xl mt-1 max-h-40 overflow-y-auto">
              {filteredMotivos.map((m, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelectMotivo(m.nombre)}
                  className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-0"
                >
                  {m.nombre}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ height: 'calc(100vh - 280px)' }}>
        <h2 className="font-semibold text-base text-primary-textoTitle">Evolución Clínica</h2>
        <RichTextEditor
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder="Escriba libremente la evolución del paciente o use el dictado por voz..."
          modules={{
            toolbar: [
              [{ header: [1, 2, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'clean'],
            ],
          }}
          style={{ height: 'calc(100%)' }}
        />
      </div>
    </div>
  );
}
