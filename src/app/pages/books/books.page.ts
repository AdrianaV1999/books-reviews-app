import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GoogleBooksService, Book } from '../../services/google-books.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-books',
  templateUrl: './books.page.html',
  styleUrls: ['./books.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class BooksPage implements OnInit {
  searchTerm = '';
  books: Book[] = [];
  loading = false;
  error = '';
  private search$ = new Subject<string>();

  constructor(private booksSrv: GoogleBooksService) {}

  ngOnInit() {
    this.search$
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((q) => this.doSearch(q));
  }

  onSearchInput(ev: any) {
    const q = ev?.detail?.value ?? this.searchTerm;
    this.search$.next(q);
  }

  onClear() {
    this.searchTerm = '';
    this.books = [];
  }

  doSearch(query: string) {
    if (!query || !query.trim()) {
      this.books = [];
      return;
    }
    this.loading = true;
    this.error = '';
    this.booksSrv.searchBooks(query, 20).subscribe({
      next: (res) => {
        this.books = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Greška pri učitavanju rezultata';
        this.loading = false;
      },
    });
  }

  openInfo(link?: string) {
    if (!link) return;
    window.open(link, '_blank');
  }
}
