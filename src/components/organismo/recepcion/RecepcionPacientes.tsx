import Input from '@/components/atomos/Input';
import Section from '@/components/moleculas/Section';
import { useStore } from '@nanostores/react';
import { recepcionStore } from '../../../context/recepcion.store';
import TurnoCard from '../agenda/TurnoCard';

type Props = {
  userId: string;
};

export default function RecepcionPacientes({ userId }: Props) {
  // 1. El componente ahora lee directamente del store
  const { turnosDelDia, isLoading } = useStore(recepcionStore);

  // 2. La lógica de filtrado se mantiene, pero usando los datos del store
  const turnosConfirmados = turnosDelDia.filter(
    (turno: any) => turno.turnoInfo?.estado === 'confirmado'
  );

  if (isLoading) {
    return <Section className="flex-1" title="Recepcion de Pacientes"><p>Cargando...</p></Section>
  }

  return (
    <Section className="flex-1" title="Recepción de Pacientes">
      <div className="flex flex-col gap-4">
        <Input type="search" placeholder="Buscar paciente" />
        <div className="flex flex-col gap-2">
          {turnosConfirmados.map((turno: any) => (
            <TurnoCard
              key={turno.id}
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
