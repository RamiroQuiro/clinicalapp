// components/moleculas/GraficoPercentil.tsx
import {
  calcularPercentilAproximado,
  generarCurvasPercentiles,
  interpretarPercentil,
} from '@/services/percentiles.services';
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
  modoVisualizacion?: 'estandar' | 'accesible' | 'bebe';
  tooltipsMejorados?: boolean;
}

// Determinar rango de edad apropiado
const determinarRangoEdad = (edadMeses: number): number => {
  if (edadMeses <= 12) return 12;
  if (edadMeses <= 24) return 24;
  if (edadMeses <= 60) return 60; // Up to 5 years
  if (edadMeses <= 120) return 120; // Up to 10 years
  if (edadMeses <= 228) return 228; // Up to 19 years
  return 228;
};

// Determinar paso de muestreo apropiado
const determinarPaso = (edadMaxima: number): number => {
  if (edadMaxima <= 12) return 0.5;
  if (edadMaxima <= 24) return 1;
  return 2;
};

// Paletas de colores para diferentes modos
const PALETAS = {
  estandar: {
    p50: '#4F46E5',
    otros: '#9CA3AF',
    paciente: '#EF4444',
    fondo: '#FFFFFF',
  },
  accesible: {
    p50: '#2563EB', // Azul más oscuro
    p3: '#16A34A', // Verde
    p15: '#D97706', // Naranja
    p85: '#9333EA', // Púrpura
    p97: '#DC2626', // Rojo
    paciente: '#000000', // Negro para máximo contraste
    fondo: '#F9FAFB',
  },
  bebe: {
    p50: '#EC4899', // Rosa
    p3: '#8B5CF6', // Púrpura
    p15: '#06B6D4', // Cian
    p85: '#F59E0B', // Ámbar
    p97: '#10B981', // Verde esmeralda
    paciente: '#F97316', // Naranja vibrante
    fondo: '#FDF2F8',
  },
};

