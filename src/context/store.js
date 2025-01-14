import { atom } from "nanostores"


const busqueda = atom({
    pacienteSelect: ''
})

const filtrosBusquedaPrestamos=atom({})
const reportPDF = atom({ cabecera: {}, columnas: [], arrayBody: [] })

const columnSelectTable = atom({ asc: true, seleccion: '' })


const atencion=atom({
    dataIds:{
        inicioAtencion:'',
        finAtencion:'',
        isDisable:false,// si es 0 desativado=noEditable , si es 1 activado=editable
        userId:'',
        pacienteId:'',
        atencionId:''
    },
    tratamiento:'',
    signosVitales:{},
    motivoInicial:'sin motivo',
    motivoConsulta:'',
    diagnosticos:[],
    medicamentos:[]
})

const dataFormularioContexto=atom({})

const usuarioActivo = atom({})
export { busqueda, reportPDF, usuarioActivo,columnSelectTable,filtrosBusquedaPrestamos ,atencion,dataFormularioContexto}