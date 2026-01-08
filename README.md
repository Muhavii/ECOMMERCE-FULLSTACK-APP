# 🛒 Ecommerce Backend API - Spring Boot

A complete production-ready ecommerce backend API built with Spring Boot, MySQL, and JWT authentication.

## 📋 What This Project Includes

- **User Authentication** (Register, Login with JWT)
- **Product Management** (CRUD operations)
- **Shopping Cart** (Add, Update, Remove items)
- **Order Management** (Create orders, Track status)
- **Admin Panel** (Manage products and orders)
- **Security** (JWT-based authentication, Role-based access)

---

## 🚀 STEP-BY-STEP GUIDE FOR BEGINNERS

### **Step 1: Install Required Software**

Before starting, install these on your computer:

1. **Java 17 or higher**
   - Download from: https://www.oracle.com/java/technologies/downloads/
   - Verify installation: Open terminal and type `java -version`

2. **MySQL Database**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - During installation, set a password for root user (remember this!)
   - Start MySQL service

3. **Maven** (Build tool)
   - Download from: https://maven.apache.org/download.cgi
   - Or use the one bundled with your IDE
   - Verify: `mvn -version`

4. **VS Code** or **IntelliJ IDEA** (IDE)
   - VS Code: https://code.visualstudio.com/
   - IntelliJ: https://www.jetbrains.com/idea/download/

---

### **Step 2: Configure Database**

1. **Start MySQL** (if not running)
   
2. **Create Database** (Terminal/Command Prompt):
   ```bash
   mysql -u root -p
   # Enter your MySQL password when prompted
   ```
   
   Then run:
   ```sql
   CREATE DATABASE ecommerce_db;
   EXIT;
   ```

3. **Update Configuration File**
   - Open: `src/main/resources/application.properties`
   - Change this line:
   ```properties
   spring.datasource.password=your_password_here
   ```
   Replace `your_password_here` with your actual MySQL password

---

### **Step 3: Build the Project**

Open terminal in the project directory and run:

```bash
# Download dependencies and build
mvn clean install
```

Wait for it to complete (first time takes 2-5 minutes).

---

### **Step 4: Run the Application**

```bash
mvn spring-boot:run
```

You should see:
```
Started EcommerceApiApplication in X.XXX seconds
```

The API is now running at: **http://localhost:8080**

---

## 🧪 Testing the API

### **Using Postman (Recommended for Beginners)**

1. **Download Postman**: https://www.postman.com/downloads/

2. **Test Registration**:
   - Method: `POST`
   - URL: `http://localhost:8080/api/auth/register`
   - Body (raw JSON):
   ```json
   {
       "username": "john",
       "email": "john@example.com",
       "password": "password123",
       "fullName": "John Doe",
       "phoneNumber": "1234567890",
       "address": "123 Main St"
   }
   ```

3. **Test Login**:
   - Method: `POST`
   - URL: `http://localhost:8080/api/auth/login`
   - Body (raw JSON):
   ```json
   {
       "username": "john",
       "password": "password123"
   }
   ```
   - Copy the `token` from response

4. **Test Getting Products**:
   - Method: `GET`
   - URL: `http://localhost:8080/api/products`
   - Headers: `Authorization: Bearer YOUR_TOKEN_HERE`

---

## 📚 Available API Endpoints

### **Authentication (No token needed)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### **Products (Public access for GET)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/{id}` | Get product by ID |
| GET | `/api/products/category/{category}` | Get products by category |
| GET | `/api/products/search?name=keyword` | Search products |
| POST | `/api/products` | Create product (Admin only) |
| PUT | `/api/products/{id}` | Update product (Admin only) |
| DELETE | `/api/products/{id}` | Delete product (Admin only) |

### **Cart (Requires Authentication)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/add/{productId}?quantity=1` | Add to cart |
| PUT | `/api/cart/update/{cartItemId}?quantity=2` | Update cart item |
| DELETE | `/api/cart/remove/{cartItemId}` | Remove from cart |
| DELETE | `/api/cart/clear` | Clear entire cart |

### **Orders (Requires Authentication)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get user's orders |
| GET | `/api/orders/{id}` | Get order by ID |
| POST | `/api/orders/create?shippingAddress=...&paymentMethod=COD` | Create order |
| PUT | `/api/orders/{id}/status?status=SHIPPED` | Update status (Admin) |
| GET | `/api/orders/all` | Get all orders (Admin) |

