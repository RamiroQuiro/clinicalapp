import Button from '@/components/atomos/Button';
import ModalReact from '@/components/moleculas/ModalReact';
import { addDerivacion, addOrdenEstudio } from '@/context/consultaAtencion.store';
import { showToast } from '@/utils/toast/toastShow';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { FormularioDerivacion } from './FormularioDerivacion';
import { FormularioOrdenEstudio } from './FormularioOrdenEstudio';

export const SolicitudesPantalla = ({ data }: { data: any }) => {
  const [solicitudes, setSolicitudes] = useState(data?.atencion?.solicitudes);
  const [modalType, setModalType] = useState<'orden' | 'derivacion' | null>(null);

  const handleCloseModal = () => {
    setModalType(null);
  };

  console.log('solicitudes', solicitudes.estudiosSolicitados);
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

      if (response.ok) {
        showToast(`Solicitud creada con éxito`, { background: 'bg-green-500' });

        // Actualizar el store global con el objeto completo de la API
        const nuevoItem = result.data;
        if (type === 'orden') {
          addOrdenEstudio(nuevoItem);
        } else {
          addDerivacion(nuevoItem);
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
          <div className="border rounded-lg p-4 min-h-[100px] bg-gray-50 space-y-2">
            {solicitudes.estudiosSolicitados?.length > 0 ? (
              solicitudes.estudiosSolicitados.map((estudio: any) => (
                <div key={estudio.id} className="flex justify-between items-center p-2 border-b">
                  <div>
                    <p className="font-bold">{estudio.diagnosticoPresuntivo}</p>

                    <p className="text-sm">{estudio.estudiosSolicitados.join(', ')}</p>
                  </div>

                  <a
                    href={`/api/ordenes-estudio/${estudio.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Imprimir/Descargar PDF"
                  >
                    <Button variant="indigo" className="p-2 rounded-full">
                      <Eye className="w-6 h-6 stroke-indigo-600" />
                    </Button>
                  </a>
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
          <div className="border rounded-lg p-4 min-h-[100px] bg-gray-50 space-y-2">
            {solicitudes.derivaciones?.length > 0 ? (
              solicitudes.derivaciones.map((derivacion: any) => (
                <div key={derivacion.id} className="p-2 border-b">
                  <p className="font-bold">Especialidad: {derivacion.especialidadDestino}</p>
                  <p className="text-sm">Motivo: {derivacion.motivoDerivacion}</p>
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
    </div>
  );
};
