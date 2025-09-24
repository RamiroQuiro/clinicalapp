import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { setPaciente } from '@/context/agenda.store';
import { showToast } from '@/utils/toast/toastShow';
import React, { useState } from 'react';

interface FormularioNuevoPacienteProps {
  onPacienteCreado: (paciente: {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
  }) => void;
  onCancel: () => void;
  isStoreAgenda: boolean;
  userId: string;
}

export const FormularioNuevoPaciente: React.FC<FormularioNuevoPacienteProps> = ({
  onPacienteCreado,
  isStoreAgenda = true,
  userId,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    celular: '',
    fNacimiento: '',
    sexo: '',
    email: '',
    userId: '',
  });
  const [loading, setLoading] = useState(false);

  const sexoOptions = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.dni) {
      alert('Nombre, Apellido y DNI son obligatorios.');
      return;
    }
    formData.userId = userId;

    setLoading(true);
    try {
      const response = await fetch('/api/pacientes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear paciente');
      }

      const result = await response.json();
      const [nuevoPaciente] = result.data;

      console.log('nuevo panietne -', nuevoPaciente);

      if (isStoreAgenda) {
        setPaciente({
          id: nuevoPaciente.id,
          nombre: `${nuevoPaciente.nombre} ${nuevoPaciente.apellido}`,
        });
      }
      showToast('Paciente creado con éxito', { background: 'bg-green-600' });
    } catch (error: any) {
      showToast(`Error al crear paciente: ${error.message}`, { background: 'bg-red-600' });
      console.error('Error al crear paciente:', error);
    } finally {
      setLoading(false);
      document.getElementById('dialog-modal-modalNuevoPaciente')?.showModal();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div className="w-full flex items-center justify-satar gap-2">
        <Input
          label="Nombre"
          type="text"
          id="nombre"
          value={formData.nombre}
          onChange={e => setFormData({ ...formData, nombre: e.target.value })}
          required
        />
        <Input
          label="Apellido"
          type="text"
          id="apellido"
          value={formData.apellido}
          onChange={e => setFormData({ ...formData, apellido: e.target.value })}
          required
        />
        <Input
          label="DNI"
          type="text"
          id="dni"
          value={formData.dni}
          onChange={e => setFormData({ ...formData, dni: e.target.value })}
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        id="email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <Input
        label="Teléfono (Opcional)"
        type="text"
        id="celular"
        value={formData.celular}
        onChange={e => setFormData({ ...formData, celular: e.target.value })}
        required
      />
      <div className="w-full flex items-center justify-satar gap-2">
        <div className="w-1/2 flex flex-col">
          <label htmlFor="sexo" className="mb-1 text-sm font-semibold text-primary-texto ">
            Sexo
          </label>
          <select
            id="sexo"
            value={formData.sexo}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary-100 focus:border-primary-100 placeholder:text-gray-400 transition"
            onChange={e => setFormData({ ...formData, sexo: e.target.value })}
            required
          >
            <option value="">Seleccionar</option>
            {sexoOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          className="w-full"
          label="Fecha de Nacimiento"
          type="date"
          id="fNacimiento"
          value={formData.fNacimiento}
          onChange={e => setFormData({ ...formData, fNacimiento: e.target.value })}
          required
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Paciente'}
        </Button>
      </div>
    </form>
  );
};
