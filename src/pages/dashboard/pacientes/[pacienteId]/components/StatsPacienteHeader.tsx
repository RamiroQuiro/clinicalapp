import formatDate from '@/utils/formatDate';
import {
  Activity,
  Calendar,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  Pill,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
  UserCheck2Icon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Tipado básico para evitar errores de autocompletado, idealmente usar el shared
type PacienteData = {
  nombre: string;
  apellido: string;
  dni: number;
  sexo: string;
  fNacimiento: string | Date;
  celular?: string;
  email?: string;
  domicilio?: string;
  ciudad?: string;
  grupoSanguineo?: string;
  numeroHC?: string; // Chequear si viene en el prop
  obraSocial?: string;
  nObraSocial?: string;
  alergias?: any[];
  medicacionesCronicas?: any[];
};

type LastVisit = {
  fecha: string | Date;
  profesional: string;
  motivoConsulta: string;
} | null;

export default function StatsPacienteHeader({
  pacienteData,
  lastVisit,
}: {
  pacienteData: PacienteData;
  lastVisit?: LastVisit;
}) {
  const [patientData, setPatientData] = useState<PacienteData>(pacienteData);

  useEffect(() => {
    if (pacienteData) {
      setPatientData(pacienteData);
    }
  }, [pacienteData]);

  const calculateAge = (dob: string | Date) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const hasAlergias = Array.isArray(patientData?.alergias) && patientData.alergias.length > 0;
  const chronicMedsCount = Array.isArray(patientData?.medicacionesCronicas)
    ? patientData.medicacionesCronicas.length
    : 0;

  return (
    <div className="flex flex-col gap-4 w-full bg-white p-4 rounded-lg pb-6 ">
      {/* --- HEADER PRINCIPAL --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-4">
        {/* COL 1: Identidad y Alertas */}
        <div className="flex items-start gap-4 flex-1">
          {/* Avatar Placeholder */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center text-primary-600 shrink-0 shadow-inner">
            <UserCheck2Icon className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-800 capitalize leading-tight">
                {patientData?.nombre} {patientData?.apellido}
              </h1>
              {/* Badge de Alergias */}
              {hasAlergias && (
                <span
                  className="flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-red-100 animate-pulse"
                  title="Ver detalle en ficha"
                >
                  <TriangleAlert className="w-3.5 h-3.5" />
                  ALERGIAS
                </span>
              )}
              {/* Badge de Medicación Crónica */}
              {chronicMedsCount > 0 && (
                <span
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-blue-100"
                  title="Medicación Crónica Activa"
                >
                  <Pill className="w-3.5 h-3.5" />
                  {chronicMedsCount} {chronicMedsCount === 1 ? 'Medicación' : 'Medicaciones'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5 font-medium text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {calculateAge(patientData?.fNacimiento)} años
              </span>
              <span className="flex items-center gap-1 capitalize px-2 py-0.5">
                {patientData?.sexo}
              </span>
              {patientData?.grupoSanguineo && (
                <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold text-xs border border-red-100">
                  <Activity className="w-3 h-3" /> {patientData.grupoSanguineo}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* COL 2: Datos Clínicos y Administrativos (HC, OS, Last Visit) */}
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 items-start lg:items-center text-sm">
          {/* Datos Obra Social / HC */}
          <div className="flex flex-col gap-1">
            {patientData?.numeroHC && (
              <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                <FileText className="w-4 h-4 text-primary-500" />
                <span>
                  HC: <strong className="font-mono text-primary-700">{patientData.numeroHC}</strong>
                </span>
              </div>
            )}
            {patientData?.obraSocial ? (
              <div className="flex items-center gap-1.5 text-gray-600">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <div className="flex flex-col leading-none">
                  <span className="font-medium text-gray-800">{patientData.obraSocial}</span>
                  {patientData.nObraSocial && (
                    <span className="text-xs text-gray-400">#{patientData.nObraSocial}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-gray-400 italic">
                <ShieldCheck className="w-4 h-4" /> Sin cobertura
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              <CreditCard className="w-3 h-3" /> DNI {patientData?.dni}
            </div>
          </div>

          {/* Última Visita - Highlight */}
          <div className="flex flex-col bg-gray-50 border border-gray-100 rounded-lg p-2 min-w-[180px]">
            <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
              <Stethoscope className="w-3 h-3" /> Última Atención
            </span>
            {lastVisit ? (
              <>
                <span
                  className="font-semibold text-gray-800 text-xs truncate max-w-[150px]"
                  title={lastVisit.motivoConsulta}
                >
                  {lastVisit.motivoConsulta}
                </span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-gray-500">{formatDate(lastVisit.fecha)}</span>
                  {/* <span className="text-[10px] text-primary-600 font-medium truncate max-w-[80px]">{lastVisit.profesional.split(' ')[0]}</span> */}
                </div>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">Sin atenciones previas</span>
            )}
          </div>
        </div>
      </div>

      {/* --- DETALLES DE CONTACTO --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm pt-1">
        {/* Teléfono */}
        <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded transition-colors group border border-transparent hover:border-gray-100">
          <Phone className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Teléfono</span>
            <span className="text-gray-700 font-medium">{patientData?.celular || '-'}</span>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded transition-colors group border border-transparent hover:border-gray-100">
          <Mail className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
          <div className="flex flex-col leading-none gap-0.5 min-w-0">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Email</span>
            <span className="text-gray-700 font-medium truncate" title={patientData?.email}>
              {patientData?.email || '-'}
            </span>
          </div>
        </div>

        {/* Domicilio */}
        <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded transition-colors group border border-transparent hover:border-gray-100">
          <MapPin className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Domicilio</span>
            <span className="text-gray-700 font-medium capitalize truncate">
              {patientData?.domicilio || '-'} {patientData?.ciudad && `, ${patientData.ciudad}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
