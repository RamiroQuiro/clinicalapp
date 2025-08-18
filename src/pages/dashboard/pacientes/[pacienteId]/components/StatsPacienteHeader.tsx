import { pacientePerfilStore } from '@/context/store';
import { fichaPaciente } from '@/types';
import formatDate from '@/utils/formatDate';
import { useStore } from '@nanostores/react';
import {
  ArrowBigRightDash,
  Briefcase,
  Calendar,
  Heart,
  Mail,
  MapPin,
  Phone,
  UserIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StatsPacienteHeader() {
  const [patientData, setPatientData] = useState<fichaPaciente>({});
  const { data } = useStore(pacientePerfilStore);
  console.log('useStore ->', data?.data?.pacienteData);
  useEffect(() => {
    if (data) {
      setPatientData(data.data.pacienteData);
    }
  }, [data]);

  const ocupacion = 'empleado';
  const edad = 12;
  const maritalStatus = 'casado';
  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">
            {patientData?.nombre}
            {patientData?.apellido}
          </h2>
          <span className="text-sm text-gray-500">
            <UserIcon className="inline-block w-4 h-4 mr-1" />
            {patientData.sexo}, {edad} años
          </span>
        </div>
        {/* <div className="flex gap-2">
          <ModalEditarPerfil>
            <FormularioPaciente user={userId} pacienteId={patientData.id} />
          </ModalEditarPerfil>
          <ButtonBackHistory className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors" />
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <span>{patientData?.celular}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <span>{patientData?.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{patientData?.fNacimiento ? formatDate(patientData.fNacimiento) : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-gray-500" />
          <span>{patientData?.grupoSanguineo}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span>
            {patientData?.domicilio}, {patientData?.ciudad}, {patientData?.provincia}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-500" />
          <span>
            {ocupacion}, {maritalStatus}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowBigRightDash className="w-4 h-4 text-gray-500" />
          <span>Última visita: {new Date().toLocaleDateString('es-AR')}</span>
        </div>
      </div>
    </div>
  );
}
