import Button from '@/components/atomos/Button';
import Switch from '@/components/atomos/Switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import Input from '../../../../../components/atomos/Input';

// --- 1. DEFINICIÓN DE TIPOS ---
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

interface PerfilHorariosProps {
  userId: string;
}

// --- 2. ESTADO INICIAL POR DEFECTO ---
const initialHorarios: HorariosData = {
  lunes: { isLaboral: true, rangoAtencion: { start: '09:00', end: '17:00' }, rangoDescanso: { start: '12:00', end: '13:00' } },
  martes: { isLaboral: true, rangoAtencion: { start: '09:00', end: '17:00' }, rangoDescanso: { start: '12:00', end: '13:00' } },
  miercoles: { isLaboral: true, rangoAtencion: { start: '09:00', end: '17:00' }, rangoDescanso: { start: '12:00', end: '13:00' } },
  jueves: { isLaboral: true, rangoAtencion: { start: '09:00', end: '17:00' }, rangoDescanso: { start: '12:00', end: '13:00' } },
  viernes: { isLaboral: true, rangoAtencion: { start: '09:00', end: '17:00' }, rangoDescanso: { start: '12:00', end: '13:00' } },
  sabado: { isLaboral: false, rangoAtencion: { start: '00:00', end: '00:00' }, rangoDescanso: { start: '00:00', end: '00:00' } },
  domingo: { isLaboral: false, rangoAtencion: { start: '00:00', end: '00:00' }, rangoDescanso: { start: '00:00', end: '00:00' } },
};

// --- 3. FUNCIÓN DE TRADUCCIÓN ---
const traducirParaUI = (horariosDB: any[]): HorariosData => {
  const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const horariosUI: any = {};

  diasSemana.forEach(dia => {
    const horarioDia = horariosDB.find(h => h.diaSemana === dia);
    if (horarioDia) {
      const tieneDescanso = horarioDia.horaInicioTarde && horarioDia.horaFinManana;
      horariosUI[dia] = {
        isLaboral: horarioDia.activo,
        rangoAtencion: {
          start: horarioDia.horaInicioManana || '00:00',
          end: horarioDia.horaFinTarde || horarioDia.horaFinManana || '00:00',
        },
        rangoDescanso: {
          start: tieneDescanso ? horarioDia.horaFinManana : '00:00',
          end: tieneDescanso ? horarioDia.horaInicioTarde : '00:00',
        },
      };
    } else {
      horariosUI[dia] = { isLaboral: false, rangoAtencion: { start: '00:00', end: '00:00' }, rangoDescanso: { start: '00:00', end: '00:00' } };
    }
  });

  return horariosUI as HorariosData;
};

// --- 4. COMPONENTE PRINCIPAL ---
export default function PerfilHorarios({ userId }: PerfilHorariosProps) {
  const [horarios, setHorarios] = useState<HorariosData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHorarios = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/ajustes/horarios?userId=${userId}`);
        if (!response.ok) throw new Error('No se pudieron cargar los horarios');
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setHorarios(traducirParaUI(data.data));
        } else {
          setHorarios(initialHorarios);
        }
      } catch (error) {
        console.error(error);
        setHorarios(initialHorarios);
      } finally {
        setLoading(false);
      }
    };
    fetchHorarios();
  }, [userId]);

  const handleCheckHorarios = (day: keyof HorariosData) => {
    if (!horarios) return;
    setHorarios(prev => ({ ...prev!, [day]: { ...prev![day], isLaboral: !prev![day].isLaboral } }));
  };

  const handleTimeChange = (day: keyof HorariosData, rangeType: 'rangoAtencion' | 'rangoDescanso', field: 'start' | 'end', value: string) => {
    if (!horarios) return;
    setHorarios(prev => ({ ...prev!, [day]: { ...prev![day], [rangeType]: { ...prev![day][rangeType], [field]: value } } }));
  };

  const handleSave = async () => {
    if (!horarios) return;

    const horariosParaGuardar = Object.keys(horarios).map(dayKey => {
      const day = dayKey as keyof HorariosData;
      const schedule = horarios[day];
      const hasBreak = schedule.rangoDescanso.start < schedule.rangoDescanso.end;
      return {
        diaSemana: day,
        activo: schedule.isLaboral,
        horaInicioManana: schedule.isLaboral ? schedule.rangoAtencion.start : null,
        horaFinManana: schedule.isLaboral ? (hasBreak ? schedule.rangoDescanso.start : schedule.rangoAtencion.end) : null,
        horaInicioTarde: schedule.isLaboral && hasBreak ? schedule.rangoDescanso.end : null,
        horaFinTarde: schedule.isLaboral && hasBreak ? schedule.rangoAtencion.end : null,
      };
    });
    console.log('horariosParaGuardar', horariosParaGuardar);
    try {
      const response = await fetch('/api/ajustes/horarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, horarios: horariosParaGuardar }),
      });
      if (!response.ok) throw new Error('Error al guardar los horarios');
      alert('Horarios guardados con éxito');
    } catch (error) {
      console.error(error);
      alert('Hubo un error al guardar los horarios', error);
    }
  };

  if (loading || !horarios) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="animate-pulse h-4 w-40 bg-gray-200 rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="rounded-lg flex-1">
              <Card className="py-2 px-4 border-gray-200/20 h-full flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <Switch className="w-fit font-bold" checked={null} onChange={() => { }} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input type="time" label="Inicio" disabled={null} value="" onChange={() => { }} />
                  <Input type="time" label="Fin" disabled={null} value="" onChange={() => { }} />
                  <Input type="time" label="Inicio Descanso" disabled={null} value="" onChange={() => { }} />
                  <Input type="time" label="Fin Descanso" disabled={null} value="" onChange={() => { }} />
                </div>
              </Card>
            </div>
          ))}
        </CardContent>
        <div className="p-6 border-t w-full flex items-end justify-end">
          <Button variant="primary" disabled>
            <Save className="mr-2 h-4 w-4" /> Guardar Cambios
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horarios de Atención</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(horarios).map(dayKey => {
          const day = dayKey as keyof HorariosData;
          const daySchedule = horarios[day];
          return (
            <div key={day} className="rounded-lg flex-1">
              <Card className="py-2 px-4 border-primary-100/20 h-full flex flex-col justify-between">
                <Switch label={day.toUpperCase()} className="w-fit font-bold" checked={daySchedule.isLaboral} onChange={() => handleCheckHorarios(day)} />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Input type="time" label="Inicio" disabled={!daySchedule.isLaboral} value={daySchedule.rangoAtencion.start} onChange={e => handleTimeChange(day, 'rangoAtencion', 'start', e.target.value)} />
                  <Input type="time" label="Fin" disabled={!daySchedule.isLaboral} value={daySchedule.rangoAtencion.end} onChange={e => handleTimeChange(day, 'rangoAtencion', 'end', e.target.value)} />
                  <Input type="time" label="Inicio Descanso" disabled={!daySchedule.isLaboral} value={daySchedule.rangoDescanso.start} onChange={e => handleTimeChange(day, 'rangoDescanso', 'start', e.target.value)} />
                  <Input type="time" label="Fin Descanso" disabled={!daySchedule.isLaboral} value={daySchedule.rangoDescanso.end} onChange={e => handleTimeChange(day, 'rangoDescanso', 'end', e.target.value)} />
                </div>
              </Card>
            </div>
          );
        })}
      </CardContent>
      <div className="p-6 border-t w-full flex items-end justify-end">
        <Button variant="primary" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Guardar Cambios
        </Button>
      </div>
    </Card>
  );
}