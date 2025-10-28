

import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import React, { useState } from 'react';
import FormularioPerfilAvatar from './FormularioPerfilAvatar';

export default function FormConfiguracionCentro() {
  const [formData, setFormData] = useState({
    nombreCentro: '',
    direccion: '',
    telefono: '',
    emailContacto: '',
    logoUrl: '',
    idiomaDefecto: 'es', // Default value
    zonaHoraria: 'America/Argentina/Buenos_Aires', // Default value
    colorPrincipal: '#3b82f6', // Default value (Tailwind blue-500)
    fuenteDefecto: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/ajustes/general/informacion', { // Endpoint a crear
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Información guardada con éxito');
      } else {
        alert('Error al guardar la información: ' + result.message);
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      alert('Error de conexión al servidor');
    }
  };

  return (
    <form title="Datos del Centro Médico" id="formularioInformacionCentro" className='flex items-center justify-between flex-col gap-2 pb-3 px-3 w-full' onSubmit={handleSubmit}>
      <Card className='flex items-center flex-col justify-between w-full gap-2 flex-1 w-full'>
        <CardHeader>
          <CardTitle>Información del Centro</CardTitle>
        </CardHeader>
        <CardContent className='w-full space-y-3'>
          <Input
            id="nombreCentro"
            label="Nombre del Centro"
            name="nombreCentro"
            type="text"
            placeholder="Nombre de tu clínica o consultorio"
            value={formData.nombreCentro}
            onChange={handleChange}
          />
          <Input
            id="direccion"
            label="Dirección"
            name="direccion"
            type="text"
            placeholder="Dirección completa"
            value={formData.direccion}
            onChange={handleChange}
          />
          <div className="flex items-center justify-between w-full gap-2">
            <Input
              id="telefono"
              label="Teléfono"
              name="telefono"
              type="text"
              placeholder="Número de teléfono"
              value={formData.telefono}
              onChange={handleChange}
            />
            <Input
              id="emailContacto"
              label="Email de Contacto"
              name="emailContacto"
              type="email"
              placeholder="Email de contacto"
              value={formData.emailContacto}
              onChange={handleChange}
            />
          </div>
          <FormularioPerfilAvatar user={formData} />
          <Input
            id="logoUrl"
            label="URL del Logo (o subir archivo)"
            name="logoUrl"
            type="text"
            placeholder="URL de tu logo"
            value={formData.logoUrl}
            onChange={handleChange}
          />
        </CardContent>
      </Card>


      <div className="flex items-center justify-end mt-4 w-full">
        <Button type="submit">Guardar Información</Button>
      </div>
    </form>
  );
}
