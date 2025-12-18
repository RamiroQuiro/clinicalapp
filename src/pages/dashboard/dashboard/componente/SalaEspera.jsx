import CardSalaEspera from '@/components/moleculas/CardSalaEspera';
import {
  detenerConexionSSE,
  fetchTurnosDelDia,
  iniciarConexionSSE,
  recepcionStore,
} from '@/context/recepcion.store';
import { useStore } from '@nanostores/react';
import { CheckCheck, ClipboardCopy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
  const agendaDelDia=turnosDelDia?.[0]?.agenda||null
 const colaDeEspera = useMemo(() => {
    // Si no hay turno, devolvemos un array vacío
    if (!agendaDelDia) return [];

    // Incluir tanto 'sala_de_espera' como 'demorado' (siendo llamados)
    return agendaDelDia.filter((turno)=> 
        turno.turnoInfo?.estado === 'sala_de_espera' || 
        turno.turnoInfo?.estado === 'demorado'
    )
  }, [agendaDelDia]);
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
      .writeText(`http://localhost:4322/publicSite/salaDeEspera/${user?.id}`)
      .then(() => {
        showToast('Link copiado', {
          background: 'bg-green-600',
        });
      });
  };

  const handleLlamarPaciente = async (turno) => {
    try {
      console.log(`Llamando a paciente ${turno.turnoInfo?.pacienteNombre} con ID ${turno.turnoInfo?.id}`);
      
      // Generar consultorio dinámico basado en el médico
      const medicoNombre = user?.nombre || 'Dr.';
      const medicoApellido = user?.apellido || '';  
      const consultorio = `Consultorio ${medicoNombre} ${medicoApellido}`.trim();
      
      const response = await fetch('/api/llamar-paciente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          turnoId: turno.turnoInfo?.id,
          consultorio: consultorio
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al llamar paciente');
      }

      console.log('Paciente llamado exitosamente:', data);
      showToast(`${data.nombrePaciente} llamado al ${data.consultorio}`, {
        background: 'bg-green-600',
      });
      
    } catch (error) {
      console.error('Error al llamar paciente:', error);
      showToast(error.message || 'No se pudo llamar al paciente', {
        background: 'bg-red-600',
      });
    }
  };

  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 pb-2 border-b w-full text-primary-textoTitle">
        <h2 className="font-semibold text-lg">Lista de Espera</h2>
        <span className="md:text-2xl">
          {turnosDelDia?.filter(t => t?.turnoInfo?.estado === 'sala_de_espera' || t?.turnoInfo?.estado === 'demorado')?.length || 0}
        </span>
        <div className="group relative cursor-pointer" onClick={handleCopy}>
          <ClipboardCopy />
          <div className="hidden -top-8 left-1/2 absolute group-hover:flex bg-gray-800 px-2 py-1 rounded text-white text-xs whitespace-nowrap -translate-x-1/2 animate-aparecer">
            Copiar Link
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-normal items-start gap-3 w-full">
        {/* formulario */}

        <div className="flex flex-col justify-between items-start gap-2 p-2 w-full 500">
          <ul className="flex flex-col justify-normal items-start gap-2 w-full">
            {colaDeEspera?.filter(t => t?.turnoInfo?.estado === 'sala_de_espera' || t?.turnoInfo?.estado === 'demorado')?.length === 0 ? (
              <div className="w-full">
                <div className="py-5 text-center">
                  <div className="flex justify-center items-center bg-gray-700/50 mx-auto mb-3 rounded-full w-12 h-12">
                    <CheckCheck className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="mb-1 font-medium text-gray-400">No hay turnos Recepcionados</p>
                  <p className="text-gray-500 text-sm">Los turnos recepcionados aparecerán aquí</p>
                </div>
              </div>
            ) : (
              colaDeEspera
                ?.filter(t => t?.turnoInfo?.estado === 'sala_de_espera' || t?.turnoInfo?.estado === 'demorado')
                .map((turno, i) => <CardSalaEspera key={i} turno={turno} index={i} onLlamarPaciente={handleLlamarPaciente} />)
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SalaEspera;
