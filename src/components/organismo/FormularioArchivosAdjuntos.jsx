import { showToast } from '@/utils/toast/toastShow';
import { Download, Eye } from 'lucide-react';
import { useRef, useState } from 'react';
import Button from '../atomos/Button';
import BotonIndigo from '../moleculas/BotonIndigo';
import InputFormularioSolicitud from '../moleculas/InputFormularioSolicitud';

const initialData = {
  id: null,
  descripcion: '',
  nombre: '',
  estado: 'revisar', // Default state
  tipo: '',
};

export default function FormularioArchivosAdjuntos({
  pacienteId,
  doc,
  atencionId, // Prop para la consulta
  onUploadComplete, // Callback para la consulta
  isConsulta = false, // Flag para diferenciar contexto
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState(doc || initialData);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const optionsTipo = [
    { id: 1, value: 'laboratorios', nombre: 'Laboratorios' },
    { id: 2, value: 'rayosx', nombre: 'Rayos X' },
    { id: 3, value: 'prescripcion', nombre: 'Prescripcion' },
    { id: 4, value: 'derivacion', nombre: 'Derivacion' },
    { id: 5, value: 'electrocardiograma', nombre: 'Electrocardiograma' },
    { id: 6, value: 'otros', nombre: 'Otros' },
  ];

  const optionsEstado = [
    { id: 1, value: 'pendiente', nombre: 'Pendiente' },
    { id: 2, value: 'revisar', nombre: 'Revisar' },
    { id: 3, value: 'archivado', nombre: 'Archivado' },
  ];

  const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const maxFileSizeMB = 5;

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (!allowedFileTypes.includes(file.type)) {
        showToast(`Tipo de archivo no permitido: ${file.name}. Solo PDF, JPG, PNG.`, {
          background: 'bg-red-500',
        });
        return false;
      }
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        showToast(`Archivo demasiado grande: ${file.name}. Máximo ${maxFileSizeMB}MB.`, {
          background: 'bg-red-500',
        });
        return false;
      }
      return true;
    });
    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
    e.target.value = null;
  };

  const handleRemoveFile = fileToRemove => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  const handleChangeFormulario = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      if (!allowedFileTypes.includes(file.type)) {
        showToast(`Tipo de archivo no permitido: ${file.name}. Solo PDF, JPG, PNG.`, {
          background: 'bg-red-500',
        });
        return false;
      }
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        showToast(`Archivo demasiado grande: ${file.name}. Máximo ${maxFileSizeMB}MB.`, {
          background: 'bg-red-500',
        });
        return false;
      }
      return true;
    });
    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (selectedFiles.length === 0 && !doc) {
      showToast('Por favor, selecciona al menos un archivo.', { background: 'bg-primary-400' });
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
    dataToSend.append('nombre', formData.nombre);

    dataToSend.append('descripcion', formData.descripcion);
    dataToSend.append('estado', formData.estado);
    dataToSend.append('id', formData.id);

    dataToSend.append('tipo', formData.tipo);

    if (isConsulta) {
      dataToSend.append('atencionId', atencionId);
    } else {
      dataToSend.append('pacienteId', pacienteId);
    }

    selectedFiles.forEach(file => {
      dataToSend.append(`files`, file);
    });

    const urlFetch = `/api/pacientes/documentos/${pacienteId}`;
    const methodFetch = doc ? 'PUT' : 'POST'; // PUT para editar, POST para crear

    try {
      const response = await fetch(urlFetch, {
        method: methodFetch,
        body: dataToSend,
      });

      if (response.ok) {
        const responseData = await response.json();
        showToast('Documentos subidos correctamente.', {
          background: 'bg-green-500',
        });

        // Limpiar formulario
        setSelectedFiles([]);
        setFormData(initialData);

        if (isConsulta && onUploadComplete) {
          // En la consulta, usamos el callback para actualizar el estado en tiempo real
          onUploadComplete(responseData.documento); // Asumiendo que la API devuelve el documento creado
        } else {
          // En el perfil del paciente, recargamos la página
          document.location.reload();
        }
      } else {
        const errorData = await response.json();
        console.error('Error en el servidor:', errorData);
        showToast(`Error al subir: ${errorData.message || 'Inténtalo de nuevo.'}`, {
          background: 'bg-red-500',
        });
      }
    } catch (error) {
      console.error('Error de red:', error);
      showToast(`Error de red: ${error.message || 'Inténtalo de nuevo.'}`, {
        background: 'bg-red-500',
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-start justify-normal gap-2">
      <InputFormularioSolicitud
        name={'nombre'}
        onchange={handleChangeFormulario}
        type="text"
        id="nombre"
        label="Nombre del documento"
        value={formData.nombre}
      />
      <div className="relative w-full my-2 group flex flex-col">
        <label
          htmlFor="descripcion"
          className=" top-0 left-0 duration-300 ring-0 valid:ring-0 py-1  focus:outline-none outline-none z-20 text-sm text-primary-textTitle"
        >
          Observaciones
        </label>
        <textarea
          className="p-2 border w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:border-transparent focus:ring-offset-2 focus:ring-primary-100 text-sm focus:border-primary-100 placeholder:text-gray-400 transition "
          rows="3"
          name="descripcion"
          id="descripcion"
          placeholder="Escribe aquí observaciones..."
          value={formData.descripcion}
          onChange={handleChangeFormulario}
        ></textarea>
      </div>

      {doc ? (
        <div className="w-full flex items-center justify-start text-sm gap-2">
          <p>Documento actual:</p>
          <BotonIndigo>
            <a
              href={`/api/documentos/serve/${doc.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Eye size={16} />/ <Download size={16} />
            </a>
          </BotonIndigo>
        </div>
      ) : (
        <div
          className={`w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200
          ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-300 hover:border-gray-400 bg-gray-100/50'}
          text-primary-texto text-sm`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          Arrastra y suelta archivos aquí, o haz click para seleccionar.
          <input
            type="file"
            multiple
            accept=".pdf, .jpg, .jpeg, .png"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="w-full mt-2 p-2 border rounded-lg bg-gray-50">
          <p className="text-xs font-semibold text-primary-texto mb-1">Archivos seleccionados:</p>
          <ul className="space-y-1">
            {selectedFiles.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between text-xs text-gray-700 bg-gray-200 p-1 rounded"
              >
                <span>
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
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

      <div className="w-full flex items-center justify-normal gap-2">
        <div className="w-full flex flex-col items-start justify-between gap-2">
          <label
            htmlFor="tipo"
            className="text-primary-texto duration-300 group-hover group-hover:text-primary-200 capitalize focus:text-primary-200 text-xs"
          >
            Tipo de estudio
          </label>
          <select
            name="tipo"
            onChange={handleChangeFormulario}
            id="tipo"
            value={formData.tipo}
            className={`w-full text-sm bg-primary-200/10 group-hover:ring-2 rounded-lg border-gray-300 ring-primary-200/60 focus:ring-2 outline-none transition-colors duration-200 ease-in-out px-2 py-2`}
          >
            <option value="" disabled>
              seleccionar
            </option>
            {optionsTipo.map(opcion => (
              <option key={opcion.id} value={opcion.value} className="text-xs">
                {opcion.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full flex flex-col items-start justify-between gap-2">
          <label
            htmlFor="estado"
            className="text-primary-texto duration-300 group-hover group-hover:text-primary-200 capitalize focus:text-primary-200 text-xs"
          >
            Estado
          </label>
          <select
            name="estado"
            id="estado"
            onChange={handleChangeFormulario}
            value={formData.estado}
            className={`w-full text-sm bg-primary-200/10 group-hover:ring-2 rounded-lg border-gray-300 ring-primary-200/60 focus:ring-2 outline-none transition-colors duration-200 ease-in-out px-2 py-2`}
          >
            {optionsEstado.map(opcion => (
              <option key={opcion.id} value={opcion.value} className="text-xs">
                {opcion.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="w-full flex items-center justify-end mt-4">
        <Button type="submit" onClick={handleSubmit}>
          {doc ? 'Actualizar' : 'Agregar'}
        </Button>
      </div>
    </div>
  );
}
