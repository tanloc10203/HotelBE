import { Model } from "@/lib";
import dayjs from "dayjs";
import { PriceByHour } from "./PriceByHour.model";

type StatusDiscount = "expired" | "using";

export interface Discount {
  id?: string;
  price_list_id: string;
  room_type_id: number;

  num_discount: number;
  code_used: number | null;
  price: number;

  time_start: string;
  time_end: string;

  status: StatusDiscount;
  is_public: 0 | 1 | number | boolean;

  created_at?: string;
  deleted_at?: string | null;
  updated_at?: string;
}

class DiscountModel extends Model {
  protected table: string = "Discounts";

  protected fillables: string[] = [
    "id",
    "price_list_id",
    "room_type_id",
    "code_used",
    "num_discount",
    "price",
    "time_start",
    "time_end",
    "status",
    "is_public",
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

  public convertPrice = (price: number) => {
    return price > 100 ? price : price / 100;
  };

  public calcWithDiscount = (totalPrice: number, priceDiscount: number) =>
    priceDiscount > 100
      ? totalPrice - priceDiscount
      : totalPrice - (totalPrice * priceDiscount) / 100;

  public checkExpired = async (discount: Discount) => {
    const currentDateTime = dayjs();

    const timeEnd = dayjs(new Date(discount.time_end));

    const compare = timeEnd.diff(currentDateTime, "minutes", true);

    if (compare <= 0) {
      await this.update<Partial<Discount>, Discount>(
        { is_public: 0, status: "expired" },
        discount.id!
      );

      return null;
    }

    return discount;
  };

  public calcPriceHourWithDiscount = ({
    priceHours,
    totalPrice,
    totalTime,
    priceDiscount,
  }: {
    totalPrice: number;
    priceHours: PriceByHour[];
    totalTime: number;
    priceDiscount: number;
  }) => {
    let results = this.calcWithDiscount(totalPrice, priceDiscount);
    // const priceHoursLength = priceHours.length;

    // console.log("========================================================================");

    const timeUsed: number[] = [];

    for (let j = 0; j < totalTime; j++) {
      const time = j + 1;

      const priceHour = priceHours.find((t) => t.start_hour === time);

      if (priceHour) {
        const priceDiscountCalc = this.calcWithDiscount(priceHour.price, priceDiscount);
        timeUsed.push(time);
        results += priceDiscountCalc;

        // console.log(`${time} results = `, { results, price: priceHour?.price });
      } else {
        // console.log(`Không tìm thấy time = `, time);
        // If time is max in timeUsed => get last timeUsed else first time;

        const timeUsedLast = timeUsed[timeUsed.length - 1];

        if (time > timeUsedLast) {
          const priceHour = priceHours.find((t) => t.start_hour === timeUsedLast);

          if (priceHour) {
            const priceDiscountCalc = this.calcWithDiscount(priceHour.price, priceDiscount);
            results += priceDiscountCalc;
          }

          // console.log(`${time} results = `, { results, price: priceHour?.price });
        } else {
          // console.log(`${time} results else = `, results);
        }
      }
    }

    // console.log(timeUsed);

    // console.log("========================================================================");

    return results;
  };
}

export default new DiscountModel();
