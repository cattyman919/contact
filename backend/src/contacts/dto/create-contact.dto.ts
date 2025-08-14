import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
