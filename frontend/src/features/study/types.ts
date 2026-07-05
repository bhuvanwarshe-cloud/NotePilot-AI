export interface StudyNote {
  id: string;
  lectureId: string;
  lectureTitle: string;
  lectureType: string;
  lectureThumbnailUrl?: string | null;
  language: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
  provider?: string | null;
  markdown: string;
  readingTime: number;
  wordCount: number;
  headings: number;
  lists: number;
  codeBlocks: number;
  tables: number;
  definitions: number;
  revisionTime: number;
  isFavorite?: boolean;
}

export interface StudyWorkspaceState {
  selectedNoteId: string | null;
  searchQuery: string;
  sortOrder: 'newest' | 'oldest' | 'alphabetical';
  view: 'list' | 'reader';
}
