export type Language = 'fa' | 'en';

export type CognitiveMode = 'sovereign' | 'mission' | 'code' | 'search' | 'terminal';

export type ThinkingLevelOption = 'HIGH' | 'LOW' | 'MINIMAL';

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
  searchEntryPoint?: { renderedContent?: string };
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
  model: string;
  memories: NeuralMemoryItem[];
  autoSpeech: boolean;
}
