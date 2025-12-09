import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { setPaciente } from '@/context/agenda.store';
import { showToast } from '@/utils/toast/toastShow';

import React, { useEffect, useState } from 'react';

interface FormularioRapidoCargaPacienteProps {
  onPacienteCreado: (paciente: {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
  }) => void;
  onCancel: () => void;
  isStoreAgenda?: boolean;
  userId: string;
  pacienteAEditar?: any; // Datos del paciente a editar (opcional)
}

export const FormularioRapidoCargaPaciente: React.FC<FormularioRapidoCargaPacienteProps> = ({
  onPacienteCreado,
  isStoreAgenda = true,
  userId,
  onCancel,
  pacienteAEditar,
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

  useEffect(() => {
    if (pacienteAEditar) {
      // Pre-cargar datos si estamos editando
      setFormData({
        nombre: pacienteAEditar.nombre || '',
        apellido: pacienteAEditar.apellido || '',
        dni: pacienteAEditar.dni || '',
        celular: pacienteAEditar.celular || '',
        fNacimiento: pacienteAEditar.fNacimiento ? new Date(pacienteAEditar.fNacimiento).toISOString().split('T')[0] : '',
        sexo: pacienteAEditar.sexo || '',
        email: pacienteAEditar.email || '',
        userId: userId,
      });
    } else {
      setFormData(prev => ({ ...prev, userId }));
    }
  }, [pacienteAEditar, userId]);

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

    setLoading(true);
    try {
      const isEditing = !!pacienteAEditar;
      const url = isEditing ? `/api/pacientes/${pacienteAEditar.id}/update` : '/api/pacientes/create';
      const method = isEditing ? 'PUT' : 'POST';

      const payload = { ...formData, id: pacienteAEditar?.id }; // Incluir ID si es edición

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${isEditing ? 'actualizar' : 'crear'} paciente`);
      }

      const result = await response.json();
      // La estructura de respuesta puede variar entre create y update, ajustamos según necesidad
      const pacienteProcesado = isEditing ? { ...pacienteAEditar, ...formData } : result.data?.paciente || result.paciente;

      if (isStoreAgenda && !isEditing) {
        setPaciente({
          id: pacienteProcesado.id,
          nombre: `${pacienteProcesado.nombre} ${pacienteProcesado.apellido}`,
        });
      }

      showToast(`Paciente ${isEditing ? 'actualizado' : 'creado'} con éxito`, { background: 'bg-green-600' });

      // Notificar al padre
      if (onPacienteCreado) {
        onPacienteCreado(pacienteProcesado);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showToast(`Error: ${errorMessage}`, { background: 'bg-red-600' });
      console.error('Error en formulario paciente:', error);
    } finally {
      setLoading(false);
      // document.getElementById('dialog-modal-modalNuevoPaciente')?.close(); // Dejar que el padre maneje el cierre
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nombre: e.target.value })}
          required
        />
        <Input
          label="Apellido"
          type="text"
          id="apellido"
          value={formData.apellido}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, apellido: e.target.value })}
          required
        />
        <Input
          label="DNI"
          type="text"
          id="dni"
          value={formData.dni}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dni: e.target.value })}
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        id="email"
        value={formData.email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <Input
        label="Teléfono (Opcional)"
        type="text"
        id="celular"
        value={formData.celular}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, celular: e.target.value })}
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
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, sexo: e.target.value })}
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fNacimiento: e.target.value })}
          required
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Guardando...' : (pacienteAEditar ? 'Actualizar Paciente' : 'Crear Paciente')}
        </Button>
      </div>
    </form>
  );
};
