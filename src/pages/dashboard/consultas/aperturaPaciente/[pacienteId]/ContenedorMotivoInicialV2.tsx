import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import ModalReact from '@/components/moleculas/ModalReact';
import { setConsultaField } from '@/context/consultaAtencion.store';
import useBusquedaFiltros from '@/hook/useBusquedaFiltro';
import { PlusCircle } from 'lucide-react';
import React, { useState } from 'react';

// Mock de datos inicial, esto debería venir de una API
const mockMotivosIniciales = [
  { id: 1, nombre: 'Dolor de pecho' },
  { id: 2, nombre: 'Control anual' },
  { id: 3, nombre: 'Chequeo prequirúrgico' },
  { id: 4, nombre: 'Mareos y vértigo' },
  { id: 5, nombre: 'Palpitaciones' },
];

const ContenedorMotivoInicialV2 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [motivos, setMotivos] = useState(mockMotivosIniciales);
  const [nuevoMotivoNombre, setNuevoMotivoNombre] = useState('');

  // Usamos el hook de búsqueda
  const { search, handleSearch, encontrado, noResultados, setSearch } = useBusquedaFiltros(
    motivos,
    ['nombre']
  );

  // Función para seleccionar un motivo de la lista
  const handleSelectMotivo = (motivo: any) => {
    setConsultaField('motivoInicial', motivo.nombre);
    setSearch(''); // Limpiamos la búsqueda
  };

  // Función para manejar la creación de un nuevo motivo
  const handleCreateMotivo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMotivoNombre.trim()) return; // Evitar motivos vacíos

    console.log('Enviando nuevo motivo a la API:', nuevoMotivoNombre);

    // --- AQUÍ IRÍA LA LLAMADA A LA API POST ---
    // Por ahora, simulamos una respuesta exitosa
    const nuevoMotivo = {
      id: Date.now(), // Usamos timestamp como ID temporal
      nombre: nuevoMotivoNombre,
    };
    // --- FIN SIMULACIÓN ---

    // Actualizamos el estado local
    setMotivos([...motivos, nuevoMotivo]);
    setConsultaField('motivoInicial', nuevoMotivo.nombre);

    // Limpiamos y cerramos el modal
    setNuevoMotivoNombre('');
    setIsModalOpen(false);
    setSearch('');
  };

  return (
    <div className="w-full flex flex-col gap-2 relative">
      <div className="flex items-end gap-2">
        <Input
          label="Buscar Motivo Inicial"
          type="text"
          name="motivoInicialSearch"
          value={search}
          onChange={handleSearch}
          placeholder="Buscar o crear motivo..."
          className="flex-grow"
        />
        {noResultados && (
          <Button
            variant="secondary"
            onClick={() => {
              setNuevoMotivoNombre(search); // Pre-populamos el input del modal
              setIsModalOpen(true);
            }}
            className="animate-aparecer"
          >
            <PlusCircle size={20} className="mr-2" />
            Agregar Motivo
          </Button>
        )}
      </div>

      {/* Lista de resultados de la búsqueda */}
      {search.length > 0 && !noResultados && (
        <ul className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
          {encontrado.map(motivo => (
            <li
              key={motivo.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectMotivo(motivo)}
            >
              {motivo.nombre}
            </li>
          ))}
        </ul>
      )}

      {/* Modal para agregar nuevo motivo */}
      {isModalOpen && (
        <ModalReact onClose={() => setIsModalOpen(false)} title="Agregar Nuevo Motivo">
          <form onSubmit={handleCreateMotivo} className="flex flex-col gap-4">
            <Input
              label="Nombre del Motivo"
              type="text"
              name="nuevoMotivo"
              value={nuevoMotivoNombre}
              onChange={e => setNuevoMotivoNombre(e.target.value)}
              placeholder="Ej: Consulta de seguimiento"
            />
            <Button type="submit">Guardar Motivo</Button>
          </form>
        </ModalReact>
      )}
    </div>
  );
};

export default ContenedorMotivoInicialV2;
