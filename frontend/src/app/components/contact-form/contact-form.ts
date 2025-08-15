import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Contact } from '../../models/contact.model';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.html',
})
export class ContactForm implements OnInit {
  @Input() contact?: Contact;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Contact>();

  contactForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.contact) {
      this.contactForm.patchValue(this.contact);
    }
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.loading = true;
      this.error = null;
      const formValue = this.contactForm.value;
      if (this.contact) {
        this.contactService.updateContact(this.contact.id, formValue).subscribe({
          next: (updatedContact) => {
            this.save.emit(updatedContact);
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to update contact.';
            this.loading = false;
            console.error(err);
          }
        });
      } else {
        this.contactService.createContact(formValue).subscribe({
          next: (newContact) => {
            this.save.emit(newContact);
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to create contact.';
            this.loading = false;
            console.error(err);
          }
        });
      }
    }
  }
}
