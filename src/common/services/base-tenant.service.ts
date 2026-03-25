import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  ObjectLiteral,
} from 'typeorm';
import { OrganizationContextService } from './organization-context.service';

/**
 * Base service for multi-tenant entities
 * Provides automatic organization filtering for all queries
 */
@Injectable()
export abstract class BaseTenantService<T extends ObjectLiteral> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly organizationContextService: OrganizationContextService,
  ) {}

  /**
   * Add organization filter to where clause
   */
  protected async addOrganizationFilter(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<FindOptionsWhere<T> | FindOptionsWhere<T>[]> {
    const organizationId =
      await this.organizationContextService.getOrganizationId();

    if (Array.isArray(where)) {
      return where.map(w => ({
        ...w,
        organizationId,
      })) as FindOptionsWhere<T>[];
    }

    return {
      ...where,
      organizationId,
    } as FindOptionsWhere<T>;
  }

  /**
   * Find all with automatic organization filtering
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    const organizationId =
      await this.organizationContextService.getOrganizationId();

    const where = options?.where
      ? await this.addOrganizationFilter(options.where as FindOptionsWhere<T>)
      : ({ organizationId } as unknown as FindOptionsWhere<T>);

    return this.repository.find({
      ...options,
      where,
    });
  }

  /**
   * Find one with automatic organization filtering
   */
  async findOne(
    where: FindOptionsWhere<T>,
    options?: Omit<FindManyOptions<T>, 'where'>,
  ): Promise<T | null> {
    const filteredWhere = await this.addOrganizationFilter(where);
    return this.repository.findOne({
      ...options,
      where: filteredWhere,
    });
  }

  /**
   * Create entity with automatic organization assignment
   */
  async create(entity: Partial<T>): Promise<T> {
    const organizationId =
      await this.organizationContextService.getOrganizationId();

    const entityWithOrg = {
      ...entity,
      organizationId,
    } as unknown as T;

    const newEntity = this.repository.create(entityWithOrg);
    return this.repository.save(newEntity);
  }

  /**
   * Update entity with organization check.
   * M-2: Throws NotFoundException when 0 rows affected (tenant mismatch or missing entity).
   */
  async update(
    where: FindOptionsWhere<T>,
    updateData: Partial<T>,
  ): Promise<void> {
    const filteredWhere = await this.addOrganizationFilter(where);
    const result = await this.repository.update(filteredWhere, updateData);

    if (result.affected === 0) {
      throw new NotFoundException('Resource not found or access denied');
    }
  }

  /**
   * Delete entity with organization check.
   * M-2: Throws NotFoundException when 0 rows affected (tenant mismatch or missing entity).
   */
  async delete(where: FindOptionsWhere<T>): Promise<void> {
    const filteredWhere = await this.addOrganizationFilter(where);
    const result = await this.repository.delete(filteredWhere);

    if (result.affected === 0) {
      throw new NotFoundException('Resource not found or access denied');
    }
  }

  /**
   * Count entities with automatic organization filtering
   */
  async count(where?: FindOptionsWhere<T>): Promise<number> {
    const organizationId =
      await this.organizationContextService.getOrganizationId();

    const filteredWhere = where
      ? await this.addOrganizationFilter(where)
      : ({ organizationId } as unknown as FindOptionsWhere<T>);

    return this.repository.count({
      where: filteredWhere,
    });
  }
}
