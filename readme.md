# Library Management System

A full-stack web application for managing library operations, including book inventory, member registrations, and borrowing records. 

The system features a Spring Boot backend connected to a MySQL database, with a dynamic, responsive React frontend.

---

## 🚀 Features

- **Dashboard**: High-level overview of library statistics (total books, active members, borrowed books, overdue details).
- **Book Management**: Add, update, view, and delete books in the library inventory.
- **Member Management**: Register, view, edit, and remove library members.
- **Borrowing Operations**: Check out books to members, record return transactions, track due dates, and manage quantities.

---

## 🛠️ Tech Stack

### Backend
- **Java 21**
- **Spring Boot** (Spring MVC, Spring Data JPA)
- **MySQL Database**
- **Maven** (Dependency & build management)

### Frontend
- **React.js**
- **Vanilla CSS** (Responsive and modern custom styling)

---

## 📦 Project Structure

```text
Library_Management_System/
│
├── backend/
│   └── LibraryManagementSystem/      # Spring Boot application
│       ├── src/                      # Java source code & resources
│       ├── pom.xml                   # Maven dependencies config
│       └── ...
│
├── frontend/                         # React application
│   ├── public/                       # Static public assets
│   ├── src/                          # React components and styles
│   ├── package.json                  # Node dependencies config
│   └── ...
│
└── .gitignore                        # Global Git ignore settings
```

---

## ⚙️ Setup & Installation

### 1. Database Setup
1. Ensure **MySQL Server** is running on your system.
2. Create a new database named `library`:
   ```sql
   CREATE DATABASE library;
   ```
3. Update the database credentials in the Spring Boot application configuration file:
   [application.properties](file:///c:/Users/V.SRERAM/Music/Library_Management_System/backend/LibraryManagementSystem/src/main/resources/application.properties)
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/library
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

### 2. Run the Backend (Spring Boot)
1. Navigate to the backend directory:
   ```bash
   cd backend/LibraryManagementSystem
   ```
2. Run the application using the Maven wrapper:
   - **Windows (CMD/PowerShell)**:
     ```cmd
     mvnw.cmd spring-boot:run
     ```
   - **Mac/Linux**:
     ```bash
     ./mvnw spring-boot:run
     ```
   The backend will start running on port `8080` (default Spring Boot port).

### 3. Run the Frontend (React)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The frontend will open in your default browser at `http://localhost:3000`.

---

## 🛡️ License

This project is open-source and available under the MIT License.