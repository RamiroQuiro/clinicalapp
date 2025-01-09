import React, { useEffect, useState } from "react";
import ContenedorAgregarDiagnostico from "../moleculas/ContenedorAgregarDiagnostico";
import MedicamentosAgregar from "../moleculas/MedicamentosAgregar";
import { atencion, dataFormularioContexto } from "../../context/store";
import { useStore } from "@nanostores/react";
import { generateId } from "lucia";

export default function MedicamentosAtencion({ isExistMedicamentos }) {
  const [medicamento, setMedicamento] = useState({
    id: "",
    nombre: "",
    dosis: '',
    frecuencia: '',
    duracion: "",
  });
  const [errores, setErrores] = useState('')
  const $atencionStore = useStore(atencion);
  const $dataFormularioContexto = useStore(dataFormularioContexto);
  
  useEffect(() => {
    setMedicamento(()=>$dataFormularioContexto);

  }, [$dataFormularioContexto]);

  const handleChange = (e) => {
    
    setMedicamento(()=>({
      ...medicamento,
      [e.target.name]: e.target.value,
    }))
  };
  const handleAddMedicamento =  (e) => {
    e.preventDefault();
    if (!medicamento.nombre || !medicamento.dosis || !medicamento.duracion || !medicamento.frecuencia) {
      setErrores('Complete los campos')
      setTimeout(() => {
        setErrores('')
      }, 2000)
      return;
    }
    
    const idMedicamento=generateId(13)
    medicamento.id=idMedicamento
    atencion.set({
      ...$atencionStore,
      medicamentos: [...$atencionStore.medicamentos, medicamento],
    });
    setMedicamento({
      id: "",
      nombre: "",
      dosis: "",
      frecuencia: "",
      duracion: "",
    })
    document.getElementById(`dialog-modal-medicamentos`).close()
    return
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!medicamento.nombre || !medicamento.dosis || !medicamento.duracion || !medicamento.frecuencia) {
      setErrores("Complete los campos");
      setTimeout(() => {
        setErrores("");
      }, 2000);
      return;
    }
  
    atencion.set({
      ...$atencionStore,
      medicamentos: $atencionStore.medicamentos?.map((med) => {
        if (med.id === medicamento.id) {
          return medicamento; // Reemplaza el medicamento editado
        }
        return med; // Deja los demás como están
      }),
    });
  
    // Reinicia el estado
    setMedicamento({
      id: "",
      nombre: "",
      dosis: "",
      frecuencia: "",
      duracion: "",
    });
  
    // Cierra el modal
    document.getElementById(`dialog-modal-medicamentos`).close();
  };
  

  const handleDelet = async (deletMedicamento) => {
    try {
      const delFeth = await fetch("/api/medicamentos/", {
        method: "DELETE",
        body: JSON.stringify(deletMedicamento.id),
      });
      const dataRes = await delFeth.json();
      if (dataRes.status == 200) {
        setArrayMedicamentos((prevArray) =>
          prevArray.filter((med) => med.id !== deletMedicamento.id)
        );
        setMedicamento({
          id: 0,
          nombre: "",
          dosis: "",
          frecuencia: "",
          duracion: "",
        });
      } else {
        console.log(dataRes);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex flex-col rounded-lg  px-2 ">
      <div className="flex  w-full  relative gap-1 ">
        <div className="flex flex-col relative items-start w-full  gap-2 justify-between ">
          <ContenedorAgregarDiagnostico
            value={medicamento.nombre}
            name="nombre"
            type={"text"}
            handleChange={handleChange}
          >
            Medicamento
          </ContenedorAgregarDiagnostico>
          <div className="flex   items-center justify-normal flex- gap-2">
            <MedicamentosAgregar
              name="dosis"
              label={"Dosis"}
              value={medicamento.dosis}
              handleChange={handleChange}
            />
            <MedicamentosAgregar
              name="frecuencia"
              value={medicamento.frecuencia}
              label={"Frecuencia"}
              handleChange={handleChange}
            />
            <MedicamentosAgregar
              name="duracion"
              value={medicamento.duracion}
              label={"Duración"}
              handleChange={handleChange}
            />
          </div>
        </div>
      </div>
      <div className="w-full h-7 0 py-2 flex text-primary-400 font-semibold tracking-wider text-xs">
        <p className="capitalize  animate-aparecer">{errores}</p>
      </div>
      <div className="w-full items-center flex py-2 justify-end">
        <button
          onClick={!medicamento.id ? handleAddMedicamento : handleEdit}
          className=" px-2 py-1 rounded-lg font-semibold capitalize active:ring-2 border-primary-150 duration-300 text-xs  border bg-primary-150 hover:bg-primary-100/80 hover:text-white"
        >
          {!medicamento.id?'agregar':'modificar'}
        </button>
      </div>

      {/* 
      <div>
        {arrayMedicamentos?.map((currentMedicamento, i) => (
          <div className={`${currentMedicamento.id==''?'bg-primary-500/20 animate-pulse':'bg-white'} p-2 rounded-lg text-primary-texto border-gray-200 border flex flex-col gap-2 my-2 shadow-md`}>
            <div className="text-sm font-semibold tracking-wide flex items-center justify-start gap-2">
              <span className="text-xs bg-gray-100 rounded-full border border-gray-800/50 px-1.5 text-center">{i + 1}</span>
              <h3  className=" text-left py-0.5 w-1/2 flex-1 bg-gray-100 rounded ">{currentMedicamento.nombre}</h3> 
              <div className="flex gap-2">
                <BotonEditar handleClick={()=>handleEdit(currentMedicamento)}/>
                <BotonEliminar handleClick={()=>handleDelet(currentMedicamento)}/>
              </div>
            </div>
            <div className="text-sm border-y border-gray-300 py- flex items-center justify-between gap-2 px-2">
              <div className="flex  flex-col items-center justify-center  border-gray-300 text-center w-full">
                <p className="font-semibold">Dosis:</p>
               <input type="text" value={currentMedicamento.dosis} name="dosis" className="text-center py-0.5 "/>
              </div>
              <div className="flex  flex-col items-center justify-center border-l border-gray-300 text-center w-full">
                <p className="font-semibold">Frecuencia:</p>
                <input type="text" value={currentMedicamento.frecuencia} name="frecuencia" className=" text-center py-0.5 "/>
              </div>
              <div className="flex  flex-col items-center justify-center border-l border-gray-300 text-center w-full">
                <p className="font-semibold">Duración:</p>
                <input type="text" value={currentMedicamento.duracion} name="duracion" className=" text-center py-0.5 "/>
              </div>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
}
