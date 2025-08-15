export interface ContactResponse {
  status: string;
  stausCode: number;
  data: Contact[];
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
}
