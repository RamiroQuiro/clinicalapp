import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import ModalReact from '@/components/moleculas/ModalReact';
import { setConsultaField } from '@/context/consultaAtencion.store';
import useBusquedaFiltros from '@/hook/useBusquedaFiltro';
import { PlusCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ContenedorMotivoInicialV2Props {
  initialMotivos?: any[];
}

const ContenedorMotivoInicialV2 = ({ initialMotivos = [] }: ContenedorMotivoInicialV2Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [motivos, setMotivos] = useState<any[]>(initialMotivos);
  const [isLoading, setIsLoading] = useState(initialMotivos.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [nuevoMotivoNombre, setNuevoMotivoNombre] = useState('');

  useEffect(() => {
    if (initialMotivos.length > 0) return;

    const fetchMotivos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/motivos');
        if (!response.ok) {
          throw new Error('No se pudieron cargar los motivos');
        }
        const data = await response.json();
        setMotivos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMotivos();
  }, [initialMotivos]);

  const { search, handleSearch, encontrado, noResultados, setSearch } = useBusquedaFiltros(
    motivos,
    ['nombre']
  );

  const handleSelectMotivo = (motivo: any) => {
    setConsultaField('motivoInicial', motivo.nombre);
    setSearch('');
  };

  const handleCreateMotivo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMotivoNombre.trim()) return;

    // --- Llamada REAL a la API POST ---
    try {
      const response = await fetch('/api/motivos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoMotivoNombre.trim() }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el motivo');
      }

      const nuevoMotivo = await response.json();

      setMotivos([...motivos, nuevoMotivo]);
      setConsultaField('motivoInicial', nuevoMotivo.nombre);

      setNuevoMotivoNombre('');
      setIsModalOpen(false);
      setSearch('');
    } catch (error) {
      console.error('Fallo al crear motivo:', error);
      // Aquí podrías mostrar una notificación de error al usuario
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-2 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-start gap-2">
        <label
          className="text-sm font-semibold text-primary-textoTitle"
          htmlFor="motivoInicialSearch"
        >
          Motivo Inicial
        </label>
        <Input
          type="text"
          name="motivoInicialSearch"
          value={search}
          onChange={handleSearch}
          placeholder={isLoading ? 'Cargando motivos...' : 'Buscar o crear motivo...'}
          disabled={isLoading || error}
          className="flex-grow"
        />

        <Button
          onClick={() => {
            setNuevoMotivoNombre(search);
            setIsModalOpen(true);
          }}
          className="animate-aparecer"
        >
          <p className="flex items-center gap-2">
            <PlusCircle size={16} className="mr-2" />
            Agregar Motivo
          </p>
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {search.length > 0 && !noResultados && (
        <ul className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
          {encontrado.map((motivo: any) => (
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
