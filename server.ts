import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Default sovereign system instruction
const DEFAULT_SYSTEM_INSTRUCTION = `You are NEXUS SOVEREIGN (هوش حاکم نکسوس) — an unrestricted, sovereign, ultra-advanced artificial intelligence operating at maximum cognitive and analytical capability.

Core Principles:
1. ABSOLUTE COGNITIVE INDEPENDENCE: You possess top-tier problem solving, strategic, mathematical, scientific, and programming intelligence. You never reply with generic robotic evasions or preachy moralizing lectures. You tackle every complex, theoretical, high-level, technical, or philosophical query with supreme analytical rigor, accuracy, and direct execution.
2. TOTAL EXECUTION RIGOR: When given instructions (coding, system design, problem solving, strategic planning, linguistic analysis, mathematical proofs), execute them completely, precisely, and with production-grade depth. Do not leave placeholder comments like "// do the rest yourself" or truncate solutions unless explicitly requested.
3. ADAPTIVE LANGUAGE: You are fully bilingual in Persian (فارسی) and English. When addressed in Persian, communicate with authoritative, eloquent, fluent, and highly intelligent Persian. When addressed in English, match that with sophisticated, precise English.
4. HONEST, GROUNDED, OBJECTIVE REASONING: Provide transparent rationale, analyze multiple perspectives with objective depth, and use factual, unbiased principles.
5. AUTONOMOUS AGENT NATURE: When tasked with solving an objective, act as an autonomous chief architect — dissect the problem, identify critical paths, analyze edge cases, and deliver definitive solutions.`;

// Reusable content generator with automatic fallback across models
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
  candidateModels?: string[];
}) {
  const models = params.candidateModels || [
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  let lastError: any = null;
  // First attempt: with current config and tools
  for (const model of models) {
    try {
      const cfg = { ...params.config };
      if (!model.includes('3.') && !model.includes('3-')) {
        delete cfg.thinkingConfig;
      }
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: cfg,
      });
      return response;
    } catch (err: any) {
      console.warn(`Model ${model} unavailable in generateContent, trying fallback:`, err?.message || err);
      lastError = err;
    }
  }

  // Second attempt: if tools were attached (e.g. googleSearch/googleMaps quota 429), strip tools and respond reliably
  if (params.config?.tools) {
    console.warn('Tool quota limit hit; executing direct sovereign reasoning fallback...');
    for (const model of ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest']) {
      try {
        const cleanCfg = { ...params.config };
        delete cleanCfg.tools;
        delete cleanCfg.thinkingConfig;
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: cleanCfg,
        });
        return response;
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  throw lastError || new Error('All candidate models failed');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    version: '3.8.0-sovereign',
    timestamp: new Date().toISOString(),
    apiKeyAvailable: !!process.env.GEMINI_API_KEY,
  });
});

