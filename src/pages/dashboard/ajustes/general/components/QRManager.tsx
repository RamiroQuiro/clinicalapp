import Button from '@/components/atomos/Button';
import { ModalQR } from '@/components/organismo/ajustes/ModalQR';
import { QrCode } from 'lucide-react';
import React, { useState } from 'react';

interface QRManagerProps {
  centroMedicoId?: string;
  nombreCentro?: string;
}

export const QRManager: React.FC<QRManagerProps> = ({
  centroMedicoId = 'centro-id-demo',
  nombreCentro = 'Centro Médico Principal',
}) => {
  const [showModalQR, setShowModalQR] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button variant="primary" className="gap-2" onClick={() => setShowModalQR(true)}>
        <QrCode className="w-4 h-4" /> QR sala de espera
      </Button>

      <Button
        variant="secondary"
        className="gap-2"
        onClick={() => {
          const url = `${window.location.origin}/turnos/${centroMedicoId}`;
          navigator.clipboard.writeText(url);
          // Idealmente usar un toast aqui, por ahora un alert nativo rapido o nada si hay toast global
          alert('Link copiado al portapapeles: ' + url);
        }}
      >
        <div className="flex items-center gap-2">
          <span>🔗</span>
          <span className="hidden sm:inline">Copiar Link Portal</span>
        </div>
      </Button>

      <ModalQR
        isOpen={showModalQR}
        onClose={() => setShowModalQR(false)}
        centroMedicoId={centroMedicoId}
        nombreCentro={nombreCentro}
      />
    </div>
  );
};
