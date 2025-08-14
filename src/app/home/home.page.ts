import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { Auth, authState, User } from '@angular/fire/auth';
import { ReviewsService, Review } from 'src/services/reviews.service';
import { GoogleBooksService } from 'src/app/services/google-books.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { StarRatingComponent } from '../pages/star-rating/star-rating.component';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, StarRatingComponent, RouterModule],
})
export class HomePage implements OnInit {
  email: string | null = null;
  latestReviews: Review[] = [];

  constructor(
    public route: Router,
    public authService: AuthenticationService,
    private auth: Auth,
    private reviewsService: ReviewsService,
    private googleBooksService: GoogleBooksService
  ) {}

  ngOnInit() {
    authState(this.auth).subscribe((user: User | null) => {
      this.email = user?.email ?? null;
    });

    this.reviewsService.getUserReviews().subscribe((reviews) => {
      reviews.sort((a, b) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      this.latestReviews = reviews.slice(0, 7);

      this.latestReviews.forEach((review) => {
        this.googleBooksService.getBookById(review.bookId).subscribe((book) => {
          if (book?.thumbnail) (review as any).thumbnail = book.thumbnail;
        });
      });
    });
  }

  async logout() {
    try {
      await this.authService.signOut();
      this.route.navigate(['/landing']);
    } catch (error) {
      console.log(error);
    }
  }
}
