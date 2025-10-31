import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import Button from '@/components/atomos/Button';

export default function PerfilDocumentos() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mis Documentos</CardTitle>
        <Button>Subir Documento</Button>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <p className="text-muted-foreground">No hay documentos.</p>
          <p className="text-sm text-muted-foreground">Arrastra y suelta archivos aquí o usa el botón para subirlos.</p>
        </div>
        {/* Aquí se listarían los documentos */}
      </CardContent>
    </Card>
  );
}
