import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Observable<boolean> {
    return authState(this.auth).pipe(
      tap((user) => console.log('AuthGuard user:', user)),
      map((user) => !!user),
      tap((loggedIn) => {
        console.log('AuthGuard loggedIn:', loggedIn);
        if (!loggedIn) {
          this.router.navigate(['/login']);
        }
      })
    );
  }
}
