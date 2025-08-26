import { pacientePerfilStore } from '@/context/store';

import formatDate from '@/utils/formatDate';
import { useStore } from '@nanostores/react';
import {
  ArrowBigRightDash,
  Briefcase,
  Calendar,
  CreditCard,
  Heart,
  Mail,
  MapPin,
  Phone,
  UserIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StatsPacienteHeader() {
  const [patientData, setPatientData] = useState({});
  const { data, loading, error } = useStore(pacientePerfilStore);
  // console.log('useStore ->', data?.pacienteData);
  useEffect(() => {
    if (data && data.pacienteData) {
      setPatientData(data.pacienteData);
    }
  }, [data?.pacienteData]);

  const ocupacion = 'empleado';
  const edad = 12;
  const maritalStatus = 'casado';
  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-end  gap-2 text-primary-textoTitle border-b w-full pb-2">
          <div className="text-3xl gap-2 inline-flex  items-end justify-center capitalize font-bold">
            <h2>{patientData?.nombre}</h2>
            <h2>{patientData?.apellido}</h2>
          </div>
          <div className="inline-flex gap-2 items-end">
            <CreditCard />
            <span>{patientData?.dni}</span>
          </div>
        </div>
        {/* <div className="flex gap-2">
          <ModalEditarPerfil>
            <FormularioPaciente user={userId} pacienteId={patientData.id} />
          </ModalEditarPerfil>
          <ButtonBackHistory className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors" />
        </div> */}
      </div>

      {/* --- SECCIÓN DE DETALLES REFACTORIZADA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm  border-gray-200 mt-4">
        {/* --- Columna de Datos de Contacto --- */}
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-primary-100 mt-1 flex-shrink-0" />
          <div>
            <p className="text-gray-500">Teléfono</p>
            <p className="font-semibold text-gray-800">{patientData?.celular || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-primary-100 mt-1 flex-shrink-0" />
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-semibold text-gray-800">{patientData?.email || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary-100 mt-1 flex-shrink-0" />
          <div>
            <p className="text-gray-500">Domicilio</p>
            <p className="font-semibold text-gray-800 capitalize">
              {patientData?.domicilio || 'S/D'}, {patientData?.ciudad}
            </p>
          </div>
        </div>

        {/* --- Columna de Datos Personales --- */}
        <div className="flex items-start gap-3">
          <UserIcon className="w-5 h-5 text-primary-100 mt-1 flex-shrink-0" />
          <div>
            <p className="text-gray-500">Sexo</p>
            <p className="font-semibold text-gray-800 capitalize">{patientData?.sexo}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-primary-100 mt-1 flex-shrink-0" />
          <div>
            <p className="text-gray-500">Fecha de Nacimiento</p>
            <p className="font-semibold text-gray-800">
              {patientData?.fNacimiento ? formatDate(patientData.fNacimiento) : 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Heart className="w-5 h-5 text-primary-100 mt-1 flex-shrink-0" />
          <div>
            <p className="text-gray-500">Grupo Sanguíneo</p>
            <p className="font-semibold text-gray-800">{patientData?.grupoSanguineo}</p>
          </div>
        </div>

        {/* --- Columna de Otros Datos --- */}
        <div className="flex items-start gap-3">
          <Briefcase className="w-5 h-5 text-primary-100 mt-1 flex-shrink-0" />
          <div>
            <p className="text-gray-500">Ocupación / E. Civil</p>
            <p className="font-semibold text-gray-800">
              {ocupacion}, {maritalStatus}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ArrowBigRightDash className="w-5 h-5 text-primary-100 mt-1 flex-shrink-0" />
          <div>
            <p className="text-gray-500">Última visita</p>
            <p className="font-semibold text-gray-800">{new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
