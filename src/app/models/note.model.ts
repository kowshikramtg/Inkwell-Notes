export type NoteTag = 'meeting' | 'idea' | 'urgent' | 'todo' | 'personal' | 'work' | 'reminder' | 'question';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: NoteTag[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
}
