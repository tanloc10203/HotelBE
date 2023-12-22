SET AUTOCOMMIT = OFF;

CREATE DATABASE IF NOT EXISTS `manager_hotel_bookings_dev` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;

USE manager_hotel_bookings_dev;

/**
 * =============================================
 * Table: Logs -- Ghi log
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `filename` VARCHAR(10) NOT NULL UNIQUE,
  `log_type` ENUM('errors', 'requests') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Logs_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Permissions - Quyền
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE COMMENT 'ten thue',
  `alias` VARCHAR(255) NOT NULL UNIQUE  'ty le thue' 'Dinh danh vai tro',
  `desc` VARCHAR(255) NOT NULL COMMENT 'mo ta ve thue',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Permissions_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Roles - Vai trò
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Roles_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: RolePermissions - Vai trò có các quyền
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `RolePermissions` (
  `permission_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_RolePermissions_Permissions` FOREIGN KEY (`permission_id`) REFERENCES `Permissions` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_RolePermissions_Roles` FOREIGN KEY (`role_id`) REFERENCES `Roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_RolePermissions_id`(`permission_id`, `role_id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Owners - Chủ khách sạn
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Owners` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `display_name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `email_verified_at` DATETIME DEFAULT NULL,
  `phone_number` VARCHAR(10) DEFAULT NULL,
  `phone_verified_at` DATETIME DEFAULT NULL,
  `remember_token` VARCHAR(255) DEFAULT NULL,
  `token_owner` VARCHAR(255) DEFAULT NULL,
  `photo` TEXT DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'banned', 'retired') DEFAULT 'inactive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Owners_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `Owners` ADD IF NOT EXISTS `email_verify_token` VARCHAR(255) DEFAULT NULL;

/**
 * =============================================
 * Table: Owner_Infors - Thông tin chủ khách sạn
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `OwnerInfos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `owner_id` INT NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `birth_date` DATE DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `desc` TEXT DEFAULT NULL,
  `gender` ENUM('MALE', 'FEMALE', 'OTHERS') DEFAULT 'MALE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_OwnerInfos_Owners` FOREIGN KEY (`owner_id`) REFERENCES `Owners` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_OwnerInfos_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Customer_Types - Loại Khách hàng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `CustomerTypes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `CustomerTypes` ADD IF NOT EXISTS is_default BOOLEAN DEFAULT 0;

/**
 * =============================================
 * Table: Customers - Khách hàng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Customers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_type_id` INT NOT NULL,
  `display_name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `email_verified_at` DATETIME DEFAULT NULL,
  `phone_number` VARCHAR(10) DEFAULT NULL,
  `phone_verified_at` DATETIME DEFAULT NULL,
  `remember_token` VARCHAR(255) DEFAULT NULL,
  `photo` TEXT DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'inactive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Customers_Customer_Types` FOREIGN KEY (`customer_type_id`) REFERENCES `CustomerTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Customers_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `Customers` ADD IF NOT EXISTS `email_verify_token` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `Customers` ADD IF NOT EXISTS `phone_number_verify_token` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `Customers` MODIFY `status` ENUM('active', 'inactive', 'banned', 'verify', 'verified') DEFAULT 'inactive';

/**
 * =============================================
 * Table: Customer_Infos - Thông tin Khách hàng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `CustomerInfos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `birth_date` DATE DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `desc` TEXT DEFAULT NULL,
  `gender` ENUM('MALE', 'FEMALE', 'OTHERS') DEFAULT 'MALE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_CustomerInfos_Customers` FOREIGN KEY (`customer_id`) REFERENCES `Customers` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_CustomerInfos_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Employees - Nhân viên
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Employees` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `display_name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NULL,
  `email_verified_at` DATETIME NULL,
  `phone_number` VARCHAR(10) DEFAULT NULL,
  `phone_verified_at` DATETIME DEFAULT NULL,
  `remember_token` VARCHAR(255) DEFAULT NULL,
  `photo` TEXT DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'banned', 'retired') DEFAULT 'inactive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Employees_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `Employees` ADD IF NOT EXISTS `email_verify_token` VARCHAR(255) DEFAULT NULL;

/**
 * =============================================
 * Table: Employee_Infors - Thông tin nhân viên
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `EmployeeInfos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` INT NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `birth_date` DATE DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `desc` TEXT DEFAULT NULL,
  `gender` ENUM('MALE', 'FEMALE', 'OTHERS') DEFAULT 'MALE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Employee_Infos_Employees` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_EmployeeInfos_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Role_Employee - Vai trò nhân viên
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `RoleEmployees` (
  `employee_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_RoleEmployees_Employee` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_RoleEmployees_Role` FOREIGN KEY (`role_id`) REFERENCES `Roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_RoleEmployees_id`(`employee_id`, `role_id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Departments - Bộ phận - Phòng ban
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Departments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Departments_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Positions - Chức vụ
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Positions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `sub_num` VARCHAR(255) NOT NULL COMMENT 'Hệ số phụ cấp',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Departments_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Operations - Nhân viên hoạt động tại bộ phận có chức vụ và thời điểm nào. 
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Operations` (
  `employee_id` INT NOT NULL,
  `department_id` INT NOT NULL,
  `position_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  CONSTRAINT `fk_Operations_Employees` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Operations_Departments` FOREIGN KEY (`department_id`) REFERENCES `Departments` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Operations_Positions` FOREIGN KEY (`position_id`) REFERENCES `Positions` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Operations_id`(`employee_id`, `department_id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: API KEY - Mã sử dụng chức năng.
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ApiKeys` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT,
  `employee_id` INT,
  `owner_id` INT,
  `key` VARCHAR(255) NOT NULL UNIQUE,
  `permissions` ENUM('0000', '1111', '2222') DEFAULT '2222',
  `ip_address` VARCHAR(255) NOT NULL,
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'inactive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ApiKeys_Employees` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_ApiKeys_Customers` FOREIGN KEY (`customer_id`) REFERENCES `Customers` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_ApiKeys_Owners` FOREIGN KEY (`owner_id`) REFERENCES `Owners` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_ApiKeys_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Floors - Tầng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Floors` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Floors_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `Floors` ADD IF NOT EXISTS `character` VARCHAR(255);

/**
 * =============================================
 * Table: Room_Types - Loại phòng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `RoomTypes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `character` VARCHAR(255) NOT NULL UNIQUE,
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_RoomTypes_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: PriceLists - Bảng giá
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `PriceLists` (
  `id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255),
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `type` ENUM('service', 'product', 'room', 'discount'),
  `is_default` BOOLEAN NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_RoomTypes_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: RoomPrices - Giá loại phòng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `RoomPrices` (
  `id` VARCHAR(32) NOT NULL,
  `price_list_id` VARCHAR(32) NOT NULL,
  `room_type_id` INT NOT NULL,
  `price_online` INT NOT NULL CHECK(`price_online` > 0),
  `price_offline` INT NOT NULL CHECK(`price_offline` > 0),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_RoomPrices_RoomTypes_Id` FOREIGN KEY (`room_type_id`) REFERENCES `RoomTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_RoomPrices_PriceLists_Id` FOREIGN KEY (`price_list_id`) REFERENCES `PriceLists` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_RoomPrices_id`(`id`, `room_type_id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: PriceByHours - Giá theo giờ
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `PriceByHours` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `room_price_id` VARCHAR(32) NOT NULL,
  `room_type_id` INT NOT NULL,
  `start_hour` INT NOT NULL COMMENT 'Gia tien se duoc tinh theo cot moc thoi gian nay',
  `price` INT NOT NULL CHECK(`price` > 0),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_PriceByHours_RoomPrices_Id` FOREIGN KEY (`room_price_id`) REFERENCES `RoomPrices` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_PriceByHours_RoomTypes_Id` FOREIGN KEY (`room_type_id`) REFERENCES `RoomTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_PriceByHours_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Units -- Đơn vị tính
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Units` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `character` VARCHAR(255) NOT NULL UNIQUE,
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Units_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: AmenityTypes - Loại Tiện nghi
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `AmenityTypes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_AmenityTypes_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Amenities - Tiện nghi
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Amenities` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Amenities_AmenityTypes_Id` FOREIGN KEY (`type_id`) REFERENCES `AmenityTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Amenities_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Equipment_Types - Loại thiết bị
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `EquipmentTypes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_EquipmentTypes_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Equipments - Thiết bị
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Equipments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `equipment_type_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Equipments_Equipment_Types` FOREIGN KEY (`equipment_type_id`) REFERENCES `EquipmentTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_EquipmentTypes_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `Equipments` ADD IF NOT EXISTS `group` ENUM('electronics', 'sanitary', 'furniture.bed', 'furniture', "security", 'others', 'entertainment', 'conference', 'meeting', 'food', 'beverage') DEFAULT 'others';

/**
 * =============================================
 * Table: EquipmentRoomTypes - Trang bị Thiết bị phòng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `EquipmentRoomTypes` (
  `equipment_id` INT NOT NULL,
  `room_type_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_EquipmentRoomTypes_Equipments_Id` FOREIGN KEY (`equipment_id`) REFERENCES `Equipments` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_EquipmentRoomTypes_RoomTypes_Id` FOREIGN KEY (`room_type_id`) REFERENCES `RoomTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_EquipmentRoomTypes_id`(`equipment_id`, `room_type_id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: AmenityRoomTypes - Tiện nghi loại phòng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `AmenityRoomTypes` (
  `amenity_id` INT NOT NULL,
  `room_type_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_AmenityRoomTypes_Amenities_Id` FOREIGN KEY (`amenity_id`) REFERENCES `Amenities` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_AmenityRoomTypes_RoomTypes_Id` FOREIGN KEY (`room_type_id`) REFERENCES `RoomTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_AmenityRoomTypes_id`(`room_type_id`, `amenity_id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: ImagesRoomTypes - Ảnh của loại phòng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ImagesRoomTypes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `room_type_id` INT NOT NULL,
  `src` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ImagesRoomTypes_RoomTypes_Id` FOREIGN KEY (`room_type_id`) REFERENCES `RoomTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_ImagesRoomTypes_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Rooms - Phòng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Rooms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `floor_id` INT NOT NULL,
  `room_type_id` INT NOT NULL,
  `name` VARCHAR(255),
  `room_number` VARCHAR(10) NOT NULL,
  `max_people` INT NOT NULL CHECK(`max_people` >= 1),
  `status` ENUM('maintenance', 'unavailable', 'available', "cleanup") DEFAULT 'available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Rooms_Room_Types_Id` FOREIGN KEY (`room_type_id`) REFERENCES `RoomTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Rooms_Floors_Id` FOREIGN KEY (`floor_id`) REFERENCES `Floors` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Rooms_id`(`id`, `floor_id`)
) ENGINE = InnoDB;

ALTER TABLE `Rooms` ADD IF NOT EXISTS `is_public` BOOLEAN DEFAULT 0, ADD IF NOT EXISTS `is_smoking` BOOLEAN DEFAULT 0, ADD IF NOT EXISTS `is_parking` BOOLEAN DEFAULT 0, ADD IF NOT EXISTS `is_breakfast` BOOLEAN DEFAULT 0, ADD IF NOT EXISTS `is_pets` BOOLEAN DEFAULT 0, ADD IF NOT EXISTS `is_extra_beds` BOOLEAN DEFAULT 0, ADD IF NOT EXISTS `adults` INT DEFAULT 1, ADD IF NOT EXISTS `children` INT DEFAULT 0, ADD IF NOT EXISTS `area` INT DEFAULT NULL, ADD IF NOT EXISTS `time_cancel` VARCHAR(255) DEFAULT NULL, ADD IF NOT EXISTS `room_quantity` INT DEFAULT 1, ADD IF NOT EXISTS `photo_publish` VARCHAR(255) DEFAULT '';

-- ALTER TABLE `Rooms` DROP COLUMN `max_people`, DROP COLUMN `name`, DROP COLUMN `time_cancel`;
-- ALTER TABLE `Rooms` DROP COLUMN `room_number`;

/**
 * =============================================
 * Table: RoomNumbers - Số phòng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `RoomNumbers` (
  `id` VARCHAR(255) NOT NULL UNIQUE,
  `room_id` INT NOT NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('maintenance', 'unavailable', 'available', "cleanup") DEFAULT 'available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_RoomNumbers_Rooms_Id` FOREIGN KEY (`room_id`) REFERENCES `Rooms` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_RoomNumbers_id`(`id`)
) ENGINE = InnoDB;



/**
 * =============================================
 * Table: Beds - Giường ngủ
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Beds` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `bed_id` INT NOT NULL,
  `room_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Beds_Room_Id` FOREIGN KEY (`room_id`) REFERENCES `Rooms` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Beds_Bed_Id` FOREIGN KEY (`bed_id`) REFERENCES `Equipments` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Beds_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `Beds` ADD IF NOT EXISTS `quantity` INT DEFAULT 1;

/**
 * =============================================
 * Table: DurationsRooms - Thời gian check in - check out
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `DurationsRooms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `room_id` INT NOT NULL,
  `check_in_from` VARCHAR(255) NOT NULL,
  `check_in_to` VARCHAR(255) NOT NULL,
  `check_out_from` VARCHAR(255) DEFAULT NULL,
  `check_out_to` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_DurationsRooms_Room_Id` FOREIGN KEY (`room_id`) REFERENCES `Rooms` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_DurationsRooms_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Discounts - Khuyến mãi / Giảm giá
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Discounts` (
  `id` VARCHAR(32) NOT NULL,
  `price_list_id` VARCHAR(32) NOT NULL,
  `room_type_id` INT NOT NULL,
  `num_discount` INT NOT NULL CHECK(`num_discount` >= 0),
  `price` INT DEFAULT NULL CHECK(`price` >= 0),
  `time_start` DATETIME NOT NULL,
  `time_end` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT `fk_Discounts_RoomTypes_Id` FOREIGN KEY (`room_type_id`) REFERENCES `RoomTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Discounts_PriceLists_Id` FOREIGN KEY (`price_list_id`) REFERENCES `PriceLists` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Discounts_id`(`id`, `room_type_id`)
) ENGINE = InnoDB;

ALTER TABLE `Discounts` ADD IF NOT EXISTS `is_public` BOOLEAN DEFAULT 1, ADD IF NOT EXISTS `status` ENUM('expired', 'using') DEFAULT 'using';
-- ALTER TABLE `Discounts` ADD IF NOT EXISTS `room_id` INT NOT NULL;
ALTER TABLE `Discounts` ADD IF NOT EXISTS `code_used` INT DEFAULT NULL CHECK(`code_used` >= 0);
-- ALTER TABLE `Discounts` ADD CONSTRAINT `fk_Discounts_Room_Id` FOREIGN KEY (`room_id`) REFERENCES `Rooms` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- DROP TABLE IF EXISTS `room_id`;


ALTER TABLE `Discounts` DROP COLUMN `room_id`;


/**
 * =============================================
 * Table: Vouchers - Voucher khuyến mãi
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Vouchers` (
  `id` VARCHAR(32) NOT NULL,
  `num_voucher` INT NOT NULL CHECK(`num_voucher` > 0) ,
  `price_voucher` INT DEFAULT NULL CHECK(`price_voucher` > 0),
  `percent_voucher` INT DEFAULT NULL CHECK(
    `percent_voucher` >= 0
    AND `percent_voucher` <= 100
  ),
  `time_start` DATETIME NOT NULL,
  `time_end` DATETIME NOT NULL,
  `type` ENUM('price', 'percent') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Vouchers_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `Vouchers` ADD IF NOT EXISTS `is_public` BOOLEAN DEFAULT 1, ADD IF NOT EXISTS `status` ENUM('used', 'expired', 'using') DEFAULT 'using',  ADD IF NOT EXISTS `quantity_used` INT DEFAULT 0;

/**
 * =============================================
 * Table: RoomsVouchers - Voucher for Rooms
 * =============================================
 */
