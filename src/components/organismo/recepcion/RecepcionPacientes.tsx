import Input from '@/components/atomos/Input';
import Section from '@/components/moleculas/Section';
import { useEffect, useState } from 'react';
import TurnoCard from '../agenda/TurnoCard';

type Props = {
  userId: string;
};

export default function RecepcionPacientes({ userId }: Props) {
  const [turnos, setTurnos] = useState([]);
  const [turnosConfirmados, setTurnosConfirmados] = useState([]);
  const diaSeleccionado = new Date();
  console.log('turnos ->', turnos);
  const toYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate() - 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fechaFormateada = toYYYYMMDD(diaSeleccionado);
    const fetchAgenda = async () => {
      try {
        const response = await fetch(
          `/api/agenda?fecha=${fechaFormateada}&profesionalId=${userId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTurnos(data.data);
      } catch (error) {
        console.error('Error al obtener la agenda:', error);
      }
    };

    fetchAgenda();
    setTurnosConfirmados(turnos.filter(turno => turno.turnoInfo?.estado === 'confirmado'));
  }, [userId]);
  console.log('turnos confirmados ->', turnosConfirmados);
  return (
    <Section className="flex-1" title="Recepcionde Pacientes">
      <div className="flex flex-col gap-4">
        <Input type="search" placeholder="Buscar paciente" />
        <div className="flex flex-col gap-2">
          {turnosConfirmados.map(turno => (
            <TurnoCard
              slot={turno}
              onVerDetalles={() => {}}
              onReagendar={() => {}}
              onCancelar={() => {}}
              onLlamar={() => {}}
              onWhatsApp={() => {}}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
