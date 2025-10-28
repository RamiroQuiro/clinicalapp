import { RenderBotonesUsuarios } from '@/components/tablaComponentes/RenderBotonesActions';
import Table from '@/components/tablaComponentes/Table';
import { filtroBusqueda } from '@/context/store';
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';

export default function ConfeccionTablaPaciente({ usersData }) {
    const [usersFiltrados, setUsersFiltrados] = useState(usersData); // Estado inicial igual a los datos completos
    const $filtro = useStore(filtroBusqueda).filtro;

    useEffect(() => {
        // Filtrar pacientes en función del filtr
        const filtrados = usersData.filter(user => {
            if ($filtro === 'todos') return true; // Mostrar todos si el filtro es 'todos'
            return (
                user.nombreApellido.toLowerCase().includes($filtro) ||
                user.email.toString().includes($filtro) ||
                (user?.especialidad?.toLowerCase() || '').includes($filtro) ||
                (user?.mp?.toString() || '').includes($filtro)
            );
        });

        setUsersFiltrados(filtrados);
    }, [$filtro, usersData]); // Ejecutar cada vez que cambie $filtro o usersData

    const columnas = [
        { label: 'Nombre y Apellido', id: 1, selector: row => row.nombreApellido },
        { label: 'Email', id: 2, selector: row => row.email },
        { label: 'Especialidad', id: 4, selector: row => row.especialidad },
        { label: 'MP', id: 5, selector: row => row.mp },
        { label: 'Rol', id: 6, selector: row => row.rol },
        { label: 'Celular', id: 7, selector: row => row.celular },
        {
            label: 'Acciones',
            id: 8,
            selector: row => (
                <div className="flex gap-x-2">
                    <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => handleEdit(row.id)}
                    >
                        Editar
                    </button>
                    <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleDelete(row.id)}
                    >
                        Eliminar
                    </button>
                    <button
                        className="bg-green-500 text-white px-2 py-1 rounded"
                        onClick={() => handleAtender(row.id)}
                    >
                        Atender
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="w-full">
            {/* Tabla de pacientes */}
            <Table
                columnas={columnas}
                arrayBody={usersFiltrados}
                styleTable="w-full min-w-0 overflow-x-auto"
                renderBotonActions={RenderBotonesUsuarios}
            />
        </div>
    );
}
