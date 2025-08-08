import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AutheticationService } from 'src/app/authetication.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule],
})
export class ResetPasswordPage implements OnInit {
  email: any;
  constructor(public route: Router, public authService: AutheticationService) {}

  ngOnInit() {}

  async resetPassword() {
    this.authService
      .resetPassword(this.email)
      .then(() => {
        console.log('reset link sent');
        this.route.navigate(['/login']);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
