import { GroundingMetadata, MissionPlan, SandboxResult } from '../types';

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onGrounding?: (metadata: GroundingMetadata) => void;
  onDone: (fullText: string) => void;
  onError: (error: string) => void;
}

export async function streamChat(
  params: {
    messages: Array<{ role: 'user' | 'model'; text: string }>;
    systemInstruction: string;
    temperature: number;
    enableSearch: boolean;
    thinkingLevel: string;
    model?: string;
  },
  callbacks: StreamCallbacks
): Promise<() => void> {
  const controller = new AbortController();

  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      callbacks.onError(`HTTP error ${response.status}: ${errText}`);
      return () => controller.abort();
    }

    const reader = response.body?.getReader();
    if (!reader) {
      callbacks.onError('ReadableStream not supported.');
      return () => controller.abort();
    }

    const decoder = new TextDecoder();
    let buffer = '';

    const readLoop = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6);
              try {
                const data = JSON.parse(dataStr);
                if (data.type === 'chunk' && data.text) {
                  callbacks.onChunk(data.text);
                } else if (data.type === 'grounding' && data.data) {
                  callbacks.onGrounding?.(data.data);
                } else if (data.type === 'done') {
                  callbacks.onDone(data.fullText || '');
                } else if (data.type === 'error') {
                  callbacks.onError(data.error || 'Stream error occurred.');
                }
              } catch (e) {
                console.warn('Failed to parse SSE line:', dataStr);
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          callbacks.onError(err.message || 'Stream reading failed.');
        }
      }
    };

    readLoop();
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      callbacks.onError(err.message || 'Failed to initiate stream.');
    }
  }

  return () => {
    controller.abort();
  };
}

export async function decomposeMission(objective: string): Promise<MissionPlan> {
  const res = await fetch('/api/agent/decompose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objective }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to decompose mission.');
  }

  return res.json();
}

export async function simulateSandbox(command: string, language: string = 'bash'): Promise<SandboxResult> {
  const res = await fetch('/api/sandbox/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, language }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Simulation failed.');
  }

  return res.json();
}

export async function checkHealth(): Promise<{ status: string; apiKeyAvailable: boolean; version: string }> {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch {
    return { status: 'offline', apiKeyAvailable: false, version: 'unknown' };
  }
}
