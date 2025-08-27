import React, { useState, useRef } from 'react'; // Added useRef
import InputFormularioSolicitud from '../moleculas/InputFormularioSolicitud';
import InputDate from '../atomos/InputDate'; // Not used in new version, can be removed if not needed elsewhere
import { showToast } from '@/utils/toast/toastShow'; // Assuming you have a toast utility

export default function FormularioArchivosAdjuntos({ pacienteId }) {
  const [selectedFiles, setSelectedFiles] = useState([]); // Changed from 'file' to 'selectedFiles' array
  const [formData, setFormData] = useState({
    descripcion: '',
    nombre: '',
    estado: 'revisar', // Default state
    tipo: '',
  });
  const [isDragging, setIsDragging] = useState(false); // For drag-and-drop visual feedback
  const fileInputRef = useRef(null); // Ref for the hidden file input

  const optionsTipo = [
    { id: 1, value: 'laboratorios', nombre: 'Laboratorios' },
    { id: 2, value: 'rayosx', nombre: 'Rayos X' },
    { id: 3, value: 'prescripcion', nombre: 'Prescripcion' },
    { id: 4, value: 'derivacion', nombre: 'Derivacion' },
    { id: 5, value: 'electrocardiograma', nombre: 'Electrocardiograma' },
    { id: 6, value: 'otros', nombre: 'Otros' }, // Corrected 'otos' to 'Otros'
  ];

  const optionsEstado = [
    { id: 1, value: 'pendiente', nombre: 'Pendiente' },
    { id: 2, value: 'revisar', nombre: 'Revisar' },
    { id: 3, value: 'archivado', nombre: 'Archivado' },
  ];

  const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const maxFileSizeMB = 5; // Max file size in MB

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (!allowedFileTypes.includes(file.type)) {
        showToast(`Tipo de archivo no permitido: ${file.name}. Solo PDF, JPG, PNG.`, { background: 'bg-red-500' });
        return false;
      }
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        showToast(`Archivo demasiado grande: ${file.name}. Máximo ${maxFileSizeMB}MB.`, { background: 'bg-red-500' });
        return false;
      }
      return true;
    });
    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
    e.target.value = null; // Clear the input so same file can be selected again
  };

  const handleRemoveFile = (fileToRemove) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  const handleChangeFormulario = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      if (!allowedFileTypes.includes(file.type)) {
        showToast(`Tipo de archivo no permitido: ${file.name}. Solo PDF, JPG, PNG.`, { background: 'bg-red-500' });
        return false;
      }
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        showToast(`Archivo demasiado grande: ${file.name}. Máximo ${maxFileSizeMB}MB.`, { background: 'bg-red-500' });
        return false;
      }
      return true;
    });
    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      showToast('Por favor, selecciona al menos un archivo.', { background: 'bg-red-500' });
      return;
    }
    if (!formData.nombre) {
      showToast('Por favor, ingresa el nombre del documento.', { background: 'bg-red-500' });
      return;
    }
    if (!formData.tipo) {
      showToast('Por favor, selecciona el tipo de estudio.', { background: 'bg-red-500' });
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append('pacienteId', pacienteId);
    dataToSend.append('nombre', formData.nombre);
    dataToSend.append('descripcion', formData.descripcion);
    dataToSend.append('estado', formData.estado);
    dataToSend.append('tipo', formData.tipo);

    selectedFiles.forEach((file, index) => {
      dataToSend.append(`files`, file); // Append each file with the same key 'files'
    });

    try {
      const response = await fetch(`/api/pacientes/documentos/${pacienteId}`, {
        method: 'POST',
        // No 'Content-Type' header when sending FormData, browser sets it automatically
        body: dataToSend,
      });

      if (response.ok) {
        showToast('Documentos subidos y datos guardados correctamente.', { background: 'bg-green-500' });
        // Reset form
        setSelectedFiles([]);
        setFormData({
          descripcion: '',
          nombre: '',
          estado: 'revisar',
          tipo: '',
        });
        // Reload page or update parent component to show new files
        document.location.reload();
      } else {
        const errorData = await response.json();
        console.error('Error en el servidor:', errorData);
        showToast(`Error al enviar los datos: ${errorData.message || 'Inténtalo de nuevo.'}`, { background: 'bg-red-500' });
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      showToast(`Error al enviar los datos: ${error.message || 'Inténtalo de nuevo.'}`, { background: 'bg-red-500' });
    }
  };

  return (
    <div className='w-full flex flex-col items-start justify-normal gap-2'>
      <InputFormularioSolicitud name={"nombre"} onchange={handleChangeFormulario} type="text" id="nombre" value={formData.nombre}>
        Nombre del documento
      </InputFormularioSolicitud>

      <textarea
        className="w-full text-xs p-2 text-primary-texto outline-none ring-0 border rounded focus:border-primary-150"
        rows="3" // Reduced rows for better initial view
        name="descripcion" // Corrected name from 'descripciones' to 'descripcion'
        id="descripcion"
        placeholder="Escribe aquí observaciones..."
        value={formData.descripcion}
        onChange={handleChangeFormulario}
      ></textarea>

      {/* Drag and Drop Area */}
      <div
        className={`w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200
          ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-300 hover:border-gray-400 bg-gray-100/50'}
          text-primary-texto text-sm`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()} // Click to open file dialog
      >
        Arrastra y suelta archivos aquí, o haz click para seleccionar.
        <input
          type="file"
          multiple // Allow multiple files
          accept=".pdf, .jpg, .jpeg, .png" // Accepted file types
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="w-full mt-2 p-2 border rounded-lg bg-gray-50">
          <p className="text-xs font-semibold text-primary-texto mb-1">Archivos seleccionados:</p>
          <ul className="space-y-1">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between text-xs text-gray-700 bg-gray-200 p-1 rounded">
                <span>{file.name} ({ (file.size / (1024 * 1024)).toFixed(2) } MB)</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* selectores */}
      <div className='w-full flex items-center justify-normal gap-2'>
        <div className='w-full flex flex-col items-start justify-between gap-2'>
          <label htmlFor='tipo' className="text-primary-texto duration-300 group-hover group-hover:text-primary-200 capitalize focus:text-primary-200 text-xs">Tipo de estudio</label>
          <select name="tipo" onChange={handleChangeFormulario} id="tipo" value={formData.tipo} className={`w-full text-sm bg-primary-200/10 group-hover:ring-2 rounded-lg border-gray-300 ring-primary-200/60 focus:ring-2 outline-none transition-colors duration-200 ease-in-out px-2 py-2`}>
            <option value="" disabled>seleccionar</option> {/* Added empty option for initial state */}
            {optionsTipo.map((opcion) => (
              <option key={opcion.id} value={opcion.value} className="text-xs">
                {opcion.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className='w-full flex flex-col items-start justify-between gap-2'>
          <label htmlFor='estado' className="text-primary-texto duration-300 group-hover group-hover:text-primary-200 capitalize focus:text-primary-200 text-xs">Estado</label> {/* Corrected label */}
          <select name="estado" id="estado" onChange={handleChangeFormulario} value={formData.estado} className={`w-full text-sm bg-primary-200/10 group-hover:ring-2 rounded-lg border-gray-300 ring-primary-200/60 focus:ring-2 outline-none transition-colors duration-200 ease-in-out px-2 py-2`}>
            {optionsEstado.map((opcion) => (
              <option key={opcion.id} value={opcion.value} className="text-xs">
                {opcion.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className='w-full flex items-center justify-end mt-4'>
        <button type="submit" onClick={handleSubmit} className='px-2 py-1 rounded-lg font-semibold capitalize active:ring-2 border-primary-150 duration-300 text-xs border bg-primary-150 hover:bg-primary-100/80 hover:text-white'>guardar</button>
      </div>
    </div>
  );
}

