import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark entities that should be automatically filtered by organizationId
 * Used for multi-tenant data isolation
 */
export const ORGANIZATION_SCOPED_KEY = 'isOrganizationScoped';
export const OrganizationScoped = () =>
  SetMetadata(ORGANIZATION_SCOPED_KEY, true);
