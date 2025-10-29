import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import Switch from '@/components/atomos/Switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organismo/Card';

type Props = {};

export default function FormAgendaGeneral({}: Props) {
  return (
    <form className="flex flex-col gap-8 w-full items-start">
      {/* Horarios de Atención */}
      <Card>
        <CardContent>
          <CardTitle>Horarios de Atención</CardTitle>
        </CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <Input label="Hora de Inicio" type="time" />
          <Input label="Hora de Fin" type="time" />
          <Input label="Duración del Turno (minutos)" type="number" placeholder="30" />
        </div>
      </Card>

      {/* Configuración de Agenda */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Agenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Switch label="Permitir Sobreturnos" />
              <p className="text-sm text-muted-foreground pl-2">
                Permite agendar turnos adicionales fuera del horario normal.
              </p>
            </div>
            <Input label="Máximo Sobreturnos por Día" type="number" placeholder="5" />
            <Input label="Anticipación Máxima para Agendar (días)" type="number" placeholder="90" />
          </div>
        </CardContent>
      </Card>

      {/* Recordatorios y Cancelaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Recordatorios y Cancelaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Switch label="Enviar Recordatorios Automáticos" />
              <p className="text-sm text-muted-foreground pl-2">
                Envía recordatorios automáticos a los pacientes.
              </p>
            </div>
            <Input label="Recordar con (horas de anticipación)" type="number" placeholder="24" />
            <div className="space-y-2">
              <Switch label="Permitir Cancelación de Pacientes" />
              <p className="text-sm text-muted-foreground pl-2">
                Permite que los pacientes cancelen sus turnos online.
              </p>
            </div>
            <Input label="Cancelar hasta (horas antes)" type="number" placeholder="2" />
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="w-full flex justify-end gap-4 mt-4">
        <Button variant="outline">Cancelar</Button>
        <Button variant="primary">Guardar Cambios</Button>
      </div>
    </form>
  );
}
