import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { TextArea } from '@/components/atomos/TextArea';
import { showToast } from '@/utils/toast/toastShow';
import { useState } from 'react';

type Props = {
  atencionId: string;
  onClose: () => void;
};

export default function FormularioEnmienda({ atencionId, onClose }: Props) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim() || !details.trim()) {
      showToast('Ambos campos son obligatorios.', { background: 'bg-red-500' });
      return;
    }

    setIsLoading(true);

    try {
      // Aquí irá la llamada a la API en el futuro
      console.log('Enviando enmienda:', { atencionId, reason, details });
      // const response = await fetch('/api/enmiendas/create', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ atencionId, reason, details }),
      // });

      // const result = await response.json();
      // if (!response.ok) throw new Error(result.message || 'Error en el servidor');

      showToast('Enmienda guardada con éxito', { background: 'bg-green-500' });
      onClose(); // Cierra el modal
    } catch (error) {
      console.error('Error al guardar la enmienda:', error);
      showToast(`Error: ${error.message}`, { background: 'bg-red-500' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 w-[500px]">
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
          Motivo de la Enmienda
        </label>
        <Input
          id="reason"
          name="reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Ej: Corrección de diagnóstico"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
          Detalles de la Enmienda
        </label>
        <TextArea
          id="details"
          name="details"
          value={details}
          onChange={e => setDetails(e.target.value)}
          placeholder="Escriba aquí el texto completo de la enmienda..."
          rows={6}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Enmienda'}
        </Button>
      </div>
    </form>
  );
}
