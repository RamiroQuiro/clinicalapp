import React, { useState, useEffect } from "react";
import Button3 from "../../../../components/atomos/Button3";
import { ArrowBigRightDash, Blocks, Briefcase, FileChartColumn, Heart, Mail, MapIcon, MapPin, Phone, User } from "lucide-react";
import DivReact from "../../../../components/atomos/DivReact";
import formatDate from "../../../../utils/formatDate";
import extraerHora from "../../../../utils/extraerHora";

const ModalAtencion = ({ atencionId, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [atencionData, setAtencionData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!atencionId) return;

    const fetchAtencionData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/pacientes/atencion`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json', // Especifica el tipo de contenido
            'X-Atencion-Id': atencionId // Aquí envías el id como header personalizado
          }
        });
        if (!response.ok) {
          throw new Error("Error al obtener los datos de la atención");
        }
        const data = await response.json();
        setAtencionData(data.data);
        console.log(data.data)
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAtencionData();
  }, [atencionId]);

  function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  }
  let edad = calcularEdad(atencionData?.pacienteData?.fNacimiento);


  const ocupacion = [];
  const maritalStatus = "casado";

  if (!atencionId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black  bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-primary-bg-componentes rounded-lg border-l-2 text- border-primary-100/80 shadow-lg min-h-[95vh] p-6 w- w-2/3">

        {isLoading ? (
          <div className="text-center">Cargando...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="flex flex-col items-start gap-4 justify-normal w-full bg0">
            <div className="flex items-center justify-between w-full mb-2 pb-2 border-b ">

              <h2 className="text-xl font-semibold ">
                Detalles de la Atención del día {formatDate(atencionData?.atencionData?.created_at)}, atención Dr. Name
              </h2>
              <Button3 onClick={onClose}>X</Button3>
            </div>
            <DivReact>

              <div className="w-full items-center justify-evenly gap-2  flex">
                <p className="capitalize font- tracking-tight">Motivo Incial: {atencionData.atencionData?.motivoInicial || 'dolor de pecho'}</p>
                <p className="capitalize font- tracking-tight"> hora de inicio:  {extraerHora(atencionData.atencionData.inicioAtencion)}</p>
                <p className="capitalize font- tracking-tight"> hora de finalizacion:  {extraerHora(atencionData.atencionData?.finAtencion) || '0:00'}</p>
                <p className="capitalize font- tracking-tight"> duración:  {Number.parseFloat(atencionData.atencionData?.duracionAtencion).toFixed(0) || '0:00'} minutos </p>
              </div>
            </DivReact>
            {/* datos personales */}
            <DivReact>
              <div className="border-b pb-2 mb-2 gap-3 w-full items-center justify-sart flex">
                <h2 className="">Paciente : {atencionData?.pacienteData?.nombre} {atencionData?.pacienteData?.apellido}</h2>

                <div class="flex items-center gap-2">
                  <ArrowBigRightDash size={16} />
                  <span>DNI {atencionData?.pacienteData?.dni}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Blocks size={16} />
                  <span>Grupo Sanguineo {atencionData?.pacienteData?.grupoSanguineo}</span>
                </div>
              </div>
              <div className="flex  items-start justify-start py-2 gap-4 w-full ">
                <div
                  class=" flex gap-2 flex-col  text-sm text-muted-foreground"
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

                </div>
                <div
                  class=" flex gap-2 flex-col text-sm capitalize text-muted-foreground"
                >
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


                </div>
                <div
                  class=" flex gap-2 flex-col text-sm capitalize text-muted-foreground"
                >
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

            <DivReact>
              <div className="flex items-start justify-between gap-2">
                <DivReact>
                  <h2 className="text-lg font-semibold ">
                    Motivo de Consulta
                  </h2>
                </DivReact>
                <DivReact>
                  <h2 className="text-lg font-semibold ">
                    Tratamiento
                  </h2>
                </DivReact>
              </div>
            </DivReact>
            <DivReact>
              <h2 className="text-lg font-semibold ">Diagnostico</h2>
            </DivReact>

            <DivReact>
              <h2 className="text-lg font-semibold ">Medicamentos</h2>
            </DivReact>


          </div>
        )}
      </div>
    </div>
  );
};

export default ModalAtencion;
