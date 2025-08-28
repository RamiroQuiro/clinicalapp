import React from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'; // For trend icons

interface StatsCardV2Props {
  title: string;
  value: string | number;
  icon: React.ElementType; // Lucide React component
  color?: string; // For dynamic styling
  trend?: 'up' | 'down' | 'neutral'; // For trend indicator
  subtitle?: string;
  // New props for morning/afternoon consultations
  manana?: number;
  tarde?: number;
}

const StatsCardV2: React.FC<StatsCardV2Props> = ({
  title,
  value,
  icon: Icon,
  color = 'gray',
  trend = 'neutral',
  subtitle,
  manana,
  tarde,
}) => {
  // Dynamic classes based on color prop (assuming Tailwind config supports these)
  const bgColorClass = `bg-${color}-50`; // Lighter background for the card
  const borderColorClass = `border-${color}-200`; // Border color
  const textColorClass = `text-${color}-800`; // Main text color
  const iconBgClass = `bg-${color}-500`; // Solid background for the icon circle
  const iconColorClass = `text-white`; // White icon color

  // Trend icon and color
  let TrendIcon = Minus;
  let trendColorClass = 'text-gray-500';
  if (trend === 'up') {
    TrendIcon = ArrowUp;
    trendColorClass = 'text-green-500';
  } else if (trend === 'down') {
    TrendIcon = ArrowDown;
    trendColorClass = 'text-red-500';
  }

  return (
    <div
      className={`flex flex-col flex-1 min-w-[200px] p-4 rounded-lg border shadow-sm justify-between gap-2
        ${bgColorClass} ${borderColorClass}`}
    >
      {/* Top section: Title, Value, Icon */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className={`text-sm font-medium ${textColorClass}`}>{title}</p>
          <h3 className={`mt-1 text-3xl font-bold ${textColorClass}`}>{value}</h3>
          {subtitle && <p className={`text-xs font-medium ${textColorClass}`}>{subtitle}</p>}
        </div>
        <div className={`rounded-full p-2 ${iconBgClass}`}>
          <Icon className={`w-6 h-6 ${iconColorClass}`} />
        </div>
      </div>

      {/* Optional: Morning/Afternoon Consultations */}
      {(typeof manana === 'number' || typeof tarde === 'number') && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600">Mañana: <span className="font-semibold">{manana ?? 'N/A'}</span></p>
          <p className="text-xs text-gray-600">Tarde: <span className="font-semibold">{tarde ?? 'N/A'}</span></p>
        </div>
      )}

      {/* Trend indicator */}
      {trend !== 'neutral' && ( // Only show trend if not neutral
        <div className="flex items-center mt-2">
          <TrendIcon className={`w-4 h-4 mr-1 ${trendColorClass}`} />
          <span className={`text-xs font-medium ${trendColorClass}`}>
            {trend === 'up' ? 'Aumento' : 'Disminución'}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatsCardV2;
