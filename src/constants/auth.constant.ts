import {
  CustomerInfoService,
  CustomerService,
  EmployeeInfoService,
  EmployeeService,
  OwnerInfoService,
  OwnerService,
} from "@/services";

export const ServicesAuth = {
  Index: {
    customer: () => CustomerService,
    employee: () => EmployeeService,
    owner: () => OwnerService,
  },
  Profile: {
    customer: () => CustomerInfoService,
    employee: () => EmployeeInfoService,
    owner: () => OwnerInfoService,
  },
};

export const ROUTE_REFRESH_TOKEN = {
  customer: "/api/v1/Auth/RefreshToken/Customer",
  employee: "/api/v1/Auth/RefreshToken/Employee",
  owner: "/api/v1/Auth/RefreshToken/Owner",
};

export const REFRESH_TOKEN_MOBILE = "/api/v1/Customers/RefreshToken";

export const ROUTE_LOGOUT_TOKEN = {
  customer: "/api/v1/Auth/Logout/Customer",
  employee: "/api/v1/Auth/Logout/Employee",
  owner: "/api/v1/Auth/Logout/Owner",
};

export const PHONE_REGEX = /((0[1|2|3|4|5|6|7|8|9])+([0-9]{8})\b)/g;
