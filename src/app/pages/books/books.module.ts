import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BooksPageRoutingModule } from './books-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, BooksPageRoutingModule],
})
export class BooksPageModule {}
