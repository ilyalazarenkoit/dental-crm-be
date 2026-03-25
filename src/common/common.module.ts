import { Module, Global } from '@nestjs/common';
import { OrganizationContextService } from './services/organization-context.service';
import { OrganizationContextInterceptor } from './interceptors/organization-context.interceptor';

// M-1: TypeOrmModule.forFeature([User]) removed — OrganizationContextService
// now reads org from JWT payload instead of querying the DB.
@Global()
@Module({
  providers: [OrganizationContextService, OrganizationContextInterceptor],
  exports: [OrganizationContextService, OrganizationContextInterceptor],
})
export class CommonModule {}
