import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import { showToast } from '@/utils/toast/toastShow';
import React, { useEffect, useState } from 'react';

// Este componente recibirá los datos del usuario como props
export default function PerfilInformacion({ user: initialUser }: { user: any }) {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);

  // Sincronizar el estado local cuando cambia initialUser (cuando llega el fetch)
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

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

  return (
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
            <Input label="Rol" name="rol" value={user?.rol || ''} disabled isLoading={isLoading} />
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
  );
}
