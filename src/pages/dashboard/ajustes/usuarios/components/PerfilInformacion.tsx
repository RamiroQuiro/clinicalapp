import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';

import ModalReact from '@/components/moleculas/ModalReact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import { showToast } from '@/utils/toast/toastShow';
import { CircleX } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import Select, { components } from 'react-select';

// Este componente recibirá los datos del usuario como props
export default function PerfilInformacion({ user: initialUser }: { user: any }) {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [profesionalesRelacionados, setProfesionalesRelacionados] = useState<any[]>([]);
  const [profesionalesCentro, setProfesionalesCentro] = useState<any[]>([]);
  const [openAddProfesional, setOpenAddProfesional] = useState(false);

  useEffect(() => {
    if (initialUser) setUser(initialUser);
    if (initialUser?.rol === 'recepcion') {
      fetchRelaciones();
      fetchProfesionalesCentro();
    }
  }, [initialUser]);

  const fetchRelaciones = async () => {
    if (!initialUser?.id) return;

    try {
      setIsLoading(true);
      const res = await fetch(`/api/ajustes/usuarios/${initialUser.id}/profesionales-relacionados`);
      const json = await res.json();

      setProfesionalesRelacionados(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchProfesionalesCentro = async () => {
    if (!initialUser?.centroMedicoId) return;

    try {
      const res = await fetch(`/api/centroMedico/${initialUser.centroMedicoId}/profesionales`);
      const json = await res.json();
      setProfesionalesCentro(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/ajustes/usuarios/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar usuario');
      }

      const result = await response.json();
      console.log('Usuario actualizado:', result);

      // Actualizar el estado local con los datos frescos del servidor
      if (result.data && result.data[0]) {
        setUser(result.data[0]);
      }

      setIsEditing(false);
      showToast('Información guardada correctamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      showToast('Error al guardar la información');
    }
  };

  const handleEliminarProfesional = async (profesionalId: number) => {
    if (!user?.id) return;

    try {
      await fetch(`/api/ajustes/usuarios/${user.id}/profesionales-relacionados/${profesionalId}`, {
        method: 'DELETE',
      });
      fetchRelaciones();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAgregarProfesional = async (option: any) => {
    if (!option || !user?.id) return;
    console.log('esta es la opcion q seleccionaste', option);
    try {
      await fetch(`/api/ajustes/usuarios/${user.id}/profesionales-relacionados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profesionalId: option.value }),
      });

      setOpenAddProfesional(false);
      fetchRelaciones();
    } catch (e) {
      console.error(e);
    }
  };

  // Profesionales disponibles = centro - relacionados
  const opcionesDisponibles = useMemo(() => {
    const idsRelacionados = profesionalesRelacionados.map(r => r.profesionalId);
    return profesionalesCentro
      .filter(p => !idsRelacionados.includes(p.id))
      .map(p => ({
        value: p.profesionalId,
        label: `${p.nombre} ${p.apellido}`,
        dni: p.dni,
        especialidad: p.especialidad,
        srcPhoto: p.srcPhoto,
      }));
  }, [profesionalesCentro, profesionalesRelacionados]);

  const Option = (props: any) => (
    <components.Option {...props}>
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200">
          {props.data.srcPhoto ? (
            <img src={props.data.srcPhoto} className="w-full h-full object-cover" />
          ) : null}
        </div>
        <div>
          <p className="text-sm capitalize font-medium">{props.data.label}</p>
          <p className="text-xs text-gray-500">{props.data.dni}</p>
          <p className="text-xs text-gray-500">{props.data.especialidad || 'General'}</p>
        </div>
      </div>
    </components.Option>
  );
  return (
    <div className="space-y-4">
      {/* Informacion personal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Información Personal</CardTitle>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col  items-center gap-4 md:col-span-1">
            <img
              src={user?.srcPhoto || '/avatar-placeholder.png'}
              alt="Avatar"
              className="w-32 h-32 rounded-full  border-primary-border border-2 object-cover"
            />
            <Button variant="outline" size="sm">
              Cambiar Avatar
            </Button>
          </div>
          <div className="space-y-4 md:col-span-2">
            <div className="flex flex- justify-between items-center gap-4">
              <Input
                label="Nombre"
                name="nombre"
                value={user?.nombre || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                isLoading={isLoading}
              />
              <Input
                label="Apellido"
                name="apellido"
                value={user?.apellido || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                isLoading={isLoading}
              />
            </div>
            <div className="flex flex- justify-between items-center gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                value={user?.email || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                isLoading={isLoading}
              />
              <Input
                label="Celular"
                name="celular"
                type="email"
                value={user?.celular || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                isLoading={isLoading}
              />
            </div>
            <div className="flex flex- justify-between items-center gap-4">
              <Input
                label="DNI"
                name="dni"
                type="number"
                value={user?.dni || 0}
                onChange={handleInputChange}
                disabled={!isEditing}
                isLoading={isLoading}
              />
              {user?.rol === 'profesional' ||
                (user?.rol === 'admin' && (
                  <Input
                    label="MP"
                    name="mp"
                    type="text"
                    value={user?.mp || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    isLoading={isLoading}
                  />
                ))}
            </div>
            <div className="flex flex- justify-between items-center gap-4">
              {user?.rol === 'profesional' ||
                (user?.rol === 'admin' && (
                  <Input
                    label="Especialidad"
                    name="especialidad"
                    type="text"
                    value={user?.especialidad || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    isLoading={isLoading}
                  />
                ))}
              <Input
                label="Rol"
                name="rol"
                value={user?.rol || ''}
                disabled
                isLoading={isLoading}
              />
            </div>
            <div className="flex flex- justify-between items-center gap-4">
              <Input
                label="Direccion"
                name="direccion"
                type="text"
                value={user?.direccion || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                isLoading={isLoading}
              />
              <Input
                label="Ciudad"
                name="ciudad"
                type="text"
                value={user?.ciudad || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                isLoading={isLoading}
              />
              <Input
                label="Provincia"
                name="provincia"
                type="text"
                value={user?.provincia || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                isLoading={isLoading}
              />
            </div>
          </div>
        </CardContent>
        {isEditing && (
          <div className="p-6 border-t">
            <Button variant="primary" onClick={handleSave}>
              Guardar Cambios
            </Button>
          </div>
        )}
      </Card>
      {/* PROFESIONALES RELACIONADOS */}
      {user?.rol === 'recepcion' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profesionales relacionados</CardTitle>
            <Button variant="primary" onClick={() => setOpenAddProfesional(true)}>
              Agregar profesional
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : profesionalesRelacionados.length === 0 ? (
              <p className="text-sm text-gray-500">No hay profesionales relacionados</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {profesionalesRelacionados.map(p => (
                  <div
                    key={p.profesionalId}
                    className="flex justify-between capitalize items-center border rounded-lg p-3"
                  >
                    <div className="bg-gray-400 text-center flex items-center justify-center w-10 h-10 rounded-full">
                      <span className="text-white text-xl -tracking-tight ">
                        {p.nombre.charAt(0)} {p.apellido.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {p.nombre} {p.apellido}
                      </p>
                      <p className="text-xs text-gray-500">{p.especialidad}</p>
                      <p className="text-xs text-gray-500">{p.mp}</p>
                      <p className="text-xs text-gray-500">{p.dni}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEliminarProfesional(p.profesionalId)}
                    >
                      <CircleX className="text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* MODAL AGREGAR PROFESIONAL */}

      {openAddProfesional && user?.rol === 'recepcion' && (
        <ModalReact title="Vincular profesional" onClose={() => setOpenAddProfesional(false)}>
          <div className="p-6 min-h-[75dvh] min-w-[75dvw]">
            <Select
              autoFocus
              isSearchable
              options={opcionesDisponibles}
              placeholder="Buscar profesional..."
              onChange={handleAgregarProfesional}
              components={{ Option }}
            />
          </div>
        </ModalReact>
      )}
    </div>
  );
}
