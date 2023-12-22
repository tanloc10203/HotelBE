export type ResponseZaloPayCommon = {
  return_code: 1 | 2 | 3;
  return_message: string;
  sub_return_code: number;
  sub_return_message: string;
};

export type ResponseCreateState = {
  order_url: string;
  zp_trans_token: string;
  order_token: string;
  qr_code: string;
} & ResponseZaloPayCommon;

export type ResponseQueryStatusState = {
  is_processing: boolean;
  amount: number;
  discount_amount: string;
  zp_trans_id: number;
} & ResponseZaloPayCommon;

export type ResponseRefundState = {
  refund_id: number;
} & ResponseZaloPayCommon;

export type RefundZaloPayPayload = {
  zpTransId: string;
  amount: number;
  description: string;
};

export type RequestPaymentPayload = {
  amount: number;
  appUser: string;
  description: string;
  title: string;
  bookingId?: string;
  bookingDetailsId?: string;
  extraData: Record<string, any>;
  isBooking: boolean;
};

export type ResponsePayment = {
  amount: number;
  appid: number;
  apptransid: string;
  bankcode: string;
  checksum: string;
  discountamount: number;
  pmcid: number;
  status: number;
};
