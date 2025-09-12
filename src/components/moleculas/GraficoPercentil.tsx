import { getPercentileCurveData } from '@/services/percentiles.services';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useMemo } from 'react';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GraficoPercentilProps {
  measurementType: 'weight' | 'length' | 'bmi';
  sex: 'boy' | 'girl';
  patientAgeInMonths: number;
  patientMeasurementValue: number;
}

export const GraficoPercentil = ({ measurementType, sex, patientAgeInMonths, patientMeasurementValue }: GraficoPercentilProps) => {
  // Definir los percentiles que queremos mostrar como curvas
  const targetPercentiles = [3, 15, 50, 85, 97];

  // Generar los datos de las curvas y el punto del paciente
  const chartData = useMemo(() => {
    const curves = getPercentileCurveData(measurementType, sex, targetPercentiles);
    
    if (!curves) return { labels: [], datasets: [] };

    // Extraer las edades únicas para las etiquetas del eje X
    const labels = Array.from(new Set(curves.map(d => d.age))).sort((a, b) => a - b);

    const datasets = targetPercentiles.map(p => ({
      label: `P${p}`,
      data: labels.map(age => {
        const point = curves.find(d => d.age === age && d.percentile === p);
        return point ? point.value : null;
      }),
      borderColor: p === 50 ? '#4F46E5' : '#9CA3AF', // Color diferente para la mediana
      backgroundColor: 'transparent',
      borderWidth: p === 50 ? 2 : 1,
      pointRadius: 0, // No mostrar puntos en las curvas
      tension: 0.4,
      spanGaps: true, // Para manejar edades donde no haya datos exactos
    }));

    // Añadir el punto del paciente
    datasets.push({
      label: 'Tu Paciente',
      data: labels.map(age => (age === patientAgeInMonths ? patientMeasurementValue : null)),
      borderColor: '#EF4444', // Rojo para el punto del paciente
      backgroundColor: '#EF4444',
      borderWidth: 0,
      pointRadius: 6,
      pointBackgroundColor: '#EF4444',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      showLine: false, // Solo mostrar el punto, no una línea
    });

    return { labels, datasets };
  }, [measurementType, sex, patientAgeInMonths, patientMeasurementValue]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#4B5563', // Color de texto para la leyenda
        },
      },
      title: {
        display: true,
        text: `Gráfico de Percentiles de ${measurementType === 'weight' ? 'Peso' : measurementType === 'length' ? 'Talla' : 'IMC'} para la Edad`,
        color: '#374151',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y.toFixed(2)} ${measurementType === 'weight' ? 'kg' : measurementType === 'length' ? 'cm' : ''}`; // Añadir unidad
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Edad (meses)',
          color: '#4B5563',
        },
        ticks: {
          color: '#4B5563',
        },
        grid: {
          color: '#E5E7EB',
        },
      },
      y: {
        title: {
          display: true,
          text: measurementType === 'weight' ? 'Peso (kg)' : measurementType === 'length' ? 'Talla (cm)' : 'IMC',
          color: '#4B5563',
        },
        ticks: {
          color: '#4B5563',
        },
        grid: {
          color: '#E5E7EB',
        },
      },
    },
  };

  return (
    <div className="relative h-80 w-full">
      <Line options={options} data={chartData} />
    </div>
  );
};
