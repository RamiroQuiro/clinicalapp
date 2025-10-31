import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';

import { perfilAjustesStore } from '@/context/perfilAjustes.store';
import PerfilDocumentos from './PerfilDocumentos';
import PerfilHorarios from './PerfilHorarios';
import PerfilInformacion from './PerfilInformacion';
import PerfilNavegacion from './PerfilNavegacion';
import PerfilSeguridad from './PerfilSeguridad';

// Mock de datos del usuario, idealmente vendrían de una API
const fetchUserById = async (userId: string) => {
  console.log(`Fetching user ${userId}...`);
  // Simulación de llamada a API
  return {
    id: userId,
    nombre: 'Ramiro Quiroga',
    email: 'ramiro@example.com',
    rol: 'Administrador',
    avatarUrl: '/avatarDefault.png',
    horarios: {
      lunes: { isLaboral: true, rangoAtencion: { start: '09:00', end: '13:00' }, rangoDescanso: { start: '12:00', end: '12:00' } },
      martes: { isLaboral: true, rangoAtencion: { start: '09:00', end: '20:00' }, rangoDescanso: { start: '13:00', end: '17:00' } },
      miercoles: { isLaboral: true, rangoAtencion: { start: '09:00', end: '13:00' }, rangoDescanso: { start: '13:00', end: '17:00' } },
      jueves: { isLaboral: true, rangoAtencion: { start: '09:00', end: '18:00' }, rangoDescanso: { start: '15:00', end: '19:00' } },
      viernes: { isLaboral: true, rangoAtencion: { start: '09:00', end: '18:00' }, rangoDescanso: { start: '12:00', end: '14:00' } },
      sabado: { isLaboral: false, rangoAtencion: { start: '09:00', end: '18:00' }, rangoDescanso: { start: '12:00', end: '14:00' } },
      domingo: { isLaboral: false, rangoAtencion: { start: '09:00', end: '18:00' }, rangoDescanso: { start: '12:00', end: '14:00' } },
    },
  };
};

interface PerfilUsuarioProps {
  userId: string;
}

export default function PerfilUsuario({ userId }: PerfilUsuarioProps) {
  const [user, setUser] = useState<any>(null);
  const { pestanaActiva } = useStore(perfilAjustesStore);

  useEffect(() => {
    fetchUserById(userId).then(data => setUser(data));
  }, [userId]);

  const renderContent = () => {
    if (!user) return <div>Cargando...</div>;

    switch (pestanaActiva) {
      case 'informacion':
        return <PerfilInformacion user={user} />;
      case 'horarios':
        return <PerfilHorarios userId={user.id} horarios={user.horarios} />;
      case 'documentos':
        return <PerfilDocumentos />;
      case 'seguridad':
        return <PerfilSeguridad />;
      default:
        return <PerfilInformacion user={user} />;
    }
  };

  return (
    <div className="p-4 space-y-4 w-full">
      <PerfilNavegacion />
      <div>{renderContent()}</div>
    </div>
  );
}
