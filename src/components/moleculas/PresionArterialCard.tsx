// components/moleculas/PresionArterialCard.tsx
import { evaluarPresionArterial } from '@/services/percentiles.services';

interface PresionArterialProps {
  edadMeses: number;
  sistolica: number;
  diastolica: number;
}

export const PresionArterialCard = ({ edadMeses, sistolica, diastolica }: PresionArterialProps) => {
  const evaluacion = evaluarPresionArterial(edadMeses, sistolica, diastolica);

  if (!evaluacion) return null;

  const getColorClass = (categoria: string) => {
    switch (categoria) {
      case 'Hipertensión':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'Prehipertensión':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      default:
        return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  return (
    <div className="flex flex-col p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h4 className="text-md font-semibold text-gray-700 mb-2">Presión Arterial</h4>

      <div className={`p-3 rounded-md border-2 ${getColorClass(evaluacion.categoria)} mb-3`}>
        <p className="font-bold text-center">{evaluacion.categoria}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-center">
          <p className="font-semibold">Sistólica</p>
          <p className="text-lg font-bold">{sistolica} mmHg</p>
          <p className="text-xs text-gray-600">P{evaluacion.percentilSistolica}</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">Diastólica</p>
          <p className="text-lg font-bold">{diastolica} mmHg</p>
          <p className="text-xs text-gray-600">P{evaluacion.percentilDiastolica}</p>
        </div>
      </div>
    </div>
  );
};
