

const ContenedorSignosVitales = ({ svg, medida, label }) => {
  
  
  return (
<div className="flex items-center justify-between py-2 px-2 my-3 bg-white w-full">
  <div className="flex items-center justify-start gap-2">
    <div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: svg }}></div>
    <span className="text-sm font-bold">{label}</span>
  </div>
  <div className="flex items-center w-4/12 bg gap-x-2">
    <div className="w-10">
      <input className="border border-gray-500/50 w-full p-1 text-sm rounded-lg outline-none ring-0" type="number" name="pesoCorporal" />
    </div>
    <span className="text-xs tracking-tighter font-light">{medida}</span>
  </div>
</div>)}


export default ContenedorSignosVitales