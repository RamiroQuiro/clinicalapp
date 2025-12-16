import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';

import ModalReact from '@/components/moleculas/ModalReact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import { showToast } from '@/utils/toast/toastShow';
import type { User } from 'lucia';
import { CircleX } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import Select, { components } from 'react-select';

// Este componente recibirá los datos del usuario como props
export default function PerfilInformacion({ user: initialUser, currentDataUser }: { user: any, currentDataUser: User }) {
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
  // Manejo para select normal
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
        <div className="bg-gray-200 rounded-full w-7 h-7 overflow-hidden">
          {props.data.srcPhoto ? (
            <img src={props.data.srcPhoto} className="w-full h-full object-cover" />
          ) : null}
        </div>
        <div>
          <p className="font-medium text-sm capitalize">{props.data.label}</p>
          <p className="text-gray-500 text-xs">{props.data.dni}</p>
          <p className="text-gray-500 text-xs">{props.data.especialidad || 'General'}</p>
        </div>
      </div>
    </components.Option>
  );
  return (
    <div className="space-y-4">
      {/* Informacion personal */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Información Personal</CardTitle>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </CardHeader>
        <CardContent className="gap-6 grid md:grid-cols-3">
          <div className="flex flex-col items-center gap-4 md:col-span-1">
            <img
              src={user?.srcPhoto || '/avatar-placeholder.png'}
              alt="Avatar"
              className="border-2 border-primary-border rounded-full w-32 h-32 object-cover"
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
            <div className="flex flex- justify-between items-center gap-4 w-full">
              <Input
                label="DNI"
                name="dni"
                type="number"
                value={user?.dni || 0}
                onChange={handleInputChange}
                disabled={!isEditing}
                isLoading={isLoading}
              />
              {(user?.rol === 'profesional' ||
                user?.rol === 'admin') && (
                  <Input
                    label="MP"
                    name="mp"
                    type="text"
                    value={user?.mp || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    isLoading={isLoading}
                  />
                )}
            </div>
            {
              currentDataUser?.rol === 'admin' && isEditing ?
                <select
                  id="rol"
                  className="shadow-sm p-2 border border-gray-300 focus:border-primary-100 rounded-md focus:ring-2 focus:ring-primary-100 focus:ring-offset-2 w-full placeholder:text-gray-400 transition"
                  name="rol"
                  value={user?.rol}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="recepcion">Recepcion</option>
                  <option value="profesional">Profesional</option>
                </select>
                :
                <Input
                  label="Rol"
                  name="rol"
                  value={user?.rol || ''}
                  disabled={currentDataUser?.rol !== 'admin'}
                  isLoading={isLoading}
                />}

            {(user?.rol === 'profesional' || user?.rol === 'admin') && <div className="flex xl:flex-row flex-col justify-normal items-center gap-2 mt-4 pt-4 border-t w-full">

              <Input
                id="especialidad"
                label="Especialidad"
                name="especialidad"
                type="text"
                placeholder="Ej: Cardiología"
                disabled={!isEditing}
                isLoading={isLoading}
                value={user?.especialidad}
                onChange={handleInputChange}
              />
              <Input
                className="flex-1"
                id="avatar"
                label="Avatar (URL)"
                name="avatar"
                type="text"
                placeholder="https://example.com/avatar.png"
                disabled={!isEditing}
                isLoading={isLoading}
                value={user?.srcPhoto}
                onChange={handleInputChange}
              />
            </div>}
            <div className="flex xl:flex-row flex-col justify-normal items-center gap-2 mt-4 pt-4 border-t w-full">
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
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Profesionales relacionados</CardTitle>
            <Button variant="primary" onClick={() => setOpenAddProfesional(true)}>
              Agregar profesional
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-500 text-sm">Cargando...</p>
            ) : profesionalesRelacionados.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay profesionales relacionados</p>
            ) : (
              <div className="flex flex-wrap gap-3 w-full item-center">
                {profesionalesRelacionados.map(p => (
                  <div
                    key={p.profesionalId}
                    className="flex justify-between items-center gap-2 p-3 border rounded-lg capitalize"
                  >
                    <div className="flex justify-center items-center bg-gray-400 rounded-full w-10 h-10 text-center">
                      <span className="text-white text-xl -tracking-tight">
                        {p.nombre.charAt(0)} {p.apellido.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {p.nombre} {p.apellido}
                      </p>
                      <p className="text-gray-500 text-xs">{p.especialidad}</p>
                      <p className="text-gray-500 text-xs">{p.mp}</p>
                      <p className="text-gray-500 text-xs">{p.dni}</p>
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
          <div className="p-6 min-w-[75dvw] min-h-[75dvh]">
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
