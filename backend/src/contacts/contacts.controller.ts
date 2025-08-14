import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  SerializeOptions,
  // UseInterceptors,
  // ClassSerializerInterceptor,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('contacts')
// @UseInterceptors(ClassSerializerInterceptor)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  findAll() {
    return this.contactsService.findAll();
  }

  @Get('dev/all')
  @SerializeOptions({
    groups: ['dev'],
  })
  findAllForDev() {
    return this.contactsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get(':uuid')
  findOne(@Param('uuid', ParseUUIDPipe) id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch(':uuid')
  update(
    @Param('uuid', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid', ParseUUIDPipe) id: string) {
    return this.contactsService.remove(id);
  }
}
