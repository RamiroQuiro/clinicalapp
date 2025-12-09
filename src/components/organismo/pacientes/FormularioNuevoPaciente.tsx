import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import InputDate from '@/components/atomos/InputDate';

import { showToast } from '@/utils/toast/toastShow';

import React, { useState } from 'react';

interface FormularioNuevoPacienteProps {
  isStoreAgenda?: boolean;
  pacienteData?: {
    id?: string;
    nombre: string;
    apellido: string;
    dni: number;
    celular: string;
    fNacimiento: string;
    domicilio: string;
    ciudad: string;
    provincia: string;
    obraSocial: string;
    nObraSocial: string;
    grupoSanguineo: string;
    sexo: string;
    email: string;
    userId: string;
  };
  userId: string;
  session?: any;
  onSuccess?: (paciente: any) => void;
  onCancel?: () => void;
}

export const FormularioNuevoPaciente: React.FC<FormularioNuevoPacienteProps> = ({
  isStoreAgenda = true,
  userId,
  pacienteData,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState(
    pacienteData || {
      id: '',
      nombre: '',
      apellido: '',
      dni: 0,
      celular: '',
      fNacimiento: '',
      domicilio: '',
      ciudad: '',
      provincia: '',
      obraSocial: '',
      nObraSocial: '',
      grupoSanguineo: '',
      sexo: '',
      email: '',
      userId: '',
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    message: '',
    code: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.dni) {
      alert('Nombre, Apellido y DNI son obligatorios.');
      setLoading(false);
      return;
    }
    formData.userId = userId;

    let isUpdate = formData.id ? true : false;
    try {
      const response = await fetch(
        isUpdate ? `/api/pacientes/${formData.id}/update` : '/api/pacientes/create',
        {
          method: isUpdate ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError({
          message: errorData.message,
          code: errorData.code,
        });
        throw new Error(errorData.message || 'Error al crear paciente');
      }

      const result = await response.json();
      showToast(`Paciente ${isUpdate ? 'actualizado' : 'creado'} con éxito`, { background: 'bg-green-600' });

      if (onSuccess) {
        onSuccess(result.paciente || result.data?.paciente || formData);
      } else {
        window.location.reload();
      }

    } catch (error: any) {
      setError({
        message: error.message,
        code: error.code,
      });
      showToast(`Error al ${isUpdate ? 'actualizar' : 'crear'} paciente: ${error.message}`, { background: 'bg-red-600' });
      console.error('Error al crear paciente:', error);
    } finally {
      setLoading(false);
      // Solo cerramos el modal automágicamente si no hay callback de éxito, 
      // o dejamos que el padre decida.
      if (!onSuccess) {
        document.getElementById('dialog-modal-modalNuevoPaciente')?.showModal();
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    // Para manejar correctamente los valores numéricos
    const finalValue = type === 'number' ? Number(value) : value;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      id="formularioCliente"
      title="Nuevo Paciente"
      className="flex flex-col items-start gap-2 pb-3 px-3 w-full"
    >
      <div data-user-id className="flex md:flex-row items-center gap-2 w-full justify-between">
        <Input
          label="* DNI"
          type="number"
          name="dni"
          id="dni"
          value={formData.dni}
          onChange={handleChange}
        />
        <Input
          label="* Nombre"
          type="text"
          name="nombre"
          id="nombre"
          styleInput=""
          value={formData.nombre}
          onChange={handleChange}
          readOnly
        />
        <Input
          label="* Apellido"
          type="text"
          name="apellido"
          id="apellido"
          styleInput=""
          value={formData.apellido}
          onChange={handleChange}
          readOnly
        />
      </div>

      <div className="flex md:flex-row items-center gap-2 w-full justify-between">
        <div className="w-full flex  items flex-col items-start justify-center  duration-300 group px-2 -md">
          <label
            htmlFor="sexo"
            className="text-primary-texto w-full duration-300 group-hover  group-hover:text-primary-100 capitalize focus:text-primary-150 text-left text-sm"
          >
            * Genero
          </label>
          <select
            name="sexo"
            id="sexo"
            className=" w-full text-sm bg-primary-bg-componentes group-hover:ring-2 rounded-lg  border-gray-300  ring-primary-150 focus:ring-2  outline-none transition-colors duration-200 ease-in-out px-2 py-2"
          >
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>
        <Input label="* Email" type="email" name="email" id="email" value={formData.email} />
        <Input label="* Celular" type="text" name="celular" id="celular" value={formData.celular} />
      </div>
      <div className="flex md:flex-row items-center gap-2 w-full justify-between">
        <Input
          label="Domicilio"
          type="text"
          id="domicilio"
          readOnly
          name="domicilio"
          value={formData.domicilio}
          onChange={handleChange}
        />
        <Input
          label="Ciudad"
          type="text"
          name="ciudad"
          id="ciudad"
          value={formData.ciudad}
          onChange={handleChange}
        />
        <Input
          label="Provincia"
          type="text"
          name="provincia"
          id="provincia"
          value={formData.provincia}
          onChange={handleChange}
        />
      </div>
      <div className="flex md:flex-row items-center gap-2 w-full justify-between">
        <Input
          label="Obra Social"
          type="text"
          name="obraSocial"
          id="obraSocial"
          value={formData.obraSocial}
          onChange={handleChange}
        />
        <Input
          label="N° Obra Social"
          type="text"
          name="nObraSocial"
          id="nObraSocial"
          value={formData.nObraSocial}
          onChange={handleChange}
        />
      </div>
      <div className="text-xs text-left flex flex-col items-start gap-">
        <p>Fecha de Nacimiento</p>
        <InputDate
          label="Fecha de Nacimiento"
          name="fNacimiento"
          readOnly
          id="fNacimiento"
          client:load
          value={formData.fNacimiento}
        />
      </div>
      <div className="flex md:flex-row items-center gap-2 w-full justify-between">
        <Input
          label="Grupo Sanguineo"
          type="text"
          name="grupoSanguineo"
          id="grupoSanguineo"
          value={formData.grupoSanguineo}
          onChange={handleChange}
        />
      </div>
      <div className="flex w-full gap-3 items-center justify-end">
        <Button variant="cancel" type="button" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>
      <div className="h-6 text-center w-full">
        <span className="items-center text-sm text-primary-texto">* campos requeridos </span>
        <p id="errores" className="text-xs font-semibold tracking-wider text-primary-400"></p>
      </div>
      <div className="h-6 text-center w-full">
        <span className="items-center text-sm text-primary-texto">{error.message}</span>
        <p id="errores" className="text-xs font-semibold tracking-wider text-primary-400"></p>
      </div>
    </form>
  );
};