-- CREATE TABLE IF NOT EXISTS `RoomsVouchers` (
--   `room_id` INT NOT NULL,
--   `voucher_id` VARCHAR(32) NOT NULL,
--   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   `deleted_at` DATETIME DEFAULT NULL,
--   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   CONSTRAINT `fk_RoomVouchers_Rooms_Id` FOREIGN KEY (`room_id`) REFERENCES `Rooms` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
--   CONSTRAINT `fk_RoomVouchers_Vouchers_Id` FOREIGN KEY (`voucher_id`) REFERENCES `Vouchers` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
--   PRIMARY KEY `pk_RoomVouchers_id`(`room_id`, `voucher_id`)
-- ) ENGINE = InnoDB;

/**
 * =============================================
 * Table: RoomsDiscounts - Voucher for Rooms
 * =============================================
 */
-- CREATE TABLE IF NOT EXISTS `RoomsDiscounts` (
--   `room_id` INT NOT NULL,
--   `discount_id` VARCHAR(32) NOT NULL,
--   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   `deleted_at` DATETIME DEFAULT NULL,
--   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   CONSTRAINT `fk_RoomsDiscounts_Rooms_Id` FOREIGN KEY (`room_id`) REFERENCES `Rooms` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
--   CONSTRAINT `fk_RoomsDiscounts_Vouchers_Id` FOREIGN KEY (`discount_id`) REFERENCES `Discounts` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
--   PRIMARY KEY `pk_RoomsDiscounts_id`(`room_id`, `discount_id`)
-- ) ENGINE = InnoDB;

