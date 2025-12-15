import Button from '@/components/atomos/Button';
import { InfoCard } from '@/components/moleculas';
import ModalReact from '@/components/moleculas/ModalReact';
import { formatDateToYYYYMMDD } from '@/utils/agendaTimeUtils';
import { downloadLoader } from '@/utils/loader/showDownloadLoader';
import { showToast } from '@/utils/toast/toastShow';
import { Download, File } from 'lucide-react';
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

  const handleDescargarDerivacion = async (derivacion: any) => {
    downloadLoader(true);
    try {
      const url = `/api/derivaciones/${derivacion.id}/pdf`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error al descargar la derivación: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `derivacion_${derivacion.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      showToast('Derivación descargada exitosamente', { background: 'bg-green-500' });
      downloadLoader(false);
    } catch (error: any) {
      showToast(`Error: ${error.message}`, { background: 'bg-red-500' });
      downloadLoader(false);
    }
  };

  const handleDescargarEstudio = async (estudio: any) => {
    downloadLoader(true);
    try {
      const url = `/api/ordenes-estudio/${estudio.id}/pdf`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error al descargar la orden de estudio: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `estudio_${estudio.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      showToast('Orden de estudio descargada exitosamente', { background: 'bg-green-500' });
      downloadLoader(false);
    } catch (error: any) {
      showToast(`Error: ${error.message}`, { background: 'bg-red-500' });
      downloadLoader(false);
    }
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
              solicitudes.estudiosSolicitados.map((estudio: any) => {
                console.log(estudio);
                return (
                  <InfoCard
                    key={estudio.id}
                    subtitle={estudio.diagnosticoPresuntivo}
                    title={estudio.estudiosSolicitados?.join(', ')}
                    onDelete={() => setItemParaBorrar({ id: estudio.id, type: 'orden' })}
                    onEdit={() => handleDescargarEstudio(estudio)}
                    iconOnEdit={<Download className="w-5 h-5" />}
                  />
                );
              })
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
              solicitudes.derivaciones.map((derivacion: any) => {
                const formateoFecha = formatDateToYYYYMMDD(new Date(derivacion.fecha));
                return (
                  <InfoCard
                    key={derivacion.id}
                    subtitle={`Dr./Dra. ${derivacion.nombreProfesionalExterno}`}
                    title={`Especialidad: ${derivacion.especialidadDestino}`}
                    bodyText={`Motivo: ${derivacion.motivoDerivacion}`}
                    date={formateoFecha}
                    icon={<File />}
                    onEdit={() => handleDescargarDerivacion(derivacion)}
                    iconOnEdit={<Download className="w-5 h-5" />}
                    onDelete={() => setItemParaBorrar({ id: derivacion.id, type: 'derivacion' })}
                  />
                );
              })
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
