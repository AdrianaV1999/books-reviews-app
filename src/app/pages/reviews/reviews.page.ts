import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IonicModule, IonModal } from '@ionic/angular';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { FormsModule } from '@angular/forms';
import { GoogleBooksService } from 'src/app/services/google-books.service';
import { Auth } from '@angular/fire/auth';
import { ReviewsService, Review } from 'src/services/reviews.service';
import { serverTimestamp } from 'firebase/firestore';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule,
    StarRatingComponent,
  ],
})
export class ReviewsPage implements OnInit {
  @ViewChild('rate_modal') rateModal!: IonModal;
  @ViewChild('details_modal') detailsModal!: IonModal;
  selectedReview: Review | null = null;

  bookId!: string;
  book: any = null;
  reviews: Review[] = [];

  rating = { rate: 0, comment: '' };
  editingReviewId: string | null = null;

  isToastOpen = false;
  errorMessage = '';
  sortBy: 'date' | 'rate' = 'date';
  constructor(
    private route: ActivatedRoute,
    private reviewsService: ReviewsService,
    private auth: Auth,
    private googleBooksService: GoogleBooksService
  ) {}

  ngOnInit() {
    this.bookId = this.route.snapshot.paramMap.get('bookId') || '';

    const loadReviews$ = this.bookId
      ? this.reviewsService.getUserReviewsForBook(this.bookId)
      : this.reviewsService.getUserReviews();

    loadReviews$.subscribe({
      next: (reviews) => {
        reviews.forEach((review) => {
          this.googleBooksService
            .getBookById(review.bookId)
            .subscribe((book) => {
              if (book?.thumbnail) {
                (review as any).thumbnail = book.thumbnail;
              }
            });
        });

        this.reviews = reviews;
        this.onSortChange();
      },
      error: (err) => console.error(err),
    });
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  openModalForNew() {
    this.editingReviewId = null;
    this.rating = { rate: 0, comment: '' };
    this.rateModal.present();
  }

  openModalForEdit(review: Review) {
    this.editingReviewId = review.id || null;
    this.rating = {
      rate: review.rate,
      comment: review.comment || '',
    };
    this.rateModal.present();
  }

  updateReview(review: Review) {
    this.openModalForEdit(review);
  }
  onSortChange() {
    if (this.sortBy === 'date') {
      this.sortReviewsByDate();
    } else if (this.sortBy === 'rate') {
      this.sortReviewsByRate();
    }
  }
  sortReviewsByRate() {
    this.reviews.sort((a, b) => b.rate - a.rate);
  }

  sortReviewsByDate() {
    this.reviews.sort((a, b) => {
      const dateA = a.updatedAt
        ? a.updatedAt.toDate
          ? a.updatedAt.toDate()
          : new Date(a.updatedAt)
        : new Date(0);
      const dateB = b.updatedAt
        ? b.updatedAt.toDate
          ? b.updatedAt.toDate()
          : new Date(b.updatedAt)
        : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  async dismiss(isSave = false) {
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

      const userId = user.uid;
      const userName = user.displayName || 'User';

      if (this.editingReviewId) {
        await this.reviewsService.updateReview(this.editingReviewId, {
          rate: this.rating.rate,
          comment: this.rating.comment,
          updatedAt: serverTimestamp(),
        });
      } else {
        await this.reviewsService.addReview({
          bookId: this.bookId,
          bookTitle: this.book?.title || 'Unknown Title',
          bookAuthors: this.book?.authors || [],
          rate: this.rating.rate,
          comment: this.rating.comment,
          userId,
          userName,
        });
      }
    }
    this.rateModal.dismiss();
  }

  onWillDismiss(event: any) {}

  async deleteReview(id: string) {
    if (confirm('Are you sure you want to delete this review?')) {
      await this.reviewsService.deleteReview(id);
    }
  }

  showError(msg: string) {
    this.errorMessage = msg;
    this.isToastOpen = true;
  }

  openDetailsModal(review: Review) {
    this.selectedReview = review;
    this.detailsModal.present();
  }

  closeDetailsModal() {
    this.detailsModal.dismiss();
  }

  onDetailsDismiss() {
    this.selectedReview = null;
  }
}
