import ConfeccionTablaPaciente from '@/pages/dashboard/pacientes/ConfeccionTablaPaciente';
import React, { useEffect, useState } from 'react';

const PacientesRecepcionista: React.FC = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [pacienteAEditar, setPacienteAEditar] = useState<any>(null);

    const fetchPacientes = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/pacientes/list');
            if (response.ok) {
                const data = await response.json();
                setPacientes(data.data || []);
            } else {
                console.error('Error al cargar pacientes');
            }
        } catch (error) {
            console.error('Error de red:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPacientes();
    }, []);

    const handleEditarPaciente = (id: string) => {
        const paciente = pacientes.find((p: any) => p.id === id);
        if (paciente) {
            setPacienteAEditar(paciente);
            setModalOpen(true);
        }
    };

    const handlePacienteGuardado = () => {
        setModalOpen(false);
        fetchPacientes(); // Recargar la lista
    };

    const handleAtenderPaciente = (id: string) => {
        window.location.href = `/api/atencion/nueva?pacienteId=${id}`;
    };

    return (
        <div className="p-4 text-primary-texto w-full h-full flex flex-col gap-4">

            <div className="flex-1 overflow-auto bg-white rounded-lg shadow p-4">

                <ConfeccionTablaPaciente
                    pacientesData={pacientes}
                    onEdit={handleEditarPaciente}
                    onAtender={handleAtenderPaciente}
                    onDelete={undefined}
                />
            </div>


        </div >
    );
};

export default PacientesRecepcionista;
