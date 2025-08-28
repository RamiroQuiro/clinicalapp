import DivReact from '@/components/atomos/DivReact';

type Props = {
  title: string;
  value: string;
  icon: string;
  color?: string;
  trend?: string;
  subtitle?: string;
};

export default function StatsCard({ title, value, icon: Icon, color, trend, subtitle }: Props) {
  return (
    <DivReact>
      <div className="flex w-full items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold">{value}</h3>
          {subtitle && <p className="text-sm font-medium text-gray-600">{subtitle}</p>}
        </div>
        <div className={`rounded-full bg-primary-150 p-2`}>
          <Icon className="w-5" />
        </div>
      </div>
      <div className="mt-4"></div>
    </DivReact>
  );
}
