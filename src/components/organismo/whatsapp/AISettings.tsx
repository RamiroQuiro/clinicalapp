import { useEffect, useState } from 'react';

interface AISettingsProps {
  centroMedicoId: string;
}

type AIProvider = 'openai' | 'gemini' | 'groq' | 'deepseek';

export default function AISettings({ centroMedicoId }: AISettingsProps) {
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WhatsApp Specific Settings
  const [aiActive, setAiActive] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    'Eres un asistente amable de una clínica médica...'
  );

  const modelOptions = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    gemini: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    groq: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
    deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const resp = await fetch('/api/whatsapp/get-config');
        const data = await resp.json();
        if (data.status === 'success') {
          if (data.data.credentials) {
            setProvider(data.data.credentials.provider);
            setModel(data.data.credentials.model);
          }
          if (data.data.waSession) {
            setAiActive(data.data.waSession.aiActive);
            setSystemPrompt(data.data.waSession.systemPrompt || '');
          }
        }
      } catch (e) {
        console.error('Error fetching AI config:', e);
      }
    };
    fetchConfig();
  }, []);

  const handleSaveCredentials = async () => {
    if (!apiKey) {
      setError('Ingresa tu API key');
      return;
    }
    await save('/api/whatsapp/save-ai-credentials', { provider, apiKey, model });
  };

  const handleSaveWhatsAppConfig = async () => {
    await save('/api/whatsapp/save-config', { aiActive, systemPrompt });
  };

  const save = async (url: string, body: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccess(true);
        if (url.includes('credentials')) setApiKey('');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.msg || 'Error al guardar');
      }
    } catch (err) {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">1. Credenciales de la IA</h2>
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
            <select
              value={provider}
              onChange={e => {
                setProvider(e.target.value as AIProvider);
                setModel(modelOptions[e.target.value as AIProvider][0]);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="openai">OpenAI (ChatGPT)</option>
              <option value="gemini">Google Gemini</option>
              <option value="groq">Groq (Llama/Mixtral)</option>
              <option value="deepseek">DeepSeek (V3/R1)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {modelOptions[provider].map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <button
            onClick={handleSaveCredentials}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Actualizar Credenciales
          </button>
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-bold mb-4">2. Configuración del Bot de WhatsApp</h2>
        <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-semibold text-gray-800">Auto-respuesta activa</label>
              <p className="text-sm text-gray-600">¿Debería la IA responder sola?</p>
            </div>
            <input
              type="checkbox"
              checked={aiActive}
              onChange={e => setAiActive(e.target.checked)}
              className="w-6 h-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSaveWhatsAppConfig}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Guardar Configuración del Bot
          </button>
        </div>
      </div>

      {(error || success) && (
        <div
          className={`p-4 rounded-lg text-center font-medium ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
        >
          {error || '¡Cambios guardados correctamente!'}
        </div>
      )}
    </div>
  );
}
