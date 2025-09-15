import Button from '@/components/atomos/Button'; // Importar Button
import ContenedorSignosVitales from '@/components/moleculas/ContenedorSignosVitales';
import Section from '@/components/moleculas/Section';
import MenuDropbox, { type MenuItem } from '@/components/organismo/MenuDropbox';
import {
  AlertCircle,
  Calculator,
  Droplet,
  HeartPulse,
  Percent,
  Ruler,
  Save,
  Settings,
  Thermometer,
  Weight,
  Wind,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react'; // Importar hooks

type Props = {
  signosVitalesHistorial: any;
  handleSignosVitalesChange: any;

  preferenciaPerfilProfesional: any; // Este es el objeto completo del perfil
};
// --- Configuración de Signos Vitales ---
const configuracionSignosVitales = [
  {
    name: 'peso',
    label: 'Peso',
    unit: 'kg',
    icon: <Weight size={18} />,
    showPercentiles: true,
  },
  {
    name: 'talla',
    label: 'Talla',
    unit: 'cm',
    icon: <Ruler size={18} />,
    showPercentiles: true,
  },
  {
    name: 'temperatura',
    label: 'Temperatura',
    unit: '°C',
    icon: <Thermometer size={18} />,
  },
  {
    name: 'perimetroCefalico',
    label: 'Perímetro Cefálico',
    unit: 'cm',
    icon: <Ruler size={18} />,
    showPercentiles: true,
  },
  {
    name: 'presionSiscolica',
    label: 'presion Siscolica',
    unit: 'mmHg',
    icon: <HeartPulse size={18} />,
  },
  {
    name: 'presionDiastolica',
    label: 'presion Diastolica',
    unit: 'mmHg',
    icon: <HeartPulse size={18} />,
  },
  {
    name: 'perimetroAbdominal',
    label: 'Perímetro Abdominal',
    unit: 'cm',
    icon: <Ruler size={18} />,
  },
  {
    name: 'frecuenciaRespiratoria',
    label: 'Frec. Resp.',
    unit: 'rpm',
    icon: <Wind size={18} />,
  },

  {
    name: 'saturacionOxigeno',
    label: 'Sat. O₂',
    unit: '%',
    icon: <Percent size={18} />,
  },

  {
    name: 'imc',
    label: 'IMC',
    unit: 'kg/m²',
    icon: <Calculator size={18} />,
    showPercentiles: true,
  },
  {
    name: 'glucosa',
    label: 'Glucosa',
    unit: 'mg/dL',
    icon: <Droplet size={18} />,
  },
  {
    name: 'dolor',
    label: 'Dolor',
    unit: 'EVA',
    icon: <AlertCircle size={18} />,
  },
];

export default function SignosVitalesPantallaConsulta({
  signosVitalesHistorial,
  handleSignosVitalesChange,
  preferenciaPerfilProfesional,
}: Props) {
  // Inicializa el estado de los checkboxes a partir de las preferencias del perfil
  const initialSelectedVitals = useMemo(() => {
    const selected = {};
    const preferenciasSignos = preferenciaPerfilProfesional?.preferencias?.signosVitales || [];
    configuracionSignosVitales?.forEach(vital => {
      selected[vital.name] = preferenciasSignos.includes(vital.name);
    });
    return selected;
  }, [preferenciaPerfilProfesional]);

  const [selectedVitals, setSelectedVitals] = useState(initialSelectedVitals);
  const [isSaving, setIsSaving] = useState(false);

  const handleVitalSelect = (vitalKey: string) => {
    setSelectedVitals(prev => ({ ...prev, [vitalKey]: !prev[vitalKey] }));
  };

  // Función para guardar las preferencias actualizadas en la base de datos
  const handleGuardarPreferencias = useCallback(async () => {
    setIsSaving(true);

    const vitalesSeleccionadosArray = Object.keys(selectedVitals).filter(
      key => selectedVitals[key]
    );

    const nuevasPreferencias = {
      ...preferenciaPerfilProfesional.preferencias, // Mantiene las preferencias existentes
      signosVitales: vitalesSeleccionadosArray, // Actualiza solo los signos vitales
    };

    try {
      const response = await fetch(
        `/api/users/preferenciasPerfil/${preferenciaPerfilProfesional.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...preferenciaPerfilProfesional, // Envía el objeto completo para la actualización
            preferencias: nuevasPreferencias,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al guardar las preferencias');
      }

      console.log('Preferencias guardadas con éxito!');
      // Aquí podrías mostrar un toast de éxito
    } catch (error) {
      console.error(error);
      // Aquí podrías mostrar un toast de error
    } finally {
      setIsSaving(false);
    }
  }, [selectedVitals, preferenciaPerfilProfesional]);

  // Genera los items del menú (checkboxes)
  const menuItems: MenuItem[] = useMemo(
    () =>
      configuracionSignosVitales?.map(({ name, label }) => ({
        label: label,
        type: 'checkbox',
        isChecked: selectedVitals[name],
        onClick: () => handleVitalSelect(name),
      })) || [],
    [configuracionSignosVitales, selectedVitals]
  );

  // Crea el botón de guardar para el pie del menú
  const footerBotonGuardar = (
    <Button
      variant="blanco"
      onClick={handleGuardarPreferencias}
      disabled={isSaving}
      className="w-full"
    >
      <Save className="w-4 h-4 mr-2" />
      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
    </Button>
  );

  return (
    <Section
      title="Signos Vitales"
      rightContent={
        <MenuDropbox
          items={menuItems}
          triggerIcon={<Settings className="w-5 h-5" />}
          triggerTitle="Seleccionar Signos Vitales"
          closeOnSelect={false} // Mantiene el menú abierto al hacer clic en checkboxes
          footer={footerBotonGuardar} // Añade el botón de guardar en el pie
        />
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {configuracionSignosVitales?.map((vital, _index) => {
          const isActive = selectedVitals[vital.name];
          const historyData =
            signosVitalesHistorial.find(h => h.tipo === vital.name)?.historial || [];
          if (!isActive) {
            return null;
          } else {
            return (
              <ContenedorSignosVitales
                key={vital.name}
                name={vital.name}
                label={vital.label}
                unit={vital.unit}
                icon={vital.icon}
                value={signosVitalesHistorial[vital?.name]}
                onChange={handleSignosVitalesChange}
                history={historyData}
              />
            );
          }
        })}
      </div>
    </Section>
  );
}
