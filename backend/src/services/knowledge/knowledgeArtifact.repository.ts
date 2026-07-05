import type { KnowledgeArtifact } from './types';

export interface KnowledgeArtifactRepository {
  saveArtifact(lectureId: string, artifact: KnowledgeArtifact, metadata?: Record<string, unknown>): Promise<{ id: string }>;
  getArtifact(lectureId: string): Promise<KnowledgeArtifact | null>;
}

interface StoredArtifactRecord {
  artifact: KnowledgeArtifact;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export class InMemoryKnowledgeArtifactRepository implements KnowledgeArtifactRepository {
  private readonly artifacts = new Map<string, StoredArtifactRecord>();

  async saveArtifact(lectureId: string, artifact: KnowledgeArtifact, metadata?: Record<string, unknown>): Promise<{ id: string }> {
    const now = new Date().toISOString();
    const existing = this.artifacts.get(lectureId);

    this.artifacts.set(lectureId, {
      artifact,
      metadata,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });

    return { id: lectureId };
  }

  async getArtifact(lectureId: string): Promise<KnowledgeArtifact | null> {
    return this.artifacts.get(lectureId)?.artifact ?? null;
  }
}
