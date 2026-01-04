import { TextArea } from '@/components/atomos/TextArea';
import Section from '@/components/moleculas/Section';
import { ClipboardList } from 'lucide-react';
import SectionMedicamentos from './SectionMedicamentos';

type Props = {
  $consulta: any;
  consultaStore: any;
  deletMedicamento: any;
  handleFormChange: any;
};

export default function ContenedorTratamientoPlan({
  $consulta,
  consultaStore,
  deletMedicamento,
  handleFormChange,
}: Props) {
  return (
    <Section title="Tratamiento y Plan" isCollapsible defaultOpen={false} icon={ClipboardList}>
      <div className="space-y-4">
        <SectionMedicamentos $consulta={consultaStore.get()} deletMedicamento={deletMedicamento} />
        <div className="border- border-gray-200 py-2">
          <TextArea
            label="Recomendaciones de Tratamiento"
            name="tratamiento"
            value={$consulta.tratamiento}
            onChange={handleFormChange}
            placeholder="Plan de tratamiento..."
          />
        </div>
        <div className="border-t border-gray-200 py-2">
          <TextArea
            label="Plan a Seguir"
            name="planSeguir"
            value={$consulta.planSeguir}
            onChange={handleFormChange}
            placeholder="Próximos pasos..."
          />
        </div>
      </div>
    </Section>
  );
}
