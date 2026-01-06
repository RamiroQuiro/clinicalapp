import percentiles from '@/lib/percentiles/percentilesPediatricos.json';

export interface LMS {
  L: number;
  M: number;
  S: number;
}

export type SexoPaciente = 'niño' | 'niña';
export type TipoMedida = 'peso' | 'talla' | 'imc' | 'perimetroCefalico';

const tipoMedidaMap: Record<TipoMedida, string> = {
  peso: 'peso',
  talla: 'talla',
  imc: 'imc',
  perimetroCefalico: 'perimetroCefalico',
};

export const calcularPercentilAproximado = (
  valorPaciente: number,
  curvas: any[],
  edadMeses: number,
  percentilesObjetivo: number[]
): number | null => {
  try {
    // Filtrar curvas para la edad actual del paciente
    const curvasEdadActual = curvas.filter(
      d => Math.abs(d.edad - edadMeses) <= 1 // Margen de ±1 mes
    );

    if (curvasEdadActual.length === 0) return null;

    // Obtener valores de percentiles para esta edad
    const valoresPercentiles = percentilesObjetivo
      .map(p => {
        const punto = curvasEdadActual.find(d => d.percentil === p);
        return punto ? { percentil: p, valor: punto.valor } : null;
      })
      .filter(Boolean) as { percentil: number; valor: number }[];

    if (valoresPercentiles.length < 2) return null;

    // Ordenar por valor
    valoresPercentiles.sort((a, b) => a.valor - b.valor);

    // Caso: valor menor que el percentil mínimo
    if (valorPaciente <= valoresPercentiles[0].valor) {
      return valoresPercentiles[0].percentil;
    }

    // Caso: valor mayor que el percentil máximo
    if (valorPaciente >= valoresPercentiles[valoresPercentiles.length - 1].valor) {
      return valoresPercentiles[valoresPercentiles.length - 1].percentil;
    }

    // Interpolar entre percentiles
    for (let i = 0; i < valoresPercentiles.length - 1; i++) {
      const current = valoresPercentiles[i];
      const next = valoresPercentiles[i + 1];

      if (valorPaciente >= current.valor && valorPaciente <= next.valor) {
        const proporcion = (valorPaciente - current.valor) / (next.valor - current.valor);
        const percentilAprox =
          current.percentil + proporcion * (next.percentil - current.percentil);
        return Math.round(percentilAprox);
      }
    }

    return null;
  } catch (error) {
    console.error('Error calculando percentil aproximado:', error);
    return null;
  }
};

// Función para interpretar el percentil
export const interpretarPercentil = (percentil: number | null): string => {
  if (percentil === null) return '';

  if (percentil >= 85) return 'Por encima del promedio';
  if (percentil <= 15) return 'Por debajo del promedio';
  return 'Dentro del promedio';
};

/**
 * Calcula parámetros LMS reales a partir de los percentiles
 */
const calcularLMSDesdePercentiles = (punto: any): LMS => {
  const { percentil3, percentil50, percentil97 } = punto;

  // Estimación de S usando la diferencia entre P97 y P50 (aproximación log-normal)
  const S = (Math.log(percentil97) - Math.log(percentil50)) / 2.0;

  // Para medidas pediátricas, L suele ser cercano a 1
  const L = 1.0;

  return {
    L,
    M: percentil50,
    S: Math.max(S, 0.05), // Evita valores demasiado pequeños
  };
};

/**
 * Interpolación lineal simple
 */
const interpolate = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

/**
 * Obtiene los parámetros LMS para una edad, medida y sexo específicos
 */
