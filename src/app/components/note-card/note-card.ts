import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '../../models/note.model';
import { NotesService } from '../../services/notes.service';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './note-card.html',
  styleUrls: ['./note-card.css'],
})
export class NoteCardComponent {
  @Input({ required: true }) note!: Note;
  @Output() deleted = new EventEmitter<string>();

  private notesService = inject(NotesService);

  get preview(): string {
    const text = this.note.content.replace(/\s+/g, ' ').trim();
    return text.length > 120 ? text.slice(0, 120) + '…' : text;
  }

  get timeAgo(): string {
    const diff = Date.now() - new Date(this.note.updatedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  open(): void {
    this.notesService.focusNote(this.note.id);
  }

  togglePin(event: MouseEvent): void {
    event.stopPropagation();
    this.notesService.updateNote(this.note.id, { isPinned: !this.note.isPinned });
  }

  delete(event: MouseEvent): void {
    event.stopPropagation();
    this.deleted.emit(this.note.id);
  }
}