/**
 * =============================================
 * Table: TokenPairs Ma su dung sau khi dang nhap
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `TokenPairs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT,
  `employee_id` INT,
  `owner_id` INT,
  `public_key` TEXT NOT NULL,
  `private_key` TEXT NOT NULL,
  `refresh_token` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_TokenPairs_Employees` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_TokenPairs_Customers` FOREIGN KEY (`customer_id`) REFERENCES `Customers` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_TokenPairs_Owners` FOREIGN KEY (`owner_id`) REFERENCES `Owners` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_TokenPairs_id`(`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `RefreshTokensUsed` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key_id` INT NOT NULL,
  `refresh_token` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_RefreshTokensUsed_TokenPairs` FOREIGN KEY (`key_id`) REFERENCES `TokenPairs` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_RefreshTokensUsed_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Bookings - Đặt phòng.
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Bookings` (
  `id` VARCHAR(32) NOT NULL COMMENT 'DDMMYYYYhhmmss',
  `customer_id` INT NOT NULL,
  `employee_id` INT DEFAULT NULL,
  `voucher` VARCHAR(32) DEFAULT NULL,
  `payment` ENUM('online', 'offline', 'transfer', 'others') NOT NULL,
  `mode_booking` ENUM('day', 'time') NOT NULL,
  `total_price` INT NOT NULL,
  `total_room` INT NOT NULL,
  `status` ENUM('paid', 'pending_payment', 'confirmed', 'pending_confirmation', 'canceled', 'checked_out', 'in_progress', 'waiting_for_guest_arrival', 'rejected', 'upgraded', 'partially_paid') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Bookings_Customers_Id` FOREIGN KEY (`customer_id`) REFERENCES `Customers` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Bookings_Employees_Id` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Bookings_Vouchers_Id` FOREIGN KEY (`voucher`) REFERENCES `Vouchers` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Bookings_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `Bookings` ADD IF NOT EXISTS `is_booked_online` BOOLEAN DEFAULT 0;

ALTER TABLE `Bookings` MODIFY `status` ENUM('pending_payment', 'confirmed', 'pending_confirmation', 'canceled', 'checked_out', 'in_progress', 'completed') NOT NULL;

/**
 * =============================================
 * Table: Booking_Details - Chi tiết đặt phòng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `BookingDetails` (
  `id` VARCHAR(32) NOT NULL,
  `booking_id` VARCHAR(32) NOT NULL,
  `room_number_id` VARCHAR(32) NOT NULL,
  `room_id` INT NOT NULL,
  `check_in` DATETIME NOT NULL,
  `check_out` DATETIME NOT NULL,
  `adults` INT NOT NULL,
  `children` INT DEFAULT NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('transfer_room', 'paid', 'pending_payment', 'confirmed', 'pending_confirmation', 'canceled', 'checked_out', 'in_progress', 'waiting_for_guest_arrival', 'rejected', 'upgraded', 'partially_paid') NOT NULL,
  `price_discount` INT  DEFAULT NULL CHECK(`price_discount` > 0),
  `percent_discount` INT DEFAULT NULL CHECK(
    `percent_discount` >= 0
    AND `percent_discount` <= 100
  ),
  `type` ENUM('price', 'percent') DEFAULT NULL,
  `last_room_number_transfer` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Booking_Details_Bookings` FOREIGN KEY (`booking_id`) REFERENCES `Bookings` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Booking_Rooms_Id` FOREIGN KEY (`room_id`) REFERENCES `Rooms` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_BookingDetails_id`(`id`)
) ENGINE = InnoDB;


ALTER TABLE `BookingDetails` ADD IF NOT EXISTS `checked_in` DATETIME DEFAULT NULL;

ALTER TABLE `BookingDetails` ADD IF NOT EXISTS `checked_out` DATETIME DEFAULT NULL;

ALTER TABLE `BookingDetails` MODIFY `status` ENUM('pending_payment', 'confirmed', 'pending_confirmation', 'canceled', 'checked_out', 'in_progress', 'completed') NOT NULL;


ALTER TABLE `BookingDetails` DROP IF EXISTS `price_discount`;

ALTER TABLE `BookingDetails` DROP IF EXISTS `percent_discount`;

ALTER TABLE `BookingDetails` DROP IF EXISTS `type`;

ALTER TABLE `BookingDetails` ADD IF NOT EXISTS `discount_id` VARCHAR(32) DEFAULT NULL;


-- ALTER TABLE `BookingDetails`
-- ADD CONSTRAINT `fk_BookingDetails_Discounts`
--   FOREIGN KEY (`discount_id`)
--   REFERENCES `Discounts` (`id`)
--   ON DELETE NO ACTION
--   ON UPDATE CASCADE;

/**
 * =============================================
 * Table: GuestStayInformations - Thông tin lưu trú của khách
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `GuestStayInformations` (
  `id` VARCHAR(32) NOT NULL,
  `booking_details_id` VARCHAR(32) NOT NULL,
  `room_number` VARCHAR(32) NOT NULL,
  `full_name` VARCHAR(32) NOT NULL,
  `gender` ENUM('MALE', 'FEMALE', 'OTHERS') DEFAULT NULL,
  `birthday` DATE DEFAULT NULL,
  `nationality` TEXT NOT NULL COMMENT 'Quoc tich',
  `note` TEXT DEFAULT NULL,
  `identification_type` ENUM('passport', 'cccd', 'cmnd', 'others', 'cavet_xe') NOT NULL COMMENT 'Loai giay to',
  `identification_value` VARCHAR(255) NOT NULL COMMENT 'Gia tri giay to',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_GuestStayInformations_Bookings_Details_Id` FOREIGN KEY (`booking_details_id`) REFERENCES `BookingDetails` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_GuestStayInformations_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Bills - Hóa đơn tiền phòng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Bills` (
  `id` VARCHAR(32) NOT NULL,
  `employee_id` INT NOT NULL,
  `booking_details_id` VARCHAR(32) NOT NULL,
  `total_price` INT NOT NULL,
  `payment` ENUM('online', 'offline', 'transfer', 'others') DEFAULT NULL,
  `deposit` INT DEFAULT NULL COMMENT 'tien tra truoc',
  `change` INT DEFAULT NULL COMMENT 'tien thua',
  `price_received` INT DEFAULT NULL COMMENT 'tien da nhan tu khach',
  `note` TEXT DEFAULT NULL,
  `status` ENUM('paid', 'unpaid', 'partially_paid', 'others') NOT NULL COMMENT 'trang thai',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Bills_Bookings_Details_Id` FOREIGN KEY (`booking_details_id`) REFERENCES `BookingDetails` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Bills_Employee_Id` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Bills_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `Bills` ADD IF NOT EXISTS `discount` INT DEFAULT NULL;
ALTER TABLE `Bills` ADD IF NOT EXISTS `cost_room` INT DEFAULT 0 COMMENT 'Chi phi phong';
ALTER TABLE `Bills` ADD IF NOT EXISTS `cost_service` INT DEFAULT 0 COMMENT 'Chi phi DV/HH';
ALTER TABLE `Bills` ADD IF NOT EXISTS `cost_room_paid` INT DEFAULT 0 COMMENT 'Tien phong da thanh toan';
ALTER TABLE `Bills` ADD IF NOT EXISTS `cost_over_checkout` INT DEFAULT 0 COMMENT 'Chi phi tra phong muon';
ALTER TABLE `Bills` ADD IF NOT EXISTS `cost_last_checkin` INT DEFAULT 0 COMMENT 'Chi phi nhan phong som';
ALTER TABLE `Bills` ADD IF NOT EXISTS `cost_late_checkout` INT DEFAULT 0 COMMENT 'Hoan tien tra phong som doi voi dat theo gio';
ALTER TABLE `Bills` ADD IF NOT EXISTS `change_room_bill` TEXT DEFAULT NULL COMMENT 'Hoa don da doi phong';

/**
 * =============================================
 * Table: Taxs - Thuế đặt phòng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Taxs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'ten thue',
  `rate` DECIMAL(5,2) NOT NULL COMMENT 'ty le thue',
  `description` VARCHAR(255) COMMENT 'mo ta ve thue',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Taxs_Id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Notifications - Thông báo
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `actor_type` ENUM('employee', 'owner', 'customer') NOT NULL,
  `user_id` INT NOT NULL,
  `is_read` BOOLEAN DEFAULT 0,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NOT NULL,
  `notification_type` VARCHAR(255),
  `entity_name` VARCHAR(255) NOT NULL,
  `entity_id` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Notifications_id`(`id`)
) ENGINE = InnoDB;


ALTER TABLE `Notifications` ADD IF NOT EXISTS `is_system` BOOLEAN DEFAULT 0;


/**
 * =============================================
 * Table: SaveExpoPushTokens - Lưu lại mã id device
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `SaveExpoPushTokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `expo_push_token` VARCHAR(255),
  `user_id` INT DEFAULT NULL,
  `actor_type` ENUM('employee', 'owner', 'customer') DEFAULT 'customer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_PushTokens_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Service_Types - Loại Dịch vụ
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ServiceTypes` (
  `id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_ServiceTypes_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Services - Dịch vụ
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Services` (
  `id` VARCHAR(32) NOT NULL,
  `service_type_id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `timer` INT DEFAULT NULL,
  `desc` VARCHAR(255) DEFAULT NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `is_sell` BOOLEAN DEFAULT 1 COMMENT 'BAN TRUC TIEP',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Services_ServiceTypes` FOREIGN KEY (`service_type_id`) REFERENCES `ServiceTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Services_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `Services` ADD IF NOT EXISTS `photo_public` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `Services` ADD IF NOT EXISTS `is_product` BOOLEAN DEFAULT 0;
ALTER TABLE `Services` ADD IF NOT EXISTS `min_quantity_product` INT DEFAULT 5;
ALTER TABLE `Services` ADD IF NOT EXISTS `quantity` INT DEFAULT NULL;
ALTER TABLE `Services` DROP IF EXISTS `is_sell`;

/**
 * =============================================
 * Table: ServicesPrices - Giá Dịch vụ
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ServicesPrices` (
  `id` VARCHAR(32) NOT NULL,
  `service_id` VARCHAR(32) NOT NULL,
  `price_original` INT NOT NULL,
  `price_sell` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Services_ServicesPrices` FOREIGN KEY (`service_id`) REFERENCES `Services` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_ServicesPrices_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Attributes - Thuộc tính
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Attributes` (
  `id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Attributes_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: ServicesAttributes - Thuộc tính
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ServicesAttributes` (
  `id` VARCHAR(32) NOT NULL,
  `attribute_id` VARCHAR(32) NOT NULL,
  `service_id` VARCHAR(32) NOT NULL,
  `quantity` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_ServicesAttributes_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `ServicesAttributes` ADD IF NOT EXISTS `value` VARCHAR(255) NOT NULL;

/**
 * =============================================
 * Table: ServicesUnits - Đơn vị sản phẩm
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ServicesUnits` (
  `id` VARCHAR(32) NOT NULL,
  `service_id` VARCHAR(32) NOT NULL,
  `unit_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ServicesUnits_Services_Id` FOREIGN KEY (`service_id`) REFERENCES `Services` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_ServicesUnits_Units_Id` FOREIGN KEY (`unit_id`) REFERENCES `Units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_ServicesUnits_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `ServicesUnits` ADD IF NOT EXISTS `quantity` INT DEFAULT 1;
ALTER TABLE `ServicesUnits` ADD IF NOT EXISTS `is_sell` BOOLEAN DEFAULT 1 COMMENT 'BAN TRUC TIEP';
ALTER TABLE `ServicesUnits` ADD IF NOT EXISTS `price` INT DEFAULT NULL;
ALTER TABLE `ServicesUnits` ADD IF NOT EXISTS `is_default` BOOLEAN DEFAULT 0;
ALTER TABLE `ServicesUnits` ADD IF NOT EXISTS `quantity_in_stock` INT DEFAULT 0;


/**
 * =============================================
 * Table: Suppliers - Nhà cung cấp
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Suppliers` (
  `id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(11) NOT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `company_name` VARCHAR(255) DEFAULT NULL,
  `code_tax` VARCHAR(255) DEFAULT NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Suppliers_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: GoodsReceiptNotes - Phiếu nhập hàng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `GoodsReceiptNotes` (
  `id` VARCHAR(32) NOT NULL,
  `supplier_id` VARCHAR(32) NOT NULL,
  `employee_id` INT NOT NULL,
  `quantity_ordered` INT NOT NULL,
  `total_cost` INT NOT NULL COMMENT 'Tong tien hang hoa',
  `total_cost_paymented` INT NOT NULL COMMENT 'Tong tien da tra cho NNC',
  `discount` INT DEFAULT NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('paid', 'unpaid', 'partially_paid') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_GoodsReceiptNotes_Suppliers_Id` FOREIGN KEY (`supplier_id`) REFERENCES `Suppliers` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_GoodsReceiptNotes_Employees_Id` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_GoodsReceiptNotes_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: GoodsReceiptNotes - Phiếu nhập hàng chi tiết
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `GoodsReceiptNotesDetails` (
  `id` VARCHAR(32) NOT NULL,
  `goods_receipt_note_id` VARCHAR(32) NOT NULL,
  `product_id` VARCHAR(32) NOT NULL,
  `quantity_ordered` INT NOT NULL,
  `sub_total` INT NOT NULL COMMENT 'Thanh tien',
  `price` INT NOT NULL COMMENT 'Don gia',
  `discount` INT DEFAULT NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_GoodsReceiptNotesDetails_GoodsReceiptNotes_Id` FOREIGN KEY (`goods_receipt_note_id`) REFERENCES `GoodsReceiptNotes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_GoodsReceiptNotesDetails_Services_Id` FOREIGN KEY (`product_id`) REFERENCES `Services` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_GoodsReceiptNotesDetails_id`(`id`)
) ENGINE = InnoDB;

-- ALTER TABLE `GoodsReceiptNotesDetails` ADD `unit_product_id` VARCHAR(32);

-- ALTER TABLE `GoodsReceiptNotesDetails`
-- ADD CONSTRAINT `fk_GoodsReceiptNotesDetails_ServicesUnits_Id`
--   FOREIGN KEY (`unit_product_id`)
--   REFERENCES `ServicesUnits` (`id`)
--   ON DELETE NO ACTION
--   ON UPDATE CASCADE;


/**
 * =============================================
 * Table: GuestUseServices - Khách  hàng sử dụng dịch vụ
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `GuestUseServices` (
  `id` VARCHAR(32) NOT NULL,
  `service_id` VARCHAR(32) NOT NULL,
  `service_unit_id` VARCHAR(32) NOT NULL,
  `booking_details_id` VARCHAR(32) NOT NULL,
  `guest_id` VARCHAR(32),
  `quantity_ordered` INT NOT NULL COMMENT 'So luong da su dung',
  `price` INT NOT NULL COMMENT 'Don gia',
  `discount` INT DEFAULT NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_GuestUseServices_Services_Id` FOREIGN KEY (`service_id`) REFERENCES `Services` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_GuestUseServices_BookingDetails_Id` FOREIGN KEY (`booking_details_id`) REFERENCES `BookingDetails` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_GuestUseServices_GuestStayInformations_Id` FOREIGN KEY (`guest_id`) REFERENCES `GuestStayInformations` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_GuestUseServices_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: MomoTransactions - Giao dịch thanh toán momo
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `MomoTransactions` (
  `id` VARCHAR(32) NOT NULL,
  `partner_code` VARCHAR(32) NOT NULL,
  `request_id` VARCHAR(32) NOT NULL,
  `order_id` VARCHAR(32) NOT NULL,
  `trans_id` VARCHAR(32) DEFAULT NULL,
  `result_code` VARCHAR(32),
  `request_type` VARCHAR(50),
  `message` VARCHAR(255),
  `booking_id` VARCHAR(32),
  `booking_details_id` VARCHAR(32),
  `lang` VARCHAR(2),
  `amount` INT,
  `order_info` VARCHAR(255),
  `status` ENUM('pending', 'successfully', 'failed', 'refund') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_MomoTransactions_Bookings_Id` FOREIGN KEY (`booking_id`) REFERENCES `Bookings` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_MomoTransactions_BookingDetails_Id` FOREIGN KEY (`booking_details_id`) REFERENCES `BookingDetails` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_MomoTransactions_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `MomoTransactions` ADD IF NOT EXISTS `signature` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `MomoTransactions` ADD IF NOT EXISTS `pay_type` ENUM("pr", "webApp", "credit", "napas") DEFAULT NULL;
ALTER TABLE `MomoTransactions` ADD IF NOT EXISTS `order_type` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `MomoTransactions` ADD IF NOT EXISTS `partner_user_Id` VARCHAR(50) DEFAULT NULL;
ALTER TABLE `MomoTransactions` ADD IF NOT EXISTS `extra_data` TEXT DEFAULT NULL;
ALTER TABLE `MomoTransactions` MODIFY `trans_id` BIGINT;

/**
 * =============================================
 * Table: ZaloPayTransactions - Giao dịch thanh toán momo
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ZaloPayTransactions` (
  `id` VARCHAR(32) NOT NULL,
  `booking_id` VARCHAR(32),
  `booking_details_id` VARCHAR(32),

  `app_id` INT NOT NULL,
  `app_user` VARCHAR(50) NOT NULL COMMENT 'TTKH',
  `app_trans_id` VARCHAR(40) NOT NULL COMMENT  'yymmdd_idBooking',

  `app_time` BIGINT NOT NULL COMMENT 'unix timestamp in milisecond',
  `amount` BIGINT NOT NULL,
  `item` TEXT NOT NULL COMMENT 'item cua don hang',

  `description` TEXT NOT NULL,
  `embed_data` TEXT NOT NULL,
  `bank_code` VARCHAR(20) COMMENT 'phuong phuc thanh toan',
  `mac` TEXT NOT NULL COMMENT  'thong tin chung thuc cua don hang',

  `title` TEXT COMMENT  'tieu de cua don hang',

  `return_code` INT  COMMENT 'trang thai giao dich',
  `sub_return_code` INT COMMENT 'ma trang thai chi tiet',
  `return_message` TEXT COMMENT 'mo ta trang thai',

  `sub_return_message` TEXT COMMENT 'mo ta trang thai chi tiet',
  `zp_trans_token` TEXT COMMENT 'thong tin token don hang',
  `order_token` TEXT COMMENT 'thong tin token don hang',

  `zp_trans_id` BIGINT COMMENT 'ma giao dich cua zalo pay',
  `m_refund_id` VARCHAR(45) COMMENT 'yymmdd_appid_xxxxxxxxxx',
  `refund_id` BIGINT COMMENT 'Ma giao dich hoan tien cua zalo pay',

  `status` ENUM('pending', 'successfully', 'failed', 'refund') DEFAULT 'pending',

  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT `fk_ZaloPayTransactions_Bookings_Id` FOREIGN KEY (`booking_id`) REFERENCES `Bookings` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_ZaloPayTransactions_BookingDetails_Id` FOREIGN KEY (`booking_details_id`) REFERENCES `BookingDetails` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_ZaloPayTransactions_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `ZaloPayTransactions` ADD IF NOT EXISTS `is_booking` BOOLEAN DEFAULT 1;

/**
 * =============================================
 * Table: InformationHotels - Giao dịch thanh toán momo
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `InformationHotels` (
  `id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `long` VARCHAR(255),
  `lat` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_InformationHotels_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Banners - Quản lý banners
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Banners` (
  `id` VARCHAR(32) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Banners_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Representatives - Quản lý Representatives
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Representatives` (
  `id` VARCHAR(32) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `photo` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `Rk_representatives_id`(`id`)
) ENGINE = InnoDB;


-- DROP TABLE IF EXISTS `Rates`;


/**
 * =============================================
 * Table: Rates - Quản lý Rates
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Rates` (
  `id` VARCHAR(32) NOT NULL,
  `booking_id` VARCHAR(32) NOT NULL,
  `room_id` INT NOT NULL,
  `customer_id` INT NOT NULL,
  `start` INT NOT NULL,
  `comment` VARCHAR(255) NOT NULL,
  `is_hidden` BOOLEAN DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Rates_Customers_Id` FOREIGN KEY (`customer_id`) REFERENCES `Customers` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Rates_Bookings_Id` FOREIGN KEY (`booking_id`) REFERENCES `Bookings` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Rates_Rooms_Id` FOREIGN KEY (`room_id`) REFERENCES `Rooms` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `Rk_Rates_id`(`id`)
) ENGINE = InnoDB;

-- CREATE TABLE IF NOT EXISTS `PolicyCategories` (
--   `id` INT NOT NULL AUTO_INCREMENT,
--   `name` VARCHAR(255),
--   `description` TEXT,
--   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   `deleted_at` DATETIME DEFAULT NULL,
--   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   PRIMARY KEY `pk_PolicyCategories_id`(`id`)
-- ) ENGINE = InnoDB;

-- CREATE TABLE IF NOT EXISTS `Policies` (
--   `id` INT NOT NULL AUTO_INCREMENT,
--   `name` VARCHAR(255),
--   `description` TEXT,
--   `effective_date` DATE COMMENT 'Ngay phat hanh',
--   `expiry_date` DATE COMMENT 'Ngay het han',
--   `category_id` INT NOT NULL COMMENT 'Loai chinh sach',
--   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   `deleted_at` DATETIME DEFAULT NULL,
--   `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   CONSTRAINT `fk_Policies_PolicyCategories_Id` FOREIGN KEY (`category_id`) REFERENCES `PolicyCategories` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
--   PRIMARY KEY `pk_Policies_id`(`id`)
-- ) ENGINE = InnoDB;


-- sp (store procedure)
-- delimiter //
-- CREATE PROCEDURE IF NOT EXISTS `sp_searching_room_is_booked_timespan` (IN check_in DATETIME, IN check_out DATETIME, IN room_id INT)
-- BEGIN
--   SELECT DISTINCT b.*, bd.room_id
--   FROM Bookings b
--   JOIN BookingDetails bd
--   ON bd.room_id = room_id
--   AND (b.check_in BETWEEN check_in AND check_out
--   OR b.check_out BETWEEN check_in AND check_out)
--   AND b.id = bd.booking_id
-- END//


-- SELECT BD.*, B.mode_booking, B.is_booked_online
-- FROM  bookings B
-- JOIN bookingdetails BD
-- ON B.id = BD.booking_id AND BD.deleted_at IS NULL
-- WHERE BD.check_in BETWEEN '2023-12-30 11:35:13' AND '2023-12-30 17:35:13'
-- OR BD.check_out BETWEEN '2023-12-30 11:35:13' AND '2023-12-30 17:35:13'
-- ORDER BY BD.check_in;

-- (BD.check_in <= check_in AND BD.check_out >= check_in)
-- OR (BD.check_in < check_out AND BD.check_out >= check_out )
-- OR (check_in <= BD.check_in AND check_out >= BD.check_in)