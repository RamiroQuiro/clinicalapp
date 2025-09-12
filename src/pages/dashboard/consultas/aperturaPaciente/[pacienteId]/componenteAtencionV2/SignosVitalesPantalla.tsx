import Section from '@/components/moleculas/Section';
import { CalculadoraPercentiles } from '@/components/moleculas/CalculadoraPercentiles';
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
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

// Registramos los componentes de Chart.js que vamos a usar
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- Paleta de Colores para los Gráficos ---
const chartColors = [
  { borderColor: '#818cf8', backgroundColor: 'rgba(129, 140, 248, 0.2)' }, // Indigo
  { borderColor: '#facc15', backgroundColor: 'rgba(250, 204, 21, 0.2)' }, // Yellow
  { borderColor: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.2)' }, // Green
  { borderColor: '#fb923c', backgroundColor: 'rgba(251, 146, 60, 0.2)' }, // Orange
];

// --- Componente para un solo Gráfico ---
const VitalSignChart = ({ title, history, unit, color }) => {
  if (!history || history.length < 2) {
    return null; // No renderizar si no hay al menos 2 puntos de datos
  }

  const sortedHistory = [...history].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const labels = sortedHistory.map(entry => new Date(entry.fecha).toLocaleDateString());
  const dataValues = sortedHistory.map(entry => entry.valor);

  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: dataValues,
        borderColor: color.borderColor,
        backgroundColor: color.backgroundColor,
        tension: 0.2,
        borderWidth: 2,
        pointBackgroundColor: color.borderColor,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `${title} (${unit})`,
        color: '#e5e7eb',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { color: '#d1d5db' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      x: {
        ticks: { color: '#d1d5db' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  return (
    <div className="p-4 bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-xl h-64 shadow-lg">
      <Line options={options} data={data} />
    </div>
  );
};

// --- Componente Principal de la Pantalla ---
export const SignosVitalesPantalla = ({ signosVitalesHistorial, paciente }) => {
  const [historial, setHistorial] = useState(signosVitalesHistorial || []);

  useEffect(() => {
    if (signosVitalesHistorial) {
      setHistorial(signosVitalesHistorial);
    }
  }, [signosVitalesHistorial]);

  const vitalInfo = {
    tensionArterial: { label: 'Tensión Arterial', unit: 'mmHg' },
    frecuenciaCardiaca: { label: 'Frecuencia Cardíaca', unit: 'lpm' },
    frecuenciaRespiratoria: { label: 'Frecuencia Respiratoria', unit: 'rpm' },
    temperatura: { label: 'Temperatura', unit: '°C' },
    saturacionOxigeno: { label: 'Saturación de Oxígeno', unit: '%' },
    peso: { label: 'Peso', unit: 'kg' },
    talla: { label: 'Talla', unit: 'cm' },
    imc: { label: 'IMC', unit: 'kg/m²' },
    glucosa: { label: 'Glucosa', unit: 'mg/dL' },
  };

  const chartsToDisplay = historial.filter(vital => vital.historial && vital.historial.length >= 2);

  const sexForCalculator: 'boy' | 'girl' | undefined = 
    paciente?.sexo?.toLowerCase() === 'masculino' ? 'boy' : 
    paciente?.sexo?.toLowerCase() === 'femenino' ? 'girl' : 
    undefined;

  return (
    <Section title="Evolución de Signos Vitales">
      {chartsToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {chartsToDisplay.map((vital, index) => (
            <VitalSignChart
              key={vital.tipo}
              title={vitalInfo[vital.tipo]?.label || vital.tipo}
              unit={vitalInfo[vital.tipo]?.unit || ''}
              history={vital.historial}
              color={chartColors[index % chartColors.length]}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
          <p>No hay suficiente historial para mostrar gráficos.</p>
        </div>
      )}

      {/* Calculadora de Percentiles integrada */}
      <div className="mt-8">
        {sexForCalculator && paciente.fNacimiento ? (
          <CalculadoraPercentiles 
            sex={sexForCalculator} 
            birthDate={paciente.fNacimiento} 
          />
        ) : (
          <div className="text-center text-gray-400 p-4 bg-gray-50 rounded-lg mt-4">
            <p>No se pueden calcular los percentiles sin el sexo y la fecha de nacimiento del paciente.</p>
          </div>
        )}
      </div>
    </Section>
  );
};