import Section from '@/components/moleculas/Section';
import { Files } from 'lucide-react';
import SectionArchivosAtencion from './SectionArchivosAtencion';

type Props = {
  $consulta: any;
  handleFormChange: any;
  pacienteId: string;
};

export default function ContenedorDocumentacionAnexos({
  $consulta,
  handleFormChange,
  pacienteId,
}: Props) {
  return (
    <Section title="Estudios y Solicitudes" isCollapsible defaultOpen={false} icon={Files}>
      <SectionArchivosAtencion $consulta={$consulta} />
      {/* <div className="border-t border-gray-100 pt-4">
        <SectionNotasMedicas
          $consulta={$consulta}
          handleFormChange={handleFormChange}
          pacienteId={pacienteId}
        />
      </div> */}
    </Section>
  );
}
