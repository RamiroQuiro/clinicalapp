export async function canReadArchivo(user: any, archivo: any) {
    if (user.centroMedicoId !== archivo.centroMedicoId) return false

    if (!['admin', 'profesional', 'recepcion'].includes(user.rol)) {
        return false
    }

    return true
}
