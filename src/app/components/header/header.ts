import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../services/notes.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent {
  private notesService = inject(NotesService);

  get searchQuery() {
    return this.notesService.searchQuery();
  }

  set searchQuery(val: string) {
    this.notesService.setSearch(val);
  }

  createNote(): void {
    const note = this.notesService.createNote();
    this.notesService.focusNote(note.id);
  }
}
