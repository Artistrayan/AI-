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

    // Google Search Grounding if requested
    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const selectedModel = model || 'gemini-3.8-flash';

    const responseStream = await ai.models.generateContentStream({
      model: selectedModel,
      contents,
      config,
    });

    let fullText = '';
    let searchMetadata: any = null;

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
      }

      // Check for search grounding metadata
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
  } catch (error: any) {
    console.error('Error generating content stream:', error);
    const errorMessage = error?.message || 'Error occurred while streaming response.';
    res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
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
