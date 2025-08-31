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
      <div className="z-20 flex flex-col w-full">
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
