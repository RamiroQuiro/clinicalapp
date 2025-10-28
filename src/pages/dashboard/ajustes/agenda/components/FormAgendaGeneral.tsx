import Button from "@/components/atomos/Button"
import Input from "@/components/atomos/Input"

type Props = {}

export default function FormAgendaGeneral({ }: Props) {
    return (
        <form className="flex flex-col gap-6 w-full items-start">
            <div className="space-y-4 w-full">
                <h3 className="text-lg font-semibold text-foreground">Horarios de Atención</h3>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Input
                            type="time"
                            placeholder="Hora de Inicio"
                        />
                    </div>

                    <div className="space-y-2">
                        <Input
                            type="time"
                            placeholder="Hora de Fin"
                        />
                    </div>

                    <div className="space-y-2">
                        <Input
                            type="number"
                            placeholder="Duración del Turno (minutos)"
                        />
                    </div>
                </div>
            </div>

            <div className="w-full border border-primary-100/50 rounded-md" />

            <div className="space-y-4 w-full">
                <h3 className="text-lg font-semibold text-foreground">Configuración de Agenda</h3>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Input
                                label="Permitir Sobreturnos"
                                type="checkbox"
                                placeholder="Permitir Sobreturnos"
                            />

                        </div>
                        <p className="text-sm text-muted-foreground">
                            Permite agendar turnos adicionales fuera del horario normal
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Input
                            label="Máximo Sobreturnos por Día"
                            type="number"
                            placeholder="5"
                        />
                    </div>

                    <div className="space-y-2">
                        <Input
                            label="Anticipación Máxima (días)"
                            type="number"
                            placeholder="90"
                        />
                    </div>

                    <div className="space-y-2">
                        <Input
                            label="Anticipación Máxima (días)"
                            type="number"
                            placeholder="90"
                        />
                        <p className="text-sm text-muted-foreground">
                            Días máximos de anticipación para agendar
                        </p>
                    </div>
                </div>
            </div>
            <div className="w-full border border-primary-100/50 rounded-md" />

            <div className="space-y-4 w-full">
                <h3 className="text-lg font-semibold text-foreground">Recordatorios y Cancelaciones</h3>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Input
                                label="Enviar Recordatorios"
                                type="checkbox"
                                placeholder="Enviar Recordatorios"
                            />

                        </div>
                        <p className="text-sm text-muted-foreground">
                            Envía recordatorios automáticos a los pacientes
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Envía recordatorios automáticos a los pacientes
                    </p>
                </div>

                <div className="space-y-2">
                    <Input
                        label="Recordar con (horas de anticipación)"
                        type="number"
                        placeholder="24"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Input
                            label="Permitir Cancelación de Pacientes"
                            type="checkbox"
                            placeholder="Permitir Cancelación de Pacientes"
                        />

                    </div>
                    <p className="text-sm text-muted-foreground">
                        Envía recordatorios automáticos a los pacientes
                    </p>
                </div>

                <div className="space-y-2">
                    <Input
                        label="Cancelar hasta (horas antes)"
                        type="number"
                        placeholder="2"
                    />
                    <p className="text-sm text-muted-foreground">
                        Tiempo límite para que el paciente cancele
                    </p>
                </div>
            </div>
            <div className="w-full border border-primary-100/50 rounded-md" />
            <div className="space-y-2 w-full">
                <Input
                    label="Cancelar hasta (horas antes)"
                    type="number"
                    placeholder="2"
                />
                <p className="text-sm text-muted-foreground">
                    Tiempo límite para que el paciente cancele
                </p>
            </div>
            <div className="w-full flex justify-end gap-2" >
                <Button

                    variant="outline"
                >Cancelar</Button>
                <Button
                    variant="primary"
                >Guardar</Button>
            </div>
        </form >
    )
}