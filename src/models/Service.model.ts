import { Model } from "@/lib";

export interface Service {
  id?: string;
  service_type_id: string;
  name: string;
  timer?: number | null;
  desc?: string | null;
  note?: string | null;
  photo_public?: string | null;
  is_product?: boolean | 1 | 0;
  min_quantity_product?: number;
  quantity?: number;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class ServiceModel extends Model {
  protected table: string = "Services";

  protected fillables: string[] = [
    "id",
    "service_type_id",
    "name",
    "timer",
    "desc",
    "note",
    "photo_public",
    "is_product",
    "min_quantity_product",
    "quantity",
    "deleted_at",
  ];

  protected timestamps: boolean = false;

  get getFillables() {
    return this.fillables;
  }

  get getTable() {
    return this.table;
  }

  get getTimestamps() {
    return this.timestamps;
  }

  public async getExistsServiceProduct(
    name: string,
    serviceTypeId: string,
    attributeValue: string
  ) {
    const response = await this.callProd<{
      service_type_id: string;
      attribute_id: string;
      service_id: string;
    }>("sp_get_exists_service_product", [`%${name}%`, serviceTypeId, `%${attributeValue}%`]);

    return response;
  }
}

export default new ServiceModel();
