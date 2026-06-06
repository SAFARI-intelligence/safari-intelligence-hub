// Server-only helper for Lovable AI Gateway calls (Wildlife Intelligence narratives).
// Uses direct fetch to keep dependencies minimal.

const GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-3-flash-preview';

export class AiGatewayError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function callGatewayText(opts: {
  system: string;
  user: string;
  model?: string;
}): Promise<{ text: string; model: string; tokensIn?: number; tokensOut?: number }> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new AiGatewayError(500, 'Missing LOVABLE_API_KEY');
  const model = opts.model ?? DEFAULT_MODEL;

  const res = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Lovable-API-Key': key,
      'X-Lovable-AIG-SDK': 'fetch',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new AiGatewayError(res.status, body || `Gateway ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const text = data.choices?.[0]?.message?.content?.trim() ?? '';
  return {
    text,
    model,
    tokensIn: data.usage?.prompt_tokens,
    tokensOut: data.usage?.completion_tokens,
  };
}

export async function callGatewayJson<T>(opts: {
  system: string;
  user: string;
  model?: string;
}): Promise<{ data: T; model: string; tokensIn?: number; tokensOut?: number }> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new AiGatewayError(500, 'Missing LOVABLE_API_KEY');
  const model = opts.model ?? DEFAULT_MODEL;

  const res = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Lovable-API-Key': key,
      'X-Lovable-AIG-SDK': 'fetch',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: opts.system + '\n\nRespond ONLY with valid minified JSON. No markdown.' },
        { role: 'user', content: opts.user },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new AiGatewayError(res.status, body || `Gateway ${res.status}`);
  }
  const raw = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const text = raw.choices?.[0]?.message?.content?.trim() ?? '{}';
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  const data = JSON.parse(cleaned) as T;
  return {
    data,
    model,
    tokensIn: raw.usage?.prompt_tokens,
    tokensOut: raw.usage?.completion_tokens,
  };
}

export function hashPrompt(input: string): string {
  // Simple FNV-1a 32-bit hash → hex. Stable, no crypto import needed.
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
