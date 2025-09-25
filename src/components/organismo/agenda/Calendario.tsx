import { fechaSeleccionada } from '@/context/agenda.store';
import { useStore } from '@nanostores/react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const meses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
const diasSemana = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

const formatWeekdayName = (day: Date) => {
  return diasSemana[day.getDay()];
};

const formatMonthCaption = (month: Date) => {
  return `${meses[month.getMonth()]} ${month.getFullYear()}`;
};

export default function Calendario() {
  const selectedDay = useStore(fechaSeleccionada);

  const handleSelect = (date: Date | undefined) => {
    fechaSeleccionada.set(date);
  };

  return (
    <div>
      <DayPicker
        mode="single"
        selected={selectedDay}
        onSelect={handleSelect}
        formatters={{ formatWeekdayName, formatMonthCaption }}
        className="w-full m-auto flex items-center justify-center"
        styles={{
          caption: { color: '#1E1B4B' },
          head: { color: '#1E1B4B' },
          day: {
            borderRadius: '5px',
            margin: '2px',
            border: '1px solid #cccccc50',
          },
        }}
      />
    </div>
  );
}
