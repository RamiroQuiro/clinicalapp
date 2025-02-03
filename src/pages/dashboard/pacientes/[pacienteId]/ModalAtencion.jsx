import { useEffect, useState } from 'react';
import AtencionExistente from '../../../../components/organismo/AtencionExistente';

const ModalAtencion = ({ atencionId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [atencionData, setAtencionData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!atencionId) return;

    const fetchAtencionData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/pacientes/atencion`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json', // Especifica el tipo de contenido
            'X-Atencion-Id': atencionId, // Aquí envías el id como header personalizado
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los datos de la atención');
        }
        const data = await response.json();
        setAtencionData(data.data);
        console.log('atencion consultada', data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAtencionData();
  }, [atencionId]);

  const ocupacion = [];
  const maritalStatus = 'casado';

  if (!atencionId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black  bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-primary-bg-componentes rounded-lg border-l-2 text- border-primary-100/80 shadow-lg h-[95vh] overflow-y-auto p-4 w- w-2/3">
        {isLoading ? (
          <div className="text-center">Cargando...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <AtencionExistente atencionData={atencionData} onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default ModalAtencion;
