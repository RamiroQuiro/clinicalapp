import { showToast } from '@/utils/toast/toastShow';
import { Edit2, Trash2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import Button from '../atomos/Button';
import ModalReact from '../moleculas/ModalReact';
import FormularioAlergias, { type Alergia } from './FormularioAlergias';

interface AlergiasPacientePerfilProps {
  alergias?: Alergia[];
  pacienteId: string;
}

export default function AlergiasPacientePerfil({
  alergias = [],
  pacienteId,
}: AlergiasPacientePerfilProps) {
  const [listaAlergias, setListaAlergias] = useState<Alergia[]>(alergias || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const saveAlergiasToServer = async (nuevasAlergias: Alergia[]) => {
    try {
      const response = await fetch(`/api/pacientes/historiaClinica/${pacienteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alergias: nuevasAlergias }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar');
      }

      showToast('Alergias actualizadas correctamente', { background: 'bg-green-500' });
      setListaAlergias(nuevasAlergias);
      setIsModalOpen(false);
      setEditingIndex(null);
    } catch (error) {
      console.error(error);
      showToast('Error al guardar los cambios', { background: 'bg-red-500' });
    }
  };

  const handleSubmit = (data: Alergia) => {
    const nuevaLista = [...listaAlergias];

    if (editingIndex !== null) {
      // Editar existente
      nuevaLista[editingIndex] = data;
    } else {
      // Agregar nueva
      nuevaLista.push(data);
    }

    saveAlergiasToServer(nuevaLista);
  };

  const handleDelete = (index: number) => {
    if (confirm('¿Está seguro de eliminar este registro de alergia?')) {
      const nuevaLista = listaAlergias.filter((_, i) => i !== index);
      saveAlergiasToServer(nuevaLista);
    }
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex border-b pb-2 justify-between items-center text-primary-texto w-full mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-primary-textoTitle">Alergias y Reacciones</h3>
          {listaAlergias.length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold border border-red-200">
              {listaAlergias.length}
            </span>
          )}
        </div>
        <Button onClick={handleOpenAdd}>agregar</Button>
      </div>

      <div className="space-y-2">
        {listaAlergias.map((alergia, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-2 border hover:border-primary-100/50 duration-300 border-gray-200/50 rounded-md bg-white"
          >
            {/* Icono status */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                alergia.severidad === 'grave'
                  ? 'bg-red-100 text-red-600'
                  : alergia.severidad === 'moderada'
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-blue-100 text-blue-600'
              }`}
            >
              <TriangleAlert size={16} />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm uppercase text-gray-700 truncate">
                  {alergia.sustancia}
                </h3>
                {!alergia.activa && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 uppercase font-medium">
                    Inactiva
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                <span className="font-medium text-gray-700">{alergia.severidad}</span> -{' '}
                {alergia.reaccion}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleOpenEdit(index)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(index)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <ModalReact
          title={editingIndex !== null ? 'Editar Alergia' : 'Registrar Nueva Alergia'}
          id="modal-alergias"
          onClose={() => setIsModalOpen(false)}
          className="w-full max-w-lg"
        >
          <FormularioAlergias
            initialData={editingIndex !== null ? listaAlergias[editingIndex] : null}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
          />
        </ModalReact>
      )}
    </div>
  );
}
