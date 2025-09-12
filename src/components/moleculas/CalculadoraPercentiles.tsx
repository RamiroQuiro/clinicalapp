import { consultaStore } from '@/context/consultaAtencion.store';
import { calculatePercentile } from '@/services/percentiles.services';
import { useStore } from '@nanostores/react';
import { useMemo, useState, useEffect } from 'react'; // Importar useEffect
import Button from '../atomos/Button';

interface Props {
  sex: 'boy' | 'girl';
  birthDate: string | Date;
}

// Helper para calcular la edad en meses (reutilizado)
const getAgeInMonths = (birthDate: string | Date): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months -= birth.getMonth();
  months += today.getMonth();
  return months <= 0 ? 0 : months;
};

// Helper para determinar la categoría del percentil y su color
const getPercentileCategory = (percentile: number) => {
  if (percentile < 3) return { label: 'Muy Bajo', color: 'bg-red-500', textColor: 'text-red-800' };
  if (percentile < 15) return { label: 'Bajo', color: 'bg-orange-400', textColor: 'text-orange-800' };
  if (percentile <= 85) return { label: 'Normal', color: 'bg-green-500', textColor: 'text-green-800' };
  if (percentile < 97) return { label: 'Alto', color: 'bg-orange-400', textColor: 'text-orange-800' };
  return { label: 'Muy Alto', color: 'bg-red-500', textColor: 'text-red-800' };
};

export const CalculadoraPercentiles = ({ sex, birthDate }: Props) => {
  const $consulta = useStore(consultaStore);
  
  const weight = $consulta.signosVitales?.peso;
  const length = $consulta.signosVitales?.talla; // Asumiendo que 'talla' es para la longitud
  const bmi = $consulta.signosVitales?.imc; // Asumiendo que 'imc' es calculado y almacenado

  const [results, setResults] = useState<{ weight?: number | null; length?: number | null; bmi?: number | null }>({});
  const [error, setError] = useState<string | null>(null);

  const ageInMonths = useMemo(() => getAgeInMonths(birthDate), [birthDate]);

  // NUEVO: useEffect para recalcular automáticamente cuando cambian los datos
  useEffect(() => {
    setError(null);
    const newResults: { weight?: number | null; length?: number | null; bmi?: number | null } = {};

    const weightNum = parseFloat(weight);
    const lengthNum = parseFloat(length);

    // Calcular Percentil de Peso
    if (!isNaN(weightNum) && weightNum > 0) {
      newResults.weight = calculatePercentile(ageInMonths, weightNum, sex, 'weight');
    } else {
      newResults.weight = null;
    }

    // Calcular Percentil de Talla
    if (!isNaN(lengthNum) && lengthNum > 0) {
      newResults.length = calculatePercentile(ageInMonths, lengthNum, sex, 'length');
    } else {
      newResults.length = null;
    }

    // Calcular IMC y Percentil de IMC
    if (!isNaN(weightNum) && weightNum > 0 && !isNaN(lengthNum) && lengthNum > 0) {
      const bmiValue = calculateBMI(weightNum, lengthNum);
      if (bmiValue !== null) {
        newResults.bmi = calculatePercentile(ageInMonths, bmiValue, sex, 'bmi');
      } else {
        newResults.bmi = null;
      }
    } else {
      newResults.bmi = null;
    }

    setResults(newResults);

    if (newResults.weight === null && newResults.length === null && newResults.bmi === null) {
      setError('Introduce valores válidos de peso y/o talla para calcular.');
    }
  }, [weight, length, ageInMonths, sex]); // Dependencias: recalcular cuando estos valores cambien

  // Componente para mostrar un solo resultado de percentil
  const PercentileCard = ({ type, value, unit }) => {
    if (value === null) return null; // No renderizar si no hay cálculo válido

    const category = getPercentileCategory(value);
    const barWidth = Math.max(0, Math.min(100, value)); // Asegurar que el ancho esté entre 0 y 100

    return (
      <div className="flex flex-col p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h4 className="text-md font-semibold text-gray-700 mb-2 capitalize">{type}</h4>
        <p className="text-2xl font-bold text-indigo-900 mb-2">P{value.toFixed(1)}</p>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div className={`${category.color} h-2.5 rounded-full`} style={{ width: `${barWidth}%` }}></div>
        </div>
        <p className={`text-sm font-medium ${category.textColor}`}>{category.label}</p>
      </div>
    );
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white mt-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Gráfico de Percentiles (OMS)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Datos pre-cargados y automáticos */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Sexo</label>
          <p className="p-2 border border-gray-300 rounded-md bg-gray-50 capitalize">{sex === 'boy' ? 'Niño' : 'Niña'}</p>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Edad (meses)</label>
          <p className="p-2 border border-gray-300 rounded-md bg-gray-50">{ageInMonths}</p>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Peso (kg)</label>
          <p className="p-2 border border-gray-300 rounded-md bg-gray-50 font-bold">{weight || '--'}</p>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Talla (cm)</label>
          <p className="p-2 border border-gray-300 rounded-md bg-gray-50 font-bold">{length || '--'}</p>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">IMC (kg/m²)</label>
          <p className="p-2 border border-gray-300 rounded-md bg-gray-50 font-bold">{bmi || '--'}</p>
        </div>
      </div>

      {/* REMOVED: Button and its div */}
      {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}

      {/* Mostrar Resultados (ahora se actualizan automáticamente) */}
      {(results.weight !== undefined || results.length !== undefined || results.bmi !== undefined) && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <PercentileCard type="Peso" value={results.weight} unit="kg" />
          <PercentileCard type="Talla" value={results.length} unit="cm" />
          <PercentileCard type="IMC" value={results.bmi} unit="kg/m²" />
        </div>
      )}
    </div>
  );
};
