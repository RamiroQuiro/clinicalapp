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
    nombreCentro = 'Centro Médico Principal'
}) => {
    const [showModalQR, setShowModalQR] = useState(false);

    return (
        <>
            <Button
                variant="primary"
                className="gap-2"
                onClick={() => setShowModalQR(true)}
            >
                <QrCode /> QR sala de espera
            </Button>

            <ModalQR
                isOpen={showModalQR}
                onClose={() => setShowModalQR(false)}
                centroMedicoId={centroMedicoId}
                nombreCentro={nombreCentro}
            />
        </>
    );
};
