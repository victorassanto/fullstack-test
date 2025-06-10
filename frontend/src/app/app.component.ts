import { Component } from '@angular/core';
import { ItemListComponent } from './components/item-list/item-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ItemListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'fullstack-technical-test';
}
