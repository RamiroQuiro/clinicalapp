import HorariosDisponibles from '@/components/organismo/agenda/HorariosDisponibles';
import { Card, CardContent, CardTitle } from '@/components/organismo/Card';
import { fechaSeleccionada, recepcionStore, setFechaYHoraRecepcionista, setPacienteSeleccionado } from '@/context/recepcion.recepcionista.store';
import { formatUtcToAppTime } from '@/utils/agendaTimeUtils';
import { useStore } from '@nanostores/react';

interface Props { }



export default function ContenedorHorariosRecepsionista({ }: Props) {
    const dia = useStore(fechaSeleccionada);
    const { profesionales, turnosDelDia, isLoading, medicoSeleccionadoId } = useStore(recepcionStore);

    console.log('turnosDelDia ->', turnosDelDia)


    if (medicoSeleccionadoId) {
        const handleAgendar = (hora: string) => {
            if (!dia) return;
            setPacienteSeleccionado({ id: '', nombre: '' });
            setFechaYHoraRecepcionista(dia, formatUtcToAppTime(hora, 'HH:mm'), medicoSeleccionadoId);
            document.getElementById('dialog-modal-modalNuevoTurno')?.showModal();
        };


        const [turnosDelProfesional] = turnosDelDia.filter((turno) => turno.profesionalId === medicoSeleccionadoId)


        return (
            <div>
                <Card>
                    <CardTitle className="mb-2 text-lg font-normal">
                        Profesional: {profesionales?.find((profesional) => profesional?.id === medicoSeleccionadoId)?.nombre} {profesionales?.find((profesional) => profesional?.id === medicoSeleccionadoId)?.apellido}
                    </CardTitle>
                    {

                        <CardContent className="animate-aparecer">
                            <HorariosDisponibles
                                isLoading={isLoading}
                                agenda={turnosDelProfesional?.agenda}
                                dia={dia || new Date()}
                                profesional={profesionales?.find((profesional) => profesional?.id === medicoSeleccionadoId)}
                                hangleAgendar={handleAgendar}
                            />
                        </CardContent>
                    }
                </Card>
            </div>
        )
    }

    return (
        <div>
            {profesionales?.map((profesional) => {
                const handleAgendar = (hora: string) => {
                    if (!dia) return;
                    setPacienteSeleccionado({ id: '', nombre: '' });
                    setFechaYHoraRecepcionista(dia, formatUtcToAppTime(hora, 'HH:mm'), profesional?.id);
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