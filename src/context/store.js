import { atom } from "nanostores"



const busqueda = atom({
    pacienteSelect: {}
})

const filtrosBusquedaPrestamos=atom({})
const reportPDF = atom({ cabecera: {}, columnas: [], arrayBody: [] })

const columnSelectTable = atom({ asc: true, seleccion: '' })
const atencion=atom({
    dataIds:{
        isDisable:false,// si es 0 desativado=noEditable , si es 1 activado=editable
        userId:'',
        pacienteId:'',
        hcId:''
    },
    tratamiento:{tratamiento:''},
    signosVitales:{},
    motivoConsulta:{},
<<<<<<< HEAD
    diagnosticos:[{diagnostico:'',observaciones:''}],
=======
    diagnosticos:[],
>>>>>>> d01c59ff6fdf92946889071885401a6b84e0991d
    medicamentos:[]
})

const usuarioActivo = atom({})
export { busqueda, reportPDF, usuarioActivo,columnSelectTable,filtrosBusquedaPrestamos ,atencion}