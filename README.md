# Backend for National Examination System

This is the **backend** of the National Examination System, built with **Node.js**, **TypeScript**, and **Express.js**. It provides APIs for user authentication, product management, and other core functionalities.

---

## **Features**
- **Authentication**: User registration, login, and JWT-based authentication.
- **Product Management**: Create, update, delete, and list products with image uploads.
- **Error Handling**: Centralized error handling with custom exceptions.
- **Rate Limiting**: Protects APIs from abuse using rate limiting.
- **File Uploads**: Supports image uploads for products.
- **Database**: Uses **Prisma ORM** with **MySQL** for database management.
- **API Documentation**: Swagger-based API documentation.
- **Logging**: Logs errors and events using **Winston**.
- **Docker Support**: Fully containerized with Docker and Docker Compose.

---

## **Tech Stack**
- **Node.js**: JavaScript runtime for building server-side applications.
- **TypeScript**: Static typing for better code quality.
- **Express.js**: Web framework for building RESTful APIs.
- **Prisma**: ORM for database management.
- **MySQL**: Relational database for storing data.
- **Multer**: Middleware for handling file uploads.
- **JWT**: JSON Web Tokens for authentication.
- **Swagger**: API documentation.

---

## **Getting Started**

### **1. Prerequisites**
- **Node.js**: Version 18 or higher.
- **MySQL**: Version 8.0 or higher.
- **Docker** (optional): For containerized deployment.

### **2. Installation**
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/national-examination-backend.git
   cd national-examination-backend