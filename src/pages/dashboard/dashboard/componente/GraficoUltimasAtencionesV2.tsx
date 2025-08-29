import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

type Atencion = {
  fecha: string; // viene como ISO (ej: "2025-08-26T14:32:01.000Z")
  motivoInicial: string;
  cantidad: number;
};

type Props = {
  atenciones: Atencion[];
};

export default function GraficoUltimasAtenciones({ atenciones }: Props) {
  const datosGrafico = useMemo(() => {
    const etiquetas: string[] = [];
    const datosManiana: number[] = [];
    const datosTarde: number[] = [];
    console.log('dators traidos para el grafico', atenciones);
    const hoy = new Date();
    const mapaFechas = new Map<string, { maniana: number; tarde: number }>();

    // Inicializar últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);

      const etiqueta = fecha.toLocaleDateString('es-AR', {
        weekday: 'short',
        day: 'numeric',
      });

      etiquetas.push(etiqueta);

      mapaFechas.set(fecha.toISOString().split('T')[0], {
        maniana: 0,
        tarde: 0,
      });
    }

    // Procesar atenciones
    if (atenciones?.length > 0) {
      atenciones.forEach(atencion => {
        const fechaAtencion = new Date(atencion.fecha);
        const fechaClave = fechaAtencion.toISOString().split('T')[0];
        const hora = fechaAtencion.getHours();

        if (mapaFechas.has(fechaClave)) {
          const datosDia = mapaFechas.get(fechaClave)!;
          if (hora < 12) {
            datosDia.maniana += 1;
          } else {
            datosDia.tarde += 1;
          }
        }
      });
    }

    // Pasar los valores al array de datos
    for (const claveFecha of mapaFechas.keys()) {
      const datosDia = mapaFechas.get(claveFecha)!;
      datosManiana.push(datosDia.maniana);
      datosTarde.push(datosDia.tarde);
    }

    return {
      labels: etiquetas,
      datasets: [
        {
          label: 'Mañana',
          data: datosManiana,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        },
        {
          label: 'Tarde',
          data: datosTarde,
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
        },
      ],
    };
  }, [atenciones]);

  const opciones = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Atenciones en los Últimos 7 Días',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (!atenciones) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div className="w-full h-96">
      <Bar options={opciones} data={datosGrafico} />
    </div>
  );
}
