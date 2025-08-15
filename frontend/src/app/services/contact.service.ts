import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Contact, ContactResponse } from '../models/contact.model';



@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:3000/api/v1/contacts';

  constructor(private http: HttpClient) { }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  getContacts(): Observable<ContactResponse> {
    return this.http.get<ContactResponse>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getContact(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createContact(contact: Omit<Contact, 'id'>): Observable<Contact> {
    return this.http.post<Contact>(this.apiUrl, contact).pipe(
      catchError(this.handleError)
    );
  }

  updateContact(id: string, contact: Partial<Contact>): Observable<Contact> {
    return this.http.patch<Contact>(`${this.apiUrl}/${id}`, contact).pipe(
      catchError(this.handleError)
    );
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
