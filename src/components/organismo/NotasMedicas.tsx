import React, { useEffect, useState } from 'react';

import formatDate from '@/utils/formatDate';
import { showToast } from '@/utils/toast/toastShow';
import { Calendar, Edit3, Newspaper, Trash } from 'lucide-react';
import Button from '../atomos/Button';
import DivReact from '../atomos/DivReact';
import BotonIndigo from '../moleculas/BotonIndigo';
import ModalReact from '../moleculas/ModalReact';
import FormularioNota from './FormularioNota';

// Tipos
interface Note {
  id: number | string;
  atencionId: string;
  title: string;
  profesional: string;
  fecha: string;
  descripcion: string;
}

interface Props {
  userId?: string;
  pacienteId: string;
  colorMap: Record<string, string>;
}

const NotasMedicas: React.FC<Props> = ({ userId, pacienteId, colorMap }) => {
  const [notas, setNotas] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState<Partial<Note>>({
    title: '',
    descripcion: '',
  });

  const fetchNotas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pacientes/notasMedicas/${pacienteId}`);
      if (!response.ok) {
        throw new Error('Error al cargar las notas.');
      }
      const data = await response.json();
      setNotas(data.data);
    } catch (err: any) {
      console.error('Error al cargar las notas:', err);
      setError(err.message);
      showToast(`Error: ${err.message}`, { background: 'bg-red-500' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pacienteId) {
      fetchNotas();
    }
  }, [pacienteId]);

  const handleOpenModal = (nota?: Note) => {
    setIsModalOpen(true);
    setNoteContent(nota || { title: '', descripcion: '' });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNoteContent({ title: '', descripcion: '' });
  };

  const handleSaveNote = async ({ title, descripcion }: { title: string; descripcion: string }) => {
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
        showToast(`Nota ${isEditing ? 'actualizada' : 'guardada'} con éxito`, {
          background: 'bg-green-500',
        });
        fetchNotas(); // Re-fetch notes to update the list
      } else {
        const errorData = await response.json();
        showToast(`Error al guardar la nota: ${errorData.message || 'Inténtalo de nuevo.'}`, {
          background: 'bg-red-500',
        });
      }
    } catch (error: any) {
      showToast(`Error de red: ${error.message || 'Inténtalo de nuevo.'}`, {
        background: 'bg-red-500',
      });
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
          showToast('Nota eliminada con éxito', { background: 'bg-green-500' });
          fetchNotas(); // Re-fetch notes to update the list
        } else {
          const errorData = await response.json();
          showToast(`Error al eliminar la nota: ${errorData.message || 'Inténtalo de nuevo.'}`, {
            background: 'bg-red-500',
          });
        }
      } catch (error: any) {
        showToast(`Error de red: ${error.message || 'Inténtalo de nuevo.'}`, {
          background: 'bg-red-500',
        });
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando notas...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <DivReact className=" p-4 rounded-lg shadow-md border">
      <div className="flex border-b pb-2 justify-between items-center text-primary-textoTitle w-full mb-2">
        <h2 className="text-lg font-semibold text-primary-textoTitle">Notas Médicas</h2>
        <Button onClick={() => handleOpenModal()}>Agregar Nota</Button>
      </div>

      <div className="space-y-4">
        {notas?.length > 0 ? (
          notas?.map(nota => (
            <div
              style={{ backgroundColor: colorMap[nota.atencionId] }}
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
