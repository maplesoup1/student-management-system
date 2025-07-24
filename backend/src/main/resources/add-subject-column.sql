-- Add subject column to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS subject VARCHAR(255);

-- Update existing classes to have subject from their teacher's subject
UPDATE classes 
SET subject = teachers.subject 
FROM teachers 
WHERE classes.teacher_id = teachers.id 
AND classes.subject IS NULL;