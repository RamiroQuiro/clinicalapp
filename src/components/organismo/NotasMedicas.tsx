import React, { useState } from 'react';

import formatDate from '@/utils/formatDate';
import { Calendar, Edit3, Newspaper, Trash } from 'lucide-react';
import Button from '../atomos/Button';
import DivReact from '../atomos/DivReact';
import BotonIndigo from '../moleculas/BotonIndigo';
import ModalReact from '../moleculas/ModalReact'; // Asumo la ruta del modal
import FormularioNota from './FormularioNota';

// Tipos
interface Note {
  id: number | string;
  title: string;
  profesional: string;
  fecha: string;
  descripcion: string; // Cambiado de nota a descripcion
}

interface Props {
  notas: Note[];
  userId?: string;
  pacienteId?: string;
}

const NotasMedicas: React.FC<Props> = ({ notas = [], userId, pacienteId }) => {
  const [notasDB, setNotasDB] = useState(notas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState({
    title: '',
    descripcion: '',
  });

  const handleOpenModal = (nota: Note) => {
    setIsModalOpen(true);
    setNoteContent(nota);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNoteContent({ title: '', descripcion: '' }); // Limpiar el editor al cerrar
  };

  const handleSaveNote = async ({ title, descripcion }: { title: string; descripcion: string }) => {
    console.log('contenido de nota?', noteContent);
    const isEditing = noteContent && noteContent.id;
    const url = isEditing ? '/api/notas/update' : '/api/notas/create';
    const body = isEditing
      ? { id: noteContent.id, title, descripcion }
      : { title, descripcion, pacienteId, userId };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        console.log(`Nota ${isEditing ? 'actualizada' : 'guardada'} con éxito`);
        window.location.reload(); // Simple reload for now
      } else {
        console.error('Error al guardar la nota');
      }
    } catch (error) {
      console.error('Error de red:', error);
    }

    handleCloseModal();
  };

  const handleDeleteNote = async (noteId: string | number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      try {
        const response = await fetch('/api/notas/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: noteId }),
        });

        if (response.ok) {
          console.log('Nota eliminada con éxito');
          setNotasDB(notasDB.filter(nota => nota.id !== noteId)); // Optimistic UI update
        } else {
          console.error('Error al eliminar la nota');
        }
      } catch (error) {
        console.error('Error de red:', error);
      }
    }
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
    <DivReact className=" p-4 rounded-lg shadow-md border">
      <div className="flex border-b pb-2 justify-between items-center text-primary-textoTitle w-full mb-2">
        <h2 className="text-lg font-semibold text-primary-textoTitle">Notas Médicas</h2>
        <Button onClick={() => handleOpenModal({ title: '', descripcion: '' })}>
          Agregar Nota
        </Button>
      </div>

      <div className="space-y-4">
        {notas.length > 0 ? (
          notas.map(nota => (
            <div
              key={nota.id}
              className="p-4 bg-primary-bg-componentes border hover:border-primary-100/50 transition-colors duration-300 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="capitalize font-semibold text-sm text-primary-textoTitle">
                  <span className="font-thin">Profesional:</span>{' '}
                  {nota.profesional || 'Autor desconocido'}
                </p>
                <div className="flex items-center gap-2  text-primary-100 border border-primary-100 font-medium bg-primary-100/10 px-2 py-1 rounded-full">
                  <Calendar size={16} />
                  <p className="text-sm ">Fecha:</p>
                  <p className="text-sm">{formatDate(nota.fecha)}</p>
                </div>
              </div>
              <div className="capitalize font-semibold text-sm text-primary-textoTitle flex items-center justify-start gap-2">
                <Newspaper size={16} className="font-thin text-primary-texto" />
                <p className="font-thin text-sm ">Titulo:</p>
                <p className="text-sm">{nota.title}</p>
              </div>
              {/* <div
                className="text-sm text-gray-800 prose"
                dangerouslySetInnerHTML={{ __html: nota.descripcion }} // Cambiado de nota a descripcion
              /> */}
              <div className="flex justify-end gap-2 mt-2">
                <BotonIndigo onClick={() => handleOpenModal(nota)}>
                  <Edit3 size={16} />
                </BotonIndigo>
                <BotonIndigo onClick={() => handleDeleteNote(nota.id)}>
                  <Trash size={16} />
                </BotonIndigo>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No hay notas registradas.</p>
        )}
      </div>

      {isModalOpen && (
        <ModalReact title="Nueva Nota Médica" id="modal-agregar" onClose={handleCloseModal}>
          <div className="p- w-[80vw]">
            <FormularioNota
              noteContent={noteContent}
              onSave={handleSaveNote}
              onCancel={handleCloseModal}
              pacienteId={pacienteId}
            />
          </div>
        </ModalReact>
      )}
    </DivReact>
  );
};

export default NotasMedicas;
