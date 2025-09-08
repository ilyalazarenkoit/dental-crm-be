import {
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class RegisterOwnerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
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
