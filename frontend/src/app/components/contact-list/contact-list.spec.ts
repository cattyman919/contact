import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ContactList } from './contact-list';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../models/contact.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const mockContacts: Contact[] = [
  { id: '1', name: 'John Doe', phone: '1234567890', email: 'john@example.com' },
  { id: '2', name: 'Jane Doe', phone: '0987654321', email: 'jane@example.com' },
];

class MockContactService {
  getContacts(query?: string) {
    if (query) {
      return of(mockContacts.filter(c => c.name.includes(query) || c.phone.includes(query)));
    }
    return of(mockContacts);
  }
}

describe('ContactList', () => {
  let component: ContactList;
  let fixture: ComponentFixture<ContactList>;
  let contactService: ContactService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactList, HttpClientTestingModule],
      providers: [
        { provide: ContactService, useClass: MockContactService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactList);
    component = fixture.componentInstance;
    contactService = TestBed.inject(ContactService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load contacts on init', () => {
    expect(component.contacts.length).toBe(2);
    expect(component.allContacts.length).toBe(2);
  });

  it('should filter contacts on search', () => {
    const event = { target: { value: 'John' } } as unknown as Event;
    component.onSearch(event);
    fixture.detectChanges();
    expect(component.contacts.length).toBe(1);
    expect(component.contacts[0].name).toBe('John Doe');
  });
});
