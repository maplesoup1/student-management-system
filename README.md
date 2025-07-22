# Student Management System

A minimal system for managing students, teachers, and classes with enrollment functionality.

## Tech Stack

**Backend:**
- Spring Boot
- Java 17
- Maven
- In-memory storage (can be configured with database)

**Frontend:**
- React with TypeScript
- Axios for API calls
- React Router for navigation
- Responsive CSS

## Project Structure

```
student-management-system/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/billieonsite/studentmanagement/
│   │   ├── controller/      # REST controllers
│   │   ├── model/          # Domain models
│   │   └── StudentManagementApplication.java
│   ├── pom.xml
│   └── src/main/resources/application.properties
└── frontend/               # React frontend
    ├── src/
    │   ├── components/     # React components
    │   ├── App.tsx
    │   └── index.tsx
    ├── package.json
    └── tsconfig.json
```

## Features

### Backend API Endpoints
- `POST /api/classes` - Create a new class with JSONB schedule
- `GET /api/classes` - List all classes with teacher details  
- `POST /api/enrollments` - Enroll student in class (prevents duplicates)
- `GET /api/teachers/{id}/classes` - Get classes by teacher

### Frontend Components
- **Class Creation Form** - Create classes with JSON schedule editor
- **Class List** - Responsive table showing all classes
- **Enrollment Form** - Enroll students in classes
- **Teacher Dashboard** - View classes by teacher ID

### Domain Models
- **Student** (id, name, email)
- **Teacher** (id, name, subject)  
- **Class** (id, title, schedule JSONB, teacher_id)
- **Enrollment** (id, class_id, student_id)

### Schedule JSON Format
```json
{
  "days": ["Mon","Wed"], 
  "time": "14:00-15:30", 
  "room": "A203"
}
```

## Getting Started

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
Server runs on http://localhost:8080

### Frontend
```bash
cd frontend
npm install
npm start
```
App runs on http://localhost:3000

## Validation Features
- Prevents duplicate student enrollments
- JSON format validation for class schedules
- Required field validation on forms

## Next Steps
- Configure database (PostgreSQL/MySQL)
- Add JPA repositories
- Implement proper error handling
- Add authentication
- Enhance UI/UX