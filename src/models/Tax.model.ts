import { Model } from "@/lib";

export interface Tax {
  id?: number;
  name: string;
  description?: string;
  rate: number;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class TaxModel extends Model {
  protected table: string = "Taxs";

  protected fillables: string[] = ["id", "name", "rate", "description", "deleted_at"];

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

  public async getTaxVAT() {
    const response = await this.findAll<Tax>({ name_like: "VAT" }, undefined, {
      limit: 5,
      page: 1,
    });

    if (!response.length) return 0.08;
    return response[0].rate;
  }
}

export default new TaxModel();
