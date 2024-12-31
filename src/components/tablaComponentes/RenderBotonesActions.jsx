import React from 'react'
import BotonEditar from '../moleculas/BotonEditar';
import BotonEliminar from '../moleculas/BotonEliminar';
import { dataFormularioContexto } from '../../context/store';
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
        try {
            const deletFetch = await fetch('/api/pacientes/atencion/diagnostico', {
                method: 'DELETE',
                body: JSON.stringify({
                    id: id
                })
            })
            if (deletFetch.ok) {
                showToast('Diagnostico eliminado')
                document.location.reload()
            } else {
                showToast('error al borrar', { background: 'bg-primary-400' })
            }
        } catch (error) {
            console.log(error)
        }
    }

    return(
    <div className="flex gap-2 pr-5 justify-end items-center text-xs">
        <BotonEditar handleClick={()=>handleEditModal(data)}/>
        <BotonEliminar handleClick={()=>handleDeletDiag(data)} />
    </div>
);}