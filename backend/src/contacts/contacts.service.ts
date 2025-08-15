import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThan, Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactsRepository: Repository<Contact>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactsRepository.create(createContactDto);
    try {
      return await this.contactsRepository.save(contact);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Phone number or email already exists.');
      }
      throw error;
    }
  }

  findAll(): Promise<Contact[]> {
    return this.contactsRepository.find();
  }

  async findAllPaginated(
    paginationQuery: PaginationQueryDto,
  ): Promise<{ data: Contact[]; nextCursor: string | null }> {
    const { cursor, limit = 10 } = paginationQuery;
    const queryOptions = {
      take: limit,
      order: { createdAt: 'ASC' as const, id: 'ASC' as const },
      where: {} as FindOptionsWhere<Contact> | FindOptionsWhere<Contact>[],
    };

    if (cursor) {
      const [cursorCreatedAt, cursorId] = Buffer.from(cursor, 'base64')
        .toString('ascii')
        .split('_');
      const parsedCreatedAt = new Date(cursorCreatedAt);

      queryOptions.where = [
        {
          createdAt: MoreThan(parsedCreatedAt),
        },
        {
          createdAt: parsedCreatedAt,
          id: MoreThan(cursorId),
        },
      ];
    }

    const contacts = await this.contactsRepository.find(queryOptions);

    let nextCursor: string | null = null;
    if (contacts.length === limit) {
      const lastContact = contacts[contacts.length - 1];
      nextCursor = Buffer.from(
        `${lastContact.createdAt.toISOString()}_${lastContact.id}`,
      ).toString('base64');
    }

    return { data: contacts, nextCursor };
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactsRepository.findOneBy({ id });
    if (!contact) {
      throw new NotFoundException(`Contact with ID "${id}" not found.`);
    }
    return contact;
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    const contact = await this.contactsRepository.preload({
      id,
      ...updateContactDto,
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID "${id}" not found.`);
    }

    try {
      return await this.contactsRepository.save(contact);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Phone number or email already exists.');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const contact = await this.findOne(id);
    await this.contactsRepository.remove(contact);
    return { message: `Contact with ID "${id}" has been removed.` };
  }
}
