import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';

interface ModelOption {
  id: string;
  name: string;
  description?: string;
}

type SupportedProvider = 'groq' | 'openai' | 'gemini' | 'deepseek' | 'claude' | 'glm' | 'local';

const supportedProviders = new Set<SupportedProvider>([
  'groq',
  'openai',
  'gemini',
  'deepseek',
  'claude',
  'glm',
  'local'
]);

function upstreamError(provider: string, response: Response, fallback: string) {
  const status = response.status === 401 || response.status === 403 ? 401 : 502;
  return NextResponse.json(
    { error: `${fallback} (réponse ${response.status} de ${provider}).`, models: [] },
    { status }
  );
}

// POST /api/agent/models
// Body: { provider: string, apiKey?: string }
// This endpoint deliberately returns only models reported by the provider API.
export async function POST(request: Request) {
  try {
    if (!await verifyAdminSession(request)) {
      return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 401 });
    }

    const body = await request.json();
    const provider = typeof body?.provider === 'string' ? body.provider.trim().toLowerCase() : '';
    const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';

    if (!provider || !supportedProviders.has(provider as SupportedProvider)) {
      return NextResponse.json({ error: 'Fournisseur IA non pris en charge.', models: [] }, { status: 400 });
    }

    // The local engine has no remote model catalogue and does not need an API key.
    if (provider === 'local') {
      return NextResponse.json({
        success: true,
        source: 'local',
        models: [],
        message: 'Le moteur local ne propose pas de modèles via une clé API.'
      });
    }

    if (!apiKey) {
      return NextResponse.json({
        error: `Clé API ${provider.toUpperCase()} requise pour récupérer les modèles réels.`,
        models: []
      }, { status: 400 });
    }

    // Groq exposes an OpenAI-compatible live catalogue.
    if (provider === 'groq') {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
          cache: 'no-store'
        });
        if (!response.ok) return upstreamError('Groq', response, 'La clé API Groq est invalide ou refusée');

        const data = await response.json();
        const models: ModelOption[] = (Array.isArray(data?.data) ? data.data : [])
          .filter((model: any) => model?.id && model.active !== false)
          .filter((model: any) => !/(whisper|tts|audio|guard|safeguard)/i.test(model.id))
          .map((model: any) => ({
            id: model.id,
            name: model.id,
            description: model.context_window ? `Contexte : ${model.context_window} tokens` : undefined
          }))
          .sort((a: ModelOption, b: ModelOption) => a.id.localeCompare(b.id));

        if (models.length === 0) {
          return NextResponse.json({ error: 'Aucun modèle conversationnel actif n’a été retourné par Groq.', models: [] }, { status: 502 });
        }
        return NextResponse.json({ success: true, source: 'live_api', models });
      } catch (error) {
        console.warn('Groq live models fetch failed:', error);
        return NextResponse.json({ error: 'Impossible de joindre le catalogue réel de Groq.', models: [] }, { status: 502 });
      }
    }

    // OpenAI exposes a live catalogue. Keep chat-capable GPT models only.
    if (provider === 'openai') {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
          cache: 'no-store'
        });
        if (!response.ok) return upstreamError('OpenAI', response, 'La clé API OpenAI est invalide ou refusée');

        const data = await response.json();
        const models: ModelOption[] = (Array.isArray(data?.data) ? data.data : [])
          .filter((model: any) => typeof model?.id === 'string' && /^(gpt-|o[1-9])/i.test(model.id))
          .map((model: any) => ({ id: model.id, name: model.id, description: `ID retourné par OpenAI : ${model.id}` }))
          .sort((a: ModelOption, b: ModelOption) => a.id.localeCompare(b.id));

        if (models.length === 0) {
          return NextResponse.json({ error: 'Aucun modèle conversationnel compatible n’a été retourné par OpenAI.', models: [] }, { status: 502 });
        }
        return NextResponse.json({ success: true, source: 'live_api', models });
      } catch (error) {
        console.warn('OpenAI live models fetch failed:', error);
        return NextResponse.json({ error: 'Impossible de joindre le catalogue réel d’OpenAI.', models: [] }, { status: 502 });
      }
    }

    // Gemini returns model metadata and supported generation methods.
    if (provider === 'gemini') {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`, {
          cache: 'no-store'
        });
        if (!response.ok) return upstreamError('Gemini', response, 'La clé API Gemini est invalide ou refusée');

        const data = await response.json();
        const models: ModelOption[] = (Array.isArray(data?.models) ? data.models : [])
          .filter((model: any) => model?.name && model.supportedGenerationMethods?.includes('generateContent'))
          .map((model: any) => {
            const id = model.name.replace(/^models\//, '');
            return {
              id,
              name: model.displayName || id,
              description: model.description?.slice(0, 120) || (model.inputTokenLimit ? `Entrée : ${model.inputTokenLimit} tokens` : undefined)
            };
          })
          .sort((a: ModelOption, b: ModelOption) => a.id.localeCompare(b.id));

        if (models.length === 0) {
          return NextResponse.json({ error: 'Aucun modèle generateContent n’a été retourné par Gemini.', models: [] }, { status: 502 });
        }
        return NextResponse.json({ success: true, source: 'live_api', models });
      } catch (error) {
        console.warn('Gemini live models fetch failed:', error);
        return NextResponse.json({ error: 'Impossible de joindre le catalogue réel de Gemini.', models: [] }, { status: 502 });
      }
    }

    // DeepSeek exposes a live catalogue.
    if (provider === 'deepseek') {
      try {
        const response = await fetch('https://api.deepseek.com/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
          cache: 'no-store'
        });
        if (!response.ok) return upstreamError('DeepSeek', response, 'La clé API DeepSeek est invalide ou refusée');

        const data = await response.json();
        const models: ModelOption[] = (Array.isArray(data?.data) ? data.data : [])
          .filter((model: any) => model?.id)
          .map((model: any) => ({ id: model.id, name: model.id, description: 'ID retourné par l’API DeepSeek' }))
          .sort((a: ModelOption, b: ModelOption) => a.id.localeCompare(b.id));

        if (models.length === 0) {
          return NextResponse.json({ error: 'Aucun modèle n’a été retourné par DeepSeek.', models: [] }, { status: 502 });
        }
        return NextResponse.json({ success: true, source: 'live_api', models });
      } catch (error) {
        console.warn('DeepSeek live models fetch failed:', error);
        return NextResponse.json({ error: 'Impossible de joindre le catalogue réel de DeepSeek.', models: [] }, { status: 502 });
      }
    }

    // Anthropic exposes a live model catalogue with the same API key.
    if (provider === 'claude') {
      try {
        const response = await fetch('https://api.anthropic.com/v1/models', {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          cache: 'no-store'
        });
        if (!response.ok) return upstreamError('Anthropic', response, 'La clé API Claude est invalide ou refusée');

        const data = await response.json();
        const models: ModelOption[] = (Array.isArray(data?.data) ? data.data : [])
          .filter((model: any) => model?.id)
          .map((model: any) => ({
            id: model.id,
            name: model.display_name || model.id,
            description: model.created_at ? `Modèle réel publié le ${String(model.created_at).slice(0, 10)}` : undefined
          }))
          .sort((a: ModelOption, b: ModelOption) => a.id.localeCompare(b.id));

        if (models.length === 0) {
          return NextResponse.json({ error: 'Aucun modèle n’a été retourné par Anthropic.', models: [] }, { status: 502 });
        }
        return NextResponse.json({ success: true, source: 'live_api', models });
      } catch (error) {
        console.warn('Anthropic live models fetch failed:', error);
        return NextResponse.json({ error: 'Impossible de joindre le catalogue réel de Claude.', models: [] }, { status: 502 });
      }
    }

    // Zhipu does not currently publish a documented public model-list endpoint.
    // Do not invent a catalogue: the admin must choose a provider with live discovery.
    return NextResponse.json({
      error: 'Zhipu AI / GLM ne fournit pas de catalogue public de modèles dans cette API. Aucun modèle fictif n’est affiché.',
      models: []
    }, { status: 422 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erreur récupération modèles', models: [] }, { status: 500 });
  }
}
