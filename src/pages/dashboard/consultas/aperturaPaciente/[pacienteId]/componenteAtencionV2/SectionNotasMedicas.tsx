import Button from '@/components/atomos/Button';
import DivReact from '@/components/atomos/DivReact';
import BotonIndigo from '@/components/moleculas/BotonIndigo';
import ModalReact from '@/components/moleculas/ModalReact';
import FormularioNota from '@/components/organismo/FormularioNota';
import {
  addNota,
  consultaStore,
  editNota,
  setConsultaField,
} from '@/context/consultaAtencion.store';
import formatDate from '@/utils/formatDate';
import { Calendar, Edit3, Newspaper, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useState } from 'react';

type Props = {
  $consulta: any;
  handleFormChange: any;
  pacienteId: string;
};

export default function SectionNotasMedicas({ $consulta, handleFormChange, pacienteId }: Props) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [error, setError] = useState('');
  const [noteContent, setNoteContent] = useState({
    title: '',
    descripcion: '',
    created_at: '',
    id: '',
    estado: 'activo', // Default to Activo
    atencionId: '',
    userMedicoId: '',
  });

  // Esta función se encargará de CREAR o EDITAR
  const handleSave = (formData: { title: string; descripcion: string }) => {
    // Verificamos si la nota en el estado tiene una ID.
    if (noteContent.id) {
      // Si tiene ID, significa que estamos EDITANDO.
      // Llamamos a editNota, pasándole la nota original con los datos nuevos del formulario.
      editNota({
        ...noteContent, // Mantiene la ID, fecha, etc.
        ...formData,   // Sobrescribe el title y descripcion con lo nuevo.
      });
    } else {
      // Si no tiene ID, estamos CREANDO una nota nueva.
      addNota({
        ...formData,
        id: nanoid(),
        profesional: 'Autor desconocido',
        created_at: new Date().toISOString(),
      });
    }

    // Cerramos el modal después de guardar
    setIsOpenModal(false);
  };

  const handleOpenModal = (nota: any) => {
    setIsOpenModal(true);
    setNoteContent(nota);
  };

  // El único propósito de handleEdit es preparar el modal
  const handleEdit = (nota: any) => {
    setNoteContent(nota); // Carga la nota completa en el estado
    setIsOpenModal(true); // Abre el modal
  };

  const handleDeleteNote = (noteId: string) => {
    const current = consultaStore.get().notas;
    setConsultaField(
      'notas',
      current.filter(note => note.id !== noteId)
    );
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
        {$consulta?.notas?.length > 0 ? (
          $consulta.notas.map(nota => {
            return (
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
                    <p className="text-sm">{formatDate(nota.created_at)}</p>
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
                  <BotonIndigo onClick={() => handleEdit(nota)}>
                    <Edit3 size={16} />
                  </BotonIndigo>
                  <BotonIndigo onClick={() => handleDeleteNote(nota.id)}>
                    <Trash2 size={16} />
                  </BotonIndigo>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No hay notas registradas.</p>
        )}
      </div>

      {isOpenModal && (
        <ModalReact
          title={noteContent.id ? 'Editar Nota Médica' : 'Nueva Nota Médica'}
          id="modal-agregar"
          onClose={() => setIsOpenModal(false)}
        >
          <div className="p- w-[80vw]">
            <FormularioNota
              noteContent={noteContent}
              onSave={handleSave}
              onCancel={() => setIsOpenModal(false)}
              pacienteId={pacienteId}
            />
          </div>
        </ModalReact>
      )}
    </DivReact>
  );
}
