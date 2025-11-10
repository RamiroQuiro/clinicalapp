import HorariosDisponibles from '@/components/organismo/agenda/HorariosDisponibles';
import { Card, CardContent, CardTitle } from '@/components/organismo/Card';
import { fechaSeleccionada, recepcionStore, setFechaYHoraRecepcionista, setPacienteSeleccionado } from '@/context/recepcion.recepcionista.store';
import { formatUtcToAppTime } from '@/utils/agendaTimeUtils';
import { useStore } from '@nanostores/react';

interface Props { }



export default function ContenedorHorariosRecepsionista({ }: Props) {
    const dia = useStore(fechaSeleccionada);
    const { profesionales, turnosDelDia, isLoading, medicoSeleccionadoId } = useStore(recepcionStore);

    console.log('profesionales ->', profesionales)


    if (medicoSeleccionadoId) {
        return (
            <div>
                <Card>
                    <CardTitle>Profesional Seleccionado</CardTitle>
                    <CardContent>
                        <p>Profesional Seleccionado</p>
                    </CardContent>
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
                return (
                    <Card key={profesional?.id} className="mb-4">
                        <CardTitle className="mb-2 text-lg font-normal">
                            Profesional: {profesional?.nombre} {profesional?.apellido}
                        </CardTitle>
                        {

                            <CardContent className="animate-aparecer">
                                <HorariosDisponibles
                                    isLoading={isLoading}
                                    agenda={turnosDelDia}
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