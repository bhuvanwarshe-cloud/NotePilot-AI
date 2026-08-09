import { useEffect, useState, useCallback } from 'react';
import type { MindMap } from '../types';
import { fetchMindMapForLecture } from '../services/mindmaps.service';

export function useMindMap(lectureId: string | null) {
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadMindMap = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setSelectedNodeId(null);
    setSearchQuery('');
    try {
      const data = await fetchMindMapForLecture(id);
      setMindMap(data);
    } catch (err: any) {
      console.error('Error loading Mind Map:', err);
      setError(err?.message || 'Failed to load mind map');
      setMindMap(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!lectureId) {
      setMindMap(null);
      setLoading(false);
      setError(null);
      setSelectedNodeId(null);
      setSearchQuery('');
      return;
    }

    // Immediately clear state on lectureId change to prevent stale display
    setMindMap(null);
    loadMindMap(lectureId);
  }, [lectureId, loadMindMap]);

  const retry = useCallback(() => {
    if (lectureId) {
      loadMindMap(lectureId);
    }
  }, [lectureId, loadMindMap]);

  return {
    mindMap,
    loading,
    error,
    retry,
    selectedNodeId,
    setSelectedNodeId,
    searchQuery,
    setSearchQuery,
  };
}
