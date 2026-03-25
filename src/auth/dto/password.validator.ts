import { MinLength, Matches } from 'class-validator';
import { applyDecorators } from '@nestjs/common';

// M-9: Single source of truth for password strength requirements
export const PASSWORD_REGEX =
  /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

/**
 * Composite decorator that enforces consistent password strength across
 * all DTOs (registration, password reset, etc.).
 * Requires: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit or special char.
 */
export function IsStrongPassword() {
  return applyDecorators(
    MinLength(8, { message: 'Password must be at least 8 characters long' }),
    Matches(PASSWORD_REGEX, {
      message:
        'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
    }),
  );
}
