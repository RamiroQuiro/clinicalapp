import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import ModalReact from '@/components/moleculas/ModalReact';
import React, { useEffect, useState } from 'react';
import { atencion } from '../../../../../context/store'; // Importar el store de atencion
import { arrayMotivosIniciales } from '../../../../../utils/arrayMotivosIniciales';

interface ContenedorMotivoInicialV2Props {
  especialidad: string; // La especialidad ahora es una prop
}

const ContenedorMotivoInicialV2: React.FC<ContenedorMotivoInicialV2Props> = ({ especialidad }) => {
  const [motivoGeneralSeleccionado, setMotivoGeneralSeleccionado] = useState('');
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    // Actualizar el store de atencion cuando cambie el motivo general seleccionado
    atencion.set({
      ...atencion.get(),
      motivoGeneral: motivoGeneralSeleccionado,
    });
  }, [motivoGeneralSeleccionado]);

  const arrayABuscar =
    arrayMotivosIniciales.find(
      item => item.especialidad?.toLowerCase() === especialidad.toLowerCase()
    )?.motivos || [];

  const handleAddMotivoInicial = (motivoInicial: string) => {
    // Aquí puedes agregar el nuevo motivo inicial al array de motivos iniciales
    // Por ejemplo, puedes agregarlo al array de motivos iniciales del store
    atencion.set({
      ...atencion.get(),
      motivosIniciales: [...atencion.get().motivosIniciales, motivoInicial],
    });
    setOpenModal(false);
  };

  return (
    <div className="flex flex-col gap-4 bg-  w-full">
      {openModal && (
        <ModalReact onClose={() => setOpenModal(false)} title="Agregar Motivo Inicial" id="">
          <form action="">
            <div>
              <Input label="Motivo Inicial" type="text" name="motivoInicial" />
              <button type="submit">Agregar</button>
            </div>
          </form>
        </ModalReact>
      )}
      <form action="">
        <div className="flex items-center gap-2">
          <label className="w-fit font-semibold text-sm whitespace-normal text-primary-textoTitle">
            Motivo Inicial
          </label>
          <Input type="search" name="motivoInicial" placeholder="Buscar motivo inicial" />
          <div className="flex  gap-2 ">
            <Button variant="secondary">Guardar</Button>
            <Button variant="secondary" onClick={() => setOpenModal(true)}>
              Agregar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContenedorMotivoInicialV2;
