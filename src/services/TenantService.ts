import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import { ITenant, TenantQueryParams } from "../types";

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}
  async create(tenantData: ITenant) {
    return await this.tenantRepository.save(tenantData);
  }

  async update(id: number, tenantData: ITenant) {
    return await this.tenantRepository.update(id, tenantData);
  }

  async getAll(validateQuery: TenantQueryParams) {
    const queryBuilder = this.tenantRepository.createQueryBuilder("tenant");

    if (validateQuery.q) {
      const searchItem = `%${validateQuery.q}%`;
      queryBuilder.where("CONCAT(tenant.name, ' ', tenant.address) Ilike :q", {
        q: searchItem,
      });
    }

    const result = await queryBuilder
      .skip((validateQuery.currentPage - 1) * validateQuery.perPage)
      .take(validateQuery.perPage)
      .orderBy("tenant.id", "DESC")
      .getManyAndCount();

    return result;
  }

  async getById(tenantId: number) {
    return await this.tenantRepository.findOne({ where: { id: tenantId } });
  }

  async deleteById(tenantId: number) {
    return await this.tenantRepository.delete(tenantId);
  }
}
