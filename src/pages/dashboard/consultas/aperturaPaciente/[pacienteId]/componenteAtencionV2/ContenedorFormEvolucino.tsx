import Button from "@/components/atomos/Button";
import { TextArea } from "@/components/atomos/TextArea";
import Section from "@/components/moleculas/Section";
import FormNotaEvolucionClinica from "@/components/organismo/FormNotaEvolucionClinica";
import { setConsultaField } from "@/context/consultaAtencion.store";
import { FileText, Mic, MicOff, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";

type Props = {
    $consulta: any;
    handleQuillChange: (value: string) => void;
    handleProcesadoIA: (result: any) => void;
    handleFormChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    initialMotivos?: string[];
    pacienteId?: string;
    userId?: string;
    atencionId?: string;
};

export default function ContenedorFormEvolucino({
    $consulta,
    handleQuillChange,
    handleProcesadoIA,
    handleFormChange,
    initialMotivos = [],
    pacienteId,
    userId,
    atencionId,
}: Props) {
    const [exposedFunctions, setExposedFunctions] = useState<{
        isListening: boolean;
        startListening: () => void;
        stopListening: () => void;
        isAiProcessing: boolean;
        handleAIAutofill: () => void;
    } | null>(null);

    return (
        <Section
            isCollapsible={true}
            title="Motivo/Evolución/Tratamiento"
            icon={FileText}
            rightContent={
                exposedFunctions ? (
                    <div className="flex gap-2 items-center">
                        {/* Boton del dictado por voz */}
                        <Button
                            onClick={exposedFunctions.isListening ? exposedFunctions.stopListening : exposedFunctions.startListening}
                            className={`border shadow-sm transition-all duration-200 ${exposedFunctions.isListening
                                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            title={exposedFunctions.isListening ? 'Detener Dictado' : 'Iniciar Dictado por Voz'}
                        >
                            {exposedFunctions.isListening ? (
                                <>
                                    <MicOff className="w-4 h-4 mr-2" />
                                    <span className="text-xs font-semibold">Escuchando...</span>
                                </>
                            ) : (
                                <>
                                    <Mic className="w-4 h-4 mr-2" />
                                    <span className="text-xs">Dictar</span>
                                </>
                            )}
                        </Button>

                        {/* Boton de extraer informacion por IA */}
                        <Button
                            onClick={exposedFunctions.handleAIAutofill}
                            disabled={exposedFunctions.isAiProcessing || !$consulta.evolucion}
                            className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                        >
                            {exposedFunctions.isAiProcessing ? (
                                <Sparkles className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Wand2 className="w-4 h-4 mr-2" />
                            )}
                            {exposedFunctions.isAiProcessing ? 'Analizando...' : 'Extraer Info (IA)'}
                        </Button>
                    </div>
                ) : null
            }
        >
            <div className="flex flex-col gap-2 h-[calc(100vh-150px)]">

                <FormNotaEvolucionClinica
                    value={$consulta.evolucion || ''}
                    onChange={handleQuillChange}
                    onProcesadoIA={handleProcesadoIA}
                    motivoInicial={$consulta.motivoInicial}
                    onMotivoChange={value => setConsultaField('motivoInicial', value)}
                    initialMotivos={initialMotivos}
                    pacienteId={pacienteId}
                    userId={userId}
                    atencionId={atencionId}
                    onExposeFunctions={setExposedFunctions}
                    hideToolbar={true}
                />
            </div>
            <div className="border-t border-gray-200 py-2 mt-5">

                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                        <TextArea
                            rows={8}
                            label="Tratamiento"
                            placeholder="Tratamiento..."
                            name="tratamiento"
                            value={$consulta.tratamiento}
                            onChange={handleFormChange}
                        />
                    </div>
                </div>
            </div>
        </Section>
    );
}