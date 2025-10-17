import React, { useState } from 'react';
import Input from '../../../components/atomos/Input';

// Tipos para las props
interface PacienteData {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular?: string;
  sexo: 'masculino' | 'femenino';
  domicilio?: string;
  ciudad?: string;
  provincia?: string;
  obraSocial?: string;
  nObraSocial?: string;
  fNacimiento: string; // Se espera un string en formato YYYY-MM-DD
  estatura?: number;
  grupoSanguineo?: string;
}

interface FormularioPacienteProps {
  paciente?: PacienteData; // Opcional: si se pasa, estamos en modo edición
  userId: string;
}

// Función para formatear la fecha que viene de la DB (ISO string) a YYYY-MM-DD para el input
const formatDateForInput = (isoDate: string | undefined) => {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

const FormularioPaciente: React.FC<FormularioPacienteProps> = ({ paciente, userId }) => {
  const isUpdating = !!paciente; // Modo edición si el objeto paciente existe

  const [formData, setFormData] = useState({
    nombre: paciente?.nombre || '',
    apellido: paciente?.apellido || '',
    dni: paciente?.dni || '',
    email: paciente?.email || '',
    celular: paciente?.celular || '',
    sexo: paciente?.sexo || 'masculino',
    domicilio: paciente?.domicilio || '',
    ciudad: paciente?.ciudad || '',
    provincia: paciente?.provincia || '',
    obraSocial: paciente?.obraSocial || '',
    nObraSocial: paciente?.nObraSocial || '',
    fNacimiento: formatDateForInput(paciente?.fNacimiento),
    estatura: paciente?.estatura || '',
    grupoSanguineo: paciente?.grupoSanguineo || '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    // --- ADVERTENCIA --- //
    // La URL es la misma para crear y actualizar. Si la edición falla,
    // es muy probable que sea por el problema de enrutamiento del backend que comentamos.
    // La solución sería crear un endpoint dedicado para PUT en `/api/pacientes/update.ts`.
    const url = '/api/pacientes/create';
    const method = isUpdating ? 'PUT' : 'POST';

    const payload: any = { ...formData, userId };
    if (isUpdating) {
      payload.id = paciente.id;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || result.message || 'Ocurrió un error inesperado.');
      }

      const successMessage = isUpdating
        ? 'Paciente actualizado exitosamente.'
        : 'Paciente creado exitosamente.';
      setSuccess(successMessage);

      setTimeout(() => {
        const patientId = paciente?.id || result.paciente?.id;
        if (patientId) {
          window.location.href = `/dashboard/pacientes/${patientId}`;
        } else {
          window.location.reload();
        }
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="* DNI" type="number" name="dni" value={formData.dni} onChange={handleChange} required />
        <Input label="* Nombre" type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
        <Input label="* Apellido" type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">* Género</label>
          <select name="sexo" value={formData.sexo} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>
        <Input label="* Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
        <Input label="Celular" type="text" name="celular" value={formData.celular} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Domicilio" type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} />
        <Input label="Ciudad" type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} />
        <Input label="Provincia" type="text" name="provincia" value={formData.provincia} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Obra Social" type="text" name="obraSocial" value={formData.obraSocial} onChange={handleChange} />
        <Input label="N° Obra Social" type="text" name="nObraSocial" value={formData.nObraSocial} onChange={handleChange} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div>
            <label className="block text-sm font-medium text-gray-700">* Fecha de Nacimiento</label>
            <Input type="date" name="fNacimiento" value={formData.fNacimiento} onChange={handleChange} required />
        </div>
        <Input label="Estatura (cm)" type="number" name="estatura" value={String(formData.estatura)} onChange={handleChange} />
        <Input label="Grupo Sanguíneo" type="text" name="grupoSanguineo" value={formData.grupoSanguineo} onChange={handleChange} />
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
          {isLoading ? 'Guardando...' : (isUpdating ? 'Actualizar Paciente' : 'Crear Paciente')}
        </button>
      </div>

      <div className="h-6 text-center w-full">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
      </div>
    </form>
  );
};

export default FormularioPaciente;