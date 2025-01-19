import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { showToast } from '../../../../../utils/toast/toastShow';
import FormularioCargaListaEspera from '@/pages/dashboard/dashboard/componente/FormularioCargaListaEspera';

const socket = io('localhost:5000');

const SalaEspera = ({ userId }) => {
  const [pacientes, setPacientes] = useState([]);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre: '',
    apellido: '',
    motivoConsulta: '',
    dni: '',
    userId: userId
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoPaciente(state => ({
      ...state,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/listaEspera/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error("Error al obtener la lista de espera");
        }
        
        const data = await response.json();
        setPacientes(data);
      } catch (error) {
        showToast(error.message, {
          background: 'bg-error-400'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();

    socket.on('lista-actualizada', (nuevoPaciente) => {
      setPacientes(prev => [...prev, nuevoPaciente[0]]);
      showToast('Paciente agregado exitosamente', {
        background: 'bg-primary-100'
      });
    });
    socket.on('paciente-eliminado', (paciente) => {
      setPacientes((prevPacientes) => prevPacientes.filter((p) => p.id !== paciente[0].id));
    });
    return () => {
      socket.off('lista-actualizada');
      socket.off('paciente-eliminado');
    };
  }, [userId]);

  const agregarPaciente = () => {
    if (!nuevoPaciente.motivoConsulta || !nuevoPaciente.dni || !nuevoPaciente.nombre || !nuevoPaciente.apellido) {
      showToast('Por favor complete todos los campos', {
        background: 'bg-primary-400'
      });
      return;
    }

    socket.emit('agregar-paciente', nuevoPaciente);
    setNuevoPaciente({
      nombre: '',
      apellido: '',
      motivoConsulta: '',
      dni: '',
      userId: userId
    });
  };

  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.dni.includes(searchTerm)
  );

  return (
    <div className="min-h-screen w-full bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-primary-textoTitle mb-4">Lista de Espera del Dr Name</h1>
          <div className="flex flex-col md:flex-row items-start gap-4">
            {/* Formulario de registro */}
            <div className="w-full md:w-1/2 bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-primary-textoTitle mb-4">Registrar Paciente</h2>
             <FormularioCargaListaEspera nuevoPaciente={nuevoPaciente} handleChange={handleChange} agregarPaciente={agregarPaciente} />
            </div>

            {/* Lista de pacientes en espera */}
            <div className="w-full md:w-1/2">
             
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-primary-textoTitle">Pacientes en Espera</h3>
                </div>
                
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-pulse">Cargando...</div>
                  </div>
                ) : filteredPacientes.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No hay pacientes en espera
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredPacientes.map((paciente, index) => (
                      <div key={paciente.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-primary-textoTitle">
                              {paciente.nombre} {paciente.apellido}
                            </h4>
                            <p className="text-sm text-gray-600">DNI: {paciente.dni}</p>
                            <p className="text-sm text-gray-600">
                              Motivo: {paciente.motivoConsulta}
                            </p>
                          </div>
                          <div className="text-center">
                            <span className="inline-block px-3 py-1 bg-primary-100 text-white rounded-full text-sm">
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaEspera;
