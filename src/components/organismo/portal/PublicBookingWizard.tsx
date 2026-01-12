import Button from '@/components/atomos/Button';
import { Input } from '@/components/atomos/Input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Mail,
  Phone,
  Stethoscope,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface PublicBookingWizardProps {
  centroMedicoId: string;
}

export const PublicBookingWizard: React.FC<PublicBookingWizardProps> = ({ centroMedicoId }) => {
  const [step, setStep] = useState(0); // Empezamos en 0: Selección de Profesional
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [selectedProfesional, setSelectedProfesional] = useState<string | null>(null);
  const [loadingProfesionales, setLoadingProfesionales] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTimeISO, setSelectedTimeISO] = useState<string | null>(null);

  const [patientData, setPatientData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    celular: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Cargar profesionales al montar
  useEffect(() => {
    const loadProfesionales = async () => {
      try {
        const res = await fetch(`/api/public/profesionales?centroId=${centroMedicoId}`);
        const data = await res.json();
        if (res.ok) {
          setProfesionales(data.data);
        }
      } catch (e) {
        console.error('Error cargando profesionales:', e);
      } finally {
        setLoadingProfesionales(false);
      }
    };
    loadProfesionales();
  }, [centroMedicoId]);

  // 2. Cargar disponibilidad cuando cambia profesional o fecha
  useEffect(() => {
    if (selectedProfesional && selectedDate) {
      const loadSlots = async () => {
        setLoadingSlots(true);
        setSelectedTimeISO(null);
        try {
          const fechaStr = format(selectedDate, 'yyyy-MM-dd');
          const res = await fetch(
            `/api/public/disponibilidad?centroId=${centroMedicoId}&profesionalId=${selectedProfesional}&fecha=${fechaStr}`
          );
          const data = await res.json();
          if (res.ok) {
            setAvailableSlots(data.data);
          }
        } catch (e) {
          console.error('Error cargando disponibilidad:', e);
        } finally {
          setLoadingSlots(false);
        }
      };
      loadSlots();
    }
  }, [selectedProfesional, selectedDate, centroMedicoId]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeISO(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientData({
      ...patientData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!selectedProfesional || !selectedTimeISO) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/public/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centroId: centroMedicoId,
          profesionalId: selectedProfesional,
          fechaISO: selectedTimeISO,
          paciente: patientData,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setStep(3);
      } else {
        setErrorMsg(data.message || 'Error al procesar la reserva');
      }
    } catch (e) {
      console.error('Error reservando:', e);
      setErrorMsg('Error de conexión con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const profSelectedData = profesionales.find(p => p.id === selectedProfesional);

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Reserva Iniciada!</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Hemos reservado tu turno temporalmente. <br />
          <strong>Por favor revisa tu email ({patientData.email})</strong> para confirmar tu turno.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
          ℹ️ Tienes 30 minutos para confirmar desde tu correo, o el turno se liberará
          automáticamente.
        </div>
        <Button
          variant="primary"
          onClick={() => (window.location.href = `/turnos/${centroMedicoId}`)}
        >
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Stepper simple visual */}
      <div className="flex items-center justify-center space-x-4 mb-10">
        {[
          { label: 'Médico', s: 0 },
          { label: 'Turno', s: 1 },
          { label: 'Tus Datos', s: 2 },
        ].map((item, idx) => (
          <React.Fragment key={item.label}>
            <div
              className={`flex items-center space-x-2 ${step >= item.s ? 'text-primary-600' : 'text-gray-400'}`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= item.s ? 'border-primary-600 bg-primary-50 font-bold' : 'border-gray-200'}`}
              >
                {item.s + 1}
              </span>
              <span className="hidden sm:inline font-medium">{item.label}</span>
            </div>
            {idx < 2 && <div className="w-8 h-0.5 bg-gray-100"></div>}
          </React.Fragment>
        ))}
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Paso 0: Selección de Profesional */}
      {step === 0 && (
        <div className="animate-fade-in">
          <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary-600" /> ¿Con quién deseas atenderte?
          </h3>
          {loadingProfesionales ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profesionales.map(prof => (
                <button
                  key={prof.id}
                  onClick={() => {
                    setSelectedProfesional(prof.id);
                    handleNext();
                  }}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group ${
                    selectedProfesional === prof.id
                      ? 'border-primary-600 bg-primary-50 shadow-md'
                      : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">
                      {prof.abreviatura} {prof.nombre} {prof.apellido}
                    </p>
                    <p className="text-sm text-gray-500">{prof.especialidad || 'Médico General'}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-600 transition-colors" />
                </button>
              ))}
              {profesionales.length === 0 && (
                <p className="col-span-full py-10 text-center text-gray-400">
                  No hay profesionales disponibles para reserva online en este momento.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Paso 1: Selección de Fecha y Hora */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 w-full">
              <Calendar className="w-5 h-5 text-primary-600" /> Selecciona un día
            </h3>
            <div className="border rounded-xl p-4 bg-white shadow-sm w-full lg:w-auto">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={es}
                disabled={{ before: new Date() }}
                modifiersStyles={{
                  selected: { backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px' },
                }}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" /> Horarios Disponibles
            </h3>
            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 bg-gray-50/50">
                <Calendar className="w-10 h-10 mb-2 opacity-20" />
                <p>Elige un día en el calendario</p>
              </div>
            ) : loadingSlots ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {availableSlots.map(timeISO => {
                  const dateObj = new Date(timeISO);
                  const timeStr = dateObj.toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <button
                      key={timeISO}
                      onClick={() => setSelectedTimeISO(timeISO)}
                      className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                        selectedTimeISO === timeISO
                          ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                          : 'bg-white border-2 border-gray-100 hover:border-primary-200 hover:text-primary-600 text-gray-700'
                      }`}
                    >
                      {timeStr}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 bg-gray-50/50">
                <Clock className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-center px-4">No hay horarios disponibles para este día.</p>
              </div>
            )}

            <div className="mt-10 flex gap-3">
              <Button variant="cancel" onClick={handleBack} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> Atrás
              </Button>
              <Button
                variant="primary"
                disabled={!selectedTimeISO}
                onClick={handleNext}
                className="flex-[2]"
              >
                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Paso 2: Datos del Paciente */}
      {step === 2 && (
        <div className="max-w-md mx-auto animate-fade-in">
          <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <User className="w-6 h-6 text-primary-600" /> Completa tus datos
          </h3>

          <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-start gap-3 mb-8 shadow-sm">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-bold text-primary-900">Resumen del turno</p>
              <p className="text-sm text-primary-700 capitalize">
                {format(selectedDate!, "EEEE d 'de' MMMM", { locale: es })} a las{' '}
                {new Date(selectedTimeISO!).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                hs
              </p>
              <p className="text-xs text-primary-600 mt-1">
                Médico: {profSelectedData?.abreviatura} {profSelectedData?.nombre}{' '}
                {profSelectedData?.apellido}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                name="nombre"
                value={patientData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre"
              />
              <Input
                label="Apellido"
                name="apellido"
                value={patientData.apellido}
                onChange={handleInputChange}
                placeholder="Tu apellido"
              />
            </div>

            <Input
              label="DNI"
              name="dni"
              value={patientData.dni}
              onChange={handleInputChange}
              placeholder="Sin puntos"
            />

            <div className="relative">
              <Input
                label="Celular"
                name="celular"
                value={patientData.celular}
                onChange={handleInputChange}
                placeholder="Cod. área + número"
              />
              <Phone className="absolute right-3 top-9 w-4 h-4 text-gray-300" />
            </div>

            <div className="relative">
              <Input
                label="Email (Para confirmación)"
                name="email"
                type="email"
                value={patientData.email}
                onChange={handleInputChange}
                placeholder="ejemplo@correo.com"
              />
              <Mail className="absolute right-3 top-9 w-4 h-4 text-gray-300" />
            </div>
          </div>

          <div className="pt-10 flex gap-3">
            <Button variant="cancel" onClick={handleBack} className="flex-1">
              Atrás
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={
                isSubmitting || !patientData.email || !patientData.nombre || !patientData.dni
              }
              className="flex-[2]"
            >
              {isSubmitting ? 'Procesando...' : 'Confirmar Turno'}
            </Button>
          </div>

          <div className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1 bg-gray-50 py-3 rounded-lg border border-gray-100">
            <Lock className="w-3 h-3" /> Tus datos están protegidos por el Centro Médico.
          </div>
        </div>
      )}
    </div>
  );
};
