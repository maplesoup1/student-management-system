-- Fix enrollment constraint to support time slot-based enrollments
-- Drop the old constraint that only allows one enrollment per student per class
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS uk82aln7vxjltduw8lw278we3j0;

-- The new constraint will be created automatically by Hibernate on restart
-- It will enforce uniqueness on (class_id, student_id, day, start_time, end_time)
-- This allows students to enroll in multiple time slots of the same class