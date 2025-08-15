import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../models/contact.model';
import { ContactService } from '../../services/contact.service';
import { ContactForm } from '../contact-form/contact-form';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope, faPhone, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-contact-list',
  imports: [CommonModule, ContactForm, ConfirmationDialog, FontAwesomeModule],
  templateUrl: './contact-list.html',
})
export class ContactList implements OnInit {
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faUser = faUser;
  faEdit = faEdit;
  faTrash = faTrash;

  contacts: Contact[] = [];
  allContacts: Contact[] = [];
  showForm = false;
  showConfirmation = false;
  selectedContact?: Contact;
  contactToDelete?: Contact;
  loading = false;
  error: string | null = null;

  // Pagination state
  totalContacts = 0;
  currentPage = 1;
  limit = 10;
  totalPages = 0;
  pages: number[] = [];

  searchQuery = '';

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    this.contactService.getContacts(this.searchQuery).subscribe({
      next: (contacts) => {
        this.allContacts = contacts;
        this.totalContacts = contacts.length;
        this.totalPages = Math.ceil(this.totalContacts / this.limit);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.loadPage(1);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load contacts.';
        this.loading = false;
        console.error(err);
      },
    });
  }

  loadPage(page: number): void {
    if (page < 1 || (page > this.totalPages && this.totalPages > 0)) {
      return;
    }

    this.currentPage = page;
    const start = (page - 1) * this.limit;
    const end = start + this.limit;
    this.contacts = this.allContacts.slice(start, end);
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadPage(this.currentPage + 1);
    }
  }

  goToPrevPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1);
    }
  }

  addContact(): void {
    this.selectedContact = undefined;
    this.showForm = true;
  }

  editContact(contact: Contact): void {
    this.selectedContact = contact;
    this.showForm = true;
  }

  deleteContact(contact: Contact): void {
    this.contactToDelete = contact;
    this.showConfirmation = true;
  }

  onSave(contact: Contact): void {
    this.loadInitialData();
    this.showForm = false;
  }

  onClose(): void {
    this.showForm = false;
  }

  onConfirmDelete(): void {
    if (this.contactToDelete) {
      this.contactService.deleteContact(this.contactToDelete.id).subscribe(() => {
        this.loadInitialData();
        this.showConfirmation = false;
      });
    }
  }

  onCancelDelete(): void {
    this.showConfirmation = false;
  }
}
