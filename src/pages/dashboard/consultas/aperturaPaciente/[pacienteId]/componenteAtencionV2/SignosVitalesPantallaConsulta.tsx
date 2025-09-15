import Button from '@/components/atomos/Button'; // Importar Button
import ContenedorSignosVitales from '@/components/moleculas/ContenedorSignosVitales';
import Section from '@/components/moleculas/Section';
import MenuDropbox, { type MenuItem } from '@/components/organismo/MenuDropbox';
import { Save, Settings } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react'; // Importar hooks

type Props = {
  signosVitalesHistorial: any;
  handleSignosVitalesChange: any;
  vitalSignsConfig: any;
  preferenciaPerfilProfesional: any; // Este es el objeto completo del perfil
};

export default function SignosVitalesPantallaConsulta({
  signosVitalesHistorial,
  handleSignosVitalesChange,
  vitalSignsConfig,
  preferenciaPerfilProfesional,
}: Props) {
  // Inicializa el estado de los checkboxes a partir de las preferencias del perfil
  const initialSelectedVitals = useMemo(() => {
    const selected = {};
    const preferenceSignos = preferenciaPerfilProfesional?.preferencias?.signosVitales || [];
    vitalSignsConfig?.forEach(vital => {
      selected[vital.name] = preferenceSignos.includes(vital.name);
    });
    return selected;
  }, [vitalSignsConfig, preferenciaPerfilProfesional]);

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
      vitalSignsConfig?.map(({ name, label }) => ({
        label: label,
        type: 'checkbox',
        isChecked: selectedVitals[name],
        onClick: () => handleVitalSelect(name),
      })) || [],
    [vitalSignsConfig, selectedVitals]
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
        {vitalSignsConfig?.map((vital, _index) => {
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
