import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';

import { perfilAjustesStore } from '@/context/perfilAjustes.store';
import type { User } from 'lucia';
import PerfilDocumentos from './PerfilDocumentos';
import PerfilHorarios from './PerfilHorarios';
import PerfilInformacion from './PerfilInformacion';
import PerfilNavegacion from './PerfilNavegacion';
import PerfilSeguridad from './PerfilSeguridad';

// Función para obtener datos del usuario desde la API
const fetchUserById = async (userId: string) => {
  try {
    const response = await fetch(`/api/ajustes/usuarios/${userId}`);
    if (!response.ok) {
      throw new Error('Error al obtener datos del usuario');
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

interface PerfilUsuarioProps {
  userId: string;
  dataUser: User | null;
}

export default function PerfilUsuario({ userId, dataUser }: PerfilUsuarioProps) {
  const [user, setUser] = useState<User | null>(null);
  const { pestanaActiva } = useStore(perfilAjustesStore);

  useEffect(() => {
    // Siempre hacer fetch para obtener datos frescos de la base de datos
    fetchUserById(userId).then(data => setUser(data));
  }, [userId]);

  const renderContent = () => {
    // Determinar si el perfil que se está viendo es de recepcionista
    const esPerfilRecepcionista =
      (user as any)?.rol === 'recepcion' || (user as any)?.rolEnCentro === 'recepcion';

    switch (pestanaActiva) {
      case 'informacion':
        return <PerfilInformacion user={user} />;
      case 'horarios':
        // Si el perfil es de recepcionista, redirigir a información
        return esPerfilRecepcionista ? (
          <PerfilInformacion user={user} />
        ) : (
          <PerfilHorarios userId={(user as any)?.id} horarios={(user as any)?.horarios} />
        );
      case 'documentos':
        return esPerfilRecepcionista ? <PerfilInformacion user={user} /> : <PerfilDocumentos />;
      case 'seguridad':
        return <PerfilSeguridad userId={userId} />;
      default:
        return <PerfilInformacion user={user} />;
    }
  };

  return (
    <div className="p-4 space-y-4 w-full">
      <PerfilNavegacion user={user} />
      <div>{renderContent()}</div>
    </div>
  );
}
