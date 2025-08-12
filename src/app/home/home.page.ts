import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { Auth, authState, User } from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  email: string | null = null;

  constructor(
    public route: Router,
    public authService: AuthenticationService,
    private auth: Auth
  ) {}

  ngOnInit() {
    authState(this.auth).subscribe((user: User | null) => {
      this.email = user?.email ?? null;
      console.log(this.email);
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
