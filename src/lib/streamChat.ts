import type { SavedModel } from '@/types/models';

export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ContentPart[];
}

export interface StreamCallbacks {
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

interface StreamParams {
  model: SavedModel;
  messages: ChatMessage[];
  signal: AbortSignal;
  callbacks: StreamCallbacks;
}

function systemPrompt(): ChatMessage {
  return {
    role: 'system',
    content:
      'You are Radiant, a helpful AI assistant by Aetheris AI. Provide clear, accurate, well-structured answers. Use Markdown for formatting and code blocks for code.',
  };
}

async function streamOpenAICompatible(
  url: string,
  headers: Record<string, string>,
  body: Record<string, unknown>,
  signal: AbortSignal,
  cb: StreamCallbacks,
) {
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300) || res.statusText}`);
  }
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream');
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content ?? json.choices?.[0]?.message?.content ?? '';
        if (delta) cb.onDelta(delta);
      } catch {
        /* skip */
      }
    }
  }
}

async function streamAnthropic(
  apiKey: string,
  apiName: string,
  messages: ChatMessage[],
  signal: AbortSignal,
  cb: StreamCallbacks,
) {
  const systemMsg = messages.find((m) => m.role === 'system')?.content;
  const conv = messages.filter((m) => m.role !== 'system');

  // Convert OpenAI-style content parts to Anthropic format
  const anthropicMessages = conv.map((m) => {
    if (typeof m.content === 'string') {
      return { role: m.role, content: m.content };
    }
    // Array of content parts — convert image_url to Anthropic's image format
    const parts = m.content.map((p) => {
      if (p.type === 'text') return { type: 'text', text: p.text };
      if (p.type === 'image_url') {
        // Extract base64 and media type from data URL
        const match = p.image_url.url.match(/^data:(image\/[\w+]+);base64,(.+)$/);
        if (match) {
          return {
            type: 'image',
            source: { type: 'base64', media_type: match[1], data: match[2] },
          };
        }
        return { type: 'text', text: '[image could not be processed]' };
      }
      return { type: 'text', text: '' };
    });
    return { role: m.role, content: parts };
  });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: apiName,
      max_tokens: 4096,
      stream: true,
      system: systemMsg || undefined,
      messages: anthropicMessages,
    }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300) || res.statusText}`);
  }
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream');
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      try {
        const json = JSON.parse(trimmed.slice(5).trim());
        if (json.type === 'content_block_delta' && json.delta?.text) cb.onDelta(json.delta.text);
      } catch {
        /* skip */
      }
    }
  }
}

async function streamGemini(
  apiKey: string,
  apiName: string,
  messages: ChatMessage[],
  signal: AbortSignal,
  cb: StreamCallbacks,
) {
  const systemMsg = messages.find((m) => m.role === 'system')?.content;
  const conv = messages.filter((m) => m.role !== 'system');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${apiName}:streamGenerateContent?alt=sse&key=${apiKey}`;

  // Convert to Gemini format — inline_data for images
  const contents = conv.map((m) => {
    const role = m.role === 'assistant' ? 'model' : 'user';
    if (typeof m.content === 'string') {
      return { role, parts: [{ text: m.content }] };
    }
    const parts = m.content.map((p) => {
      if (p.type === 'text') return { text: p.text };
      if (p.type === 'image_url') {
        const match = p.image_url.url.match(/^data:(image\/[\w+]+);base64,(.+)$/);
        if (match) {
          return { inline_data: { mime_type: match[1], data: match[2] } };
        }
        return { text: '[image could not be processed]' };
      }
      return { text: '' };
    });
    return { role, parts };
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: systemMsg ? { parts: [{ text: systemMsg }] } : undefined,
      generationConfig: { maxOutputTokens: 4096 },
    }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300) || res.statusText}`);
  }
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream');
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      try {
        const json = JSON.parse(trimmed.slice(5).trim());
        const delta = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (delta) cb.onDelta(delta);
      } catch {
        /* skip */
      }
    }
  }
}

export async function streamChat({ model, messages, signal, callbacks }: StreamParams) {
  const allMessages = [systemPrompt(), ...messages];
  try {
    switch (model.provider) {
      case 'anthropic':
        await streamAnthropic(model.apiKey, model.apiName, messages, signal, callbacks);
        break;
      case 'gemini':
        await streamGemini(model.apiKey, model.apiName, messages, signal, callbacks);
        break;
      case 'openai':
        await streamOpenAICompatible(
          'https://api.openai.com/v1/chat/completions',
          { 'Content-Type': 'application/json', Authorization: `Bearer ${model.apiKey}` },
          { model: model.apiName, messages: allMessages, stream: true },
          signal,
          callbacks,
        );
        break;
      case 'groq':
        await streamOpenAICompatible(
          'https://api.groq.com/openai/v1/chat/completions',
          { 'Content-Type': 'application/json', Authorization: `Bearer ${model.apiKey}` },
          { model: model.apiName, messages: allMessages, stream: true },
          signal,
          callbacks,
        );
        break;
      case 'perplexity':
        await streamOpenAICompatible(
          'https://api.perplexity.ai/chat/completions',
          { 'Content-Type': 'application/json', Authorization: `Bearer ${model.apiKey}` },
          { model: model.apiName, messages: allMessages, stream: true },
          signal,
          callbacks,
        );
        break;
      case 'kimi':
        await streamOpenAICompatible(
          'https://api.moonshot.cn/v1/chat/completions',
          { 'Content-Type': 'application/json', Authorization: `Bearer ${model.apiKey}` },
          { model: model.apiName, messages: allMessages, stream: true },
          signal,
          callbacks,
        );
        break;
      case 'deepseek':
        await streamOpenAICompatible(
          'https://api.deepseek.com/chat/completions',
          { 'Content-Type': 'application/json', Authorization: `Bearer ${model.apiKey}` },
          { model: model.apiName, messages: allMessages, stream: true },
          signal,
          callbacks,
        );
        break;
      case 'mistral':
        await streamOpenAICompatible(
          'https://api.mistral.ai/v1/chat/completions',
          { 'Content-Type': 'application/json', Authorization: `Bearer ${model.apiKey}` },
          { model: model.apiName, messages: allMessages, stream: true },
          signal,
          callbacks,
        );
        break;
      case 'openrouter':
        await streamOpenAICompatible(
          'https://openrouter.ai/api/v1/chat/completions',
          { 'Content-Type': 'application/json', Authorization: `Bearer ${model.apiKey}` },
          { model: model.apiName, messages: allMessages, stream: true },
          signal,
          callbacks,
        );
        break;
    }
    callbacks.onDone();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      callbacks.onDone();
      return;
    }
    callbacks.onError(err instanceof Error ? err.message : 'Unknown error');
  }
}
