import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header';
import { NoteListComponent } from './components/note-list/note-list';
import { NoteEditorComponent } from './components/note-editor/note-editor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, NoteListComponent, NoteEditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
