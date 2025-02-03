import {
  ArrowBigRightDash,
  Blocks,
  FileChartColumn,
  Mail,
  MapIcon,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import ConfeccionTablaDiagnosticoHistoriaModal from '../../pages/dashboard/pacientes/[pacienteId]/ConfeccionTablaDiagnosticoHistoriaModal';
import ConfeccionTablaMedicamentosHistoriaModal from '../../pages/dashboard/pacientes/[pacienteId]/ConfeccionTablaMedicamentosHistoriaModal';
import calcularEdad from '../../utils/calcularEdad';
import extraerHora from '../../utils/extraerHora';
import formatDate from '../../utils/formatDate';
import Button3 from '../atomos/Button3';
import DivReact from '../atomos/DivReact';

export default function AtencionExistente({ atencionData, onClose }) {
  let edad = calcularEdad(atencionData?.pacienteData?.fNacimiento);
  console.log(atencionData);

  return (
    <div className="flex flex-col items-start gap-2 justify-normal w-full print:fixed ">
      <div className="flex items-center  sticky top-0 py-3 bg-primary-bg-componentes justify-between w-full mb- pb-2 border-b ">
        <h2 className="text-xl font-semibold ">
          Atención del día {formatDate(atencionData?.atencionData?.created_at)}, profesional:{' '}
          <span className="capitalize">
            {atencionData?.atencionData.nombreDoctor} {atencionData?.atencionData.apellidoDoctor}
          </span>
        </h2>

        <div className="flex items-center justify-normal gap-2">
          <Button3>Pdf</Button3>
          <Button3>impirmir</Button3>
          {onClose && <Button3 onClick={onClose}>X</Button3>}
        </div>
      </div>
      <DivReact>
        <div className="w-full items-center justify-evenly gap-2  flex">
          <p className="capitalize font- tracking-tight">
            Motivo Incial: {atencionData?.atencionData?.motivoInicial || 'dolor de pecho'}
          </p>
          <p className="capitalize font- tracking-tight">
            {' '}
            hora de inicio: {extraerHora(atencionData?.atencionData?.inicioAtencion)}
          </p>
          <p className="capitalize font- tracking-tight">
            {' '}
            hora de finalizacion: {extraerHora(atencionData?.atencionData?.finAtencion) || '0:00'}
          </p>
          <p className="capitalize font- tracking-tight">
            {' '}
            duración:{' '}
            {Number.parseFloat(atencionData?.atencionData?.duracionAtencion).toFixed(0) ||
              '0:00'}{' '}
            minutos{' '}
          </p>
        </div>
      </DivReact>
      {/* datos personales */}
      <DivReact>
        {/* nombre dni grupo sanguiniea */}
        <div className="border-b pb-2 mb-2 gap-3 w-full items-center justify-sart flex">
          <h2 className="">
            Paciente : {atencionData?.pacienteData?.nombre} {atencionData?.pacienteData?.apellido}
          </h2>

          <div class="flex items-center gap-2">
            <ArrowBigRightDash size={16} />
            <span>DNI {atencionData?.pacienteData?.dni}</span>
          </div>
          <div class="flex items-center gap-2">
            <Blocks size={16} />
            <span>Grupo Sanguineo {atencionData?.pacienteData?.grupoSanguineo}</span>
          </div>
        </div>
        {/* data info paciente */}
        <div className="flex  items-start justify-evenly py-2 gap-4 w-full ">
          <div class=" flex gap-2 flex-col  text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <ArrowBigRightDash size={16} />
              <span>Fecha de Nacimiento {atencionData?.pacienteData?.fNacimiento}</span>
            </div>
            <div class="flex items-center gap-2">
              <User size={16} />
              <span>Edad {edad} años </span>
            </div>
            <div class="flex items-center gap-2 capitalize">
              <User size={16} />
              <span>Genero {atencionData?.pacienteData?.sexo}</span>
            </div>
          </div>
          <div class=" flex gap-2 flex-col text-sm capitalize text-muted-foreground">
            <div class="flex items-center cpai gap-2">
              <Mail size={16} />
              <span>{atencionData?.pacienteData?.email}</span>
            </div>
            <div class="flex items-center gap-2">
              <Phone size={16} />
              <span>{atencionData?.pacienteData?.celular}</span>
            </div>
            <div class="flex items-center gap-2">
              <MapPin size={16} />
              <span>Direccion {atencionData?.pacienteData?.domicilio}</span>
            </div>
          </div>
          <div class=" flex gap-2 flex-col text-sm capitalize text-muted-foreground">
            <div class="flex items-center gap-2">
              <MapIcon size={16} />
              <span>Ciudad {atencionData?.pacienteData?.ciudad}</span>
            </div>
            <div class="flex items-center gap-2">
              <MapIcon size={16} />
              <span>Provincia {atencionData?.pacienteData?.provincia}</span>
            </div>
            <div class="flex items-center gap-2">
              <FileChartColumn size={16} />
              <span>Obra Social {atencionData?.pacienteData?.obraSocial}</span>
            </div>
          </div>

          {/* opcion para flex row todo el conjunto */}

          {/* <div
          class=" flex gap-4 flex-wrap tracking-tight text-sm text-muted-foreground"
        >
          <div class="flex items-center gap-2">
            <ArrowBigRightDash size={16} />
            <span>Fecha de Nacimiento {atencionData?.pacienteData?.fNacimiento}</span>
          </div>
          <div class="flex items-center gap-2">
            <User size={16} />
            <span>Edad {edad} años </span>
          </div>
          <div class="flex items-center gap-2 capitalize">
            <User size={16} />
            <span>Genero {atencionData?.pacienteData?.sexo}</span>
          </div>
          <div class="flex items-center cpai gap-2">
            <Mail size={16} />
            <span>{atencionData?.pacienteData?.email}</span>
          </div>
          <div class="flex items-center gap-2">
            <Phone size={16} />
            <span>{atencionData?.pacienteData?.celular}</span>
          </div>
        
          
          <div class="flex items-center gap-2">
            <MapPin size={16} />
            <span>Direccion {atencionData?.pacienteData?.direccion}</span>
          </div>
          <div class="flex items-center gap-2">
            <MapIcon size={16} />
            <span>Ciudad {atencionData?.pacienteData?.ciudad}</span>
          </div>
          <div class="flex items-center gap-2">
            <MapIcon size={16} />
            <span>Provincia {atencionData?.pacienteData?.provincia}</span>
          </div>
          <div class="flex items-center gap-2">
            <FileChartColumn size={16} />
            <span>Obra Social {atencionData?.pacienteData?.obraSocial}</span>
          </div>
          {
            ocupacion && (
              <div class="flex items-center gap-2">
                <Briefcase size={16} />
                <span>{"Ocupacion"}</span>
              </div>
            )
          }
          {
            maritalStatus && (
              <div class="flex items-center gap-2">
                <Heart size={16} />
                <span>Estado {maritalStatus}</span>
              </div>
            )
          }
        </div> */}
        </div>
      </DivReact>
      {/* signos vitale> */}
      <DivReact>
        <h2 className="text- font-semibold mb-1 ">Signos Vitales</h2>
        <div className="flex items-start justify-between px-4 gap-3">
          <p className="border px-2 py-0.5 rounded-lg">
            Peso: {atencionData?.signosVitalesAtencion?.peso}kg
          </p>
          <p className="border px-2 py-0.5 rounded-lg">
            Temperatura: {atencionData?.signosVitalesAtencion?.temperatura}°
          </p>
          <p className="border px-2 py-0.5 rounded-lg">
            Frecuencia Respiratoria: {atencionData?.signosVitalesAtencion?.frecuenciaRespiratoria}
          </p>
          <p className="border px-2 py-0.5 rounded-lg">
            Tension Arterial: {atencionData?.signosVitalesAtencion?.tensionArterial}
          </p>
        </div>
      </DivReact>
      <DivReact>
        <div className="flex items-start justify-between gap-2">
          <div className="w-full flex flex-col items-center justify-start">
            <h2 className="text- font-semibold ">Motivo de Consulta</h2>
            <DivReact>
              <p className="text-sm break-all">{atencionData?.atencionData?.motivoConsulta}</p>
            </DivReact>
          </div>
          <div className="w-full flex flex-col items-center justify-start">
            <h2 className="text font-semibold ">Tratamiento</h2>
            <DivReact>
              <p className="text-sm break-all">{atencionData?.atencionData?.tratamiento}</p>
            </DivReact>
          </div>
        </div>
      </DivReact>
      {/* diagnosticos */}
      <DivReact>
        <h2 className="text-lg font-semibold ">Diagnostico</h2>
        <ConfeccionTablaDiagnosticoHistoriaModal
          arrayDiagnosticos={atencionData?.diagnosticoAtencionData}
        />
      </DivReact>
      {/* medicamentos */}
      <DivReact>
        <h2 className="text-lg font-semibold ">Medicamentos</h2>
        <ConfeccionTablaMedicamentosHistoriaModal
          arrayMedicamentos={atencionData?.medicamentosAtencionData}
        />
      </DivReact>
    </div>
  );
}
