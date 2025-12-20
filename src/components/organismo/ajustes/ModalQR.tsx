import Button from '@/components/atomos/Button';
import ModalReact from '@/components/moleculas/ModalReact';
import APP_TIME_ZONE from '@/lib/timeZone';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Download, Printer } from 'lucide-react';
import React, { useState } from 'react';

interface ModalQRProps {
  isOpen: boolean;
  onClose: () => void;
  centroMedicoId: string;
  nombreCentro: string;
}

export const ModalQR: React.FC<ModalQRProps> = ({
  isOpen,
  onClose,
  centroMedicoId,
  nombreCentro,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Generar URL del QR para el centro
  const qrUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/publico/autocheckin?centroId=${centroMedicoId}`;

  // Fecha y hora actual para el cartel
  const fechaActual = format(toZonedTime(new Date(), APP_TIME_ZONE), 'dd/MM/yyyy');
  const horaActual = format(toZonedTime(new Date(), APP_TIME_ZONE), 'HH:mm');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      // Mostrar loader
      const loader = document.createElement('div');
      loader.innerHTML = `
                <div class="top-4 right-4 z-50 fixed bg-white shadow-lg p-4 border border-gray-200 rounded-lg w-64 h-1/3 download-loader-container">
                    <div class="flex justify-center items-center gap-3 h-full">
                        <div class="download-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 3v13"/>
                                <path d="m9 13 3 3-3"/>
                                <path d="M20 21H4"/>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <p class="font-medium text-gray-700 text-sm">Descargando PDF</p>
                            <p class="text-gray-500 text-xs">Por favor espere...</p>
                        </div>
                    </div>
                </div>
            `;
      document.body.appendChild(loader);
      loader.style.display = 'block';

      // Llamar al endpoint para generar PDF
      const response = await fetch('/api/public/generar-qr-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          centroMedicoId,
          nombreCentro,
          qrUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar PDF');
      }

      // Descargar el PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cartel-qr-sala-espera-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    } finally {
      // Ocultar loader
      const loader = document.querySelector('.download-loader-container');
      if (loader) {
        loader.remove();
      }
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalReact title={` QR Sala de Espera - ${nombreCentro}`} onClose={onClose}>
      <div
        id="qr-cartel-content"
        className="bg-white mb-6 p-8 border-2 border-gray-300 border-dashed rounded-lg"
        style={{ minHeight: '600px' }}
      >
        {/* Header del cartel */}
        <div className="mb-8 text-center">
          <div className="mb-4">
            <h1 className="mb-2 font-bold text-gray-800 text-3xl">{nombreCentro}</h1>
            <p className="text-gray-600 text-lg">Sala de Espera Digital</p>
          </div>

          <div className="mb-6 text-gray-500 text-sm">
            <p>Fecha: {fechaActual}</p>
            <p>Hora: {horaActual}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white shadow-md mb-4 p-4 border-2 border-gray-200 rounded-lg">
            <div className="flex justify-center items-center bg-gray-50 w-64 h-64">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
                alt="QR para Check-in"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="text-center">
            <h3 className="mb-2 font-semibold text-gray-800 text-xl">Escanee para Check-in</h3>
            <p className="mb-4 text-gray-600">Use su cámara o escanee el código QR</p>
            <p className="text-gray-500 text-sm">
              También puede visitar: <span className="font-mono text-xs break-all">{qrUrl}</span>
            </p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 mb-6 p-6 rounded-lg">
          <h4 className="mb-3 font-semibold text-blue-900">¿Cómo usar?</h4>
          <ol className="space-y-2 text-blue-800 list-decimal list-inside">
            <li>Abra la cámara de su celular</li>
            <li>Apunte hacia el código QR</li>
            <li>Escanee automáticamente o manualmente</li>
            <li>Complete el formulario de check-in</li>
            <li>Espere su llamado en la sala</li>
          </ol>
        </div>

        {/* Footer del cartel */}
        <div className="pt-4 border-t text-gray-500 text-xs text-center">
          <p className="mb-2">Powered by</p>
          <div className="flex justify-center items-center gap-2">
            <span className="font-bold">clínicalApp</span>
            <span>•</span>
            <span className="font-bold">ramaCode</span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-center gap-4">
        <Button onClick={handlePrint} variant="secondary" className="gap-2">
          <Printer size={20} />
          Imprimir Cartel
        </Button>

        <Button
          onClick={handleDownloadPDF}
          variant="primary"
          disabled={isGenerating}
          className="gap-2"
        >
          <Download size={20} />
          {isGenerating ? 'Generando...' : 'Descargar PDF'}
        </Button>
      </div>
    </ModalReact>
  );
};
