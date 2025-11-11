import { recepcionStore, setMedicoSeleccionado, setProfesionales } from '@/context/recepcion.recepcionista.store';
import { useStore } from '@nanostores/react';
import { Check } from 'lucide-react'; // Asegúrate de tener lucide-react instalado
import { useEffect, useMemo } from 'react';
import Select, { components } from 'react-select';

interface Profesional {
  id: string;
  nombre: string;
  apellido: string;
}

interface OptionType {
  value: string;
  label: string;
}

interface Props {
  profesionales: Profesional[];
}

export default function ContenedorSelectorProfesional({ profesionales }: Props) {
  const { medicoSeleccionadoId } = useStore(recepcionStore);

  // Convertir profesionales a opciones para el Select
  const opciones = useMemo(() => {
    return profesionales.map((profesional) => ({
      value: profesional.id,
      label: `${profesional.nombre} ${profesional.apellido}`,
    }));
  }, [profesionales]);

  // Obtener los valores seleccionados actuales
  const valoresSeleccionados = useMemo(() => {
    return opciones.filter(opcion =>
      medicoSeleccionadoId?.includes(opcion.value)
    );
  }, [opciones, medicoSeleccionadoId]);

  // Efecto para cargar los profesionales
  useEffect(() => {
    if (profesionales) {
      setProfesionales(profesionales);
    }
  }, [profesionales]);

  // Manejador de cambio de selección
  const handleSelection = (opcionesSeleccionadas: readonly OptionType[]) => {
    if (!opcionesSeleccionadas) {
      setMedicoSeleccionado([]);
      return;
    }

    // Obtener solo los IDs de las opciones seleccionadas
    const idsSeleccionados = opcionesSeleccionadas.map(opcion => opcion.value);
    setMedicoSeleccionado(idsSeleccionados);
  };

  // Componente personalizado para mostrar los checkboxes con iconos de Lucide
  const Option = (props: any) => {
    return (
      <components.Option {...props}>
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-5 w-5 mr-2 rounded border ${props.isSelected
            ? 'bg-indigo-600 border-indigo-600'
            : 'border-gray-300 bg-white'
            }`}>
            {props.isSelected && (
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            )}
          </div>
          <span className={props.isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}>
            {props.label}
          </span>
        </div>
      </components.Option>
    );
  };

  // Estilos personalizados para el select
  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: '42px',
      border: '1px solid #e5e7eb',
      '&:hover': {
        borderColor: '#9ca3af',
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#eef2ff',
      borderRadius: '0.375rem',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#5B92D9',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#818cf8',
      ':hover': {
        backgroundColor: '#c7d2fe',
        color: '#5B92D9',
      },
    }),
  };

  return (
    <div className="w-full">
      <Select
        isSearchable
        isMulti
        options={opciones}
        value={valoresSeleccionados}
        onChange={handleSelection}
        placeholder="Seleccione profesionales..."
        noOptionsMessage={() => "No hay opciones disponibles"}
        className="text-sm"
        classNamePrefix="select"
        components={{ Option }}
        styles={customStyles}
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
        controlShouldRenderValue={false}
      />


    </div>
  );
}