---

## 🔐 How Authentication Works

1. **Register** a user → Stores in database
2. **Login** with username/password → Returns JWT token
3. **Use token** in all protected endpoints:
   - Add to headers: `Authorization: Bearer YOUR_TOKEN`

---

## 🎯 Production Deployment Guide

### **Option 1: Deploy to Railway (Easiest)**

1. Create account at https://railway.app
2. Create new project → Deploy from GitHub
3. Add MySQL database addon
4. Set environment variables:
   ```
   SPRING_PROFILES_ACTIVE=prod
   DATABASE_URL=jdbc:mysql://...
   DATABASE_USERNAME=...
   DATABASE_PASSWORD=...
   JWT_SECRET=your-super-secret-key-min-256-bits-long
   ```
5. Deploy!

### **Option 2: Deploy to Heroku**

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add MySQL addon: `heroku addons:create jawsdb`
5. Set environment:
   ```bash
   heroku config:set SPRING_PROFILES_ACTIVE=prod
   heroku config:set JWT_SECRET=your-secret-key
   ```
6. Deploy: `git push heroku main`

### **Option 3: Deploy to AWS EC2**

1. Launch EC2 instance (Amazon Linux 2)
2. Install Java 17:
   ```bash
   sudo yum install java-17-amazon-corretto
   ```
3. Install MySQL
4. Upload JAR file:
   ```bash
   scp target/ecommerce-api-1.0.0.jar ec2-user@your-ip:~/
   ```
5. Run:
   ```bash
   java -jar ecommerce-api-1.0.0.jar --spring.profiles.active=prod
   ```

### **Option 4: Docker Deployment**

Create `Dockerfile`:
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/ecommerce-api-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

Build and run:
```bash
mvn clean package
docker build -t ecommerce-api .
docker run -p 8080:8080 ecommerce-api
```

---

## 📱 Connecting Android App to Backend

In your Android project, set the base URL:

```java
// For local testing (emulator)
String BASE_URL = "http://10.0.2.2:8080/api/";

// For production
String BASE_URL = "https://your-domain.com/api/";
```

Use Retrofit or Volley to make API calls:

```java
// Example with Retrofit
public interface ApiService {
    @POST("auth/login")
    Call<AuthResponse> login(@Body LoginRequest request);
    
    @GET("products")
    Call<List<Product>> getProducts();
}
```

---

## 🐛 Common Issues & Solutions

### **Issue: "Access denied for user"**
- **Fix**: Update password in `application.properties`

### **Issue: "Port 8080 already in use"**
- **Fix**: Change port in `application.properties`:
  ```properties
  server.port=8081
  ```

### **Issue: "Table doesn't exist"**
- **Fix**: Ensure MySQL is running and database is created

### **Issue: "Invalid JWT token"**
- **Fix**: Login again to get a fresh token

---

## 📖 Learn More

- **Spring Boot**: https://spring.io/guides/gs/spring-boot/
- **JWT**: https://jwt.io/introduction
- **REST API**: https://restfulapi.net/
- **MySQL**: https://dev.mysql.com/doc/

---

## 🤝 Support

If you're stuck:
1. Check error messages in terminal
2. Verify MySQL is running
3. Check database credentials
4. Ensure Java 17+ is installed

---

## 📝 Project Structure

```
ecommerce-api/
├── src/main/java/com/ecommerce/
│   ├── config/          # Security configuration
│   ├── controller/      # REST API endpoints
│   ├── dto/             # Data transfer objects
│   ├── model/           # Database entities
│   ├── repository/      # Database queries
│   └── security/        # JWT & authentication
├── src/main/resources/
│   └── application.properties  # Configuration
└── pom.xml             # Dependencies
```

---

## ✅ Quick Start Checklist

- [ ] Java 17+ installed
- [ ] MySQL installed and running
- [ ] Database created (`ecommerce_db`)
- [ ] Password updated in `application.properties`
- [ ] Run `mvn clean install`
- [ ] Run `mvn spring-boot:run`
- [ ] Test with Postman

---

**You're all set! 🎉 Start building your ecommerce empire!**