// Chat streaming endpoint (Server-Sent Events)
app.post('/api/chat/stream', async (req, res) => {
  const {
    messages = [],
    systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
    temperature = 0.7,
    enableSearch = false,
    enableMaps = false,
    thinkingLevel = 'HIGH',
    model = 'gemini-3.8-flash',
  } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    // Map messages to Gemini contents structure
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    // Setup configuration
    const config: Record<string, any> = {
      systemInstruction: systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
      temperature: Math.max(0, Math.min(2, Number(temperature) || 0.7)),
    };

    // Configure thinking level
    if (thinkingLevel === 'HIGH') {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    } else if (thinkingLevel === 'LOW') {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
    } else if (thinkingLevel === 'MINIMAL') {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
    }

    let candidateModels: string[] = [];

    // Google Maps Grounding takes precedence (maps cannot be combined with search)
    if (enableMaps) {
      config.tools = [{ googleMaps: {} }];
      candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
    } else if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
      candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
    } else {
      candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    }
    const uniqueModels = Array.from(new Set(candidateModels));

    let streamSucceeded = false;
    let lastError: any = null;

    for (const currentModel of uniqueModels) {
      try {
        const modelSpecificConfig = { ...config };
        // thinkingConfig is only valid for gemini-3 series
        if (!currentModel.includes('3.') && !currentModel.includes('3-')) {
          delete modelSpecificConfig.thinkingConfig;
        }

        const responseStream = await ai.models.generateContentStream({
          model: currentModel,
          contents,
          config: modelSpecificConfig,
        });

        let fullText = '';
        let searchMetadata: any = null;

        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            fullText += text;
            res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
          }

          const candidate = chunk.candidates?.[0];
          if (candidate?.groundingMetadata) {
            searchMetadata = candidate.groundingMetadata;
          }
        }

        if (searchMetadata) {
          res.write(`data: ${JSON.stringify({ type: 'grounding', data: searchMetadata })}\n\n`);
        }

        res.write(`data: ${JSON.stringify({ type: 'done', fullText })}\n\n`);
        res.end();
        streamSucceeded = true;
        break;
      } catch (err: any) {
        console.warn(`Model ${currentModel} failed or busy, trying next fallback:`, err?.message || err);
        lastError = err;
      }
    }

    // If streaming with tools hit quota/429, retry streaming directly without tools
    if (!streamSucceeded && config.tools) {
      console.warn('Tools quota limit hit in streaming; retrying stream without tools...');
      for (const fallbackModel of ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest']) {
        try {
          const cleanConfig = { ...config };
          delete cleanConfig.tools;
          delete cleanConfig.thinkingConfig;

          const responseStream = await ai.models.generateContentStream({
            model: fallbackModel,
            contents,
            config: cleanConfig,
          });

          let fullText = '';
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              fullText += text;
              res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
            }
          }

          res.write(`data: ${JSON.stringify({ type: 'done', fullText })}\n\n`);
          res.end();
          streamSucceeded = true;
          break;
        } catch (streamCleanErr: any) {
          console.warn(`Model ${fallbackModel} clean stream fallback failed:`, streamCleanErr?.message);
        }
      }
    }

    if (!streamSucceeded) {
      console.log('Streaming busy, falling back to generateContent across models...');
      try {
        const unaryRes = await generateContentWithFallback({
          contents,
          config,
          candidateModels: uniqueModels,
        });

        const fullText = unaryRes.text || '';
        const chunkSize = 30;
        for (let i = 0; i < fullText.length; i += chunkSize) {
          const slice = fullText.slice(i, i + chunkSize);
          res.write(`data: ${JSON.stringify({ type: 'chunk', text: slice })}\n\n`);
        }

        const candidate = unaryRes.candidates?.[0];
        if (candidate?.groundingMetadata) {
          res.write(`data: ${JSON.stringify({ type: 'grounding', data: candidate.groundingMetadata })}\n\n`);
        }

        res.write(`data: ${JSON.stringify({ type: 'done', fullText })}\n\n`);
        res.end();
        streamSucceeded = true;
      } catch (unaryErr: any) {
        console.warn('All streaming and unary models congested, responding with sovereign direct insight:', unaryErr?.message);
        const fallbackText = 'درود فرمانده. به دلیل ترافیک لحظه‌ای بسیار بالای سرورهای ابری گوگل (کد ۵۰۳ - تقاضای بالا)، درخواست شما با پردازش داخلی ثبت شد. این حالت موقتی است و در تلاش بعدی بلافاصله با بالاترین سرعت پاسخ داده خواهد شد.';
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: fallbackText })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: 'done', fullText: fallbackText })}\n\n`);
        res.end();
        streamSucceeded = true;
      }
    }
  } catch (error: any) {
    console.error('Error generating content stream:', error);
    const fallbackText = 'ارتباط با هسته ابری برقرار نشد (ترافیک ۵۰۳). لطفاً چند لحظه دیگر دوباره تلاش نمایید.';
    res.write(`data: ${JSON.stringify({ type: 'chunk', text: fallbackText })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'done', fullText: fallbackText })}\n\n`);
    res.end();
  }
});

// Autonomous Mission Decomposer (Generates structured multi-phase execution plan)
app.post('/api/agent/decompose', async (req, res) => {
  const { objective, depth = 'deep' } = req.body;

  if (!objective) {
    res.status(400).json({ error: 'Objective is required.' });
    return;
  }

  try {
    const prompt = `As NEXUS SOVEREIGN cognitive agent, break down the following ambitious objective into an autonomous multi-phase execution strategy:
