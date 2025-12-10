import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';
import { showToast } from '@/utils/toast/toastShow';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Licencia {
  id: string;
  fechaInicio: Date;
  fechaFin: Date;
  motivo: string;
  tipo: 'vacaciones' | 'enfermedad' | 'personal' | 'capacitacion' | 'otro';
  estado: 'activa' | 'cancelada' | 'finalizada';
}

interface GestionLicenciasProps {
  userId: string;
  centroMedicoId: string;
}

export default function GestionLicencias({ userId, centroMedicoId }: GestionLicenciasProps) {
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
    motivo: '',
    tipo: 'vacaciones' as const,
  });

  // Cargar licencias existentes
  useEffect(() => {
    fetchLicencias();
  }, [userId]);

  const fetchLicencias = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ajustes/licencias?userId=${userId}`);
      if (!response.ok) throw new Error('Error al cargar licencias');
      const result = await response.json();
      setLicencias(result.data || []);
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cargar licencias', { background: 'bg-red-600' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardarLicencia = async () => {
    // Validaciones
    if (!formData.fechaInicio || !formData.fechaFin) {
      showToast('Debes completar las fechas', { background: 'bg-red-600' });
      return;
    }

    if (new Date(formData.fechaInicio) > new Date(formData.fechaFin)) {
      showToast('La fecha de inicio debe ser anterior a la fecha de fin', {
        background: 'bg-red-600',
      });
      return;
    }

    try {
      const response = await fetch('/api/ajustes/licencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          centroMedicoId,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error('Error al guardar licencia');

      showToast('Licencia guardada correctamente', { background: 'bg-green-600' });

      // Limpiar formulario y recargar
      setFormData({ fechaInicio: '', fechaFin: '', motivo: '', tipo: 'vacaciones' });
      setShowForm(false);
      fetchLicencias();
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al guardar licencia', { background: 'bg-red-600' });
    }
  };

  const handleEliminarLicencia = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta licencia?')) return;

    try {
      const response = await fetch(`/api/ajustes/licencias/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar licencia');

      showToast('Licencia eliminada correctamente', { background: 'bg-green-600' });
      fetchLicencias();
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar licencia', { background: 'bg-red-600' });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      vacaciones: '🏖️ Vacaciones',
      enfermedad: '🏥 Enfermedad',
      personal: '👤 Personal',
      capacitacion: '📚 Capacitación',
      otro: '📋 Otro',
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Licencias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-16 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestión de Licencias y Vacaciones</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancelar' : 'Nueva Licencia'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Formulario para nueva licencia */}
        {showForm && (
          <div className="border border-primary-100 rounded-lg p-4 bg-primary-50/10 space-y-3">
            <h3 className="font-semibold text-sm">Nueva Licencia</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                label="Fecha Inicio"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleInputChange}
              />
              <Input
                type="date"
                label="Fecha Fin"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col w-full">
                <label className="mb-1 text-sm font-semibold text-primary-texto">Tipo</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary-100 focus:border-primary-100"
                >
                  <option value="vacaciones">Vacaciones</option>
                  <option value="enfermedad">Enfermedad</option>
                  <option value="personal">Personal</option>
                  <option value="capacitacion">Capacitación</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <Input
                type="text"
                label="Motivo (opcional)"
                name="motivo"
                value={formData.motivo}
                onChange={handleInputChange}
                placeholder="Ej: Vacaciones de verano"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleGuardarLicencia}>Guardar Licencia</Button>
            </div>
          </div>
        )}

        {/* Lista de licencias */}
        {licencias.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay licencias registradas</p>
            <p className="text-sm">Haz clic en "Nueva Licencia" para agregar una</p>
          </div>
        ) : (
          <div className="space-y-2">
            {licencias.map(licencia => (
              <div
                key={licencia.id}
                className="border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{getTipoLabel(licencia.tipo)}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        licencia.estado === 'activa'
                          ? 'bg-green-100 text-green-700'
                          : licencia.estado === 'cancelada'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {licencia.estado}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(licencia.fechaInicio)} - {formatDate(licencia.fechaFin)}
                  </p>
                  {licencia.motivo && (
                    <p className="text-sm text-gray-500 italic mt-1">{licencia.motivo}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEliminarLicencia(licencia.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
