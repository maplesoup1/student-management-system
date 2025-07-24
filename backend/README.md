# Student Management System - Backend API

## Technology Stack
- **Java 17** - Programming language
- **Spring Boot 3.2.0** - Application framework
- **Spring Security** - Authentication & authorization
- **Spring Data JPA** - Data persistence
- **PostgreSQL** - Primary database
- **JWT (JJWT 0.12.3)** - Token-based authentication
- **Maven** - Build tool
- **Swagger/OpenAPI** - API documentation

## Project Structure
```
src/main/java/com/billieonsite/studentmanagement/
├── controller/          # REST API endpoints
├── dto/                # Data Transfer Objects
├── model/              # JPA entities
├── repository/         # Data access layer
├── security/           # JWT & security configuration
└── service/            # Business logic layer
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User authentication with JWT token generation
- `POST /register` - Student account registration
- `POST /logout` - User session termination
- `POST /create-admin` - Administrative account creation

### Users (`/api/users`)
- `GET /` - Retrieve all user accounts
- `POST /` - Create new user account
- `PUT /{id}/role` - Update user role permissions

### Students (`/api/students`)
- `GET /` - List all student profiles
- `GET /{id}` - Get specific student details
- `POST /` - Create new student profile
- `PUT /{id}` - Update student information
- `DELETE /{id}` - Remove student account

### Teachers (`/api/teachers`)
- `GET /` - List all teacher profiles
- `GET /{id}` - Get specific teacher details
- `POST /` - Create new teacher profile
- `PUT /{id}` - Update teacher information
- `DELETE /{id}` - Remove teacher account

### Classes (`/api/classes`)
- `GET /` - List all available courses
- `GET /{id}` - Get specific course details
- `GET /teacher/{teacherId}` - Get courses by teacher
- `POST /` - Create new course
- `PUT /{id}` - Update course information
- `DELETE /{id}` - Remove course

### Enrollments (`/api/enrollments`)
- `GET /` - List all enrollment records
- `GET /student/{studentId}` - Get student's enrollments
- `GET /class/{classId}` - Get class enrollment list
- `POST /` - Create new enrollment
- `DELETE /{id}` - Cancel enrollment

### Conflicts (`/api/conflicts`)
- `POST /check-room` - Validate room availability
- `POST /check-teacher` - Validate teacher schedule conflicts

## Authentication
JWT-based authentication required for all endpoints except `/api/auth/*`.
Include `Authorization: Bearer <token>` header in requests.

## Database Schema
- **users** - Account credentials and roles
- **students** - Student profile information
- **teachers** - Teacher profile and subjects
- **classes** - Course details with JSONB schedule
- **enrollments** - Student-course relationships with time slots

## Schedule Format
```json
{
  "monday": [{"start": "08:00", "end": "10:00", "room": "A203"}],
  "tuesday": [],
  "wednesday": [{"start": "08:00", "end": "10:00", "room": "A203"}],
  "thursday": [],
  "friday": [],
  "saturday": [],
  "sunday": []
}
```



## DTOs (Data Transfer Objects)

### UserDto
User account information with role-based access control.

### StudentDto
Student profile with enrollment capabilities.

### TeacherDto
Teacher profile with subject specialization.

### ClassDto
Course information with JSON-based schedule structure.

### EnrollmentDto
Student-course enrollment with time slot details.

### LoginRequest
Authentication credentials for login.

### ScheduleDto
Time slot structure with day-based scheduling.



## Development Setup
1. Configure PostgreSQL database
2. Update `application.properties` with database credentials
3. Run `mvn spring-boot:run`
4. Access Swagger UI at `http://localhost:8080/swagger-ui.html`