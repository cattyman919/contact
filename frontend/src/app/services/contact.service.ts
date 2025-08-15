import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Contact, PaginatedContactsResponse } from '../models/contact.model';

interface ApiResponse<T> {
  status: string;
  statusCode: number;
  data?: T;
  message?: string;
  nextCursor: string | null;
  prevCursor: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private apiUrl = 'http://localhost:3000/api/v1/contacts';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Something bad happened; please try again later.';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else {
      console.error(
        `Error returned code ${error.status}, ` + `body was: ${JSON.stringify(error.error)}`,
      );
    }
    return throwError(() => new Error(errorMessage));
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<ApiResponse<Contact[]>>(this.apiUrl).pipe(
      map((response) => response.data || []),
      catchError(this.handleError),
    );
  }

  getContactsCount(): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/count`).pipe(
      map((response) => response.data || 0),
      catchError(this.handleError),
    );
  }

  getContactbyId(id: string): Observable<Contact> {
    return this.http.get<ApiResponse<Contact>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (!response.data) {
          throw new Error('Contact not found in API response');
        }
        return response.data;
      }),
      catchError(this.handleError),
    );
  }

  createContact(contact: Omit<Contact, 'id'>): Observable<Contact> {
    return this.http.post<ApiResponse<Contact>>(this.apiUrl, contact).pipe(
      map((response) => {
        if (!response.data) {
          throw new Error('Created contact not found in API response');
        }
        return response.data;
      }),
      catchError(this.handleError),
    );
  }

  updateContact(id: string, contact: Partial<Contact>): Observable<Contact> {
    return this.http.patch<ApiResponse<Contact>>(`${this.apiUrl}/${id}`, contact).pipe(
      map((response) => {
        if (!response.data) {
          throw new Error('Updated contact not found in API response');
        }
        return response.data;
      }),
      catchError(this.handleError),
    );
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  getContactsPaginated(
    cursor: string | null,
    direction: 'next' | 'prev',
    limit = 10,
  ): Observable<PaginatedContactsResponse> {
    let params = new HttpParams().set('limit', limit.toString());
    if (cursor) {
      if (direction === 'next') {
        params = params.set('nextCursor', cursor);
      } else {
        params = params.set('prevCursor', cursor);
      }
    }
    return this.http
      .get<ApiResponse<Contact[]>>(`${this.apiUrl}/paginated`, {
        params,
      })
      .pipe(
        map((response) => {
          if (!response.data) {
            throw new Error('Paginated contacts not found in API response');
          }
          const response_paginated: PaginatedContactsResponse = {
            data: response.data,
            nextCursor: response.nextCursor,
            prevCursor: response.prevCursor,
          };

          return response_paginated;
        }),
        catchError(this.handleError),
      );
  }
}
