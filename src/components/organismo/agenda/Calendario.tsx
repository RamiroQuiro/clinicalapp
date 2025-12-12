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

const formatWeekdayName = (day: Date) => diasSemana[day.getDay()];
const formatMonthCaption = (month: Date) => `${meses[month.getMonth()]} ${month.getFullYear()}`;

type DayOccupancy = {
  [key: string]: {
    estado: string;
    color: string;
    colorClaro: string;
    porcentaje: number;
    profesionales: { [profId: string]: number };
    totalTurnos: number;
    turnosPorProfesional: { [profId: string]: number };
    esLicencia?: boolean;
  };
};

export default function Calendario({
  onSelect,
  selectedDay,
  dayOccupancy = {},
}: {
  onSelect: (date: Date | undefined) => void;
  selectedDay: Date;
  dayOccupancy?: DayOccupancy;
}) {
  const formatDateToYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const modifiers = {
    full: (day: Date) => dayOccupancy[formatDateToYYYYMMDD(day)]?.estado === 'full',
    ocupacionAlta: (day: Date) =>
      dayOccupancy[formatDateToYYYYMMDD(day)]?.estado === 'ocupacionAlta',
    ocupacionMedia: (day: Date) =>
      dayOccupancy[formatDateToYYYYMMDD(day)]?.estado === 'ocupacionMedia',
    disponible: (day: Date) => dayOccupancy[formatDateToYYYYMMDD(day)]?.estado === 'disponible',
    licencia: (day: Date) => !!dayOccupancy[formatDateToYYYYMMDD(day)]?.esLicencia,
  };

  const modifiersStyles = {
    full: { backgroundColor: '#fecaca', color: '#dc2626', border: '1px solid #dc2626' },
    ocupacionAlta: { backgroundColor: '#fed7aa', color: '#ea580c', border: '1px solid #ea580c' },
    ocupacionMedia: { backgroundColor: '#fef08a', color: '#ca8a04', border: '1px solid #ca8a04' },
    disponible: { backgroundColor: '#bbf7d0', color: '#16a34a', border: '1px solid #16a34a' },
    licencia: { backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #6b7280' }, // Naranja distinto para licencia
  };

  const DayContent = (props: any) => {
    const date = props.date;
    const dateKey = formatDateToYYYYMMDD(date);
    const occupancyData = dayOccupancy[dateKey];

    if (!occupancyData) return <div className="relative z-10">{new Date(date).getDate()}</div>;

    const porcentaje = Math.round(occupancyData.porcentaje || 0);
    const totalTurnos = occupancyData.totalTurnos || 0;

    let tooltipLines = [`Ocupación: ${porcentaje}%`, `Turnos: ${totalTurnos}`];

    if (occupancyData.esLicencia) {
      tooltipLines = [`📅 Licencia Médica`];
    }

    return (
      <div className="relative flex items-center justify-center group overflow-visible z-10">
        {date.getDate()}
        <div
          className="
          absolute bottom-[115%] left-1/2 -translate-x-1/2
          bg-gray-900 text-white text-xs rounded-md px-2 py-1
          opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200
          whitespace-pre z-50 shadow-lg
        "
        >
          {tooltipLines.join('\n')}
        </div>
      </div>
    );
  };

  return (
    <div className="relative overflow-visible">
      <DayPicker
        mode="single"
        selected={selectedDay}
        onSelect={onSelect}
        formatters={{ formatWeekdayName, formatMonthCaption }}
        className="w-full m-auto flex items-center justify-center overflow-"
        modifiers={modifiers}
        components={{
          DayContent: props => <DayContent {...props} />,
        }}
        modifiersStyles={modifiersStyles}
        styles={{
          caption: { color: '#5B92D9' },
          head: { color: '#5B92D9' },
          day: {
            borderRadius: '5px',
            margin: '2px',
            border: '1px solid #cccccc50',
            overflow: 'visible', // 🔥 clave para tooltip
          },
        }}
      />
    </div>
  );
}
