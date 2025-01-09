import React from 'react'
import BotonEditar from '../moleculas/BotonEditar';
import BotonEliminar from '../moleculas/BotonEliminar';
import { atencion, dataFormularioContexto } from '../../context/store';
import { showToast } from '../../utils/toast/toastShow';


//   botonera de acciones
export const RenderActionsPacientes = (data) => (
    <div className="flex gap-2 pr-5 justify-end items-center text-xs">
        <button
            className="bg-primary-100 text-white px-1 py-0.5 rounded hover:bg-primary-100/80 duration-150"
            onClick={() => (document.location.href = `/dashboard/pacientes/${data.id}`)}
        >
            ficha
        </button>
        <button
            className="bg-primary-200 text-white  px-1 py-0.5 rounded hover:bg-primary-200/80 duration-150"
            onClick={(e) => {
                e.stopPropagation();
                document.location.href = data.href;
            }}
        >
            atender
        </button>
        <button
            className="bg-primary-400 text-white  px-1 py-0.5 rounded hover:bg-primary-400/80 duration-150"
            onClick={(e) => {
                e.stopPropagation();
                alert(`Eliminar: ${data.id}`);
            }}
        >
            Eliminar
        </button>
    </div>
);

// botoner para acciones de diagnosticos

export const RenderActionsEditDelet = (data) =>{
    const handleEditModal=(data)=>{
        dataFormularioContexto.set(data)
        const modal = document.querySelector(".modal");
          modal.showModal();
          // e.showModal()
    }

    const handleDeletDiag = async ({id}) => {
        const newDiagnosticos=atencion.get().diagnosticos.filter(diag=>diag.id!=id)
        atencion.set({
            ...atencion.get(),
            diagnosticos:newDiagnosticos
        })
    }

    return(
    <div className="flex gap-2 pr-5 justify-end items-center text-xs">
        <BotonEditar handleClick={()=>handleEditModal(data)}/>
        <BotonEliminar handleClick={()=>handleDeletDiag(data)} />
    </div>
);}
export const RenderActionsEditDeletMedicamentos = (data) =>{
    const handleEditModal=(data)=>{
        dataFormularioContexto.set(data)
        const modal = document.getElementById(`dialog-modal-medicamentos`);
          modal.showModal();
          // e.showModal()
    }

    const handleDeletMed = async ({id}) => {
        const newMedicamentos=atencion.get().medicamentos.filter(med=>med.id!=id)
            atencion.set({
                ...atencion.get(),
                medicamentos:newMedicamentos
            })
       
    }

    return(
    <div className="flex gap-2 pr-5 justify-end items-center text-xs">
        <BotonEditar handleClick={()=>handleEditModal(data)}/>
        <BotonEliminar handleClick={()=>handleDeletMed(data)} />
    </div>
);}