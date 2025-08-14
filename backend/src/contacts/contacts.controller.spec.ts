import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

const mockContact = {
  id: 'a7a1f8e2-c2e2-4e2a-8f5c-2f3b9a7b1b2c',
  name: 'John Doe',
  phone: '081234567890',
  email: 'john@doe.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  generateId: jest.fn(),
};

const mockContactsService = {
  findAll: jest.fn().mockResolvedValue([mockContact]),
  findOne: jest.fn().mockResolvedValue(mockContact),
  create: jest.fn().mockResolvedValue(mockContact),
  update: jest.fn().mockResolvedValue(mockContact),
  remove: jest.fn().mockResolvedValue({
    message: `Contact with ID "${mockContact.id}" has been removed.`,
  }),
};

describe('ContactsController', () => {
  let controller: ContactsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        {
          provide: ContactsService,
          useValue: mockContactsService,
        },
      ],
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get an array of contacts', async () => {
    await expect(controller.findAll()).resolves.toEqual([mockContact]);
    expect(mockContactsService.findAll).toHaveBeenCalled();
  });

  it('should get a single contact', async () => {
    await expect(controller.findOne(mockContact.id)).resolves.toEqual(
      mockContact,
    );
    expect(mockContactsService.findOne).toHaveBeenCalledWith(mockContact.id);
  });

  it('should create a contact', async () => {
    const createContactDto: CreateContactDto = {
      name: 'John Doe',
      phone: '081234567890',
      email: 'john@doe.com',
    };
    await expect(controller.create(createContactDto)).resolves.toEqual(
      mockContact,
    );
    expect(mockContactsService.create).toHaveBeenCalledWith(createContactDto);
  });

  it('should update a contact', async () => {
    const updateContactDto: UpdateContactDto = { name: 'Jane Doe' };
    await expect(
      controller.update(mockContact.id, updateContactDto),
    ).resolves.toEqual(mockContact);
    expect(mockContactsService.update).toHaveBeenCalledWith(
      mockContact.id,
      updateContactDto,
    );
  });

  it('should remove a contact', async () => {
    await expect(controller.remove(mockContact.id)).resolves.toEqual({
      message: `Contact with ID "${mockContact.id}" has been removed.`,
    });
    expect(mockContactsService.remove).toHaveBeenCalledWith(mockContact.id);
  });
});