export const GraficoPercentil = ({
  tipoMedida,
  sexo,
  edadMeses,
  valorPaciente,
  unidad,
  modoVisualizacion = 'estandar',
  tooltipsMejorados = false,
}: GraficoProps) => {
  const percentilesObjetivo = [3, 15, 50, 85, 97];
  const edadMaxima = determinarRangoEdad(edadMeses);
  const pasoMeses = determinarPaso(edadMaxima);
  const paleta = PALETAS[modoVisualizacion];

  // Generar datos de percentiles
  const { datosGrafico, percentilPaciente } = useMemo(() => {
    const curvas = generarCurvasPercentiles(
      tipoMedida as any,
      sexo,
      percentilesObjetivo,
      edadMaxima,
      pasoMeses
    );

    if (!curvas) return { datosGrafico: { labels: [], datasets: [] }, percentilPaciente: null };

    const etiquetas = Array.from(new Set(curvas.map(d => d.edad)))
      .sort((a, b) => a - b)
      .map(edad => {
        if (edad < 12) return `${edad}m`;
        if (edad < 24) return `${Math.floor(edad / 12)}a ${edad % 12}m`;
        return `${Math.floor(edad / 12)}a`;
      });

    // Calcular percentil REAL del paciente
    const percentilPacienteReal = calcularPercentilAproximado(
      valorPaciente,
      curvas,
      edadMeses,
      percentilesObjetivo
    );

    const datasets = percentilesObjetivo.map(p => {
      let color;
      if (modoVisualizacion === 'estandar') {
        color = p === 50 ? paleta.p50 : (paleta as any).otros || '#9CA3AF';
      } else {
        color = (paleta as any)[`p${p}`] || '#9CA3AF';
      }

      return {
        label: `P${p}`,
        data: etiquetas.map((_, index) => {
          const edad = curvas.filter(d => d.percentil === p)[index]?.edad;
          const punto = curvas.find(d => d.edad === edad && d.percentil === p);
          return punto ? punto.valor : null;
        }),
        borderColor: color,
        backgroundColor: 'transparent',
        borderWidth: p === 50 ? 3 : 2,
        borderDash: modoVisualizacion === 'accesible' && p !== 50 ? [5, 5] : [],
        pointRadius: 0,
        tension: 0.4,
        spanGaps: true,
        order: 1, // Dibuja las líneas de percentiles primero (fondo)
      };
    });

    // Punto del paciente
    const indiceEdadPaciente = curvas
      .filter(d => d.percentil === 50)
      .findIndex(d => Math.abs(d.edad - edadMeses) <= pasoMeses / 2);

    if (indiceEdadPaciente !== -1) {
      datasets.push({
        label: 'Paciente',
        data: etiquetas.map((_, index) => (index === indiceEdadPaciente ? valorPaciente : null)),
        borderColor: paleta.paciente,
        backgroundColor: paleta.paciente,
        borderWidth: 0,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointBackgroundColor: paleta.paciente,
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        showLine: false,
        order: 10, // Dibuja el punto del paciente al final (frente)
      });
    }

    return {
      datosGrafico: { labels: etiquetas, datasets },
      percentilPaciente: percentilPacienteReal,
    };
  }, [
    tipoMedida,
    sexo,
    edadMeses,
    valorPaciente,
    edadMaxima,
    pasoMeses,
    modoVisualizacion,
    paleta,
  ]);

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
        text: `Percentiles de ${tipoMedida.toUpperCase()} - ${sexo}`,
        font: { size: 14 },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false, // ← Oculta la caja de color que ocupa espacio
        callbacks: {
          title: function (tooltipItems: any[]) {
            // Solo mostrar título para el punto del paciente
            if (tooltipItems[0].dataset.label === 'Paciente') {
              return `Edad: ${tooltipItems[0].label}`;
            }
            return '';
          },
          label: function (context: any) {
            const dataset = context.dataset;
            const value = context.parsed.y;

            if (dataset.label === 'Paciente') {
              if (tooltipsMejorados) {
                // 📊 TOOLTIP MEJORADO (con más info)
                const interpretacion = interpretarPercentil(percentilPaciente);
                return [
                  `Paciente: ${value.toFixed(1)} ${unidad}`,
                  percentilPaciente ? `Percentil: P${percentilPaciente}` : '',
                  interpretacion ? `• ${interpretacion}` : '',
                ].filter(line => line !== '');
              } else {
                // 📊 TOOLTIP SIMPLE
                return `Paciente: ${value.toFixed(1)} ${unidad}`;
              }
            } else {
              // Para curvas de percentiles, mostrar info simple
              return `${dataset.label}: ${value.toFixed(1)} ${unidad}`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Edad',
          font: { size: 12, weight: 'bold' },
        },
        ticks: {
          maxRotation: 0,
          font: { size: 10 },
        },
        grid: {
          color: modoVisualizacion === 'accesible' ? '#E5E7EB' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        title: {
          display: true,
          text: unidad ? `${tipoMedida.toUpperCase()} (${unidad})` : tipoMedida.toUpperCase(),
          font: { size: 12, weight: 'bold' },
        },
        grid: {
          color: modoVisualizacion === 'accesible' ? '#E5E7EB' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    hover: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div
      className="relative h-80 w-full min-w-[300px] p-2"
      style={{ backgroundColor: paleta.fondo }}
    >
      <Line options={opciones} data={datosGrafico} />

      {/* Información del percentil fuera del tooltip */}
      {percentilPaciente && (
        <div className="mt-2 p-2 bg-white rounded border text-center text-xs">
          <div className="font-semibold text-gray-700">
            Percentil estimado: <span className="text-blue-600">P{percentilPaciente}</span>
          </div>
          <div className="text-gray-500 text-xs mt-1">
            {interpretarPercentil(percentilPaciente)}
          </div>
        </div>
      )}
    </div>
  );
};
