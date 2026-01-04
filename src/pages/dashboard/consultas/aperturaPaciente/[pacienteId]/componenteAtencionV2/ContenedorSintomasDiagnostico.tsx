import { TextArea } from '@/components/atomos/TextArea';
import Section from '@/components/moleculas/Section';
import { FileSliders } from 'lucide-react';
import SectionDiagnostico from './SectionDiagnostico';

type Props = {
  $consulta: any;
  consultaStore: any;
  deletDiagnostico: any;
  handleFormChange: any;
};

export default function ContenedorSintomasDiagnostico({
  $consulta,
  consultaStore,
  deletDiagnostico,
  handleFormChange,
}: Props) {
  return (
    <Section title="Síntomas / Diagnosticos" isCollapsible defaultOpen={false} icon={FileSliders}>
      <TextArea
        name="sintomas"
        label="Síntomas (Anamnesis)"
        value={$consulta.sintomas}
        onChange={handleFormChange}
        placeholder="Síntomas identificados..."
      />
      <SectionDiagnostico $consulta={consultaStore.get()} deletDiagnostico={deletDiagnostico} />
    </Section>
  );
}
