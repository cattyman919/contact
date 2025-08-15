import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactList } from './components/contact-list/contact-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ContactList],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Contact List');
}
