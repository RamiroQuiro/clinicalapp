const ContenedorSignosVitales = ({
  icon,
  label,
  unit,
  name,
  value,
  onChange,
  readOnly,
  history = [],
}) => {
  return (
    <div className="group relative flex flex-col flex-1 min-w-[140px] p-3 bg-gray-50 rounded-lg border border-gray-200 items-center justify-center shadow-sm">
      {/* Tooltip con Historial */}
      <div className="hidden absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded-lg p-3 z-10 group-hover:block animate-aparecer">
        <p className="font-bold border-b border-gray-600 pb-1 mb-1">Historial de {label}</p>
        {history && history.length > 0 ? (
          <ul className="space-y-1">
            {history.slice(0, 5).map((entry, index) => (
              <li key={index} className="flex justify-between">
                <span>
                  {entry.valor} {unit}
                </span>
                <span className="text-gray-400">{new Date(entry.fecha).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No hay historial.</p>
        )}
        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
      </div>

      {/* Contenido del Signo Vital */}
      <div className="flex items-center gap-2 mb-1">
        <div className="text-primary-textoTitle">{icon}</div>
        <label htmlFor={name} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      </div>
      <div className="flex items-baseline">
        <input
          id={name}
          name={name}
          type="number"
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className="w-20 text-center text-xl font-bold bg-transparent focus:outline-none appearance-none"
          placeholder="--"
        />
        <span className="text-xs text-gray-500 ml-1">{unit}</span>
      </div>
    </div>
  );
};

export default ContenedorSignosVitales;