export const getLMSParaEdad = (
  edadMeses: number,
  tipoMedida: TipoMedida,
  sexo: SexoPaciente
): LMS | null => {
  try {
    const sexoKey = sexo === 'niño' ? 'Nino' : 'Nina';
    const dataKey = `${tipoMedidaMap[tipoMedida]}Edad${sexoKey}` as keyof typeof percentiles;
    const data = percentiles[dataKey];

    if (!data || !Array.isArray(data)) {
      console.warn(`No se encontraron datos para: ${dataKey}`);
      return null;
    }

    // Filtra puntos válidos y ordena por edad
    const puntosValidos = data
      .filter((d: any) => d.edadMeses !== undefined && d.percentil50 !== undefined)
      .sort((a, b) => a.edadMeses - b.edadMeses);

    if (puntosValidos.length === 0) return null;

    // Encuentra el punto exacto o los puntos para interpolación
    const puntoExacto = puntosValidos.find(d => d.edadMeses === edadMeses);
    if (puntoExacto) {
      return calcularLMSDesdePercentiles(puntoExacto);
    }

    // Encuentra puntos adyacentes para interpolación
    const lower = puntosValidos.filter(d => d.edadMeses < edadMeses).pop();
    const upper = puntosValidos.find(d => d.edadMeses > edadMeses);

    if (!lower || !upper) return null;

    // Interpolación lineal
    const t = (edadMeses - lower.edadMeses) / (upper.edadMeses - lower.edadMeses);
    const lmsLower = calcularLMSDesdePercentiles(lower);
    const lmsUpper = calcularLMSDesdePercentiles(upper);

    return {
      L: interpolate(lmsLower.L, lmsUpper.L, t),
      M: interpolate(lmsLower.M, lmsUpper.M, t),
      S: interpolate(lmsLower.S, lmsUpper.S, t),
    };
  } catch (error) {
    console.error('Error en getLMSParaEdad:', error);
    return null;
  }
};

/**
 * Calcula el Z-score de un valor usando parámetros LMS
 */
export const calcularZScore = (valor: number, lms: LMS): number => {
  const { L, M, S } = lms;

  if (L !== 0) {
    return (Math.pow(valor / M, L) - 1) / (L * S);
  }

  return Math.log(valor / M) / S;
};

/**
 * Convierte Z-score a percentil (0-100)
 */
export const zScoreAPercentil = (z: number): number => {
  // Función de distribución acumulativa normal
  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2.0);
  const t = 1.0 / (1.0 + p * x);
  const erf = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1 + sign * erf) * 100;
};

/**
 * Convierte percentil a Z-score
 */
export const percentilAZScore = (percentil: number): number => {
  if (percentil === 50) return 0;
  if (percentil <= 0) return -Infinity;
  if (percentil >= 100) return Infinity;

  const p = percentil / 100;
  const sign = p < 0.5 ? -1 : 1;
  const q = Math.min(p, 1 - p);

  // Aproximación de Abramowitz & Stegun
  const t = Math.sqrt(-2 * Math.log(q));
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;

  return sign * (t - ((c2 * t + c1) * t + c0) / (((d3 * t + d2) * t + d1) * t + 1.0));
};

/**
 * Obtiene el valor de la medida desde Z-score usando LMS
 */
export const obtenerMedidaDesdeZScore = (zScore: number, lms: LMS): number => {
  const { L, M, S } = lms;

  if (L !== 0) {
    return M * Math.pow(1 + L * S * zScore, 1 / L);
  }

  return M * Math.exp(S * zScore);
};

/**
 * Calcula el percentil de un valor para una edad, sexo y medida específicos
 */
export const calcularPercentil = (
  edadMeses: number,
  valor: number,
  sexo: SexoPaciente,
  tipoMedida: TipoMedida
): number | null => {
  try {
    if (!['niño', 'niña'].includes(sexo)) {
      console.warn('Sexo debe ser "niño" o "niña"');
      return null;
    }

    if (edadMeses < 0 || edadMeses > 240) {
      console.warn('Edad fuera de rango (0-240 meses)');
      return null;
    }

    const lms = getLMSParaEdad(edadMeses, tipoMedida, sexo);
    if (!lms) {
      console.warn('No se pudieron obtener parámetros LMS');
      return null;
    }

    const zScore = calcularZScore(valor, lms);
    const percentil = zScoreAPercentil(zScore);

    return Math.max(0, Math.min(100, percentil)); // Asegura entre 0-100
  } catch (error) {
    console.error('Error en calcularPercentil:', error);
    return null;
  }
};

/**
 * Genera datos para graficar curvas de percentiles
 */
