## Backend Details

### Project Structure
```
src/main/java/com/billieonsite/studentmanagement/
├── controller/          # REST API endpoints
├── dto/                # Data Transfer Objects
├── model/              # JPA entities
├── repository/         # Data access layer
├── security/           # JWT & security configuration
└── service/            # Business logic layer
```

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /login` - User authentication with JWT token generation
- `POST /register` - Student account registration
- `POST /logout` - User session termination
- `POST /create-admin` - Administrative account creation

#### Users (`/api/users`)
- `GET /` - Retrieve all user accounts
- `POST /` - Create new user account
- `PUT /{id}/role` - Update user role permissions

#### Students (`/api/students`)
- `GET /` - List all student profiles
- `GET /{id}` - Get specific student details
- `POST /` - Create new student profile
- `PUT /{id}` - Update student information
- `DELETE /{id}` - Remove student account

#### Teachers (`/api/teachers`)
- `GET /` - List all teacher profiles
- `GET /{id}` - Get specific teacher details
- `POST /` - Create new teacher profile
- `PUT /{id}` - Update teacher information
- `DELETE /{id}` - Remove teacher account

#### Classes (`/api/classes`)
- `GET /` - List all available courses
- `GET /{id}` - Get specific course details
- `GET /teacher/{teacherId}` - Get courses by teacher
- `POST /` - Create new course
- `PUT /{id}` - Update course information
- `DELETE /{id}` - Remove course

#### Enrollments (`/api/enrollments`)
- `GET /` - List all enrollment records
- `GET /student/{studentId}` - Get student's enrollments
- `GET /class/{classId}` - Get class enrollment list
- `POST /` - Create new enrollment
- `DELETE /{id}` - Cancel enrollment

#### Conflicts (`/api/conflicts`)
- `POST /check-room` - Validate room availability
- `POST /check-teacher` - Validate teacher schedule conflicts

### Authentication
JWT-based authentication required for all endpoints except `/api/auth/*`.
Include `Authorization: Bearer <token>` header in requests.

### Database Schema
- **users** - Account credentials and roles
- **students** - Student profile information
- **teachers** - Teacher profile and subjects
- **classes** - Course details with JSONB schedule
- **enrollments** - Student-course relationships with time slots

### Schedule Format
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

### DTOs (Data Transfer Objects)

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

### Development Setup
1. Configure PostgreSQL database
2. Update `application.properties` with database credentials
3. Run `mvn spring-boot:run`
4. Access Swagger UI at `http://localhost:8080/swagger-ui.html`

## Features

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
