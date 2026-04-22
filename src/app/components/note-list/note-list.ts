import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteCardComponent } from '../note-card/note-card';
import { NotesService } from '../../services/notes.service';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [CommonModule, NoteCardComponent],
  templateUrl: './note-list.html',
  styleUrls: ['./note-list.css'],
})
export class NoteListComponent {
  private notesService = inject(NotesService);

  get notes() { return this.notesService.notes(); }
  get pinnedNotes() { return this.notes.filter(n => n.isPinned); }
  get unpinnedNotes() { return this.notes.filter(n => !n.isPinned); }
  get isEmpty() { return this.notes.length === 0; }
  get isSearching() { return !!this.notesService.searchQuery(); }

  deleteNote(id: string): void {
    this.notesService.deleteNote(id);
  }

  trackById(_: number, note: { id: string }) { return note.id; }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'n' || e.key === 'N') {
      const note = this.notesService.createNote();
      this.notesService.focusNote(note.id);
    }
  }
}
// trackBy added at bottom of class — need to add inside class body
