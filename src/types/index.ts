export type pacienteType={
    id:string,
    userId:string,
    email:string,
    nombre:string,
    apellido:string,
    sexo:string,
    dni:number,
    fNacimiento:string,
    srcPhoto?:string,
    celular?:string,
    direccion?:string,
    ciudad?:string,
    provincia?:string,
    pais?:string,
    updated_at?:string,
    created_at:string,
    deleted_at?:string

}


export type DiagnosticosTypes={
    id?: number,
    diagnostico: string,
    observacion:string,
    pacienteId?:string,
    userId?:string,
}


export type responseAPIType={
    msg:string,
    code?:number,
    status?:string,
    baody?:string
}

export type optionsSelectInputType={
    id:number,
    value:string,
    name?:string
}