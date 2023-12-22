export const templateBill = () => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
  
      <style>
  
        body {
          font-size: 16px;
          padding: 20px;
          /* max-width: 400px; */
          justify-content: center;
          align-items: center;
          font-family: Arial, Helvetica, sans-serif;
        }
  
        table {
          width: 100%;
          border-collapse: collapse;
        }
  
        table tr td {
          padding: 0;
        }
  
        table tr td:last-child {
          text-align: right;
        }
  
        .bold {
          font-weight: bold;
        }
  
        .right {
          text-align: right;
        }
  
        .large {
          font-size: 1.75em;
        }
  
        .total {
          font-weight: bold;
          color: #fb7578;
        }
  
        .logo-container {
          margin: 20px 0 70px 0;
        }
  
        .invoice-info-container {
          font-size: 0.875em;
        }
        .invoice-info-container td {
          padding: 4px 0;
        }
  
        .client-name {
          font-size: 1.5em;
          vertical-align: top;
        }
  
        .line-items-container {
          margin: 70px 0;
          font-size: 0.875em;
        }
  
        .line-items-container th {
          text-align: left;
          padding: 10px 0 15px 0;
          font-size: 0.75em;
          font-weight: bold;
          text-transform: uppercase;
        }
  
        .line-items-container th:last-child {
          text-align: right;
        }
  
        .line-items-container td {
          padding: 15px 0;
        }
  
        .line-items-container tbody tr:first-child td {
          padding-top: 25px;
        }
  
        .line-items-container.has-bottom-border tbody tr:last-child td {
          padding-bottom: 25px;
          border-bottom: 2px solid #ddd;
        }
  
        .line-items-container.has-bottom-border {
          margin-bottom: 0;
        }
  
        .line-items-container th.heading-quantity {
          width: 20px;
        }
        .line-items-container th.heading-price {
          text-align: right;
          width: 100px;
        }
        .line-items-container th.heading-subtotal {
          width: 100px;
        }
  
        .payment-info {
          width: 38%;
          line-height: 1.8;
        }
  
        .footer {
          margin-top: 100px;
        }
  
        .footer-thanks {
          font-size: 1.125em;
        }
  
        .footer-thanks img {
          display: inline-block;
          position: relative;
          top: 1px;
          width: 16px;
          margin-right: 4px;
        }
  
        .footer-info {
          float: right;
          margin-top: 5px;
          font-size: 0.75em;
          color: #ccc;
        }
  
        .footer-info span {
          padding: 0 5px;
          color: black;
        }
  
        .footer-info span:last-child {
          padding-right: 0;
        }
  
        .page-container {
          display: none;
        }
  
        /*
        The styles here for use when generating a PDF invoice with the HTML code.
      
        * Set up a repeating page counter
        * Place the .footer-info in the last page's footer
      */
  
        .footer {
          margin-top: 30px;
        }
  
        .footer-info {
          float: none;
          position: running(footer);
          margin-top: -25px;
        }
  
        .page-container {
          display: block;
          position: running(pageContainer);
          margin-top: -25px;
          font-size: 12px;
          text-align: right;
          color: #999;
        }
  
        .page-container .page::after {
          content: counter(page);
        }
  
        .page-container .pages::after {
          content: counter(pages);
        }
  
        @page {
          @bottom-right {
            content: element(pageContainer);
          }
          @bottom-left {
            content: element(footer);
          }
        }
  
        .title {
          text-transform: uppercase;
        }
  
        .header {
          margin-top: 30px;
        }
  
        .header--title {
          color: #fb7578;
          text-transform: uppercase;
        }
  
        .info-customer {
          display: flex;
          justify-content: space-between;
        }
  
        .info-customer--text {
          font-size: 14px;
        }
  
        .info-customer--text p {
          margin: 0;
          padding: 4px 0;
        }
  
        .info-date {
          display: flex;
          flex-direction: column;
          /* justify-content: flex-end; */
          align-items: flex-end;
        }
  
        .line {
          border: 1px dashed gray;
        }
  
        .line-top-50 {
          margin-top: 50px;
        }
  
        .line-top-10 {
          margin-top: 10px;
        }
  
        .border-bottom {
          border-bottom: 1px dashed gray;
          padding-bottom: 10px;
        }
  
        .color-red {
          color: red;
          font-size: 18px;
        }
  
        .color-red-v2 {
          color: #fb7578;
        }
  
        .fw-bold {
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <h1 class="title">Hóa đơn</h1>
  
      <div class="header">
        <h3 class="header--title">Khách sạn end cool</h3>
      </div>
  
      <div class="info-customer">
        <div class="info-customer--text">
          <p>Số điện thoại: <b>0123456789</b></p>
          <p>Họ và tên KH: <b>Nguyễn Văn A</b></p>
        </div>
  
        <div class="info-customer--text info-date">
          <p>Hóa đơn: <b>#BI7770141448</b></p>
          <p>Ngày: <b>10/04/2023</b></p>
        </div>
      </div>
  
      <div class="line line-top-10"></div>
  
      <div class="info-customer line-top-10">
        <div class="info-customer--text">
          <p>Ngày nhận: <b>10/04/2023</b></p>
          <p>Loại phòng: <b>Standard</b></p>
          <p>Giá phòng: <b>1.000.000</b></p>
        </div>
  
        <div class="info-customer--text info-date">
          <p>Ngày trả: <b>11/04/2023</b></p>
          <p>Số phòng: <b>DXL102</b></p>
        </div>
      </div>
  
      <div class="line line-top-10"></div>
  
      <table class="line-items-container">
        <thead>
          <tr>
            <th class="heading-description">DV/Hàng hóa</th>
            <th class="heading-quantity">SL</th>
            <th class="heading-price">Đơn giá</th>
            <th class="heading-subtotal">Thành tiền</th>
          </tr>
        </thead>
  
        <tbody>
          <tr>
            <td>Blue large widgets</td>
            <td>2</td>
            <td class="right">$15.00</td>
            <td class="bold">$30.00</td>
          </tr>
          <tr>
            <td>Green medium widgets</td>
            <td>4</td>
            <td class="right">$10.00</td>
            <td class="bold">$40.00</td>
          </tr>
          <tr>
            <td>Red small widgets with logo</td>
            <td>5</td>
            <td class="right">$7.00</td>
            <td class="bold">$35.00</td>
          </tr>
        </tbody>
  
        <tfoot>
          <tr>
            <td colspan="4" class="payment-info">
              <!-- <div class="line"></div> -->
              <div class="line-top-10">
                <div>Tổng tiền DV/HH: <strong>1.235.677</strong></div>
                <div>Tổng tiền Phòng: <strong>1.235.677</strong></div>
                <div>Thuế (VAT): <strong>120000547</strong></div>
              </div>
  
              <div class="line-top-10 color-red">Tổng tiền: <strong>120000547</strong></div>
            </td>
          </tr>
        </tfoot>
      </table>
  
      <div class="line line-top-50"></div>
  
      <footer class="line-top-50">
        <h3 class="color-red-v2 fw-bold">Thông tin liên hệ</h3>
  
        <div class="info-customer">
          <div class="info-customer--text">
            <p>Số điện thoại: <b>0123456789</b></p>
            <p>Email: <b>example@gmail.com</b></p>
            <p>Địa chỉ: <b>21, 3/2 Hưng Lợi, Cần Thơ</b></p>
          </div>
  
          <div class="info-customer--text info-date">
            <p class="color-red-v2 fw-bold">https://endcoll-hotel.com</p>
          </div>
        </div>
      </footer>
    </body>
  </html>
  `;
};
