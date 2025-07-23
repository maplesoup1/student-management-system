-- Drop all tables to clean database
-- Run this script in Supabase SQL editor to clean the database

DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Note: After running this script, restart your Spring Boot application
-- The tables will be recreated automatically with the correct schema