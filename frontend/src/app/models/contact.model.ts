export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface PaginatedContactsResponse {
  data: Contact[];
  nextCursor: string | null;
  prevCursor: string | null;
}
