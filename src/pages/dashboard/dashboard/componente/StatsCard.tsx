import { TrendingDown, TrendingUp } from 'lucide-react';

type Props = {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  trend?: string;
  subtitle?: string;
};

export default function StatsCard({ id, title, value, icon: Icon, color, trend, subtitle }: Props) {
  return (
    <div className="flex flex-col flex-1 0px] p-4 bg-gradient-to-tr from-primary-100/20 to-primary-400/20 hover:-translate-y-1 overflow-hi hover:-translate-x-0.5 rounded-lg border duration-300 border-gray-200 shadow-sm justify-between gap-2 relative group">
      <div className="absolute top-0 rounded-lg left-0 w-full h-full bg-white backdrop-blur-sm z-0 group-hover:bg-white/70 duration-200 group-hover:shadow-[0_0_20px_10px_#5FA5FA24]"></div>
      <div className="z-0 flex flex-col w-full">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="text-primary-textoTitle w-full bg-primary- p-2  flex items-center gap-2">
            <Icon className="w-5" />
            <div>
              <h3 className="text-lg font-bold text-primary-textoTitle">{title}</h3>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <h3 className="mt-1 text-3xl  text-primary-textoTitle font-semibold">{value}</h3>
        </div>
        <div className="flex w-fit items-center justify-between h-10">
          {id !== 'consultasHoy' ? (
            <div className="text-xs flex items-center justify-start gap-2 text-indigo-600 bg-indigo-50 py-1 px-2 rounded-full border border-indigo-200">
              {subtitle === 'upPeriodoActual' ? (
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> periodo actual
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" /> periodo anterior
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs flex items-center justify-start gap-2 text-indigo-600 bg-indigo-50 py-1 px-2 rounded-full border border-indigo-200">
              constanta tarde contula mañana
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

type PropsStatsCard = {
  id: string;
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'primary100';
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  percentage?: number;
  comparison?: string;
};

const colorSchemes = {
  blue: {
    gradient: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    text: 'text-blue-900',
    trendUp: 'text-green-600',
    trendDown: 'text-red-600',
  },
  primary100: {
    gradient: 'from-primary-100 to-primary-150',
    border: 'border-primary-100/20',
    iconBg: 'bg-primary-100/90',
    iconColor: 'text-white',
    text: 'text-primary-texto',
    trendUp: 'text-green-600',
    trendDown: 'text-red-600',
  },
  green: {
    gradient: 'from-green-50 to-green-100',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    text: 'text-green-900',
    trendUp: 'text-green-600',
    trendDown: 'text-red-600',
  },
  orange: {
    gradient: 'from-orange-50 to-orange-100',
    border: 'border-orange-200',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    text: 'text-orange-900',
    trendUp: 'text-green-600',
    trendDown: 'text-red-600',
  },
  purple: {
    gradient: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    text: 'text-purple-900',
    trendUp: 'text-green-600',
    trendDown: 'text-red-600',
  },
  red: {
    gradient: 'from-red-50 to-red-100',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    text: 'text-red-900',
    trendUp: 'text-green-600',
    trendDown: 'text-red-600',
  },
};

export function StatsCardV2({
  id,
  title,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  subtitle,
  percentage,
  comparison,
}: PropsStatsCard) {
  const scheme = colorSchemes[color];

  return (
    <div
      className={`
      relative group p-6 rounded-xl border-2 transition-all duration-300 
      hover:scale-[1.02] flex-1 hover:shadow-lg hover:border-${color}-300
      ${scheme.gradient} ${scheme.border}
      backdrop-blur-sm bg-white/50
    `}
    >
      {/* Efecto de brillo al hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Header con icono y título */}
        <div className="flex  items-center gap-2 w-full justify-between mb-4">
          <div className={`p-2 rounded-lg ${scheme.iconBg}`}>
            <Icon className={`w-6 h-9 ${scheme.iconColor}`} />
          </div>

          {/* Badge de tendencia */}
          {trend && percentage && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {trend === 'up' ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {percentage}%
            </div>
          )}

          {/* Valor principal */}
          <div className="mb-2 flex-1 ">
            <h3 className={`text-3xl font-bold ${scheme.text}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            <p className={`text-sm font-medium ${scheme.text} opacity-80`}>{title}</p>
          </div>
        </div>
        {/* Footer con información contextual */}
        <div className="flex items-center justify-between">
          {id !== 'consultasHoy' ? (
            <div className={`flex items-center gap-2 text-xs ${scheme.text} opacity-70`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span>{subtitle === 'upPeriodoActual' ? 'Período actual' : 'Período anterior'}</span>
            </div>
          ) : (
            <div className={`text-xs ${scheme.text} opacity-70`}>
              {comparison || 'Comparativa con período anterior'}
            </div>
          )}

          {/* Indicador sutil */}
          <div
            className={`w-2 h-2 rounded-full ${
              trend === 'up' ? 'bg-green-400' : trend === 'down' ? 'bg-red-400' : 'bg-gray-400'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export function StatsCardMinimal({ id, title, value, icon: Icon, trend, subtitle }: Props) {
  return (
    <div className="group p-5 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">{title}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>

        {trend && (
          <div
            className={`p-1 rounded ${
              trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          {id !== 'consultasHoy'
            ? subtitle === 'upPeriodoActual'
              ? '📈 Período actual'
              : '📉 Período anterior'
            : '📊 Comparativa constante'}
        </p>
      </div>
    </div>
  );
}
