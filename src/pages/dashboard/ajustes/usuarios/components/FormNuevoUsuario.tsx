import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import Select from '@/components/atomos/Select';
import React, { useState } from 'react';

interface FormNuevoUsuarioProps {
  onClose: () => void;
  profesionales: any[];
}

export default function FormNuevoUsuario({ onClose, profesionales }: FormNuevoUsuarioProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: '',
    especialidad: '',
    dni: '',
    mp: '',
    avatar: '',
    profesionales: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manejo para inputs normales
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  // Manejo para select normal
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  // Manejo especial para el Select múltiple
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Para el select múltiple, value será un array de strings
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validación básica
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password || !formData.rol) {
      setError('Por favor complete todos los campos obligatorios');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/ajustes/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || 'Ocurrió un error al crear el usuario');
      }

      setSuccess(result.msg || 'Usuario creado con éxito');
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Error al enviar los datos:', error);
      setError(error.message || 'Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="flex gap-4">
        <Input
          id="nombre"
          label="Nombre *"
          name="nombre"
          type="text"
          placeholder="Nombre del usuario"
          value={formData.nombre}
          onChange={handleInputChange}
          required
        />
        <Input
          id="apellido"
          label="Apellido *"
          name="apellido"
          type="text"
          placeholder="Apellido del usuario"
          value={formData.apellido}
          onChange={handleInputChange}
          required
        />
      </div>

      <Input
        id="dni"
        label="DNI"
        name="dni"
        type="text"
        placeholder="Documento Nacional de Identidad"
        value={formData.dni}
        onChange={handleInputChange}
      />

      <Input
        id="email"
        label="Email *"
        name="email"
        type="email"
        placeholder="Email del usuario"
        value={formData.email}
        onChange={handleInputChange}
        required
      />

      <Input
        id="password"
        label="Contraseña *"
        name="password"
        type="password"
        placeholder="Contraseña para usuario nuevo"
        value={formData.password}
        onChange={handleInputChange}
        required
      />

      <div>
        <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
          Rol *
        </label>
        <select
          id="rol"
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 w-full focus:ring-offset-2 focus:ring-primary-100 focus:border-primary-100 placeholder:text-gray-400 transition"
          name="rol"
          value={formData.rol}
          onChange={handleSelectChange}
          required
        >
          <option value="">Seleccione un rol</option>
          <option value="profesional">Profesional</option>
          <option value="recepcion">Recepcionista</option>
          <option value="adminLocal">Administrador</option>
        </select>
      </div>

      {formData.rol === 'profesional' && (
        <div className="space-y-4 mt-4 border-t pt-4">
          <Input
            id="mp"
            label="Matrícula Profesional"
            name="mp"
            type="text"
            placeholder="MP 12345"
            value={formData.mp}
            onChange={handleInputChange}
          />
          <Input
            id="especialidad"
            label="Especialidad"
            name="especialidad"
            type="text"
            placeholder="Ej: Cardiología"
            value={formData.especialidad}
            onChange={handleInputChange}
          />
          <Input
            id="avatar"
            label="Avatar (URL)"
            name="avatar"
            type="text"
            placeholder="https://example.com/avatar.png"
            value={formData.avatar}
            onChange={handleInputChange}
          />
        </div>
      )}

      {formData.rol === 'recepcion' && (
        <div className="space-y-4 mt-4 border-t pt-4">
          <Select
            isMulti={true}
            label="Relacionar con profesional"
            name="profesionales"
            value={formData.profesionales}
            onChange={handleMultiSelectChange}
            options={profesionales.map(profesional => ({
              value: profesional.id,
              label: `${profesional.nombreApellido}`,
            }))}
          />
        </div>
      )}

      {/* Mensajes de Estado */}
      <div className="mt-4 text-center">
        {error && <p className="text-red-500 bg-red-100 p-2 rounded-md">{error}</p>}
        {success && <p className="text-green-500 bg-green-100 p-2 rounded-md">{success}</p>}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Usuario'}
        </Button>
      </div>
    </form>
  );
}