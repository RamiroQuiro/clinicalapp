import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import React, { useState } from 'react';

export default function FormConfiguracionCentro() {
  const [formData, setFormData] = useState({
    nombreCentro: '',
    direccion: '',
    telefono: '',
    emailContacto: '',
    sitioWeb: '',
    logo: null as File | null,
    horarios: {
      lunes: '09:00-18:00',
      martes: '09:00-18:00',
      miercoles: '09:00-18:00',
      jueves: '09:00-18:00',
      viernes: '09:00-18:00',
      sabado: 'Cerrado',
      domingo: 'Cerrado',
    },
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleHorarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      horarios: { ...prevData.horarios, [name]: value },
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prevData => ({ ...prevData, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí iría la lógica para subir el logo a un servicio de almacenamiento
    // y luego enviar todos los datos al backend.
    console.log(formData);
    alert('Funcionalidad en desarrollo. Revisa la consola para ver los datos del formulario.');
  };

  return (
    <form onSubmit={handleSubmit} className="gap-4 grid grid-cols-2 w-full">
      {/* Información del Centro */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Centro</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 w-full md:grid-cols-2">
          <Input
            name="nombreCentro"
            label="Nombre del Centro"
            placeholder="Clínica Salud Total"
            onChange={handleChange}
            value={formData.nombreCentro}
          />
          <Input
            name="direccion"
            label="Dirección"
            placeholder="Av. Siempre Viva 123"
            onChange={handleChange}
            value={formData.direccion}
          />
          <Input
            name="telefono"
            label="Teléfono"
            placeholder="+54 9 11 1234-5678"
            onChange={handleChange}
            value={formData.telefono}
          />
          <Input
            name="emailContacto"
            label="Email de Contacto"
            type="email"
            placeholder="contacto@saludtotal.com"
            onChange={handleChange}
            value={formData.emailContacto}
          />
          <Input
            name="sitioWeb"
            label="Sitio Web"
            type="url"
            placeholder="https://www.saludtotal.com"
            onChange={handleChange}
            value={formData.sitioWeb}
          />
        </CardContent>
      </Card>

      {/* Logo del Centro */}
      <Card>
        <CardHeader>
          <CardTitle>Logo del Centro</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-48 h-48 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Previsualización del logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-muted-foreground text-sm text-center">Sin logo</span>
            )}
          </div>
          <label
            htmlFor="logo-upload"
            className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            Seleccionar Logo
          </label>
          <input
            id="logo-upload"
            name="logo"
            type="file"
            className="hidden"
            onChange={handleLogoChange}
            accept="image/*"
          />
        </CardContent>
      </Card>

      {/* Horarios de Atención */}
      <Card>
        <CardHeader>
          <CardTitle>Horarios de Atención</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {Object.keys(formData.horarios).map(day => (
            <Input
              key={day}
              name={day}
              label={day.charAt(0).toUpperCase() + day.slice(1)}
              value={formData.horarios[day as keyof typeof formData.horarios]}
              onChange={handleHorarioChange}
            />
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Guardar Cambios</Button>
      </div>
    </form>
  );
}
