import { Transaction } from "@/lib";
import PriceListRoute from "./PriceList.route";
import RateRoute from "./Rate.route";
import RepresentativeRoute from "./Representative.route";
import BannerRoute from "./Banner.route";
import InformationHotelRoute from "./InformationHotel.route";
import ZaloPayTransactionRoute from "./ZaloPayTransaction.route";
import { Unit, UnitModel } from "@/models";
import { ZaloPayService } from "@/services";
import { asyncHandler, encodeBase64, generateUUIDv2 } from "@/utils";
import { Response, Router } from "express";
import { raw } from "mysql2/promise";
import { CommonRequest } from "types";
import AmenitieRoute from "./Amenitie.route";
import AmenityRoomTypeRoute from "./AmenityRoomType.route";
import AmenityTypeRoute from "./AmenityType.route";
import ApiKeyRoute from "./ApiKey.route";
import AttributeRoute from "./Attribute.route";
import AuthRoute from "./Auth";
import BedRoute from "./Bed.route";
import BillRoute from "./Bill.route";
import BookingRoute from "./Booking.route";
import BookingDetailRoute from "./BookingDetail.route";
import CustomerRoute from "./Customer.route";
import CustomerInfoRoute from "./CustomerInfo.route";
import CustomerTypeRoute from "./CustomerType.route";
import DepartmentRoute from "./Department.route";
import DiscountRoute from "./Discount.route";
import DurationsRoomRoute from "./DurationsRoom.route";
import EmployeeRoute from "./Employee.route";
import EmployeeInfoRoute from "./EmployeeInfo.route";
import EquipmentRoute from "./Equipment.route";
import EquipmentRoomTypeRoute from "./EquipmentRoomType.route";
import EquipmentTypeRoute from "./EquipmentType.route";
import FloorRoute from "./Floor.route";
import GoodsReceiptNoteRoute from "./GoodsReceiptNote.route";
import GoodsReceiptNotesDetailRoute from "./GoodsReceiptNotesDetail.route";
import GuestStayInformationRoute from "./GuestStayInformation.route";
import GuestUseServiceRoute from "./GuestUseService.route";
import ImagesRoomTypeRoute from "./ImagesRoomType.route";
import LogRoute from "./Log.route";
import MomoTransactionRoute from "./MomoTransaction.route";
import NotificationRoute from "./Notification.route";
import OperationRoute from "./Operation.route";
import OwnerRoute from "./Owner.route";
import OwnerInfoRoute from "./OwnerInfo.route";
import PermissionRoute from "./Permission.route";
import PositionRoute from "./Position.route";
import PriceByHourRoute from "./PriceByHour.route";
import RefreshTokensUseRoute from "./RefreshTokensUse.route";
import ReportRoute from "./Report.route";
import RoleRoute from "./Role.route";
import RoleEmployeeRoute from "./RoleEmployee.route";
import RolePermissionRoute from "./RolePermission.route";
import RoomRoute from "./Room.route";
import RoomNumberRoute from "./RoomNumber.route";
import RoomPriceRoute from "./RoomPrice.route";
import RoomTypeRoute from "./RoomType.route";
import RoomsDiscountRoute from "./RoomsDiscount.route";
import RoomsVoucherRoute from "./RoomsVoucher.route";
import SaveExpoPushTokenRoute from "./SaveExpoPushToken.route";
import ServiceRoute from "./Service.route";
import ServiceTypeRoute from "./ServiceType.route";
import ServicesAttributeRoute from "./ServicesAttribute.route";
import ServicesPriceRoute from "./ServicesPrice.route";
import ServicesUnitRoute from "./ServicesUnit.route";
import SupplierRoute from "./Supplier.route";
import TaxRoute from "./Tax.route";
import TokenPairRoute from "./TokenPair.route";
import UnitRoute from "./Unit.route";
import VoucherRoute from "./Voucher.route";

const router = Router();

router
  .route("/api/v1/response-payment")
  .post((req, res) => {
    const json = { data: req.body, headers: req.headers, query: req.query };
    console.log("====================================");
    console.log(`json`, json);
    console.log("====================================");
    res.status(204).send();
  })
  .get((req, res) => {
    const json = { data: req.body, headers: req.headers, query: req.query };
    res.json(json);
  });
