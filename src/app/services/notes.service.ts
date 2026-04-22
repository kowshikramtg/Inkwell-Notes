import { Injectable, signal, computed } from '@angular/core';
import { Note, NoteTag } from '../models/note.model';

const STORAGE_KEY = 'inkwell_notes';

const TAG_KEYWORDS: Record<NoteTag, string[]> = {
  meeting: ['meeting', 'standup', 'sync', 'call', 'agenda', 'discuss', 'conference'],
  idea: ['idea', 'concept', 'think', 'maybe', 'what if', 'brainstorm', 'explore', 'imagine'],
  urgent: ['urgent', 'asap', 'deadline', 'critical', 'immediately', 'priority', 'emergency'],
  todo: ['todo', 'to-do', 'task', 'need to', 'must', 'should', 'finish', 'complete', 'done'],
  personal: ['personal', 'family', 'home', 'health', 'gym', 'diet', 'birthday', 'vacation'],
  work: ['work', 'project', 'client', 'team', 'sprint', 'review', 'report', 'deploy'],
  reminder: ['reminder', 'remind', 'remember', 'don\'t forget', 'follow up', 'check'],
  question: ['why', 'how', 'what', '?', 'wondering', 'not sure', 'confused'],
};

@Injectable({ providedIn: 'root' })
export class NotesService {
  private _notes = signal<Note[]>(this.loadFromStorage());
  private _searchQuery = signal<string>('');
  private _focusedNoteId = signal<string | null>(null);

  readonly notes = computed(() => {
    const query = this._searchQuery().toLowerCase().trim();
    const all = this._notes();
    if (!query) return all;
    return all.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      n.tags.some(t => t.includes(query))
    );
  });

  readonly searchQuery = this._searchQuery.asReadonly();
  readonly focusedNoteId = this._focusedNoteId.asReadonly();

  readonly focusedNote = computed(() => {
    const id = this._focusedNoteId();
    return id ? this._notes().find(n => n.id === id) ?? null : null;
  });

  createNote(): Note {
    const note: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
    };
    this._notes.update(notes => [note, ...notes]);
    this.saveToStorage();
    return note;
  }

  updateNote(id: string, changes: Partial<Pick<Note, 'title' | 'content' | 'isPinned'>>): void {
    this._notes.update(notes =>
      notes.map(n => {
        if (n.id !== id) return n;
        const updated = { ...n, ...changes, updatedAt: new Date() };
        if ('title' in changes || 'content' in changes) {
          updated.tags = this.detectTags(updated.title + ' ' + updated.content);
        }
        return updated;
      })
    );
    this.saveToStorage();
  }

  deleteNote(id: string): void {
    if (this._focusedNoteId() === id) this._focusedNoteId.set(null);
    this._notes.update(notes => notes.filter(n => n.id !== id));
    this.saveToStorage();
  }

  setSearch(query: string): void {
    this._searchQuery.set(query);
  }

  focusNote(id: string | null): void {
    this._focusedNoteId.set(id);
  }

  private detectTags(text: string): NoteTag[] {
    const lower = text.toLowerCase();
    const found: NoteTag[] = [];
    for (const [tag, keywords] of Object.entries(TAG_KEYWORDS) as [NoteTag, string[]][]) {
      if (keywords.some(kw => lower.includes(kw))) {
        found.push(tag);
      }
    }
    return found.slice(0, 3); // max 3 tags per note
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._notes()));
    } catch { /* storage full or unavailable */ }
  }

  private loadFromStorage(): Note[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Note[];
      return parsed.map(n => ({
        ...n,
        createdAt: new Date(n.createdAt),
        updatedAt: new Date(n.updatedAt),
      }));
    } catch {
      return [];
    }
  }
}
