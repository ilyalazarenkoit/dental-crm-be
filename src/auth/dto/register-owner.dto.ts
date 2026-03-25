import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { IsStrongPassword } from './password.validator';

export class RegisterOwnerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  // M-9: Use the shared strong password validator (previously only @MinLength(6))
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(\+[0-9]{1,3})?[-\s.]?[0-9]{3,}[-\s.]?[0-9]{3,}[-\s.]?[0-9]{0,}$/,
    {
      message:
        'Mobile phone must be a valid phone number (e.g., +49123456789, +380501234567)',
    },
  )
  mobilePhone: string;

  @IsString()
  @IsNotEmpty()
  organizationName: string;
}
