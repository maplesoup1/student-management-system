-- Initial data for development (PostgreSQL compatible)

-- Insert users first (admin, teachers, students) - only if not exists
INSERT INTO users (username, password, role) 
SELECT * FROM (VALUES
  ('admin', 'admin123', 'ADMIN'),
  ('teacher_zhang', 'teacher123', 'TEACHER'),
  ('teacher_li', 'teacher123', 'TEACHER'),
  ('teacher_wang', 'teacher123', 'TEACHER'),
  ('teacher_zhao', 'teacher123', 'TEACHER'),
  ('student_ming', 'student123', 'STUDENT'),
  ('student_hong', 'student123', 'STUDENT'),
  ('student_li', 'student123', 'STUDENT'),
  ('student_wang', 'student123', 'STUDENT')
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
  ('高等数学A', '{"days":["Mon","Wed"],"time":"08:00-10:00","room":"A203"}', '张三'),
  ('英语口语', '{"days":["Tue","Thu"],"time":"14:00-16:00","room":"B105"}', '李四'),
  ('普通物理', '{"days":["Mon","Fri"],"time":"10:00-12:00","room":"C301"}', '王五'),
  ('有机化学', '{"days":["Wed","Fri"],"time":"14:00-16:00","room":"D202"}', '赵六')
) AS v(title, schedule, teacher_name)
JOIN teachers t ON t.name = v.teacher_name
WHERE NOT EXISTS (
  SELECT 1 FROM classes WHERE classes.title = v.title
);

-- Insert enrollments (with unique constraint protection)
INSERT INTO enrollments (student_id, course_id) 
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
  SELECT 1 FROM enrollments WHERE enrollments.student_id = s.id AND enrollments.course_id = c.id
);