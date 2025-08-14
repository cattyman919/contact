import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  // Anda bisa menggunakan dekorator yang lebih spesifik seperti @IsPhoneNumber
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
