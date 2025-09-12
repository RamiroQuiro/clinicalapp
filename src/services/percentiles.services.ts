import wfaData from '@/lib/percentiles/who-wfa-boys-0-24_lms.json';
import lfaData from '@/lib/percentiles/lfa_boys_0_to_24_lms.json';
import bmiData from '@/lib/percentiles/bmi_boys_0_to_24_lms';

// Interfaz para asegurar que los datos tienen la forma correcta
interface LMS {
  Month: number;
  L: number;
  M: number;
  S: number;
}

// Mapeo de tipos de medida a sus respectivos datos LMS
const growthData: { [key: string]: LMS[] } = {
  'weight': wfaData,
  'length': lfaData,
  'bmi': bmiData,
};

/**
 * Encuentra los valores L, M, S para una edad específica y tipo de medida usando interpolación lineal.
 * @param ageInMonths La edad del niño en meses.
 * @param measurementType El tipo de medida ('weight', 'length' o 'bmi').
 * @returns Un objeto con los valores L, M, S interpolados.
 */
const getLMSForAge = (ageInMonths: number, measurementType: 'weight' | 'length' | 'bmi'): { L: number; M: number; S: number } | null => {
  const data = growthData[measurementType];
  if (!data) {
    console.error(`Tipo de medida no soportado: ${measurementType}`);
    return null;
  }

  // Encuentra los dos puntos de datos entre los que se encuentra la edad
  const lowerBound = data.filter(d => d.Month <= ageInMonths).pop();
  const upperBound = data.find(d => d.Month > ageInMonths);

  // Si no se encuentran los límites (ej. edad fuera de rango), no se puede calcular
  if (!lowerBound || !upperBound) {
    // console.error("Edad fuera del rango de los datos disponibles para este tipo de medida.");
    return null;
  }

  // Si la edad coincide exactamente con un punto de datos, no se necesita interpolar
  if (lowerBound.Month === ageInMonths) {
    return { L: lowerBound.L, M: lowerBound.M, S: lowerBound.S };
  }

  // Cálculo de la interpolación lineal
  const t = (ageInMonths - lowerBound.Month) / (upperBound.Month - lowerBound.Month);
  
  const L = lowerBound.L + t * (upperBound.L - lowerBound.L);
  const M = lowerBound.M + t * (upperBound.M - lowerBound.M);
  const S = lowerBound.S + t * (upperBound.S - lowerBound.S);

  return { L, M, S };
};

/**
 * Calcula el Z-Score para una medida dada, usando los parámetros LMS.
 * @param measurement El valor medido (ej. peso en kg).
 * @param lms Los parámetros L, M, S para la edad y sexo correspondientes.
 * @returns El Z-Score calculado.
 */
const calculateZScore = (measurement: number, lms: { L: number; M: number; S: number }): number => {
  const { L, M, S } = lms;
  
  if (L !== 0) {
    return (Math.pow(measurement / M, L) - 1) / (L * S);
  } else {
    return Math.log(measurement / M) / S;
  }
};

/**
 * Convierte un Z-Score a un percentil.
 * @param z El Z-Score.
 * @returns El percentil (0-100).
 */
const zScoreToPercentile = (z: number): number => {
  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2.0);
  const t = 1.0 / (1.0 + p * x);
  const erf = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  const percentile = 0.5 * (1.0 + sign * erf);

  return percentile * 100;
};

/**
 * Convierte un percentil a un Z-Score.
 * Esta es la inversa de zScoreToPercentile.
 * @param percentile El percentil (0-100).
 * @returns El Z-Score correspondiente.
 */
const percentileToZScore = (percentile: number): number => {
  // Esta es una aproximación inversa de la CDF normal estándar.
  // Para mayor precisión, se podría usar una librería estadística o una tabla de búsqueda.
  // Implementación basada en la aproximación de Beasley y Springer (1977).
  if (percentile === 50) return 0; // Percentil 50 es Z-score 0
  if (percentile === 0) return -Infinity;
  if (percentile === 100) return Infinity;

  const p = percentile / 100;
  const sign = p < 0.5 ? -1 : 1;
  const q = p < 0.5 ? p : 1 - p;

  const t = Math.sqrt(-2 * Math.log(q));
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;

  const z = sign * (t - ((c2 * t + c1) * t + c0) / (((d3 * t + d2) * t + d1) * t + 1.0));
  return z;
};

/**
 * Calcula la medida (peso, talla, IMC) correspondiente a un Z-Score dado y parámetros LMS.
 * Esta es la inversa de calculateZScore.
 * @param zScore El Z-Score.
 * @param lms Los parámetros L, M, S.
 * @returns La medida correspondiente.
 */
const getMeasurementForZScore = (zScore: number, lms: { L: number; M: number; S: number }): number => {
  const { L, M, S } = lms;

  if (L !== 0) {
    return M * Math.pow(1 + L * S * zScore, 1 / L);
  } else {
    return M * Math.exp(S * zScore);
  }
};

/**
 * Función principal para calcular el percentil de crecimiento para cualquier medida.
 * @param ageInMonths Edad en meses.
 * @param measurement El valor medido (ej. peso en kg, talla en cm, IMC).
 * @param sex Sexo ('boy' o 'girl'). Por ahora solo 'boy' está implementado.
 * @param measurementType El tipo de medida ('weight', 'length' o 'bmi').
 * @returns El percentil calculado, o null si no se pudo calcular.
 */
export const calculatePercentile = (ageInMonths: number, measurement: number, sex: 'boy' | 'girl', measurementType: 'weight' | 'length' | 'bmi'): number | null => {
  // Por ahora, solo tenemos datos para niños (boys)
  if (sex !== 'boy') {
    console.error("El cálculo para niñas aún no está implementado.");
    return null;
  }

  const lms = getLMSForAge(ageInMonths, measurementType);
  if (!lms) {
    return null; // Error ya logueado en la función interna
  }

  const zScore = calculateZScore(measurement, lms);
  const percentile = zScoreToPercentile(zScore);

  return percentile;
};

/**
 * Genera los datos para dibujar las curvas de percentiles para un tipo de medida y sexo.
 * @param measurementType El tipo de medida ('weight', 'length' o 'bmi').
 * @param sex Sexo ('boy' o 'girl').
 * @param targetPercentiles Un array de percentiles objetivo (ej: [3, 15, 50, 85, 97]).
 * @returns Un array de objetos con { age: number, value: number, percentile: number } para cada punto de la curva.
 */
export const getPercentileCurveData = (measurementType: 'weight' | 'length' | 'bmi', sex: 'boy' | 'girl', targetPercentiles: number[]): { age: number; value: number; percentile: number }[] | null => {
  if (sex !== 'boy') {
    console.error("La generación de curvas para niñas aún no está implementada.");
    return null;
  }

  const curveData: { age: number; value: number; percentile: number }[] = [];
  const data = growthData[measurementType];

  if (!data) {
    console.error(`Tipo de medida no soportado para curvas: ${measurementType}`);
    return null;
  }

  // Iterar sobre un rango de edades (ej. de 0 a 24 meses, en incrementos de 0.5 meses)
  for (let age = 0; age <= 24; age += 0.5) {
    const lms = getLMSForAge(age, measurementType);
    if (lms) {
      targetPercentiles.forEach(p => {
        const zScore = percentileToZScore(p);
        const value = getMeasurementForZScore(zScore, lms);
        curveData.push({ age: age, value: value, percentile: p });
      });
    }
  }
  return curveData;
};