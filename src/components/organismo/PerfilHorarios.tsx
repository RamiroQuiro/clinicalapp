import Button from '@/components/atomos/Button';
import Switch from '@/components/atomos/Switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import { Save } from 'lucide-react';
import { useState } from 'react';
import Input from '../atomos/Input';

interface TimeRange {
  start: string;
  end: string;
}

interface DaySchedule {
  isLaboral: boolean;
  rangoAtencion: TimeRange;
  rangoDescanso: TimeRange;
}

interface HorariosData {
  lunes: DaySchedule;
  martes: DaySchedule;
  miercoles: DaySchedule;
  jueves: DaySchedule;
  viernes: DaySchedule;
  sabado: DaySchedule;
  domingo: DaySchedule;
}

const initialHorarios: HorariosData = {
  lunes: {
    isLaboral: true,
    rangoAtencion: { start: '09:00', end: '13:00' },
    rangoDescanso: { start: '12:00', end: '12:00' },
  },
  martes: {
    isLaboral: true,
    rangoAtencion: { start: '09:00', end: '20:00' },
    rangoDescanso: { start: '13:00', end: '17:00' },
  },
  miercoles: {
    isLaboral: true,
    rangoAtencion: { start: '09:00', end: '13:00' },
    rangoDescanso: { start: '13:00', end: '17:00' },
  },
  jueves: {
    isLaboral: true,
    rangoAtencion: { start: '09:00', end: '18:00' },
    rangoDescanso: { start: '15:00', end: '19:00' },
  },
  viernes: {
    isLaboral: true,
    rangoAtencion: { start: '09:00', end: '18:00' },
    rangoDescanso: { start: '12:00', end: '14:00' },
  },
  sabado: {
    isLaboral: false,
    rangoAtencion: { start: '09:00', end: '18:00' },
    rangoDescanso: { start: '12:00', end: '14:00' },
  },
  domingo: {
    isLaboral: false,
    rangoAtencion: { start: '09:00', end: '18:00' },
    rangoDescanso: { start: '12:00', end: '14:00' },
  },
};

export default function PerfilHorarios({ horarios: initialHorariosProp }: { horarios: any }) {
  const [horarios, setHorarios] = useState<HorariosData>(initialHorariosProp || initialHorarios);

  const handleCheckHorarios = (day: keyof HorariosData) => {
    setHorarios(prev => ({
      ...prev,
      [day]: { ...prev[day], isLaboral: !prev[day].isLaboral },
    }));
  };

  const handleAddRange = (day: keyof HorariosData) => {
    setHorarios(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        rangoAtencion: { start: '09:00', end: '17:00' },
        rangoDescanso: { start: '12:00', end: '12:00' },
      },
    }));
  };

  const handleRemoveRange = (day: keyof HorariosData, index: number) => {
    setHorarios(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        rangoAtencion: prev[day].rangoAtencion,
        rangoDescanso: prev[day].rangoDescanso,
      },
    }));
  };

  const handleTimeChange = (
    day: keyof HorariosData,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    setHorarios(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        rangoAtencion: { ...prev[day].rangoAtencion, [field]: value },
        rangoDescanso: { ...prev[day].rangoDescanso, [field]: value },
      },
    }));
  };

  const handleSave = () => {
    console.log('Guardando horarios:', horarios);
    alert('Horarios guardados (simulación)');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horarios de Atención</CardTitle>
      </CardHeader>
      <CardContent className=" grid grid-cols-2 gap-4 items-center justify-between">
        {Object.keys(horarios).map(dayKey => {
          const day = dayKey as keyof HorariosData;
          const daySchedule = horarios[day];

          return (
            <div key={day} className=" rounded-lg flex-1">
              <Card className="py-2 px-4 border-primary-100/20">
                <Switch
                  label={day.toUpperCase()}
                  className="w-fit"
                  checked={daySchedule.isLaboral}
                  onChange={() => handleCheckHorarios(day)}
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    label="Hora Inicio"
                    disabled={!daySchedule.isLaboral}
                    name="horaInicio"
                    value={daySchedule.rangoAtencion.start}
                    onChange={e => handleTimeChange(day, 0, 'start', e.target.value)}
                  />
                  <Input
                    type="time"
                    label="Hora Fin"
                    disabled={!daySchedule.isLaboral}
                    name="horaFin"
                    value={daySchedule.rangoAtencion.end}
                    onChange={e => handleTimeChange(day, 0, 'end', e.target.value)}
                  />
                  <Input
                    type="time"
                    label="Hora Descanso"
                    disabled={!daySchedule.isLaboral}
                    name="horaDescanso"
                    value={daySchedule.rangoDescanso.start}
                    onChange={e => handleTimeChange(day, 0, 'start', e.target.value)}
                  />
                  <Input
                    type="time"
                    label="Hora Fin Descanso"
                    disabled={!daySchedule.isLaboral}
                    name="horaFinDescanso"
                    value={daySchedule.rangoDescanso.end}
                    onChange={e => handleTimeChange(day, 0, 'end', e.target.value)}
                  />
                </div>
              </Card>
            </div>
          );
        })}
      </CardContent>
      <div className="h-4 w-full border-b border-primary-100/20 mb-4" />

      <CardContent className="flex items-start flex-col  gap-4">
        <CardHeader>
          <CardTitle>Configuración de Agenda</CardTitle>
        </CardHeader>
        <div className="flex items-start gap-4">
          <Card className="w-full px-4 py-2">
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Switch label="Permitir Sobreturnos" />
                  <p className="text-sm text-muted-foreground pl-2">
                    Permite agendar turnos adicionales fuera del horario normal.
                  </p>
                </div>
                <Input label="Máximo Sobreturnos por Día" type="number" placeholder="5" />
                <Input
                  label="Anticipación Máxima para Agendar (días)"
                  type="number"
                  placeholder="90"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Turnos por día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input type="number" label="Cantidad de Turnos" name="cantidadTurnos" value={'0'} />
                <Input
                  type="time"
                  label="Duración de Turnos"
                  name="horaInicio"
                  value={'00:00'}
                  onChange={e => handleTimeChange(day, 0, 'start', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <div className="p-6 border-t w-full flex items-end justify-end">
        <Button variant="primary" onClick={handleSave}>
          <Save className="mr-2" /> Guardar
        </Button>
      </div>
    </Card>
  );
}
