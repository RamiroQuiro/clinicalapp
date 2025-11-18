import HorariosDisponibles from '@/components/organismo/agenda/HorariosDisponibles';
import { Card, CardContent, CardTitle } from '@/components/organismo/Card';
import type { AgendaSlot } from '@/context/agenda.store';
import { fechaSeleccionada, recepcionStore, setFechaYHoraRecepcionista, setPacienteSeleccionado } from '@/context/recepcion.recepcionista.store';
import { formatUtcToAppTime } from '@/utils/agendaTimeUtils';
import { useStore } from '@nanostores/react';

interface Props { }



export default function ContenedorHorariosRecepsionista({ }: Props) {
    const dia = useStore(fechaSeleccionada);
    const { profesionales, turnosDelDia, isLoading, medicoSeleccionadoId } = useStore(recepcionStore);



    if (medicoSeleccionadoId.length > 0) {


        return (
            <div>
                {
                    medicoSeleccionadoId.map((id) => {
                        const handleAgendar = (hora: string) => {
                            if (!dia) return;
                            setPacienteSeleccionado({ id: '', nombre: '' });
                            setFechaYHoraRecepcionista(dia, formatUtcToAppTime(hora, 'HH:mm'), id);
                            document.getElementById('dialog-modal-modalNuevoTurno')?.showModal();
                        };


                        const [turnosDelProfesional] = turnosDelDia.filter((turno) => turno.profesionalId === id)

                        const profesional = profesionales?.find((profesional) => profesional?.id === id)
                        return (
                            <Card key={id} className="mb-4">
                                <CardTitle className="mb-2 text-lg font-normal">
                                    Profesional: {profesional?.nombre} {profesional?.apellido}
                                </CardTitle>
                                {
                                    <CardContent className="animate-aparecer">
                                        <HorariosDisponibles
                                            isLoading={isLoading}
                                            agenda={turnosDelProfesional?.agenda}
                                            dia={dia || new Date()}
                                            profesional={profesional}
                                            hangleAgendar={handleAgendar}
                                        />
                                    </CardContent>
                                }
                            </Card>
                        );
                    })
                }
            </div>
        )
    }

    return (
        <div>
            {profesionales?.map((profesional) => {
                const handleAgendar = (slot: AgendaSlot) => {
                    if (!dia) return;
                    setPacienteSeleccionado({ id: '', nombre: '' });
                    setFechaYHoraRecepcionista(dia, formatUtcToAppTime(slot.hora, 'HH:mm'), profesional?.id);
                    document.getElementById('dialog-modal-modalNuevoTurno')?.showModal();
                };


                const [turnosDelProfesional] = turnosDelDia.filter((turno) => turno.profesionalId === profesional.id)



                return (
                    <Card key={profesional?.id} className="mb-4">
                        <CardTitle className="mb-2 text-lg font-normal">
                            Profesional: {profesional?.nombre} {profesional?.apellido}
                        </CardTitle>
                        {

                            <CardContent className="animate-aparecer">
                                <HorariosDisponibles
                                    isLoading={isLoading}
                                    agenda={turnosDelProfesional?.agenda}
                                    dia={dia || new Date()}
                                    profesional={profesional}
                                    hangleAgendar={handleAgendar}
                                />
                            </CardContent>
                        }
                    </Card>
                );
            })}
        </div>
    );
}