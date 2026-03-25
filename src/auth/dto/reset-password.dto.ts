import { IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from './password.validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  token: string;

  // M-9: Unified password policy — same rules as registration
  @IsStrongPassword()
  password: string;
}
