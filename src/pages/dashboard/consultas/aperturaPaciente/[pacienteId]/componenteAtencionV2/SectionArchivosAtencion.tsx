import Button from '@/components/atomos/Button';
import BotonIndigo from '@/components/moleculas/BotonIndigo';
import ModalReact from '@/components/moleculas/ModalReact';
import Section from '@/components/moleculas/Section';
import FormularioArchivosAdjuntos from '@/components/organismo/FormularioArchivosAdjuntos';
import { addArchivo, removeArchivo } from '@/context/consultaAtencion.store';
import type { Documentos } from '@/types';
import formatDate from '@/utils/formatDate';
import { Download, Edit3, Eye, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

export default function SectionArchivosAtencion({ $consulta }: { $consulta: Consulta }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doc, setDoc] = useState<Documentos | null>(null);

  const handleUploadComplete = nuevoArchivo => {
    addArchivo(nuevoArchivo);
    // No cerramos el modal para permitir subir más archivos si se desea
    // setIsModalOpen(false);
  };

  const handleEdit = (doc: Documentos) => {
    setDoc(doc);
    setIsModalOpen(true);
  };
  const handleDelete = archivoId => {
    // TODO: Implementar llamada a la API para borrar el archivo del servidor
    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar este archivo? Esta acción no se puede deshacer.'
      )
    ) {
      removeArchivo(archivoId);
      // Aquí iría la llamada a la API, por ejemplo:
      // fetch(`/api/atencion/documentos/${archivoId}`, { method: 'DELETE' });
    }
  };
  const getTypeIcon = (tipo: Documentos['tipo']) => {
    switch (tipo) {
      case 'laboratorios':
        return '🧪';
      case 'rayosx':
        return '📷';
      case 'prescripcion':
        return '📝';
      case 'derivacion':
        return '📝';
      case 'electrocardiograma':
        return '❤️';
      default:
        return '📄';
    }
  };
  const getStatusColor = (status: Documentos['estado']) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'revisar':
        return 'bg-green-100 text-green-800';
      case 'archivado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <Section title="Archivos Adjuntos">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsModalOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Agregar Archivo
        </Button>
      </div>

      <div className="space-y-2 px-4 bg-primary-bg-componentes rounded-lg border w-full">
        <table className="w-full">
          <thead className="w-full">
            <tr className="text-left py-3  border-b  items-center justify-evenly w-full">
              <th className=" py-3 text-sm font-medium text-muted-foreground">Documento</th>
              <th className=" text-sm font-medium text-muted-foreground">Fecha</th>
              <th className=" text-sm font-medium text-muted-foreground">Tamaño</th>
              <th className=" text-sm font-medium text-muted-foreground">Estado</th>
              <th className=" text-center text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {$consulta.archivosAdjuntos?.slice(0, 5)?.map((doc, index) => {
              const dateFormat = formatDate(doc.created_at);
              return (
                <tr className="border-b last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getTypeIcon(doc.tipo)}</span>
                      <div>
                        <p className="font-medium text-sm">{doc.nombre}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm">{dateFormat}</td>
                  <td className="py-4 text-sm">{doc.tamaño}</td>
                  <td className="py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.estado)}`}
                    >
                      {doc.estado.charAt(0).toUpperCase() + doc.estado.slice(1)}
                    </span>
                  </td>
                  <td className="py-4  flex items-center justify-center gap-2">
                    <BotonIndigo onClick={() => handleEdit(doc)}>
                      <Edit3 size={16} />
                    </BotonIndigo>
                    <BotonIndigo>
                      <a
                        href={`/api/documentos/serve/${doc.id}`}
                        target="_blank"
                        className="flex items-center gap-1"
                        rel="noopener noreferrer"
                      >
                        <Eye size={16} />/<Download size={16} />
                      </a>
                    </BotonIndigo>
                    <BotonIndigo onClick={() => handleDelete(doc.id)}>
                      <Trash2 size={16} />
                    </BotonIndigo>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ModalReact
          title="Agregar Archivos Adjuntos"
          id="modal-archivos"
          onClose={() => setIsModalOpen(false)}
        >
          <div className="p-1 w-[80vw] md:w-[60vw] lg:w-[40vw]">
            <FormularioArchivosAdjuntos
              pacienteId={$consulta.pacienteId} // Necesario si la API lo requiere
              atencionId={$consulta.id} // ID de la consulta actual
              onUploadComplete={handleUploadComplete} // Callback para actualizar el estado
              isConsulta={true} // Flag para diferenciar el contexto
              doc={doc}
            />
          </div>
        </ModalReact>
      )}
    </Section>
  );
}
