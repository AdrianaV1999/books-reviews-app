import { Component } from '@angular/core';
import { AutheticationService } from '../authetication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  email: any;

  constructor(public route: Router, public authService: AutheticationService) {
    this.authService
      .getProfile()
      .then((user) => {
        this.email = user?.email;
        console.log(user?.email);
      })
      .catch((error) => {
        console.error('Error getting user profile:', error);
      });
  }

  async logout() {
    this.authService
      .signOut()
      .then(() => {
        this.route.navigate(['/landing']);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