export const generarCurvasPercentiles = (
  tipoMedida: TipoMedida,
  sexo: SexoPaciente,
  percentilesObjetivo: number[] = [3, 15, 50, 85, 97],
  edadMaxMeses: number = 60,
  pasoMeses: number = 0.5
): { edad: number; valor: number; percentil: number }[] => {
  const datosCurva: { edad: number; valor: number; percentil: number }[] = [];

  try {
    for (let edad = 0; edad <= edadMaxMeses; edad += pasoMeses) {
      const lms = getLMSParaEdad(edad, tipoMedida, sexo);
      if (!lms) continue;

      percentilesObjetivo.forEach(p => {
        const zScore = percentilAZScore(p);
        const valor = obtenerMedidaDesdeZScore(zScore, lms);

        if (isFinite(valor) && valor > 0) {
          datosCurva.push({
            edad: Math.round(edad * 10) / 10, // Redondea a 1 decimal
            valor: Math.round(valor * 100) / 100, // Redondea a 2 decimales
            percentil: p,
          });
        }
      });
    }
  } catch (error) {
    console.error('Error en generarCurvasPercentiles:', error);
  }

  return datosCurva;
};

/**
 * Obtiene percentiles exactos para una edad específica (sin interpolación)
 */
export const obtenerPercentilesExactos = (
  edadMeses: number,
  tipoMedida: TipoMedida,
  sexo: SexoPaciente
): Record<string, number> | null => {
  try {
    const sexoKey = sexo === 'niño' ? 'Nino' : 'Nina';
    const dataKey = `${tipoMedidaMap[tipoMedida]}Edad${sexoKey}` as keyof typeof percentiles;
    const data = percentiles[dataKey];

    if (!data || !Array.isArray(data)) return null;

    const puntoExacto = data.find(d => d.edadMeses === edadMeses);
    if (!puntoExacto) return null;

    // Filtra solo las propiedades de percentil
    const resultado: Record<string, number> = {};
    Object.entries(puntoExacto).forEach(([key, value]) => {
      if (key.startsWith('percentil') && typeof value === 'number') {
        resultado[key] = value;
      }
    });

    return resultado;
  } catch (error) {
    console.error('Error en obtenerPercentilesExactos:', error);
    return null;
  }
};

/**
 * Obtiene valores de presión arterial por edad
 */
export const obtenerPresionArterial = (
  edadMeses: number
): { sistolica: number; diastolica: number } | null => {
  try {
    const data = percentiles.presionArterialEdad;
    if (!data || !Array.isArray(data)) return null;

    const punto = data.find(d => d.edadMeses === edadMeses);
    if (!punto) return null;

    return {
      sistolica: punto.sistolica_p50 || 0,
      diastolica: punto.diastolica_p50 || 0,
    };
  } catch (error) {
    console.error('Error en obtenerPresionArterial:', error);
    return null;
  }
};
// En percentiles.services.ts, agrega estas funciones:

/**
 * Calcula el percentil de perímetro cefálico
 */
export const calcularPercentilPC = (
  edadMeses: number,
  valor: number,
  sexo: SexoPaciente
): number | null => {
  return calcularPercentil(edadMeses, valor, sexo, 'perimetroCefalico');
};

/**
 * Obtiene los percentiles de presión arterial para una edad
 */
