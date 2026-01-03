import Button from '@/components/atomos/Button';
import RichTextEditor from '@/components/moleculas/RichTextEditor';
import { useSpeechRecognition } from '@/hook/useSpeechRecognition';
import { showToast } from '@/utils/toast/toastShow';
import { Mic, MicOff, Save, Sparkles, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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

  const handleAIAutofill = async () => {
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
  };

  const handleGuardarNota = async () => {
    if (!pacienteId || !userId) {
      showToast('Faltan datos para guardar la nota', { background: 'bg-red-500' });
      return;
    }

    // Ensure reason is present if required by backend
    if (!motivoInicial || !motivoInicial.trim()) {
      showToast('Por favor ingrese un Motivo Principal de la consulta.', {
        background: 'bg-yellow-500',
      });
      return;
    }

    const title = `Evolución Consultorio - ${new Date().toLocaleDateString()}`;

    try {
      const response = await fetch('/api/notas/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          descripcion: value,
          pacienteId,
          userId,
          atencionId,
        }),
      });

      if (response.ok) {
        showToast('Nota de evolución guardada correctamente', { background: 'bg-green-500' });
        onChange(''); // Clear the editor content
      } else {
        showToast('Error al guardar la nota', { background: 'bg-red-500' });
      }
    } catch (e) {
      console.error(e);
      showToast('Error de conexión al guardar nota', { background: 'bg-red-500' });
    }
  };

  return (
    <div className="h-full flex flex-col items-stretch">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span className="text-base">Notas Clínicas / Evolución</span>
        </label>
        <div className="flex gap-3 items-center">
          {/* Boton del dicatod por voz */}
          <Button
            onClick={isListening ? stopListening : startListening}
            className={`border shadow-sm transition-all duration-200 ${
              isListening
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title={isListening ? 'Detener Dictado' : 'Iniciar Dictado por Voz'}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                <span className="text-xs font-semibold">Escuchando...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                <span className="text-xs">Dictar</span>
              </>
            )}
          </Button>

          {/* Boton de extraer informacion por IA */}
          <Button
            onClick={handleAIAutofill}
            disabled={isAiProcessing || !value}
            className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
          >
            {isAiProcessing ? (
              <Sparkles className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            {isAiProcessing ? 'Analizando...' : 'Extraer Info (IA)'}
          </Button>

          {/* Boton de guardar la nota */}
          <Button
            onClick={handleGuardarNota}
            variant="primary"
            className="bg-green-600 hover:bg-green-700 text-white border-transparent shadow-sm"
            title="Guardar como Nota Médica"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Nota
          </Button>
        </div>
      </div>

      {/* Input de motivo inicial con autocompletado */}
      <div className="mb-4 px-1 relative z-50">
        <div className="relative">
          <Input
            label="Motivo de la Consulta"
            type="text"
            value={motivoInicial || ''}
            onChange={e => {
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

      {/* contenedor del editortexto enriquecido*/}
      <div style={{ height: 'calc(85vh - 280px)' }}>
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
          style={{ height: 'calc(85vh - 330px)' }}
        />
      </div>
    </div>
  );
}
