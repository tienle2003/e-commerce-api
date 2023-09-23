create database ecommerce
go

use ecommerce
go

CREATE TABLE users (
   id int AUTO_INCREMENT PRIMARY KEY,
   name varchar(255) NOT NULL,
   email varchar(255) UNIQUE NOT NULL,
   password varchar(255) NOT NULL,
   created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   role varchar(50) DEFAULT 'user' NOT NULL,
   avatar varchar(255),
   birth_date date,
   address varchar(255),
   phone varchar(20),
   verified tinyint(1) DEFAULT '0'
);


CREATE TABLE categories (
   id int AUTO_INCREMENT PRIMARY KEY,
   name varchar(255) NOT NULL
);


CREATE TABLE products (
   id int AUTO_INCREMENT PRIMARY KEY,
   name varchar(255) NOT NULL,
   price decimal(10,2) NOT NULL,
   description text,
   color varchar(50),
   quantity int NOT NULL DEFAULT '0',
   created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   sold int DEFAULT '0',
   brand varchar(255) NOT NULL,
   images json,
   category_id int NOT NULL
)


CREATE TABLE reviews (
   id int AUTO_INCREMENT PRIMARY KEY,
   product_id int NOT NULL,
   user_id int NOT NULL,
   comment varchar(255) NOT NULL,
   rating int NOT NULL,
   createdAt datetime NOT NULL,
   updatedAt datetime NOT NULL,
   CONSTRAINT reviews_products_fk FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE,
   CONSTRAINT reviews_users_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
)


CREATE TABLE refresh_tokens (
   id int AUTO_INCREMENT PRIMARY KEY,
   user_id int,
   token varchar(255),
   expires_at timestamp NULL,
   CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
)
