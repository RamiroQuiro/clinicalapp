import { atom, map } from 'nanostores';

export interface Solicitud {
    id: string;
    nombrePaciente: string;
    numeroTelefono: string;
    fechaHora: string;
    created_at: string;
    userMedicoId: string;
    nombreMedico: string;
}

export const whatsappSolicitudesStore = atom<Solicitud[]>([]);

export const addWhatsappSolicitud = (solicitud: Solicitud) => {
    whatsappSolicitudesStore.set([...whatsappSolicitudesStore.get(), solicitud]);
};

export const removeWhatsappSolicitud = (solicitudId: string) => {
    whatsappSolicitudesStore.set(
        whatsappSolicitudesStore.get().filter((s) => s.id !== solicitudId)
    );
};