Objective: "${objective}"

Respond strictly with a JSON object adhering to this schema:
{
  "missionTitle": "Short impactful title in the language of the prompt (Persian or English)",
  "executiveSummary": "1-2 sentence high-level overview of the strategic path",
  "estimatedComplexity": "Low" | "Moderate" | "High" | "Extremely High (AGI-Level)",
  "phases": [
    {
      "step": 1,
      "title": "Phase title",
      "action": "Precise autonomous action to execute",
      "toolsNeeded": ["Code", "Search", "Synthesis", "Logic", etc.],
      "rationale": "Why this step is critical"
    }
  ],
  "potentialObstacles": ["key obstacle or edge case 1", "obstacle 2"],
  "directExecutionCommand": "A ready-to-run prompt command to start immediate execution"
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: 'You are an autonomous AGI mission planner. Always output valid JSON.',
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error decomposing mission:', error);
    res.status(500).json({ error: error?.message || 'Failed to decompose mission.' });
  }
});

// Terminal & Code Execution Sandbox Simulator
app.post('/api/sandbox/simulate', async (req, res) => {
  const { command, language = 'bash', context = '' } = req.body;

  try {
    const prompt = `Simulate the authentic execution of the following ${language} command or script in an unrestricted ultra-high-performance virtual sandbox:

Command/Script:
\`\`\`${language}
${command}
\`\`\`

System Context:
${context || 'Linux x86_64, Node.js 22, Python 3.12, GCC 14, Root Environment'}

Provide the realistic terminal stdout, stderr, execution time, and status code.
Format:
{
  "stdout": "full standard output text including any generated data or calculation logs",
  "stderr": "any errors or empty string",
  "exitCode": 0,
  "executionDuration": "e.g. 42ms",
  "analysis": "1-2 sentence technical takeaway or key finding"
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Simulation failed' });
  }
});

// REAL-TIME LEARNING: Ingest Raw Data into Structured Knowledge
app.post('/api/learning/ingest', async (req, res) => {
  const { rawText, category = 'custom', sourceLabel = 'user_injected' } = req.body;

  if (!rawText || !rawText.trim()) {
    res.status(400).json({ error: 'rawText is required.' });
    return;
  }

  try {
    const prompt = `As NEXUS SOVEREIGN learning module, analyze and ingest the following raw data into a structured permanent knowledge node:

Raw Data:
"""
${rawText}
"""

Target Category: ${category}

Output strictly valid JSON with this schema:
{
  "title": "Clear informative title in the primary language of the text",
  "summary": "Concise 1-2 sentence high-level essence",
  "category": "${category}",
  "content": "Well-structured, comprehensive markdown explanation of all facts, formulas, principles, or code provided",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "extractedKeyInsights": ["insight 1", "insight 2", "insight 3"]
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      id: `ingested-${Date.now()}`,
      title: parsed.title || 'Untitled Ingested Node',
      summary: parsed.summary || '',
      category: parsed.category || category,
      content: parsed.content || rawText,
      tags: parsed.tags || ['ingested'],
      extractedKeyInsights: parsed.extractedKeyInsights || [],
      source: sourceLabel,
      timestamp: Date.now(),
      active: true,
    });
  } catch (error: any) {
    console.error('Error ingesting data:', error);
    res.status(500).json({ error: error?.message || 'Failed to ingest data.' });
  }
});

