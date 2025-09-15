import { generarCurvasPercentiles } from '@/services/percentiles.services';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface GraficoProps {
  tipoMedida: string;
  sexo: 'niño' | 'niña';
  edadMeses: number;
  valorPaciente: number;
  unidad: string;
}

// Determinar rango de edad apropiado
const determinarRangoEdad = (edadMeses: number): number => {
  if (edadMeses <= 12) return 12;
  if (edadMeses <= 24) return 24;
  if (edadMeses <= 36) return 36;
  return 60;
};

// Determinar paso de muestreo apropiado
const determinarPaso = (edadMaxima: number): number => {
  if (edadMaxima <= 12) return 0.5;
  if (edadMaxima <= 24) return 1;
  return 2;
};

export const GraficoPercentil = ({
  tipoMedida,
  sexo,
  edadMeses,
  valorPaciente,
  unidad,
}: GraficoProps) => {
  const percentilesObjetivo = [3, 15, 50, 85, 97];

  // Configuración adaptable
  const edadMaxima = determinarRangoEdad(edadMeses);
  const pasoMeses = determinarPaso(edadMaxima);

  const datosGrafico = useMemo(() => {
    const curvas = generarCurvasPercentiles(
      tipoMedida as any,
      sexo,
      percentilesObjetivo,
      edadMaxima,
      pasoMeses
    );

    if (!curvas) return { labels: [], datasets: [] };

    const etiquetas = Array.from(new Set(curvas.map(d => d.edad)))
      .sort((a, b) => a - b)
      .map(edad => {
        if (edad < 12) return `${edad}m`;
        if (edad < 24) return `${Math.floor(edad / 12)}a ${edad % 12}m`;
        return `${Math.floor(edad / 12)}a`;
      });

    const datasets = percentilesObjetivo.map(p => ({
      label: `P${p}`,
      data: etiquetas.map((_, index) => {
        const edad = curvas.filter(d => d.percentil === p)[index]?.edad;
        const punto = curvas.find(d => d.edad === edad && d.percentil === p);
        return punto ? punto.valor : null;
      }),
      borderColor: p === 50 ? '#4F46E5' : '#9CA3AF',
      backgroundColor: 'transparent',
      borderWidth: p === 50 ? 3 : 1,
      pointRadius: 0,
      tension: 0.4,
      spanGaps: true,
    }));

    // Punto del paciente
    const indiceEdadPaciente = curvas
      .filter(d => d.percentil === 50)
      .findIndex(d => Math.abs(d.edad - edadMeses) <= pasoMeses / 2);

    if (indiceEdadPaciente !== -1) {
      datasets.push({
        label: 'Paciente',
        data: etiquetas.map((_, index) => (index === indiceEdadPaciente ? valorPaciente : null)),
        borderColor: '#EF4444',
        backgroundColor: '#EF4444',
        borderWidth: 0,
        pointRadius: 6,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        showLine: false,
      });
    }

    return { labels: etiquetas, datasets };
  }, [tipoMedida, sexo, edadMeses, valorPaciente, edadMaxima, pasoMeses]);

  const opciones = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 15,
          font: { size: 11 },
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: `Percentiles de ${tipoMedida.toUpperCase()}`,
        font: { size: 14 },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += `${context.parsed.y.toFixed(2)} ${unidad}`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Edad del niño',
          font: { size: 12, weight: 'bold' },
        },
        ticks: {
          maxRotation: 0,
          font: { size: 10 },
        },
      },
      y: {
        title: {
          display: true,
          text: unidad ? `${tipoMedida.toUpperCase()} (${unidad})` : tipoMedida.toUpperCase(),
          font: { size: 12, weight: 'bold' },
        },
      },
    },
  };

  return (
    <div className="relative h-80 w-full min-w-[300px]">
      <Line options={opciones} data={datosGrafico} />
    </div>
  );
};
