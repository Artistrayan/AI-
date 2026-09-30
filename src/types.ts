export type Language = 'fa' | 'en';

export type CognitiveMode = 'sovereign' | 'mission' | 'knowledge' | 'learning' | 'terminal' | 'search';

export type ThinkingLevelOption = 'HIGH' | 'LOW' | 'MINIMAL';

export type KnowledgeCategory =
  | 'science'
  | 'technology'
  | 'history_philosophy'
  | 'abstract'
  | 'current_events'
  | 'custom';

export interface KnowledgeItem {
  id: string;
  title: string;
  category: KnowledgeCategory;
  summary: string;
  content: string;
  tags: string[];
  source: 'vault' | 'web_ingested' | 'user_injected' | 'autonomous_reflection';
  timestamp: number;
  active: boolean;
}

export interface LearningEvolutionLog {
  id: string;
  timestamp: number;
  trigger: string;
  learnedConcepts: string[];
  adaptationSummary: string;
  confidenceScore: number;
}

export interface LearningMetrics {
  totalIngestedDataPoints: number;
  activeKnowledgeNodes: number;
  adaptationLevel: number;
  reflectionCycles: number;
  lastIngestionTime: number;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: Array<{
    web?: { uri?: string; title?: string };
    maps?: { uri?: string; title?: string; placeId?: string; address?: string };
  }>;
  searchEntryPoint?: { renderedContent?: string };
  groundingSupports?: any[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  thinking?: string;
  groundingMetadata?: GroundingMetadata;
  isStreaming?: boolean;
  model?: string;
}

export interface MissionPhase {
  step: number;
  title: string;
  action: string;
  toolsNeeded: string[];
  rationale: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
}

export interface MissionPlan {
  missionTitle: string;
  executiveSummary: string;
  estimatedComplexity: string;
  phases: MissionPhase[];
  potentialObstacles: string[];
  directExecutionCommand: string;
}

export interface SandboxResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionDuration: string;
  analysis: string;
}

export interface NeuralMemoryItem {
  id: string;
  key: string;
  value: string;
  createdAt: number;
  active: boolean;
}

export interface SovereignSettings {
  systemInstruction: string;
  temperature: number;
  thinkingLevel: ThinkingLevelOption;
  enableSearch: boolean;
  enableMaps: boolean;
  model: string;
  memories: NeuralMemoryItem[];
  autoSpeech: boolean;
}
