import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../models/contact.model';
import { ContactService } from '../../services/contact.service';
import { ContactForm } from '../contact-form/contact-form';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-contact-list',
  imports: [CommonModule, ContactForm, ConfirmationDialog],
  templateUrl: './contact-list.html',
})
export class ContactList implements OnInit {
  contacts: Contact[] = [];
  showForm = false;
  showConfirmation = false;
  selectedContact?: Contact;
  contactToDelete?: Contact;
  loading = false;
  error: string | null = null;

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading = true;
    this.error = null;
    this.contactService.getContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load contacts.';
        this.loading = false;
        console.error(err);
      },
    });
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
    this.loadContacts();
    this.showForm = false;
  }

  onClose(): void {
    this.showForm = false;
  }

  onConfirmDelete(): void {
    if (this.contactToDelete) {
      this.contactService.deleteContact(this.contactToDelete.id).subscribe(() => {
        this.loadContacts();
        this.showConfirmation = false;
      });
    }
  }

  onCancelDelete(): void {
    this.showConfirmation = false;
  }
}
