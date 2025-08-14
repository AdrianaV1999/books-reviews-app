import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, IonModal } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GoogleBooksService, Book } from '../../services/google-books.service';
import { ReviewsService } from 'src/services/reviews.service';
import { Auth } from '@angular/fire/auth';
import { serverTimestamp } from 'firebase/firestore';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { AuthenticationService } from 'src/app/authentication.service';

@Component({
  selector: 'app-books',
  templateUrl: './books.page.html',
  styleUrls: ['./books.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule,
    StarRatingComponent,
  ],
})
export class BooksPage implements OnInit {
  @ViewChild('rateModal') rateModal!: IonModal;

  searchTerm = '';
  books: Book[] = [];
  loading = false;
  error = '';
  private search$ = new Subject<string>();

  selectedBook: Book | null = null;
  rating = { rate: 0, comment: '' };
  isToastOpen = false;
  errorMessage = '';

  constructor(
    private booksSrv: GoogleBooksService,
    private reviewsService: ReviewsService,
    private auth: Auth,
    public router: Router,
    public authService: AuthenticationService
  ) {}

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

  openModalForBook(book: Book) {
    this.selectedBook = book;
    this.rating = { rate: 0, comment: '' };
    this.rateModal.present();
  }

  async dismissModal(isSave = false) {
    if (isSave) {
      if (!this.rating.rate || this.rating.rate === 0) {
        this.showError('Please provide rating!');
        return;
      }

      const user = this.auth.currentUser;
      if (!user) {
        this.showError('You must be logged in to add a review.');
        return;
      }

      await this.reviewsService.addReview({
        bookId: this.selectedBook?.id || '',
        bookTitle: this.selectedBook?.title || 'Unknown Title',
        bookAuthors: this.selectedBook?.authors || [],
        rate: this.rating.rate,
        comment: this.rating.comment,
        userId: user.uid,
        userName: user.displayName || 'User',
      });
    }
    this.rateModal.dismiss();
  }

  onModalDismiss() {
    this.rating = { rate: 0, comment: '' };
    this.selectedBook = null;
  }

  showError(msg: string) {
    this.errorMessage = msg;
    this.isToastOpen = true;
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  async logout() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/landing']);
    } catch (error) {
      console.log(error);
    }
  }
}
