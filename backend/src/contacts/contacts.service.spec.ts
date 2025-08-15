import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

const mockContact: Contact = {
  id: 'a7a1f8e2-c2e2-4e2a-8f5c-2f3b9a7b1b2c',
  name: 'John Doe',
  phone: '081234567890',
  email: 'john@doe.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  generateId: jest.fn(),
};

const mockContactsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  remove: jest.fn(),
};

describe('ContactsService', () => {
  let service: ContactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: getRepositoryToken(Contact),
          useValue: mockContactsRepository,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new contact', async () => {
      const createContactDto: CreateContactDto = {
        name: 'John Doe',
        phone: '081234567890',
        email: 'john@doe.com',
      };
      mockContactsRepository.create.mockReturnValue(mockContact);
      mockContactsRepository.save.mockResolvedValue(mockContact);

      await expect(service.create(createContactDto)).resolves.toEqual(
        mockContact,
      );
      expect(mockContactsRepository.create).toHaveBeenCalledWith(
        createContactDto,
      );
      expect(mockContactsRepository.save).toHaveBeenCalledWith(mockContact);
    });

    it('should throw a ConflictException if phone number or email already exists', async () => {
      const createContactDto: CreateContactDto = {
        name: 'John Doe',
        phone: '081234567890',
        email: 'john@doe.com',
      };
      mockContactsRepository.create.mockReturnValue(mockContact);
      mockContactsRepository.save.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      await expect(service.create(createContactDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of contacts', async () => {
      mockContactsRepository.find.mockResolvedValue([mockContact]);
      await expect(service.findAll()).resolves.toEqual([mockContact]);
      expect(mockContactsRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAllPaginated', () => {
    const limit = 5;
    const generateContacts = (length: number, offset = 0) =>
      Array.from({ length }, (_, i) => ({
        ...mockContact,
        id: `uuid-${i + offset}`,
        createdAt: new Date(
          `2025-08-15T12:00:${(i + offset).toString().padStart(2, '0')}Z`,
        ),
      }));

    it('should return the first page with a next cursor', async () => {
      const contacts = generateContacts(limit + 1);
      mockContactsRepository.find.mockResolvedValue(contacts);

      const result = await service.findAllPaginated({ limit });

      expect(result.data.length).toBe(limit);
      expect(result.nextCursor).not.toBeNull();
      expect(result.prevCursor).toBeNull();
      expect(result.data[0].id).toBe('uuid-0');
    });

    it('should return the next page with next and prev cursors', async () => {
      const contacts = generateContacts(limit + 1, 5);
      mockContactsRepository.find.mockResolvedValue(contacts);
      const nextCursor = Buffer.from(
        `2025-08-15T12:00:04Z_uuid-4`,
      ).toString('base64');

      const result = await service.findAllPaginated({ limit, nextCursor });

      expect(result.data.length).toBe(limit);
      expect(result.nextCursor).not.toBeNull();
      expect(result.prevCursor).not.toBeNull();
      expect(result.data[0].id).toBe('uuid-5');
    });

    it('should return the last page with a prev cursor', async () => {
      const contacts = generateContacts(3, 10);
      mockContactsRepository.find.mockResolvedValue(contacts);
      const nextCursor = Buffer.from(
        `2025-08-15T12:00:09Z_uuid-9`,
      ).toString('base64');

      const result = await service.findAllPaginated({ limit, nextCursor });

      expect(result.data.length).toBe(3);
      expect(result.nextCursor).toBeNull();
      expect(result.prevCursor).not.toBeNull();
      expect(result.data[0].id).toBe('uuid-10');
    });

    it('should return the previous page with next and prev cursors', async () => {
      const contacts = generateContacts(limit + 1, 4).reverse();
      mockContactsRepository.find.mockResolvedValue(contacts);
      const prevCursor = Buffer.from(
        `2025-08-15T12:00:10Z_uuid-10`,
      ).toString('base64');

      const result = await service.findAllPaginated({ limit, prevCursor });

      expect(result.data.length).toBe(limit);
      expect(result.nextCursor).not.toBeNull();
      expect(result.prevCursor).not.toBeNull();
      expect(result.data[0].id).toBe('uuid-5');
      expect(result.data[4].id).toBe('uuid-9');
    });

    it('should throw BadRequestException if both cursors are provided', async () => {
      await expect(
        service.findAllPaginated({
          nextCursor: 'abc',
          prevCursor: 'def',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a single contact', async () => {
      mockContactsRepository.findOneBy.mockResolvedValue(mockContact);
      await expect(service.findOne(mockContact.id)).resolves.toEqual(
        mockContact,
      );
      expect(mockContactsRepository.findOneBy).toHaveBeenCalledWith({
        id: mockContact.id,
      });
    });

    it('should throw a NotFoundException if contact is not found', async () => {
      mockContactsRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(mockContact.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a contact', async () => {
      const updateContactDto: UpdateContactDto = { name: 'Jane Doe' };
      mockContactsRepository.preload.mockResolvedValue(mockContact);
      mockContactsRepository.save.mockResolvedValue(mockContact);

      await expect(
        service.update(mockContact.id, updateContactDto),
      ).resolves.toEqual(mockContact);
      expect(mockContactsRepository.preload).toHaveBeenCalledWith({
        id: mockContact.id,
        ...updateContactDto,
      });
      expect(mockContactsRepository.save).toHaveBeenCalledWith(mockContact);
    });

    it('should throw a NotFoundException if contact to update is not found', async () => {
      const updateContactDto: UpdateContactDto = { name: 'Jane Doe' };
      mockContactsRepository.preload.mockResolvedValue(null);
      await expect(
        service.update(mockContact.id, updateContactDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a ConflictException if phone number or email already exists on update', async () => {
      const updateContactDto: UpdateContactDto = { name: 'Jane Doe' };
      mockContactsRepository.preload.mockResolvedValue(mockContact);
      mockContactsRepository.save.mockRejectedValue({ code: 'ER_DUP_ENTRY' });
      await expect(
        service.update(mockContact.id, updateContactDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a contact', async () => {
      mockContactsRepository.findOneBy.mockResolvedValue(mockContact);
      await expect(service.remove(mockContact.id)).resolves.toEqual({
        message: `Contact with ID "${mockContact.id}" has been removed.`,
      });
      expect(mockContactsRepository.remove).toHaveBeenCalledWith(mockContact);
    });

    it('should throw a NotFoundException if contact to remove is not found', async () => {
      mockContactsRepository.findOneBy.mockResolvedValue(null);
      await expect(service.remove(mockContact.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
