import CardSalaEspera from '@/components/moleculas/CardSalaEspera';
import {
  detenerConexionSSE,
  fetchTurnosDelDia,
  iniciarConexionSSE,
  recepcionStore,
} from '@/context/recepcion.store';
import { useStore } from '@nanostores/react';
import { CheckCheck, ClipboardCopy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { showToast } from '../../../../utils/toast/toastShow';

const SalaEspera = ({ user }) => {
  const { turnosDelDia } = useStore(recepcionStore);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    apellido: '',
    motivoConsulta: '',
    dni: '',
    userId: user?.id,
  });
  const handleChange = e => {
    const { name, value } = e.target;
    setNuevoPaciente(state => ({
      ...state,
      [name]: value,
    }));
  };

  useEffect(() => {
    const toYYYYMMDD = date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const fechaFormateada = toYYYYMMDD(new Date());
    fetchTurnosDelDia(fechaFormateada, user.id, user.centroMedicoId);

    iniciarConexionSSE(user.id);
    return () => {
      detenerConexionSSE();
    };
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(`http://localhost:4321/publicSite/salaDeEspera/${user?.id}`)
      .then(() => {
        showToast('Link copiado', {
          background: 'bg-green-600',
        });
      });
  };
  return (
    <div className="w-full">
      <div className="flex border-b w-full pb-2 justify-between items-center text-primary-textoTitle  mb-2">
        <h2 className="text-lg font-semibold ">Lista de Espera</h2>
        <span className="md:text-2xl">
          {turnosDelDia?.filter(t => t?.turnoInfo?.estado === 'sala_de_espera')?.length || 0}
        </span>
        <div className="relative group cursor-pointer" onClick={handleCopy}>
          <ClipboardCopy />
          <div className="absolute hidden group-hover:flex -top-8 left-1/2  animate-aparecer  -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
            Copiar Link
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col items-start justify-normal gap-3">
        {/* formulario */}

        <div className="flex flex-col w-full  items-start 500 justify-between gap-2  p-2 ">
          <ul className="flex w-full items-start justify-normal gap-2 flex-col">
            {turnosDelDia?.filter(t => t?.turnoInfo?.estado === 'sala_de_espera')?.length === 0 ? (
              <div className="w-full">
                <div className="text-center py-5">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-700/50 flex items-center justify-center">
                    <CheckCheck className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400 font-medium mb-1">No hay turnos Recepcionados</p>
                  <p className="text-gray-500 text-sm">Los turnos recepcionados aparecerán aquí</p>
                </div>
              </div>
            ) : (
              turnosDelDia
                ?.filter(t => t?.turnoInfo?.estado === 'sala_de_espera')
                .map((turno, i) => <CardSalaEspera key={i} turno={turno} index={i} />)
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SalaEspera;
