import React, { useState } from 'react';
import { MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import ContenedorRenderizdoPantallaRecepcionista from './ContenedorRenderizdoPantalla.recepcionista';
import WhatsAppSolicitudesPanel from './WhatsAppSolicitudesPanel';

// TODO: Fetch this number from an API or SSE event
const placeholderRequestCount = 2;

const RecepcionMainView = ({ user }: { user: any }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="w-full flex flex-row gap-2 h-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-0 min-w-0">
                <ContenedorRenderizdoPantallaRecepcionista user={user} />
            </div>

            {/* Sidebar Container */}
            <div
                className={`flex-shrink-0 h-full transition-all duration-300 ease-in-out bg-white rounded-lg border shadow-sm relative ${isSidebarOpen ? 'w-[420px]' : 'w-[50px]'}`}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -left-3 top-4 bg-white border border-gray-200 shadow-md rounded-full p-1 text-gray-500 hover:text-indigo-600 z-10"
                    title={isSidebarOpen ? 'Ocultar Solicitudes' : 'Ver Solicitudes de WhatsApp'}
                >
                    {isSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                <div className="h-full overflow-hidden">
                    {isSidebarOpen ? (
                        <WhatsAppSolicitudesPanel />
                    ) : (
                        /* Collapsed State Icon Bar */
                        <div className="flex flex-col items-center pt-6 gap-4 h-full">
                            <div
                                onClick={() => setIsSidebarOpen(true)}
                                className="relative flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors w-full"
                                title="Ver Solicitudes"
                            >
                                <div className="p-2 rounded-lg bg-green-50 text-green-600">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div
                                    className="text-gray-500 font-medium tracking-wide transform rotate-180 text-xs"
                                    style={{ writingMode: 'vertical-rl' }}
                                >
                                    WHATSAPP
                                </div>
                                {placeholderRequestCount > 0 && (
                                     <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                        {placeholderRequestCount}
                                     </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecepcionMainView;
