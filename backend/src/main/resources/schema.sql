-- Schema cleanup script to fix enrollment constraint issue
-- This script will be executed before Hibernate creates tables

-- Drop the old constraint that prevents time slot-based enrollments
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS uk82aln7vxjltduw8lw278we3j0;

-- Clean up existing enrollment data that lacks time slot information
-- These records are incompatible with the new time slot-based enrollment system
DELETE FROM enrollments;

-- Note: Hibernate will automatically create the new constraint based on the entity definition:
-- UNIQUE(class_id, student_id, day, start_time, end_time)