import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Book {
  id: string;
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  thumbnail?: string;
  infoLink?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleBooksService {
  private API = 'https://www.googleapis.com/books/v1/volumes';

  constructor(private http: HttpClient) {}

  searchBooks(
    query: string,
    maxResults = 20,
    startIndex = 0
  ): Observable<Book[]> {
    if (!query || !query.trim()) {
      return new Observable<Book[]>((subs) => {
        subs.next([]);
        subs.complete();
      });
    }

    const url = `${this.API}?q=${encodeURIComponent(
      query
    )}&maxResults=${maxResults}&startIndex=${startIndex}`;

    return this.http.get<any>(url).pipe(
      map((res) =>
        (res.items || []).map((item: any) => {
          const v = item.volumeInfo || {};
          return {
            id: item.id,
            title: v.title,
            authors: v.authors,
            publisher: v.publisher,
            publishedDate: v.publishedDate,
            description: v.description,
            thumbnail: v.imageLinks?.thumbnail?.replace('http:', 'https:'),
            infoLink: v.infoLink,
          } as Book;
        })
      )
    );
  }
}
