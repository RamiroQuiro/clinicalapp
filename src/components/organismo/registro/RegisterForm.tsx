import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { useEffect, useState } from 'react';

const Step1 = ({ data, setData, nextStep, errors }) => (
  <div className="space-y-6 animate-fade-in-right">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Input
          id="nombre"
          type="text"
          value={data.nombre}
          onChange={e => setData({ ...data, nombre: e.target.value })}
          required
          placeholder="Nombre"
        />
        {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
      </div>
      <div>
        <Input
          id="apellido"
          type="text"
          value={data.apellido}
          onChange={e => setData({ ...data, apellido: e.target.value })}
          required
          placeholder="Apellido"
        />
        {errors.apellido && <p className="text-xs text-red-500 mt-1">{errors.apellido}</p>}
      </div>
    </div>
    <div>
      <Input
        id="email"
        type="email"
        value={data.email}
        onChange={e => setData({ ...data, email: e.target.value })}
        required
        placeholder="Email"
      />
      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
    </div>
    <div>
      <Input
        id="password"
        type="password"
        value={data.password}
        onChange={e => setData({ ...data, password: e.target.value })}
        required
        placeholder="Contraseña"
      />
      {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
    </div>
    <Button onClick={nextStep} variant="primary" className="w-full">
      Siguiente
    </Button>
  </div>
);

const Step2 = ({ data, setData, prevStep, handleSubmit, isLoading, apiError }) => (
  <div className="space-y-6 animate-fade-in-right">
    <div>
      <h3 className="text-lg font-medium text-gray-900">¡Un último paso, {data.nombre}!</h3>
      <p className="mt-1 text-sm text-gray-500">
        Dale un nombre a tu espacio de trabajo. Puede ser tu propio nombre o el de tu clínica.
      </p>
    </div>
    <div>
      <Input
        id="nombreCentro"
        type="text"
        value={data.nombreCentro}
        onChange={e => setData({ ...data, nombreCentro: e.target.value })}
        required
        placeholder="Nombre del Consultorio"
      />
    </div>
    {apiError && <p className="text-sm text-center text-red-600">{apiError}</p>}
    <div className="flex items-center justify-between space-x-4">
      <Button onClick={prevStep} variant="secondary" className="w-1/3">
        Atrás
      </Button>
      <Button onClick={handleSubmit} disabled={isLoading} variant="primary" className="w-2/3">
        {isLoading ? 'Creando cuenta...' : 'Finalizar Registro'}
      </Button>
    </div>
  </div>
);

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    nombreCentro: '',
  });

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'El nombre es requerido.';
    if (!formData.apellido) newErrors.apellido = 'El apellido es requerido.';
    if (!formData.email) newErrors.email = 'El email es requerido.';
    if (formData.password.length < 6)
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => setStep(1);

  useEffect(() => {
    if (step === 2 && formData.nombre && formData.apellido && !formData.nombreCentro) {
      setFormData(prev => ({
        ...prev,
        nombreCentro: `Consultorio de ${prev.nombre} ${prev.apellido}`,
      }));
    }
  }, [step, formData.nombre, formData.apellido]);

  const handleSubmit = async () => {
    if (!formData.nombreCentro) {
      setApiError('El nombre del consultorio es requerido.');
      return;
    }
    setIsLoading(true);
    setApiError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ocurrió un error en el servidor.');
      }

      // Redirección al dashboard en caso de éxito
      window.location.href = '/';
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8">
      {step === 1 && (
        <Step1
          key="step1"
          data={formData}
          setData={setFormData}
          nextStep={nextStep}
          errors={errors}
        />
      )}
      {step === 2 && (
        <Step2
          key="step2"
          data={formData}
          setData={setFormData}
          prevStep={prevStep}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          apiError={apiError}
        />
      )}
    </div>
  );
}
