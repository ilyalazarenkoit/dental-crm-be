import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationContextService } from './services/organization-context.service';
import { OrganizationContextInterceptor } from './interceptors/organization-context.interceptor';
import { User } from '@/entities/user.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [OrganizationContextService, OrganizationContextInterceptor],
  exports: [OrganizationContextService, OrganizationContextInterceptor],
})
export class CommonModule {}
