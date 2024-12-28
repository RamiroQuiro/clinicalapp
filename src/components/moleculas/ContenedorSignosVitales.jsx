import { useState, useEffect } from 'react';
import { useStore } from "@nanostores/react";
import { atencion } from "../../context/store";

const ContenedorSignosVitales = ({ svg, medida, label, name }) => {
  const $signosVitales = useStore(atencion);

  // Inicializa el estado con el valor correspondiente en signosVitales
  const [signoVital, setSignoVital] = useState($signosVitales.signosVitales[name] || '');

  useEffect(() => {
    // Sincroniza el estado local con el store de Nanostores cuando cambia $signosVitales
    setSignoVital($signosVitales.signosVitales[name] || '');
  }, [$signosVitales, name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignoVital(value);
    atencion.set({ ...$signosVitales, signosVitales: { ...$signosVitales.signosVitales, [name]: value } });
  };

  return (
    <div className="flex items-center justify-start w-full py-0.5 px-1 bg-white border border-gray-500/30 rounded-lg">
      <div className="flex items-center justify-start gap-1">
        <div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: svg }}></div>
        <span className="text-xs font-bold break-words px-1">{label}</span>
      </div>
      <div className="flex items-center gap-x-2">
        <div className="w-12">
          <input
            disabled={false}
            value={signoVital}
            onChange={handleChange}
            className="border border-gray-500/50 w-full px-2 py-1 text-sm rounded-lg outline-none ring-0"
            type="number"
            name={name}
          />
        </div>
        <span className="text-xs tracking-tighter font-light break-words px-1">{medida}</span>
      </div>
    </div>
  );
};

export default ContenedorSignosVitales;
