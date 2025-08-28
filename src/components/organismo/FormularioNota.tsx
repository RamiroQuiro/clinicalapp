import React, { useState } from 'react';
import Input from '../atomos/Input';
import RichTextEditor from '../moleculas/RichTextEditor';

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
