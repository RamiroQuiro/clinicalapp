import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';

import BotonIndigo from '@/components/moleculas/BotonIndigo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import { showToast } from '@/utils/toast/toastShow';
import { Check, CircleX } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import Select, { components } from 'react-select';

// Este componente recibirá los datos del usuario como props
export default function PerfilInformacion({ user: initialUser }: { user: any }) {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfesionalesRelacionados, setIsLoadingProfesionalesRelacionados] =
    useState(false);
  const [profesionalesRelacionados, setProfesionalesRelacionados] = useState<any[]>([]);

  // Sincronizar el estado local cuando cambia initialUser (cuando llega el fetch)
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
    if (user?.rol === 'recepcion') {
      console.log('es recepcion?');
      fetchProfesionalesRelacionados();
    }
  }, [initialUser, user]);

  const fetchProfesionalesRelacionados = async () => {
    try {
      setIsLoadingProfesionalesRelacionados(true);
      const response = await fetch(`/api/ajustes/usuarios/${user.id}/profesionales-relacionados`);
      if (!response.ok) {
        throw new Error('Error al obtener profesionales relacionados');
      }
      const result = await response.json();
      setProfesionalesRelacionados(result.data);
    } catch (error) {
      setIsLoadingProfesionalesRelacionados(false);
      console.error('Error al obtener profesionales relacionados:', error);
    }
    setIsLoadingProfesionalesRelacionados(false);
  };

  // Determinar si está cargando (cuando no hay datos del usuario)
  const isLoading = !user || !user.nombre;

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

  const handleEliminarProfesional = async (id: string) => {
    try {
      const response = await fetch(
        `/api/ajustes/usuarios/${user.id}/profesionales-relacionados/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar profesional relacionado');
      }

      const result = await response.json();
      console.log('Profesional relacionado eliminado:', result);

      // Actualizar el estado local con los datos frescos del servidor
      if (result.data && result.data[0]) {
        setUser(result.data[0]);
      }

      showToast('Profesional relacionado eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar profesional relacionado:', error);
      showToast('Error al eliminar el profesional relacionado');
    }
  };

  // Convertir profesionales a opciones para el Select
  const opciones = useMemo(() => {
    return profesionalesRelacionados.map(profesional => ({
      value: profesional.id,
      label: `${profesional.nombreProfesional} ${profesional.apellidoProfesional}`,
    }));
  }, [profesionalesRelacionados]);

  // Obtener los valores seleccionados actuales
  const valoresSeleccionados = useMemo(() => {
    return opciones.filter(opcion => profesionalesRelacionados?.includes(opcion.value));
  }, [opciones, profesionalesRelacionados]);

  const Option = (props: any) => {
    return (
      <components.Option {...props}>
        <div className="flex items-center">
          <div
            className={`flex items-center justify-center h-5 w-5 mr-2 rounded border ${
              props.isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
            }`}
          >
            {props.isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </div>
          <span className={props.isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}>
            {props.label}
          </span>
        </div>
      </components.Option>
    );
  };

  // Manejador de cambio de selección
  const handleSelection = (opcionesSeleccionadas: readonly OptionType[]) => {
    if (!opcionesSeleccionadas) {
      return;
    }
  };
  return (
    <div className="space-y-4">
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
            <Button onClick={handleSave}>Guardar Cambios</Button>
          </div>
        )}
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profesionales Relacionados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProfesionalesRelacionados ? (
            <div className="text-center py-8 text-gray-500">
              <p>Cargando profesionales...</p>
            </div>
          ) : profesionalesRelacionados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay profesionales registrados</p>
              <p className="text-sm">Haz clic en "Nueva Licencia" para agregar una</p>
            </div>
          ) : (
            <div className="flex w-full flex-wrap gap-2 items-center justify-start">
              {profesionalesRelacionados.map(profesional => (
                <BotonIndigo
                  key={profesional.id}
                  onClick={() => handleEliminarProfesional(profesional.id)}
                  className=" hover:bg-red-50"
                >
                  {profesional.nombreProfesional} {profesional.apellidoProfesional}
                  <CircleX className="h-6 w-6 border ml-4 text-red-500   rounded-full" />
                </BotonIndigo>
              ))}
            </div>
          )}
        </CardContent>

        <div className="space-y-4 mt-4 border-t pt-4">
          <div className="w-full">
            <Select
              isSearchable
              isMulti
              options={opciones}
              value={valoresSeleccionados}
              onChange={handleSelection}
              placeholder="Seleccione profesionales..."
              noOptionsMessage={() => 'No hay opciones disponibles'}
              className="text-sm"
              classNamePrefix="select"
              components={{ Option }}
              hideSelectedOptions={false}
              closeMenuOnSelect={false}
              controlShouldRenderValue={false}
            />
          </div>
        </div>
        <div className="p-6 border-t">
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      </Card>
    </div>
  );
}
