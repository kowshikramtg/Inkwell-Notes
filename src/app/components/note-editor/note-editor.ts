import {
  Component, inject, HostListener, ViewChild,
  ElementRef, AfterViewInit, OnDestroy, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-editor.html',
  styleUrls: ['./note-editor.css'],
})
export class NoteEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('titleInput') titleInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('contentInput') contentInput?: ElementRef<HTMLTextAreaElement>;

  private notesService = inject(NotesService);
  private autosaveTimer: ReturnType<typeof setTimeout> | null = null;

  note: Note | null = null;
  localTitle = '';
  localContent = '';
  isSaved = true;

  constructor() {
    effect(() => {
      const n = this.notesService.focusedNote();
      if (n) {
        this.note = n;
        this.localTitle = n.title;
        this.localContent = n.content;
        this.isSaved = true;
      } else {
        this.note = null;
      }
    });
  }

  ngAfterViewInit(): void {
    this.focusTitle();
  }

  ngOnDestroy(): void {
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
  }

  get isOpen(): boolean {
    return !!this.note;
  }

  get wordCount(): number {
    return this.localContent.trim()
      ? this.localContent.trim().split(/\s+/).length
      : 0;
  }

  get tags() {
    return this.note?.tags ?? [];
  }

  onTitleChange(): void {
    this.scheduleAutosave();
  }

  onContentChange(): void {
    this.scheduleAutosave();
  }

  close(): void {
    this.flush();
    this.notesService.focusNote(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close();
  }

  private focusTitle(): void {
    setTimeout(() => {
      if (!this.localTitle) {
        this.titleInput?.nativeElement.focus();
      } else {
        this.contentInput?.nativeElement.focus();
      }
    }, 80);
  }

  private scheduleAutosave(): void {
    this.isSaved = false;
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    this.autosaveTimer = setTimeout(() => this.flush(), 600);
  }

  private flush(): void {
    if (!this.note) return;
    this.notesService.updateNote(this.note.id, {
      title: this.localTitle,
      content: this.localContent,
    });
    this.isSaved = true;
  }

  autoResize(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }
}
