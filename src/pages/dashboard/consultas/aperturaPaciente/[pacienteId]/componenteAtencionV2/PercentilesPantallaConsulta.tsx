// components/organismos/PercentilesPantallaConsulta.tsx
import { GraficoPercentil } from '@/components/moleculas';
import { PresionArterialCard } from '@/components/moleculas/PresionArterialCard'; // ← Import nuevo

type Props = {
  data: any;
  $consulta: any;
};

export default function PercentilesPantallaConsulta({ data, $consulta }: Props) {
  return (
    <details className="w-full group bg-white rounded-lg border">
      <summary className="px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-50">
        <span className="font-semibold text-gray-700">Percentiles de Crecimiento</span>
        <span className="text-sm text-gray-500 group-open:hidden">Ver más</span>
        <span className="text-sm text-gray-500 hidden group-open:inline">Ver menos</span>
      </summary>
      <div className="p-4">
        {(() => {
          if (!data.paciente?.fNacimiento || !data.paciente.sexo) {
            return (
              <div className="text-center text-gray-400 p-4 bg-gray-50 rounded-lg">
                Se requiere fecha de nacimiento y sexo para mostrar percentiles.
              </div>
            );
          }

          const calcularEdadEnMeses = (fechaNacimiento: string) => {
            const hoy = new Date();
            const nacimiento = new Date(fechaNacimiento);
            let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12;
            meses -= nacimiento.getMonth();
            meses += hoy.getMonth();
            return meses <= 0 ? 0 : meses;
          };

          const edadMeses = calcularEdadEnMeses(data.paciente.fNacimiento);
          const sexoOriginal = data.paciente.sexo.toLowerCase();

          const sexo =
            sexoOriginal === 'masculino' ? 'niño' : sexoOriginal === 'femenino' ? 'niña' : null;

          if (!sexo) {
            return (
              <div className="text-center text-gray-400 p-4 bg-gray-50 rounded-lg">
                Sexo no válido. Debe ser "masculino" o "femenino".
              </div>
            );
          }

          const signos = $consulta?.signosVitales || {};
          const peso = signos.peso;
          const talla = signos.talla;
          const perimetroCefalico = signos.perimetroCefalico;
          const presionSistolica = signos.presionSistolica;
          const presionDiastolica = signos.presionDiastolica;
          const imc = peso && talla ? peso / Math.pow(talla / 100, 2) : null;

          const tiposMedida = [
            { clave: 'peso', valor: peso, unidad: 'kg' },
            { clave: 'talla', valor: talla, unidad: 'cm' },
            { clave: 'imc', valor: imc, unidad: 'kg/m²' },
            { clave: 'perimetroCefalico', valor: perimetroCefalico, unidad: 'cm' },
          ];

          // Filtrar medidas que tienen valores válidos
          const medidasValidas = tiposMedida.filter(
            medida => medida.valor && !isNaN(parseFloat(medida.valor))
          );

          // Verificar si hay presión arterial válida
          const tienePresionArterial =
            presionSistolica &&
            !isNaN(parseFloat(presionSistolica)) &&
            presionDiastolica &&
            !isNaN(parseFloat(presionDiastolica));

          if (medidasValidas.length === 0 && !tienePresionArterial) {
            return (
              <div className="text-center text-gray-400 p-4 bg-gray-50 rounded-lg">
                Ingrese valores de signos vitales para ver los percentiles.
              </div>
            );
          }

          return (
            <div className="flex flex-row gap-4 overflow-x-auto p-2">
              {/* Gráficos de percentiles */}
              {medidasValidas.map(medida => (
                <div key={medida.clave} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                  <GraficoPercentil
                    tipoMedida={medida.clave}
                    sexo={sexo}
                    edadMeses={edadMeses}
                    valorPaciente={parseFloat(medida.valor)}
                    unidad={medida.unidad}
                  />
                </div>
              ))}

              {/* Tarjeta de presión arterial (si tiene datos) */}
              {tienePresionArterial && (
                <div className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
                  <PresionArterialCard
                    edadMeses={edadMeses}
                    sistolica={parseFloat(presionSistolica)}
                    diastolica={parseFloat(presionDiastolica)}
                  />
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </details>
  );
}
