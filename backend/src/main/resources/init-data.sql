-- Manual data initialization script
-- Run this only when you need to initialize test data

-- Insert users first (admin, teachers, students) - only if not exists
-- Password for all users is "password"
INSERT INTO users (username, password, role) 
SELECT * FROM (VALUES
  ('teacher_zhang', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'TEACHER'),
  ('teacher_li', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'TEACHER'),
  ('teacher_wang', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'TEACHER'),
  ('teacher_zhao', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'TEACHER'),
  ('student_ming', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'STUDENT'),
  ('student_hong', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'STUDENT'),
  ('student_li', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWeWG/igi6', 'STUDENT'),
  ('student_wang', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi6', 'STUDENT')
) AS v(username, password, role)
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE users.username = v.username
);

-- Insert teachers with user references (only if not exists)
INSERT INTO teachers (name, subject, user_id) 
SELECT v.name, v.subject, u.id
FROM (VALUES
  ('张三', '数学', 'teacher_zhang'),
  ('李四', '英语', 'teacher_li'),  
  ('王五', '物理', 'teacher_wang'),
  ('赵六', '化学', 'teacher_zhao')
) AS v(name, subject, username)
JOIN users u ON u.username = v.username
WHERE NOT EXISTS (
  SELECT 1 FROM teachers WHERE teachers.user_id = u.id
);

-- Insert students with user references (only if not exists)
INSERT INTO students (name, email, user_id) 
SELECT v.name, v.email, u.id
FROM (VALUES
  ('小明', 'xiaoming@example.com', 'student_ming'),
  ('小红', 'xiaohong@example.com', 'student_hong'),
  ('小李', 'xiaoli@example.com', 'student_li'),
  ('小王', 'xiaowang@example.com', 'student_wang')
) AS v(name, email, username)
JOIN users u ON u.username = v.username
WHERE NOT EXISTS (
  SELECT 1 FROM students WHERE students.user_id = u.id
);

-- Insert classes with enhanced schedule JSON (only if not exists)
INSERT INTO classes (title, schedule, teacher_id) 
SELECT v.title, v.schedule::jsonb, t.id
FROM (VALUES
  ('高等数学A', '{"monday":[{"start":"08:00","end":"10:00","room":"A203"}],"wednesday":[{"start":"08:00","end":"10:00","room":"A203"}],"tuesday":[],"thursday":[],"friday":[],"saturday":[],"sunday":[]}', '张三'),
  ('英语口语', '{"monday":[],"tuesday":[{"start":"14:00","end":"16:00","room":"B105"}],"wednesday":[],"thursday":[{"start":"14:00","end":"16:00","room":"B105"}],"friday":[],"saturday":[],"sunday":[]}', '李四'),
  ('普通物理', '{"monday":[{"start":"10:00","end":"12:00","room":"C301"}],"tuesday":[],"wednesday":[],"thursday":[],"friday":[{"start":"10:00","end":"12:00","room":"C301"}],"saturday":[],"sunday":[]}', '王五'),
  ('有机化学', '{"monday":[],"tuesday":[],"wednesday":[{"start":"14:00","end":"16:00","room":"D202"}],"thursday":[],"friday":[{"start":"14:00","end":"16:00","room":"D202"}],"saturday":[],"sunday":[]}', '赵六')
) AS v(title, schedule, teacher_name)
JOIN teachers t ON t.name = v.teacher_name
WHERE NOT EXISTS (
  SELECT 1 FROM classes WHERE classes.title = v.title
);

-- Insert enrollments (with unique constraint protection)
INSERT INTO enrollments (student_id, class_id) 
SELECT s.id, c.id
FROM (VALUES
  ('小明', '高等数学A'), ('小明', '英语口语'),
  ('小红', '高等数学A'), ('小红', '普通物理'),
  ('小李', '英语口语'), ('小李', '有机化学'),
  ('小王', '普通物理'), ('小王', '有机化学')
) AS v(student_name, class_title)
JOIN students s ON s.name = v.student_name
JOIN classes c ON c.title = v.class_title
WHERE NOT EXISTS (
  SELECT 1 FROM enrollments WHERE enrollments.student_id = s.id AND enrollments.class_id = c.id
);