router.get("/api/v1/get-payment", async (req, res) => {
  // const response = await MomoService.collectionLink({
  //   amount: 10000,
  //   orderId: generateUUIDv2("MOMO"),
  //   orderInfo: "Thanh toán đặt phòng",
  //   partnerCode: "MOMO",
  // });
  const bookingId = generateUUIDv2("BID");
  const response = await ZaloPayService.requestPayment({
    amount: 30000,
    appUser: bookingId,
    description: "Thanh toán đặt phòng",
    extraData: { type: encodeBase64("booking") },
    title: "Thanh toán đặt phòng",
    isBooking: false,
  });
  res.json(response);
});
router.post(
  "/api/v1/test",
  asyncHandler(
    async (req: CommonRequest<{}, {}, { name: string; desc: string }>, res: Response) => {
      const transaction = new Transaction();
      const connectPool = await transaction.getPoolTransaction();
      try {
        await connectPool.beginTransaction();
        // const response = await transaction.create({
        //   data: req.body,
        //   pool: connectPool,
        //   table: UnitModel.getTable,
        // });
        // a,b,c...
        // throw new Error("test transaction");
        const getById = await transaction.read<Unit>({
          conditions: { id: raw("IS NOT NULL") },
          fillables: UnitModel.getFillables,
          pool: connectPool,
          table: UnitModel.getTable,
          timestamps: true,
        });
        console.log(`commit`);
        await connectPool.commit();
        res.json(getById);
      } catch (error) {
        console.log("Rollback", error);
        await connectPool.rollback();
        throw error;
      } finally {
        console.log(`finish release`);
        connectPool.release();
        transaction.releaseConnection(connectPool);
      }
    }
  )
);
router.use("/api/v1/Logs", LogRoute);
router.use("/api/v1/Permissions", PermissionRoute);
router.use("/api/v1/Roles", RoleRoute);
router.use("/api/v1/RolePermissions", RolePermissionRoute);
router.use("/api/v1/CustomerTypes", CustomerTypeRoute);
router.use("/api/v1/Customers", CustomerRoute);
router.use("/api/v1/CustomerInfos", CustomerInfoRoute);
router.use("/api/v1/Employees", EmployeeRoute);
router.use("/api/v1/EmployeeInfos", EmployeeInfoRoute);
router.use("/api/v1/Auth", AuthRoute);
router.use("/api/v1/Owners", OwnerRoute);
router.use("/api/v1/OwnerInfos", OwnerInfoRoute);
router.use("/api/v1/ApiKeys", ApiKeyRoute);
router.use("/api/v1/TokenPairs", TokenPairRoute);
router.use("/api/v1/RefreshTokensUses", RefreshTokensUseRoute);
router.use("/api/v1/RoleEmployees", RoleEmployeeRoute);
router.use("/api/v1/Departments", DepartmentRoute);
router.use("/api/v1/Positions", PositionRoute);
router.use("/api/v1/Operations", OperationRoute);
router.use("/api/v1/Floors", FloorRoute);
router.use("/api/v1/RoomTypes", RoomTypeRoute);
router.use("/api/v1/Units", UnitRoute);
router.use("/api/v1/Rooms", RoomRoute);
router.use("/api/v1/AmenityTypes", AmenityTypeRoute);
router.use("/api/v1/Amenities", AmenitieRoute);
router.use("/api/v1/EquipmentTypes", EquipmentTypeRoute);
router.use("/api/v1/Equipments", EquipmentRoute);
router.use("/api/v1/EquipmentRoomTypes", EquipmentRoomTypeRoute);
router.use("/api/v1/AmenityRoomTypes", AmenityRoomTypeRoute);
router.use("/api/v1/ImagesRoomTypes", ImagesRoomTypeRoute);
router.use("/api/v1/RoomPrices", RoomPriceRoute);
router.use("/api/v1/Discounts", DiscountRoute);
router.use("/api/v1/Vouchers", VoucherRoute);
router.use("/api/v1/RoomsVouchers", RoomsVoucherRoute);
router.use("/api/v1/RoomsDiscounts", RoomsDiscountRoute);
router.use("/api/v1/Beds", BedRoute);
router.use("/api/v1/DurationsRooms", DurationsRoomRoute);
router.use("/api/v1/RoomNumbers", RoomNumberRoute);
router.use("/api/v1/Bookings", BookingRoute);
router.use("/api/v1/BookingDetails", BookingDetailRoute);
router.use("/api/v1/Taxs", TaxRoute);
router.use("/api/v1/Notifications", NotificationRoute);
router.use("/api/v1/SaveExpoPushTokens", SaveExpoPushTokenRoute);
router.use("/api/v1/ServiceTypes", ServiceTypeRoute);
router.use("/api/v1/Services", ServiceRoute);
router.use("/api/v1/ServicesPrices", ServicesPriceRoute);
router.use("/api/v1/ServicesUnits", ServicesUnitRoute);
router.use("/api/v1/PriceByHours", PriceByHourRoute);
router.use("/api/v1/GuestStayInformations", GuestStayInformationRoute);
router.use("/api/v1/Bills", BillRoute);
router.use("/api/v1/Attributes", AttributeRoute);
router.use("/api/v1/ServicesAttributes", ServicesAttributeRoute);
router.use("/api/v1/Suppliers", SupplierRoute);
router.use("/api/v1/GoodsReceiptNotes", GoodsReceiptNoteRoute);
router.use("/api/v1/GoodsReceiptNotesDetails", GoodsReceiptNotesDetailRoute);
router.use("/api/v1/GuestUseServices", GuestUseServiceRoute);
router.use("/api/v1/MomoTransactions", MomoTransactionRoute);
router.use("/api/v1/Reports", ReportRoute);
router.use("/api/v1/ZaloPayTransactions", ZaloPayTransactionRoute);
router.use("/api/v1/InformationHotels", InformationHotelRoute);
router.use("/api/v1/Banners", BannerRoute);
router.use("/api/v1/Representatives", RepresentativeRoute);
router.use("/api/v1/Rates", RateRoute);
router.use("/api/v1/PriceLists", PriceListRoute);

export default router;