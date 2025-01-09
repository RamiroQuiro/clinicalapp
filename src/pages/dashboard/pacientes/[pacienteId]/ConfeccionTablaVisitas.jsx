import React, { useState } from "react";
import formatDate from "../../../../utils/formatDate";
import { EyeClosed, LogOut, Outdent, TypeOutline } from "lucide-react";
import ModalVisitasMedicas from "./ModalVisitasMedicas";

export default function ConfeccionTablaVisitas({ historialVisitaData }) {
  const [modalData, setModalData] = useState(null); // Estado para los datos del modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir/cerrar el modal

  const openModal = (visita) => {
    setModalData(visita);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalData(null);
    setIsModalOpen(false);
  };

  const arrayBody = historialVisitaData?.map((visita) => {
    const dateFormato = formatDate(visita.created_at);
    return {
      id: visita.id,
      fecha: dateFormato,
      motivo: visita.motivoConsulta,
      tratamiento: visita.tratamiento,
    };
  });

  const cabeceraColumn = ["fecha", "motivo", "tratamiento"];

  return (
    <div className="w-full">
      {/* Tabla */}
      <table className="w-full text-primary-texto">
        <thead className="w-full bg-primary-bg-componentes">
          <tr className="text-border-b">
            {cabeceraColumn?.map((colum) => (
              <th
                key={colum}
                className="py-2 text-left last:text-end last:pr-4 first:pl-4 text-sm font-medium capitalize"
              >
                {colum}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {arrayBody.length >= 1 ? (
            arrayBody.map((visit, index) => (
              <tr
                key={index}
                className="border-b last:border-0 bg-white group cursor-pointer hover:bg-primary-100/10 rounded-md"
                onClick={() => openModal(visit)} // Abre el modal al hacer clic en la fila
              >
                <td className="text-xs px-2 py-2.5">{visit.fecha}</td>
                <td className="text-xs break-all px-2 py-2.5">
                  {visit.motivo}
                </td>
                <td className="text-xs px-2 py-2.5 break-after-all">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary line-clamp-4">
                    {visit.tratamiento}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr className="text-xs my-2">
              <td colSpan={3} className="text-center">
                No hay elementos para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 text-primary-texto flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b">
            <h2 className="text-lg font-semibold ">
              Información de la Atención
            </h2>
            <button onClick={closeModal}><LogOut/></button>
            </div>
            {modalData && (
             <ModalVisitasMedicas/>
            )}
    
          </div>
        </div>
      )}
    </div>
  );
}
