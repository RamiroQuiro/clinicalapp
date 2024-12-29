import { atom } from "nanostores"



const busqueda = atom({
    pacienteSelect: {}
})

const filtrosBusquedaPrestamos=atom({})
const reportPDF = atom({ cabecera: {}, columnas: [], arrayBody: [] })

const columnSelectTable = atom({ asc: true, seleccion: '' })
const atencion=atom({
    dataIds:{
        userId:'',
        pacienteId:'',
        hcId:''
    },
    tratamiento:{tratamiento:''},
    signosVitales:[],
    motivoConsulta:{},
    diagnosticos:[],
    medicamentos:[]
})

const usuarioActivo = atom({})
export { busqueda, reportPDF, usuarioActivo,columnSelectTable,filtrosBusquedaPrestamos ,atencion}