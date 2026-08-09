import { useState } from 'react';

import { useStudyLectures } from '@/features/study/hooks/useStudyLectures';
import { StudySidebar } from '@/features/study/components/StudySidebar';
import { EmptyState as GlobalEmptyState } from '@/features/study/components/EmptyState';
import { LoadingState } from '@/features/study/components/LoadingState';
import { ErrorState } from '@/features/study/components/ErrorState';
import { LecturePickerSheet, LecturePickerTrigger } from '@/features/study/components/LecturePickerSheet';

import { useMindMap } from '@/features/mindmaps/hooks/useMindMap';
import { MindMapCanvas } from '@/features/mindmaps/components/MindMapCanvas';
import { MindMapLoading } from '@/features/mindmaps/components/MindMapLoading';
import { MindMapEmpty } from '@/features/mindmaps/components/MindMapEmpty';
import { MindMapError } from '@/features/mindmaps/components/MindMapError';

import { useIsCompact } from '@/hooks/useMediaQuery';

export function MindMapsPage() {
  const {
    lectures,
    loading: lecturesLoading,
    error: lecturesError,
    selectedLectureId,
    searchQuery,
    sortOrder,
    setSelectedLectureId,
    setSearchQuery,
    setSortOrder,
  } = useStudyLectures();

  const {
    mindMap,
    loading: mindMapLoading,
    error: mindMapError,
    retry,
    selectedNodeId,
    setSelectedNodeId,
  } = useMindMap(selectedLectureId);

  const isCompact = useIsCompact();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (lecturesLoading) return <LoadingState />;
  if (lecturesError)   return <ErrorState message={lecturesError} onRetry={() => window.location.reload()} />;
  if (!lectures.length) return <GlobalEmptyState />;

  const selectedLecture = lectures.find((l) => l.id === selectedLectureId);

  const renderMindMapContent = () => {
    if (mindMapLoading) return <MindMapLoading />;
    if (mindMapError)   return <MindMapError message={mindMapError} onRetry={retry} />;
    if (!mindMap || !mindMap.nodes || mindMap.nodes.length === 0) return <MindMapEmpty />;

    return (
      <MindMapCanvas
        title={selectedLecture?.title || mindMap.title}
        nodes={mindMap.nodes}
        edges={mindMap.edges}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
      />
    );
  };

  // ── Desktop Layout (≥1024px) ──────────────────────────────────
  if (!isCompact) {
    return (
      <div style={{ padding: '24px 20px 40px', maxWidth: 1600, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
          <div style={{ minWidth: 0 }}>
            <StudySidebar
              items={lectures}
              selectedId={selectedLectureId}
              searchQuery={searchQuery}
              sortOrder={sortOrder}
              onSelect={setSelectedLectureId}
              onSearchChange={setSearchQuery}
              onSortChange={setSortOrder}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            {selectedLectureId ? (
              renderMindMapContent()
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--np-text-muted)' }}>
                Select a lecture to view its Mind Map
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Compact Layout (<1024px) ──────────────────────────────────
  return (
    <div style={{ padding: '12px 0 32px', width: '100%', boxSizing: 'border-box' }}>
      {/* Lecture Picker Trigger */}
      <div style={{ padding: '0 16px' }}>
        <LecturePickerTrigger
          selectedLecture={selectedLecture}
          onClick={() => setSheetOpen(true)}
          pageTitle="Mind Maps"
        />
      </div>

      {/* Bottom Sheet for Lecture Picker */}
      <LecturePickerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        selectedLecture={selectedLecture}
        items={lectures}
        searchQuery={searchQuery}
        sortOrder={sortOrder}
        onSelect={setSelectedLectureId}
        onSearchChange={setSearchQuery}
        onSortChange={setSortOrder}
        pageTitle="Select Lecture"
      />

      {/* Main Content Canvas Area */}
      <div style={{ padding: '0 16px' }}>
        {selectedLectureId ? (
          renderMindMapContent()
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--np-text-muted)' }}>
            Select a lecture above to view its Mind Map
          </div>
        )}
      </div>
    </div>
  );
}
