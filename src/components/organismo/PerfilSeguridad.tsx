import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';

export default function PerfilSeguridad() {
  const handleSave = () => {
    alert('Contraseña actualizada (simulación)');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar Contraseña</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input label="Contraseña Actual" type="password" placeholder="••••••••" />
        <Input label="Nueva Contraseña" type="password" placeholder="••••••••" />
        <Input label="Confirmar Nueva Contraseña" type="password" placeholder="••••••••" />
      </CardContent>
      <div className="p-6 border-t">
        <Button onClick={handleSave}>Actualizar Contraseña</Button>
      </div>
    </Card>
  );
}
