export interface Topic {
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
}

export interface Definition {
  term: string;
  explanation: string;
}

export interface Formula {
  name: string;
  expression: string;
  explanation: string;
}

export interface Example {
  title: string;
  description: string;
  takeaway: string;
}

export interface Concept {
  name: string;
  explanation: string;
  examRelevance: string;
}

export interface ExamInsight {
  title: string;
  insight: string;
  whyItMatters: string;
}

export interface KnowledgeArtifact {
  topics: Topic[];
  definitions: Definition[];
  formulae: Formula[];
  examples: Example[];
  importantConcepts: Concept[];
  examInsights: ExamInsight[];
  rawMarkdown: string;
}

export interface KnowledgeGenerationInput {
  lectureId: string;
  title?: string | null;
  transcriptText: string;
  language?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface GenerationMetadata {
  provider: string;
  model: string;
  systemPromptVersion: string;
  taskPromptVersion: string;
  temperature: number;
  generatedAt: string;
}

export interface GeneratedNotesResult {
  content: string;
  metadata: GenerationMetadata;
  artifact: KnowledgeArtifact;
}
