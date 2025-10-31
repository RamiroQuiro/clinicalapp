import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import React, { useState } from 'react';

// Este componente recibirá los datos del usuario como props
export default function PerfilInformacion({ user: initialUser }: { user: any }) {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log('Guardando información personal:', user);
    setIsEditing(false);
    alert('Información guardada (simulación)');
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
        <div className="flex flex-col items-center gap-4 md:col-span-1">
          <img src={user.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full object-cover" />
          <Button variant="outline" size="sm">
            Cambiar Avatar
          </Button>
        </div>
        <div className="space-y-4 md:col-span-2">
          <Input
            label="Nombre Completo"
            name="nombre"
            value={user.nombre}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={user.email}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
          <Input
            label="Celular"
            name="celular"
            type="email"
            value={user.celular}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
          <Input
            label="DNI"
            name="dni"
            type="number"
            value={user.dni}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
          <Input
            label="MP"
            name="mp"
            type="text"
            value={user.mp}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
          <Input
            label="Especialidad"
            name="especialidad"
            type="text"
            value={user.especialidad}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
          <Input label="Rol" name="rol" value={user.rol} disabled />
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