export const obtenerPercentilesPresionArterial = (
  edadMeses: number
): {
  sistolica: { p50: number; p90: number; p95: number };
  diastolica: { p50: number; p90: number; p95: number };
} | null => {
  try {
    const data = percentiles.presionArterialEdad;
    if (!data || !Array.isArray(data)) return null;

    // Ordenar puntos por edad para asegurar interpolación correcta
    const puntosValidos = data
      .filter(d => d.edadMeses !== undefined)
      .sort((a, b) => a.edadMeses - b.edadMeses);

    if (puntosValidos.length === 0) return null;

    // Caso: exacto o fuera de límites (clipping)
    if (edadMeses <= puntosValidos[0].edadMeses) {
      const p = puntosValidos[0];
      return {
        sistolica: { p50: p.sistolica_p50, p90: p.sistolica_p90, p95: p.sistolica_p95 },
        diastolica: { p50: p.diastolica_p50, p90: p.diastolica_p90, p95: p.diastolica_p95 },
      };
    }

    if (edadMeses >= puntosValidos[puntosValidos.length - 1].edadMeses) {
      const p = puntosValidos[puntosValidos.length - 1];
      return {
        sistolica: { p50: p.sistolica_p50, p90: p.sistolica_p90, p95: p.sistolica_p95 },
        diastolica: { p50: p.diastolica_p50, p90: p.diastolica_p90, p95: p.diastolica_p95 },
      };
    }

    // Buscar puntos adyacentes
    const lower = puntosValidos.filter(d => d.edadMeses <= edadMeses).pop();
    const upper = puntosValidos.find(d => d.edadMeses > edadMeses);

    if (!lower || !upper) return null;

    // Si coincide exactamente con el lower
    if (lower.edadMeses === edadMeses) {
      return {
        sistolica: { p50: lower.sistolica_p50, p90: lower.sistolica_p90, p95: lower.sistolica_p95 },
        diastolica: { p50: lower.diastolica_p50, p90: lower.diastolica_p90, p95: lower.diastolica_p95 },
      };
    }

    // Interpolación lineal
    const t = (edadMeses - lower.edadMeses) / (upper.edadMeses - lower.edadMeses);

    return {
      sistolica: {
        p50: Math.round(interpolate(lower.sistolica_p50, upper.sistolica_p50, t)),
        p90: Math.round(interpolate(lower.sistolica_p90, upper.sistolica_p90, t)),
        p95: Math.round(interpolate(lower.sistolica_p95, upper.sistolica_p95, t)),
      },
      diastolica: {
        p50: Math.round(interpolate(lower.diastolica_p50, upper.diastolica_p50, t)),
        p90: Math.round(interpolate(lower.diastolica_p90, upper.diastolica_p90, t)),
        p95: Math.round(interpolate(lower.diastolica_p95, upper.diastolica_p95, t)),
      },
    };
  } catch (error) {
    console.error('Error en obtenerPercentilesPresionArterial:', error);
    return null;
  }
};

/**
 * Evalúa la presión arterial del paciente
 */
export const evaluarPresionArterial = (
  edadMeses: number,
  sistolica: number,
  diastolica: number
): {
  categoria: string;
  color: string;
  percentilSistolica: number;
  percentilDiastolica: number;
} | null => {
  const percentiles = obtenerPercentilesPresionArterial(edadMeses);
  if (!percentiles) return null;

  // Calcular en qué percentil está la presión del paciente
  const percentilSistolica = calcularPercentilParaPresion(
    sistolica,
    percentiles.sistolica.p50,
    percentiles.sistolica.p90,
    percentiles.sistolica.p95
  );

  const percentilDiastolica = calcularPercentilParaPresion(
    diastolica,
    percentiles.diastolica.p50,
    percentiles.diastolica.p90,
    percentiles.diastolica.p95
  );

  // Determinar categoría
  const categoria = determinarCategoriaPresion(percentilSistolica, percentilDiastolica);

  return {
    categoria,
    color: obtenerColorCategoria(categoria),
    percentilSistolica,
    percentilDiastolica,
  };
};

// Funciones auxiliares para presión arterial
const calcularPercentilParaPresion = (
  valor: number,
  p50: number,
  p90: number,
  p95: number
): number => {
  if (valor <= p50) return 50;
  if (valor <= p90) return 90;
  if (valor <= p95) return 95;
  return 97;
};

const determinarCategoriaPresion = (
  percentilSistolica: number,
  percentilDiastolica: number
): string => {
  if (percentilSistolica >= 95 || percentilDiastolica >= 95) return 'Hipertensión';
  if (percentilSistolica >= 90 || percentilDiastolica >= 90) return 'Prehipertensión';
  return 'Normal';
};

const obtenerColorCategoria = (categoria: string): string => {
  switch (categoria) {
    case 'Hipertensión':
      return 'bg-red-500';
    case 'Prehipertensión':
      return 'bg-orange-400';
    default:
      return 'bg-green-500';
  }
};
