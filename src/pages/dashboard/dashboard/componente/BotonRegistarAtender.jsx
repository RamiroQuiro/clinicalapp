import { UserCog, UserPlus } from 'lucide-react';

export default function BotonRegistarAtender({ handleAtender, isExist }) {
  return (
    <div className="relative group">
      <button
        onClick={handleAtender}
        className="text-xs bg-primary-100 p-1.5 rounded-lg text-white hover:bg-primary-100/80 transition-colors duration-150"
      >
        {isExist ? <UserCog className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      </button>
      <div className="absolute hidden group-hover:flex -top-8 left-1/2 animate-aparecer  -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
        {isExist ? 'Atender paciente' : 'Registrar y atender'}
      </div>
    </div>
  );
}
