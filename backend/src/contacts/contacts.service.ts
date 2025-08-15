import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';

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

  async createBulk(createContactDtos: CreateContactDto[]): Promise<Contact[]> {
    const contacts = this.contactsRepository.create(createContactDtos);
    try {
      return await this.contactsRepository.save(contacts);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'One or more phone numbers or emails already exist.',
        );
      }
      throw error;
    }
  }

  findAll(): Promise<Contact[]> {
    return this.contactsRepository.find();
  }

  getCount(): Promise<number> {
    return this.contactsRepository.count();
  }

  async findAllPaginated(
    paginationQuery: PaginationQueryDto,
  ): Promise<{
    data: Contact[];
    nextCursor: string | null;
    prevCursor: string | null;
  }> {
    const { cursor, nextCursor, prevCursor, limit = 10 } = paginationQuery;
    const finalNextCursor = nextCursor || cursor;

    if (finalNextCursor && prevCursor) {
      throw new BadRequestException(
        'Both nextCursor and prevCursor cannot be provided simultaneously.',
      );
    }

    const take = limit + 1;
    const isDescending = !!prevCursor;

    const queryOptions = {
      take,
      order: {
        createdAt: isDescending ? ('DESC' as const) : ('ASC' as const),
        id: isDescending ? ('DESC' as const) : ('ASC' as const),
      },
      where: {} as FindOptionsWhere<Contact> | FindOptionsWhere<Contact>[],
    };

    const cursorToUse = prevCursor || finalNextCursor;
    if (cursorToUse) {
      const [cursorCreatedAt, cursorId] = Buffer.from(cursorToUse, 'base64')
        .toString('ascii')
        .split('_');
      const parsedCreatedAt = new Date(cursorCreatedAt);
      const operator = isDescending ? LessThan : MoreThan;

      queryOptions.where = [
        {
          createdAt: operator(parsedCreatedAt),
        },
        {
          createdAt: parsedCreatedAt,
          id: operator(cursorId),
        },
      ];
    }

    let contacts = await this.contactsRepository.find(queryOptions);

    const hasMore = contacts.length > limit;
    if (hasMore) {
      contacts.pop();
    }

    if (isDescending) {
      contacts.reverse();
    }

    const firstContact = contacts[0];
    const lastContact = contacts[contacts.length - 1];

    let newNextCursor: string | null = null;
    let newPrevCursor: string | null = null;

    if (isDescending) {
      newNextCursor = Buffer.from(
        `${lastContact.createdAt.toISOString()}_${lastContact.id}`,
      ).toString('base64');
      if (hasMore) {
        newPrevCursor = Buffer.from(
          `${firstContact.createdAt.toISOString()}_${firstContact.id}`,
        ).toString('base64');
      }
    } else {
      if (hasMore) {
        newNextCursor = Buffer.from(
          `${lastContact.createdAt.toISOString()}_${lastContact.id}`,
        ).toString('base64');
      }
      if (finalNextCursor) {
        newPrevCursor = Buffer.from(
          `${firstContact.createdAt.toISOString()}_${firstContact.id}`,
        ).toString('base64');
      }
    }

    return {
      data: contacts,
      nextCursor: newNextCursor,
      prevCursor: newPrevCursor,
    };
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
