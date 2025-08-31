import React, { useState, useEffect } from 'react';
import Input from '../atomos/Input';
import RichTextEditor from '../moleculas/RichTextEditor';
import { useSpeechRecognition } from '../../hook/useSpeechRecognition'; // Nuevo import
import { Mic } from 'lucide-react'; // Nuevo import

interface Props {
  onSave: (data: { title: string; descripcion: string }) => void;
  onCancel: () => void;
  noteContent: {
    title: string;
    descripcion: string;
    id: string;
    fecha: string;
    profesional: string;
    atencionId: string;
  };
}

const FormularioNota: React.FC<Props> = ({ onSave, onCancel, noteContent }) => {
  const [title, setTitle] = useState(noteContent.title || '');
  const [descripcion, setDescripcion] = useState(noteContent.descripcion || '');

  // Llamada al hook de reconocimiento de voz
  const { isListening, newFinalSegment, startListening, stopListening, error } = useSpeechRecognition();

  // Efecto para añadir el texto transcrito a la descripción
  useEffect(() => {
    if (newFinalSegment) {
      setDescripcion(prevDesc => prevDesc + newFinalSegment);
    }
  }, [newFinalSegment]);

  const handleSave = () => {
    onSave({ title, descripcion });
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  return (
    <div className="p-">
      <Input
        label="Título"
        name="title"
        type="text"
        placeholder="Título de la nota"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full p-2 border rounded-md mb-4"
      />
      <div className="mb-2 flex items-center justify-between"> {/* Nuevo wrapper para editor y botón de micrófono */}
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`p-2 rounded-full transition-colors duration-200 ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={isListening ? 'Detener dictado' : 'Iniciar dictado'}
        >
          <Mic size={20} />
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>} {/* Nuevo display de error */}
      <div style={{ height: '250px' }}>
        <RichTextEditor
          theme="snow"
          value={descripcion}
          onChange={setDescripcion}
          modules={quillModules}
          style={{ height: '200px' }}
        />
      </div>
      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary-100 text-white rounded-lg hover:bg-primary-100/90"
        >
          Guardar
        </button>
      </div>
    </div>
  );
};

export default FormularioNota;