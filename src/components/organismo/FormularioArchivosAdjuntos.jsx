import React, { useState } from 'react'
import InputFormularioSolicitud from '../moleculas/InputFormularioSolicitud'
import InputDate from '../atomos/InputDate'

export default function FormularioArchivosAdjuntos({ pacienteId }) {

  const [file, setFile] = useState(null);
  const [labelText, setLabelText] = useState("Click para cargar");
  const [archivoURL, setArchivoURL] = useState("");
  const [formData, setFormData] = useState({
    descripcion: "",
    nombre: "",
    estado: "revisar",
    tipo: "",
  });
  const optionsTipo = [
    {
      id: 1,
      value: "laboratorios",
      nombre: "Laboratorios",
    },
    {
      id: 2,
      value: "rayosx",
      nombre: "Rayos X",
    },
    {
      id: 3,
      value: "prescripcion",
      nombre: "Prescripcion"
    },
    {
      id: 4,
      value: "derivacion",
      nombre: "Derivacion"
    },
    {
      id: 5,
      value: "electrocardiograma",
      nombre: "Electrocardiograma"
    },
    {
      id: 6,
      value: "otros",
      nombre: "otos"
    }
  ]

  const optionsEstado = [
    {
      id: 1,
      value: "pendiente",
      nombre: "Pendiente"
    },
    {
      id: 2,
      value: "revisar",
      nombre: "Revisar"
    },
    {
      id: 3,
      value: "archivado",
      nombre: "Archivado"
    }
  ]



  const handleFileChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setFile(archivo);
      setLabelText("Archivo preparado");
    }
  };

  const handleChangeFormulario = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

  }

  const guardarArchivoEnFirestore = async () => {
    if (!file) {
      alert("Por favor, carga un archivo antes de guardar.");
      return;
    }

    const storage = getStorage();
    const archivoRef = ref(storage, `pacientes/${pacienteId}/${file.name}`);

    try {
      await uploadBytes(archivoRef, file);
      const url = await getDownloadURL(archivoRef);
      setArchivoURL(url);
      alert("Archivo guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar el archivo en Firestore:", error);
      alert("Error al guardar el archivo. Inténtalo de nuevo.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!archivoURL) {
    //   alert("Por favor, guarda el archivo antes de enviar el formulario.");
    //   return;
    // }

    try {
      console.log(formData)
      const response = await fetch(`/api/pacientes/documentos/${pacienteId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          pacienteId,
          url: archivoURL,
        }),
      });

      if (response.ok) {
        alert("Datos enviados correctamente.");
        setFormData({
          descripcion: '',
          estado: '',
          nombre: '',
          tipo: ''
        })
        document.location.reload()
      } else {
        const errorData = await response.json();
        console.error("Error en el servidor:", errorData);
        alert("Error al enviar los datos. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert("Error al enviar los datos. Inténtalo de nuevo.");
    }
  };

  return (
    <div className='w-full flex flex-col items-start justify-normal gap-2'>

      <div className='w-full flex items-center justify-between gap-2'>

        <InputFormularioSolicitud name={"nombre"} onchange={handleChangeFormulario} type="text" id="nombre">
          Nombre del documento
        </InputFormularioSolicitud>
      </div>

      <div className='w-full flex items-center justify-normal gap-2'>
      <textarea
      className="w-full text-xs p-2 text-primary-texto outline-none ring-0 border rounded focus:border-primary-150"
      rows="5"
      name="descripciones"
      id="descripciones"
      placeholder="Escribe aquí observaciones..."
    ></textarea>
        </div>
      <div className='w-full flex items-center justify-normal gap-2'>
        <label htmlFor="documentAdjunto" className='w-1/3  text-center h-14 flex items-center justify-center rounded-lg border border-primary-150 hover:bg-primary-100/30 cursor-pointer text-xs text-primary-texto '>{labelText}</label>
        <input onChange={handleChangeFormulario} type="file" name="documentAdjunto" id="documentAdjunto" className='hidden' />
        <button className='border text-xs px-2 py-1  border-primary-150 bg-primary-100/30 rounded-md hover:bg-primary-100/50 hover:text-white duration-200'>cargar documento</button>
      </div>

      {/* selectores */}
      <div className='w-full flex items-center justify-normal gap-2'>
        <div className='w-full flex flex-col items-start  justify-between gap-2'>
          <label htmlFor='tipo' class="text-primary-texto duration-300 group-hover  group-hover:text-primary-200 capitalize focus:text-primary-200 text-xs">Tipo de estudio</label>
          <select name="tipo"  onChange={handleChangeFormulario}  id="tipo" className={` w-full text-sm bg-primary-200/10 group-hover:ring-2 rounded-lg  border-gray-300  ring-primary-200/60 focus:ring-2  outline-none transition-colors duration-200 ease-in-out px-2 py-2`}>
            <option selected className='disabled:text-gray-300' disabled>seleccionar</option>
            {optionsTipo.map((opcion) => {
              return (
                <option onChange={handleChangeFormulario} value={opcion.value} id={opcion.id} class="text-xs">
                  {opcion.nombre || opcion.value}
                </option>
              );
            })
            }
          </select>
        </div>
        <div className='w-full flex flex-col items-start  justify-between gap-2'>
          <label htmlFor='estado' class="text-primary-texto duration-300 group-hover  group-hover:text-primary-200 capitalize focus:text-primary-200 text-xs">Tipo de estudio</label>
          <select name="estado" id="estado" onChange={handleChangeFormulario} className={` w-full text-sm bg-primary-200/10 group-hover:ring-2 rounded-lg  border-gray-300  ring-primary-200/60 focus:ring-2  outline-none transition-colors duration-200 ease-in-out px-2 py-2`}>
            <option selected className='disabled:text-gray-300' disabled>seleccionar</option>
            {optionsEstado.map((opcion) => {
              return (
                <option onChange={handleChangeFormulario} value={opcion.value} id={opcion.id} class="text-xs">
                  {opcion.nombre || opcion.value}
                </option>
              );
            })
            }
          </select>
        </div>
      </div>
      <div className='w-full flex items-center justify-end mt-4'>
        <button onClick={handleSubmit} className=' px-2 py-1 rounded-lg font-semibold capitalize active:ring-2 border-primary-150 duration-300 text-xs  border bg-primary-150 hover:bg-primary-100/80 hover:text-white'>guardar</button>
      </div>
    </div>

  )
}
