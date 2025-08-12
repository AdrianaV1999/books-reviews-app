import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { Observable, of, switchMap, map } from 'rxjs';

export interface Review {
  id?: string;
  bookId: string;
  bookTitle: string;
  bookAuthors: string[];
  rate: number;
  comment?: string;
  userId: string;
  userName: string;
  createdAt: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async addReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) {
    const reviewsRef = collection(this.firestore, 'reviews');
    return addDoc(reviewsRef, {
      ...review,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async updateReview(id: string, data: Partial<Review>) {
    const reviewDocRef = doc(this.firestore, `reviews/${id}`);
    return updateDoc(reviewDocRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteReview(id: string) {
    const reviewDocRef = doc(this.firestore, `reviews/${id}`);
    return deleteDoc(reviewDocRef);
  }

  getUserReviewsForBook(bookId: string): Observable<Review[]> {
    return user(this.auth).pipe(
      switchMap((usr) => {
        if (!usr?.uid) {
          return of([]);
        }
        const reviewsRef = collection(this.firestore, 'reviews');
        const q = query(
          reviewsRef,
          where('bookId', '==', bookId),
          orderBy('createdAt', 'desc') // samo ovaj uslov
        );
        return collectionData(q, { idField: 'id' }).pipe(
          map((reviews: Review[]) =>
            reviews.filter((review) => review.userId === usr.uid)
          )
        ) as Observable<Review[]>;
      })
    );
  }

  getUserReviews(): Observable<Review[]> {
    return user(this.auth).pipe(
      switchMap((usr) => {
        if (!usr?.uid) {
          return of([]);
        }
        const reviewsRef = collection(this.firestore, 'reviews');
        const q = query(
          reviewsRef,
          where('userId', '==', usr.uid),
          orderBy('createdAt', 'desc')
        );
        return collectionData(q, { idField: 'id' }) as Observable<Review[]>;
      })
    );
  }
}
