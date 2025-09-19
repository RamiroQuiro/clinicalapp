import Button from '@/components/atomos/Button';
import BotonIndigo from '@/components/moleculas/BotonIndigo';
import ModalReact from '@/components/moleculas/ModalReact';
import { showToast } from '@/utils/toast/toastShow';
import { Eye, File, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FormularioDerivacion } from './FormularioDerivacion';
import { FormularioOrdenEstudio } from './FormularioOrdenEstudio';

export const SolicitudesPantalla = ({ data }: { data: any }) => {
  const [solicitudes, setSolicitudes] = useState(data?.atencion?.solicitudes);
  const [modalType, setModalType] = useState<'orden' | 'derivacion' | null>(null);

  const handleCloseModal = () => {
    setModalType(null);
  };

  const [itemParaBorrar, setItemParaBorrar] = useState<{
    id: string;
    type: 'orden' | 'derivacion';
  } | null>(null);

  const handleConfirmDelete = async () => {
    if (!itemParaBorrar) return;

    const { id, type } = itemParaBorrar;
    const url =
      type === 'orden' ? `/api/ordenes-estudio/${id}/cancelar` : `/api/derivaciones/${id}/cancelar`;

    try {
      const response = await fetch(url, { method: 'POST' });
      const result = await response.json();

      if (response.ok) {
        showToast('Solicitud cancelada exitosamente', { background: 'bg-green-500' });
        // Actualizar el estado local
        if (type === 'orden') {
          setSolicitudes(prev => ({
            ...prev,
            estudiosSolicitados: prev.estudiosSolicitados.filter(o => o.id !== id),
          }));
        } else {
          setSolicitudes(prev => ({
            ...prev,
            derivaciones: prev.derivaciones.filter(d => d.id !== id),
          }));
        }
      } else {
        showToast(`Error: ${result.message || 'No se pudo cancelar'}`, {
          background: 'bg-red-500',
        });
      }
    } catch (error: any) {
      showToast(`Error de red: ${error.message}`, { background: 'bg-red-500' });
    }

    setItemParaBorrar(null); // Cerrar modal
  };

  console.log('solicitudes', solicitudes);
  const handleSave = async (type: 'orden' | 'derivacion', formData: any) => {
    const atencionId = data?.atencion?.id;
    const url =
      type === 'orden'
        ? `/api/atencion/${atencionId}/ordenes`
        : `/api/atencion/${atencionId}/derivaciones`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pacienteId: data?.atencion?.pacienteId,
          userMedicoId: data?.atencion?.userIdMedico,
        }),
      });

      const result = await response.json();
      console.log('result', result);
      if (response.ok) {
        showToast(`Solicitud creada con éxito`, { background: 'bg-green-500' });

        // Actualizar el store global con el objeto completo de la API
        const nuevoItem = result.data;
        if (type === 'orden') {
          setSolicitudes(prev => ({
            ...prev,
            estudiosSolicitados: [...prev.estudiosSolicitados, nuevoItem],
          }));
        } else {
          setSolicitudes(prev => ({
            ...prev,
            derivaciones: [...prev.derivaciones, nuevoItem],
          }));
        }
      } else {
        showToast(`Error: ${result.message || 'No se pudo crear la solicitud'}`, {
          background: 'bg-red-500',
        });
      }
    } catch (error: any) {
      showToast(`Error de red: ${error.message}`, { background: 'bg-red-500' });
    }

    handleCloseModal();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Gestión de Solicitudes</h2>
      <div className="flex space-x-4 mb-6">
        <Button variant="primary" onClick={() => setModalType('orden')}>
          + Nueva Orden de Estudio
        </Button>
        <Button variant="primary" onClick={() => setModalType('derivacion')}>
          + Nueva Derivación
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Órdenes de Estudio Creadas</h3>
          <div className="border rounded-lg p-4 min-h-[100px] bg-white space-y-2">
            {solicitudes.estudiosSolicitados?.length > 0 ? (
              solicitudes.estudiosSolicitados.map((estudio: any) => (
                <div className="flex items-center gap-4 p-2 border hover:border-primary-100/50 duration-300 border-gray-200/50 rounded-md bg-primary-bg-componentes">
                  <div className=" rounded-full">
                    <File className="w-6 h-6 stroke-primary-texto" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className="font-bold">{estudio.diagnosticoPresuntivo}</p>

                    <p className="text-sm">{estudio.estudiosSolicitados.join(', ')}</p>
                  </div>
                  <a
                    href={`/api/ordenes-estudio/${estudio.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Imprimir/Descargar PDF"
                  >
                    <BotonIndigo className="p-2 rounded-full">
                      <Eye className="w-6 h-6 stroke-indigo-600" />
                    </BotonIndigo>
                  </a>
                  <button
                    onClick={() => setItemParaBorrar({ id: estudio.id, type: 'orden' })}
                    title="Cancelar Orden"
                    className="p-2 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-6 h-6 stroke-red-600" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                Aún no se han creado órdenes de estudio en esta consulta.
              </p>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Derivaciones Creadas</h3>
          <div className="border rounded-lg p-4 min-h-[100px] bg-white space-y-2">
            {solicitudes.derivaciones?.length > 0 ? (
              solicitudes.derivaciones.map((derivacion: any) => (
                <div
                  key={derivacion.id}
                  className="flex items-center gap-4 p-2 border hover:border-primary-100/50 duration-300 border-gray-200/50 rounded-md bg-primary-bg-componentes"
                >
                  <div className=" rounded-full">
                    <File className="w-6 h-6 stroke-primary-texto" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className="font-bold">Especialidad: {derivacion.especialidadDestino}</p>
                    <p className="text-sm">Motivo: {derivacion.motivoDerivacion}</p>
                  </div>
                  <a
                    href={`/api/derivaciones/${derivacion.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Imprimir/Descargar PDF"
                  >
                    <BotonIndigo className="p-2 rounded-full">
                      <Eye className="w-6 h-6 stroke-indigo-600" />
                    </BotonIndigo>
                  </a>
                  <button
                    onClick={() => setItemParaBorrar({ id: derivacion.id, type: 'derivacion' })}
                    title="Cancelar DerivaciÃ³n"
                    className="p-2 rounded-full hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-6 h-6 stroke-red-600" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                Aún no se han creado derivaciones en esta consulta.
              </p>
            )}
          </div>
        </div>
      </div>

      {modalType && (
        <ModalReact
          title={modalType === 'orden' ? 'Nueva Orden de Estudio' : 'Nueva Derivación'}
          id={`modal-${modalType}`}
          onClose={handleCloseModal}
        >
          <div className="w-[80vw] md:w-[600px]">
            {modalType === 'orden' && (
              <FormularioOrdenEstudio
                onSave={formData => handleSave('orden', formData)}
                onCancel={handleCloseModal}
              />
            )}
            {modalType === 'derivacion' && (
              <FormularioDerivacion
                onSave={formData => handleSave('derivacion', formData)}
                onCancel={handleCloseModal}
              />
            )}
          </div>
        </ModalReact>
      )}

      {/* Modal de confirmaciÃ³n para borrar */}
      {itemParaBorrar && (
        <ModalReact
          title="Confirmar Cancelación"
          id="modal-confirmar-borrado"
          onClose={() => setItemParaBorrar(null)}
        >
          <div className="p-4">
            <p>¿Esta seguro que quiere cancelar esta solicitud?</p>
            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="grisClaro" onClick={() => setItemParaBorrar(null)}>
                Volver
              </Button>
              <Button variant="cancel" onClick={handleConfirmDelete}>
                Si, Cancelar
              </Button>
            </div>
          </div>
        </ModalReact>
      )}
    </div>
  );
};
