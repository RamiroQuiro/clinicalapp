import CardTurnoRecepcion from '@/components/moleculas/CardTurnoRecepcion';
import { ClipboardCopy } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { showToast } from '../../../../utils/toast/toastShow';

const socket = io('localhost:5000'); // Cambia el puerto si usas otro

const SalaEspera = ({ user }) => {
  const [pacientes, setPacientes] = useState([]);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    apellido: '',
    motivoConsulta: '',
    dni: '',
    userId: user?.id,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setNuevoPaciente(state => ({
      ...state,
      [name]: value,
    }));
  };
  useEffect(() => {
    // traer la data de la base de datos de los pacientes en espéra

    const fetchPacientes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/listaEspera/${user?.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json', // Especifica el tipo de contenido
          },
        });
        if (!response.ok) {
          throw new Error('Error al obtener los datos de la atención');
        }
        const data = await response.json();
        console.log(data);
        setPacientes(data);
        setLoading(false);
      } catch (err) {
        showToast(err.message, {
          background: 'bg-primaryu-400',
        });
        setLoading(false);
        console.log(err);
      }
    };
    fetchPacientes();
    // Escucha los cambios en la lista
    socket.on('lista-actualizada', aregarALista => {
      setPacientes(prevPacientes => [...prevPacientes, aregarALista[0]]);
    });
    socket.on('paciente-eliminado', paciente => {
      setPacientes(prevPacientes => prevPacientes.filter(p => p.id !== paciente[0].id));
    });

    return () => {
      socket.off('lista-actualizada');
      socket.off('paciente-eliminado');
    };
  }, []);

  const agregarPaciente = () => {
    if (
      !nuevoPaciente.motivoConsulta ||
      !nuevoPaciente.dni ||
      !nuevoPaciente.nombre ||
      !nuevoPaciente.apellido
    ) {
      showToast('no hay data para guardar', {
        background: 'bg-primary-400',
      });
      return;
    }
    socket.emit('agregar-paciente', nuevoPaciente);
    setNuevoPaciente({ nombre: '', apellido: '', motivoConsulta: '', dni: '', userId: user?.id }); // Limpia el input
  };

  const handleDelete = id => {
    console.log('eliminando paciente oooo', id);
    socket.emit('eliminar-paciente', id);
  };
  const handleAtender = async paciente => {
    socket.emit('atender-paciente', paciente.id);

    if (paciente.pacienteId) {
      let idAtencion = nanoid(13);
      document.location.href = `dashboard/consultas/aperturaPaciente/${paciente.pacienteId}/${idAtencion}`;
    } else {
      try {
        const response = await fetch('/api/pacientes/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paciente),
        });

        const result = await response.json(); // Leer respuesta JSON
        if (result.code == 400) {
          showToast(result.msg, {
            background: 'bg-primary-400',
          });
          return;
        } else if (result.code == 200) {
          let idAtencion = nanoid(13);
          document.location.href = `dashboard/consultas/aperturaPaciente/${result.data.id}/${idAtencion}`;
        } else {
          // Manejo explícito de errores por status
          erroresShow.textContent = result.message || 'Error al crear el paciente.';
        }
      } catch (error) {
        console.error('Error al enviar los datos:', error);
        erroresShow.textContent = 'Error de conexión al servidor.';
      }
    }
  };

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
    <>
      <div className="flex border-b pb-2 justify-between items-center text-primary-textoTitle w-full mb-2">
        <h2 className="text-lg font-semibold ">Lista de Espera</h2>
        <span className="md:text-2xl">{pacientes.length}</span>
        <div className="relative group cursor-pointer" onClick={handleCopy}>
          <ClipboardCopy />
          <div className="absolute hidden group-hover:flex -top-8 left-1/2  animate-aparecer  -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
            Copiar Link
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col items-start justify-normal gap-3">
        {/* formulario */}

        <div className="flex flex-col w-full  items-start 500 justify-between gap-2 bg-primary-bg-componentes p-2 ">
          <div className="flex w-full pri items-start justify-between gap-2 text-sm text-primary-textoTitle">
            <p className="w-2/4 text-left">Datos Paciente</p>
            <p className="w-1/5">N° Turno</p>
            <p className="w-1/5">accion</p>
          </div>

          <ul className="flex w-full items-start justify-normal gap-2 flex-col">
            {loading ? (
              <li className="h-24 rounded-lg w-full border-y items-center shadow-sm justify-center border border-primary-100 bg-white animate-pulse flex">
                <p className="animate-pulse">Esperado datos...</p>
              </li>
            ) : pacientes.length === 0 ? (
              <li className="h-24 rounded-lg w-full border-y items-center shadow-sm justify-center border border-primary-100 bg-white animate-pulse flex">
                <p>No hay pacientes en espera</p>
              </li>
            ) : (
              pacientes?.map((paciente, index) => (
                <CardTurnoRecepcion
                  handleAtender={handleAtender}
                  handleDelete={handleDelete}
                  paciente={paciente}
                  index={index}
                />
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SalaEspera;
