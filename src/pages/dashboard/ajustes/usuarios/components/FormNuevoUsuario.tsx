import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import React, { useState } from 'react';

interface FormNuevoUsuarioProps {
  onClose: () => void;
}

interface DataProfesional {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: string;
  centroMedicoId: string;
  especialidad: string;
  avatar: string;
  dni: number;
  mp: string;
}

export default function FormNuevoUsuario({ onClose }: FormNuevoUsuarioProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: '',
    centroMedicoId: '',
    especialidad: '',
    dni: '',
    mp: '',
    avatar: '',
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/ajustes/usuarios', { // Endpoint corregido
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Usuario creado con éxito');
        onClose(); // Close modal on success
        // Optionally, trigger a refresh of the user list
      } else {
        alert('Error al crear el usuario: ' + result.message);
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      alert('Error de conexión al servidor');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">

      <div className="flex gap-4">
        <Input
          id="nombre"
          label="Nombre"
          name="nombre"
          type="text"
          placeholder="Nombre del usuario"
          value={formData.nombre}
          onChange={handleChange}
        />
        <Input
          id="apellido"
          label="Apellido"
          name="apellido"
          type="text"
          placeholder="Apellido del usuario"
          value={formData.apellido}
          onChange={handleChange}
        />
      </div>
      <Input
        id="email"
        label="Email"
        name="email"
        type="email"
        placeholder="Email del usuario"
        value={formData.email}
        onChange={handleChange}
      />
      <Input
        id="password"
        label="Contraseña"
        name="password"
        type="password"
        placeholder="Contraseña"
        value={formData.password}
        onChange={handleChange}
      />
      <select
        id="rol"
        className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 w-full focus:ring-offset-2 focus:ring-primary-100 focus:border-primary-100 placeholder:text-gray-400 transition"
        name="rol"
        value={formData.rol}
        onChange={handleChange}
      >
        <option value="">Seleccione un rol</option>
        <option value="profesional">Profesional</option>
        <option value="recepcionista">Recepcionista</option>
        <option value="administrador">Administrador</option>
      </select>

      {formData.rol === 'profesional' && (
        <div className="space-y-4 mt-4 border-t pt-4">
          <Input
            id="mp"
            label="Matrícula Profesional"
            name="mp"
            type="text"
            placeholder="MP 12345"
            value={formData.mp}
            onChange={handleChange}
          />
          <Input
            id="especialidad"
            label="Especialidad"
            name="especialidad"
            type="text"
            placeholder="Ej: Cardiología"
            value={formData.especialidad}
            onChange={handleChange}
          />
          <Input
            id="dni"
            label="DNI"
            name="dni"
            type="text"
            placeholder="Documento Nacional de Identidad"
            value={formData.dni}
            onChange={handleChange}
          />
          <Input
            id="avatar"
            label="Avatar (URL)"
            name="avatar"
            type="text"
            placeholder="https://example.com/avatar.png"
            value={formData.avatar}
            onChange={handleChange}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Crear Usuario</Button>
      </div>
    </form>
  );
}
