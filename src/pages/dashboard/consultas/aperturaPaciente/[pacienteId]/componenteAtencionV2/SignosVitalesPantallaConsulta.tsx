import Button from '@/components/atomos/Button';
import ContenedorSignosVitales from '@/components/moleculas/ContenedorSignosVitales';
import Section from '@/components/moleculas/Section';
import MenuDropbox, { type MenuItem } from '@/components/organismo/MenuDropbox';
import { preferenciaPerfilUserStore } from '@/context/preferenciasPerfilUser.store';

import { useStore } from '@nanostores/react';
import {
  AlertCircle,
  Backpack,
  Calculator,
  Droplet,
  HeartPulse,
  Percent,
  Ruler,
  Save,
  Settings,
  Stethoscope,
  Thermometer,
  Weight,
  Wind,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Props = {
  signosVitalesHistorial: any;
  handleSignosVitalesChange: any;
  userId: string;
};

// --- Configuración de Signos Vitales ---
const configuracionSignosVitales = [
  {
    nombre: 'peso',
    etiqueta: 'Peso',
    unidad: 'kg',
    icono: <Weight size={18} />,
    mostrarPercentiles: true,
  },
  {
    nombre: 'talla',
    etiqueta: 'Talla',
    unidad: 'cm',
    icono: <Ruler size={18} />,
    mostrarPercentiles: true,
  },
  {
    nombre: 'temperatura',
    etiqueta: 'Temperatura',
    unidad: '°C',
    icono: <Thermometer size={18} />,
  },
  {
    nombre: 'perimetroCefalico',
    etiqueta: 'Perímetro Cefálico',
    unidad: 'cm',
    icono: <Ruler size={18} />,
    mostrarPercentiles: true,
  },
  {
    nombre: 'presionSistolica',
    etiqueta: 'Presión Sistólica',
    unidad: 'mmHg',
    icono: <HeartPulse size={18} />,
  },
  {
    nombre: 'presionDiastolica',
    etiqueta: 'Presión Diastólica',
    unidad: 'mmHg',
    icono: <HeartPulse size={18} />,
  },
  {
    nombre: 'perimetroAbdominal',
    etiqueta: 'Perímetro Abdominal',
    unidad: 'cm',
    icono: <Ruler size={18} />,
  },
  {
    nombre: 'frecuenciaRespiratoria',
    etiqueta: 'Frec. Resp.',
    unidad: 'rpm',
    icono: <Wind size={18} />,
  },
  {
    nombre: 'saturacionOxigeno',
    etiqueta: 'Sat. O₂',
    unidad: '%',
    icono: <Percent size={18} />,
  },
  {
    nombre: 'imc',
    etiqueta: 'IMC',
    unidad: 'kg/m²',
    icono: <Calculator size={18} />,
    mostrarPercentiles: true,
  },
  {
    nombre: 'glucosa',
    etiqueta: 'Glucosa',
    unidad: 'mg/dL',
    icono: <Droplet size={18} />,
  },
  {
    nombre: 'dolor',
    etiqueta: 'Dolor',
    unidad: 'EVA',
    icono: <AlertCircle size={18} />,
  },
];

export default function SignosVitalesPantallaConsulta({
  signosVitalesHistorial,
  handleSignosVitalesChange,
  userId,
}: Props) {
  const $preferenciasPerfilUsuario = useStore(preferenciaPerfilUserStore);
  const [signosSeleccionados, setSignosSeleccionados] = useState<Record<string, boolean>>({});

  const [guardando, setGuardando] = useState(false);

  // 1. INICIALIZACIÓN DE SIGNOS SELECCIONADOS
  useEffect(() => {
    const inicializarSignosSeleccionados = () => {
      const seleccionados: Record<string, boolean> = {};
      const camposPreferidos =
        $preferenciasPerfilUsuario?.preferencias?.signosVitales?.campos || [];

      configuracionSignosVitales.forEach(signo => {
        seleccionados[signo.nombre] = camposPreferidos.includes(signo.nombre);
      });

      setSignosSeleccionados(seleccionados);
    };

    inicializarSignosSeleccionados();
  }, [$preferenciasPerfilUsuario]);

  // 2. MANEJO DE SELECCIÓN DE SIGNOS
  const manejarSeleccionSigno = useCallback((claveSigno: string) => {
    setSignosSeleccionados(prev => ({
      ...prev,
      [claveSigno]: !prev[claveSigno],
    }));
  }, []);

  const handleResetPreferencias = async () => {
    try {
      const response = await fetch(
        `/api/users/preferenciasPerfil/${userId}?reset=true&perfilId=${$preferenciasPerfilUsuario?.id}`,
        { method: 'GET' }
      );

      if (response.ok) {
        console.log('Preferencias reseteadas correctamente');
      }
    } catch (error) {
      console.error('Error al resetear:', error);
    }
  };

  // 3. GUARDADO DE PREFERENCIAS
  // Función para guardar las preferencias actualizadas
  const manejarGuardarPreferencias = useCallback(async () => {
    setGuardando(true);

    try {
      const camposSeleccionados = Object.keys(signosSeleccionados).filter(
        clave => signosSeleccionados[clave]
      );

      // 1. Crear SOLO el objeto de preferencias (sin toda la metadata)
      const preferenciasActualizadas = {
        configuracionGeneral: $preferenciasPerfilUsuario?.preferencias?.configuracionGeneral,
        signosVitales: {
          mostrar: true,
          campos: camposSeleccionados,
        },
        consulta: $preferenciasPerfilUsuario?.preferencias?.consulta,
        reportes: $preferenciasPerfilUsuario?.preferencias?.reportes,
      };

      console.log('Preferencias a guardar:', preferenciasActualizadas);

      // 2. Enviar SOLO las preferencias, no todo el objeto
      const respuesta = await fetch(
        `/api/users/preferenciasPerfil/perfiles/${$preferenciasPerfilUsuario?.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferencias: preferenciasActualizadas, // ← Solo enviar esto
          }),
        }
      );

      if (!respuesta.ok) {
        throw new Error('Error al guardar las preferencias');
      }

      console.log('Preferencias guardadas con éxito!');
    } catch (error) {
      console.error('Error guardando preferencias:', error);
    } finally {
      setGuardando(false);
    }
  }, [signosSeleccionados, $preferenciasPerfilUsuario, userId]);
  // 4. GENERACIÓN DE ITEMS DEL MENÚ
  const itemsMenu: MenuItem[] = useMemo(
    () =>
      configuracionSignosVitales.map(({ nombre, etiqueta }) => ({
        label: etiqueta,
        type: 'checkbox',
        isChecked: signosSeleccionados[nombre],
        onClick: () => manejarSeleccionSigno(nombre),
      })),
    [configuracionSignosVitales, signosSeleccionados, manejarSeleccionSigno]
  );

  // 5. botonera del menudropbox
  const botonGuardarPie = (
    <div className="flex  gap-1">
      <Button className="w-fit" variant="" onClick={handleResetPreferencias} disabled={guardando}>
        <Backpack className="w-4 h-4 mr-1" />
        reset
      </Button>
      <Button
        variant="green"
        onClick={manejarGuardarPreferencias}
        disabled={guardando}
        className="w-full"
      >
        <Save className="w-4 h-4 mr-1" />
        {guardando ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </div>
  );

  // 6. FILTRAR SIGNOS VISIBLES
  const signosVisibles = useMemo(() => {
    return configuracionSignosVitales.filter(signo => signosSeleccionados[signo.nombre] !== false);
  }, [signosSeleccionados]);

  return (
    <Section
      isCollapsible
      defaultOpen={true}
      title={`Signos Vitales`}
      icon={Stethoscope}
      rightContent={
        <MenuDropbox
          items={itemsMenu}
          triggerIcon={<Settings className="w-5 h-5" />}
          triggerTitle="Seleccionar Signos Vitales"
          closeOnSelect={false}
          footer={botonGuardarPie}
        />
      }
    >
      <div className="flex flex-wrap gap-2">
        {signosVisibles.map(signo => {
          const datosHistorial =
            signosVitalesHistorial.find((h: any) => h.tipo === signo.nombre)?.historial || [];

          return (
            <ContenedorSignosVitales
              key={signo.nombre}
              name={signo.nombre}
              label={signo.etiqueta}
              unit={signo.unidad}
              icon={signo.icono}
              value={signosVitalesHistorial[signo.nombre]}
              onChange={handleSignosVitalesChange}
              history={datosHistorial}
            />
          );
        })}
      </div>
    </Section>
  );
}
