import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MrbauPageLayoutComponent } from '../mrbau-page-layout/mrbau-page-layout.component';

@Component({
  selector: 'lib-commontest',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MrbauPageLayoutComponent],
  templateUrl: './commontest.component.html',
  styleUrls: ['./commontest.component.scss']
})
export class CommonTestComponent {
  errorMessage = "Test Error Message";
  loaderVisible = false;

  fakeLoading(){
    this.loaderVisible = true;
    setTimeout(() => this.loaderVisible = false, 2000);
  }
}
