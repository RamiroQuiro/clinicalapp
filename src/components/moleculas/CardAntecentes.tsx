import formatDate from '@/utils/formatDate';
import { AlertCircle, Heart, Pencil } from 'lucide-react';
import type { Antecedente } from '../../types';
import Button3 from '../atomos/Button3';

type Props = {
  data: Antecedente;
  onEdit: (antecedente: Antecedente) => void; // Callback to handle edit action
};

export default function CardAntecentes({ data, onEdit }: Props) {
  return (
    <div className="flex items-start gap-4 p-2 border border-gray-200/50 rounded-md bg-primary-bg-componentes">
      <div
        className={`w-8 h-8 rounded-full ${data.estado !== 'controlado' ? 'bg-red-100' : 'bg-primary-150'} flex items-center justify-center`}
      >
        {data.estado !== 'controlado' ? (
          <AlertCircle size={16} className="text-red-800" />
        ) : (
          <Heart size={16} className="text-primary-texto" />
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-medium text-sm uppercase">{data?.antecedente}</h3>
        <p className="text-xs text-muted-foreground">
          Diagnosticado: {formatDate(data?.fechaDiagnostico)}
        </p>
      </div>
      <Button3
        className={`px-2 py-1 text-xs font-medium bg-accent items-center justify-center`}
        onClick={() => onEdit(data)}
      >
        <Pencil size={16} className="mx-auto" /> <p className="text-[10px] mx-auto">Editar</p>
      </Button3>
    </div>
  );
}