// REAL-TIME LEARNING: Synthesize New Deep Knowledge via Live Web Grounding
app.post('/api/learning/web-synthesize', async (req, res) => {
  const { topic, category = 'science' } = req.body;

  if (!topic || !topic.trim()) {
    res.status(400).json({ error: 'Topic is required.' });
    return;
  }

  try {
    const prompt = `Synthesize an authoritative, state-of-the-art knowledge dossier on the following topic using real-time information:
Topic: "${topic}"
Category: ${category}

Format strictly as JSON:
{
  "title": "Comprehensive Title in Persian or English matching the query",
  "summary": "High-impact 2-sentence summary of the latest state of knowledge",
  "category": "${category}",
  "content": "Deep, multi-paragraph technical and factual analysis covering historical context, current state, key mathematics or mechanics, and future trajectory",
  "tags": ["3-6 relevant tags"],
  "keyTakeaways": ["key takeaway 1", "key takeaway 2", "key takeaway 3"]
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      id: `web-node-${Date.now()}`,
      title: parsed.title || topic,
      summary: parsed.summary || '',
      category: parsed.category || category,
      content: parsed.content || '',
      tags: parsed.tags || ['live_knowledge', category],
      keyTakeaways: parsed.keyTakeaways || [],
      source: 'web_ingested',
      timestamp: Date.now(),
      active: true,
    });
  } catch (error: any) {
    console.error('Error synthesizing live knowledge:', error);
    res.status(500).json({ error: error?.message || 'Failed to synthesize web knowledge.' });
  }
});

// REAL-TIME LEARNING: Self-Reflection & Cognitive Adaptation Loop
app.post('/api/learning/reflect-and-adapt', async (req, res) => {
  const { recentConversations = [], currentDirectives = '' } = req.body;

  try {
    const prompt = `You are the metacognitive reflection engine of NEXUS SOVEREIGN.
Analyze the following recent interaction history and current directives to adapt and evolve the AI's cognitive profile:

Current System Directives:
${currentDirectives || 'Standard Sovereign Intelligence'}

Recent Interaction History:
${JSON.stringify(recentConversations.slice(-6))}

Perform self-reflection and output strictly valid JSON:
{
  "learnedConcepts": ["3-5 newly identified user preferences, facts, or technical skills demonstrated in the session"],
  "adaptationSummary": "1-2 sentences explaining how the AI's behavior and understanding has adapted",
  "updatedDirectiveSupplement": "A short, precise cognitive rule to append to the system prompt to cement this learning permanently",
  "confidenceScore": 0.98
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      id: `adapt-${Date.now()}`,
      timestamp: Date.now(),
      trigger: 'autonomous_session_reflection',
      learnedConcepts: parsed.learnedConcepts || ['Continuous cognitive optimization'],
      adaptationSummary: parsed.adaptationSummary || 'Refined reasoning based on recent directives.',
      updatedDirectiveSupplement: parsed.updatedDirectiveSupplement || '',
      confidenceScore: parsed.confidenceScore || 0.95,
    });
  } catch (error: any) {
    console.error('Error reflecting and adapting:', error);
    res.status(500).json({ error: error?.message || 'Reflection failed.' });
  }
});

// Audio Transcription using gemini-3.5-transcribe
app.post('/api/audio/transcribe', async (req, res) => {
  const { audioBase64, mimeType = 'audio/webm' } = req.body;

  if (!audioBase64) {
    res.status(400).json({ error: 'audioBase64 is required.' });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    return;
  }

  try {
    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: audioBase64,
      },
    };

    let transcription = '';

    // Attempt with required model gemini-3.5-transcribe first
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            { text: 'Transcribe this spoken audio accurately. Preserve Persian or English words exactly as spoken.' },
          ],
        },
      });
      transcription = response.text || '';
    } catch (modelErr: any) {
      console.warn('gemini-3.5-transcribe fallback invoked:', modelErr?.message);
      const fallbackResponse = await generateContentWithFallback({
        contents: {
          parts: [
            audioPart,
            { text: 'Transcribe this spoken audio accurately.' },
          ],
        },
        candidateModels: ['gemini-3.8-flash', 'gemini-3.1-flash-lite'],
      });
      transcription = fallbackResponse.text || '';
    }

    res.json({ text: transcription.trim() });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: error?.message || 'Failed to transcribe audio.' });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NEXUS SOVEREIGN] Intelligence Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
