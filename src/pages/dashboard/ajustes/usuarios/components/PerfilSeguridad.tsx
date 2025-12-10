import Button from '@/components/atomos/Button';
import InputPassword from '@/components/atomos/InputPassword';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import { showToast } from '@/utils/toast/toastShow';
import React, { useState } from 'react';

interface PerfilSeguridadProps {
  userId: string;
}

export default function PerfilSeguridad({ userId }: PerfilSeguridadProps) {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Validaciones básicas en el frontend
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      showToast('Todos los campos son obligatorios', { background: 'bg-red-600' });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('Las contraseñas nuevas no coinciden', { background: 'bg-red-600' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', { background: 'bg-red-600' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/ajustes/usuarios/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwords),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar contraseña');
      }

      showToast('Contraseña actualizada correctamente', { background: 'bg-green-600' });

      // Limpiar formulario
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      showToast(error.message || 'Error al actualizar contraseña', { background: 'bg-red-600' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar Contraseña</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InputPassword
          label="Contraseña Actual"
          name="currentPassword"
          value={passwords.currentPassword}
          onChange={handleInputChange}
          placeholder="••••••••"
        />
        <InputPassword
          label="Nueva Contraseña"
          name="newPassword"
          value={passwords.newPassword}
          onChange={handleInputChange}
          placeholder="••••••••"
        />
        <InputPassword
          label="Confirmar Nueva Contraseña"
          name="confirmPassword"
          value={passwords.confirmPassword}
          onChange={handleInputChange}
          placeholder="••••••••"
        />
      </CardContent>
      <div className="p-6 border-t">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </Button>
      </div>
    </Card>
  );
}
