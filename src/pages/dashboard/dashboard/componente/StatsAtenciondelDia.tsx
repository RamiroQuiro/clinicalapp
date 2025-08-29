import DivReact from '@/components/atomos/DivReact';
// Removed imports: statsDashStore, getFechaUnix, useStore, useEffect, useState

type Props = {
  total: number;
  manana: number;
  tarde: number;
};

export default function StatsAtenciondelDia({ total, manana, tarde }: Props) {
  return (
    <DivReact className="bg-white/30 dark:bg-gray-700/30 backdrop-filter backdrop-blur-lg shadow-lg !border-none">
      <div className="flex w-full items-center gap-2 justify-between border-b pb-1 mb-1">
        <p className="text-sm font-medium text-gray-600">Consultas Hoy</p>
        <span className="text-2xl text-primary-texto">
          {total}
        </span>
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col items-center justify-normal">
          <p className="text-sm font-medium text-gray-600">Mañana</p>
          <h3 className="mt-1 text-xl font-semibold">{manana}</h3>
        </div>
        <div className="flex flex-col items-center justify-normal">
          <p className="text-sm font-medium text-gray-600">Tarde</p>
          <h3 className="mt-1 text-xl font-semibold">{tarde}</h3>
        </div>
      </div>
    </DivReact>
  );
}
