-- Initial data for development (PostgreSQL compatible)

-- Insert users first (admin, teachers, students) - only if not exists
-- Password for all users is "password"
INSERT INTO users (username, password, role) 
SELECT * FROM (VALUES
  ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'ADMIN'),
  ('john_smith', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'TEACHER'),
  ('mary_johnson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'TEACHER'),
  ('david_wilson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'TEACHER'),
  ('sarah_brown', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'TEACHER'),
  ('alice_chen', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'STUDENT'),
  ('bob_davis', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'STUDENT'),
  ('charlie_lee', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'STUDENT'),
  ('diana_kim', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'STUDENT')
) AS v(username, password, role)
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE users.username = v.username
);

-- Insert teachers with user references (only if not exists)
INSERT INTO teachers (name, subject, user_id) 
SELECT v.name, v.subject, u.id
FROM (VALUES
  ('John Smith', 'mathematics', 'john_smith'),
  ('Mary Johnson', 'english', 'mary_johnson'),  
  ('David Wilson', 'chinese', 'david_wilson'),
  ('Sarah Brown', 'accounting', 'sarah_brown')
) AS v(name, subject, username)
JOIN users u ON u.username = v.username
WHERE NOT EXISTS (
  SELECT 1 FROM teachers WHERE teachers.user_id = u.id
);

-- Insert students with user references (only if not exists)
INSERT INTO students (name, email, user_id) 
SELECT v.name, v.email, u.id
FROM (VALUES
  ('Alice Chen', 'alice.chen@example.com', 'alice_chen'),
  ('Bob Davis', 'bob.davis@example.com', 'bob_davis'),
  ('Charlie Lee', 'charlie.lee@example.com', 'charlie_lee'),
  ('Diana Kim', 'diana.kim@example.com', 'diana_kim')
) AS v(name, email, username)
JOIN users u ON u.username = v.username
WHERE NOT EXISTS (
  SELECT 1 FROM students WHERE students.user_id = u.id
);

-- Insert classes with enhanced schedule JSON (only if not exists)
INSERT INTO classes (title, schedule, teacher_id) 
SELECT v.title, v.schedule::jsonb, t.id
FROM (VALUES
  ('Advanced Mathematics', '{"monday":[{"start":"08:00","end":"10:00","room":"A203"}],"wednesday":[{"start":"08:00","end":"10:00","room":"A203"}],"tuesday":[],"thursday":[],"friday":[],"saturday":[],"sunday":[]}', 'John Smith'),
  ('Business English', '{"monday":[],"tuesday":[{"start":"14:00","end":"16:00","room":"B105"}],"wednesday":[],"thursday":[{"start":"14:00","end":"16:00","room":"B105"}],"friday":[],"saturday":[],"sunday":[]}', 'Mary Johnson'),
  ('Chinese Literature', '{"monday":[{"start":"10:00","end":"12:00","room":"C301"}],"tuesday":[],"wednesday":[],"thursday":[],"friday":[{"start":"10:00","end":"12:00","room":"C301"}],"saturday":[],"sunday":[]}', 'David Wilson'),
  ('Financial Accounting', '{"monday":[],"tuesday":[],"wednesday":[{"start":"14:00","end":"16:00","room":"D202"}],"thursday":[],"friday":[{"start":"14:00","end":"16:00","room":"D202"}],"saturday":[],"sunday":[]}', 'Sarah Brown')
) AS v(title, schedule, teacher_name)
         JOIN teachers t ON t.name = v.teacher_name
WHERE NOT EXISTS (
    SELECT 1 FROM classes WHERE classes.title = v.title
);

-- Insert enrollments with time slot information (simplified test data)
-- Each enrollment targets specific time slots with complete information
INSERT INTO enrollments (student_id, class_id, day, start_time, end_time, room) 
SELECT s.id, c.id, time_slot.day, time_slot.start_time, time_slot.end_time, time_slot.room
FROM (VALUES
  ('Alice Chen', 'Advanced Mathematics', 'monday', '08:00', '10:00', 'A203'),
  ('Alice Chen', 'Business English', 'tuesday', '14:00', '16:00', 'B105'),
  ('Bob Davis', 'Advanced Mathematics', 'wednesday', '08:00', '10:00', 'A203'),
  ('Charlie Lee', 'Chinese Literature', 'friday', '10:00', '12:00', 'C301'),
  ('Diana Kim', 'Financial Accounting', 'friday', '14:00', '16:00', 'D202')
) AS time_slot(student_name, class_title, day, start_time, end_time, room)
JOIN students s ON s.name = time_slot.student_name
JOIN classes c ON c.title = time_slot.class_title
WHERE NOT EXISTS (
  SELECT 1 FROM enrollments 
  WHERE enrollments.student_id = s.id 
    AND enrollments.class_id = c.id 
    AND enrollments.day = time_slot.day 
    AND enrollments.start_time = time_slot.start_time 
    AND enrollments.end_time = time_slot.end_time
);