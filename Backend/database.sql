-- Admission Management System Database Schema

-- Create Database
CREATE DATABASE IF NOT EXISTS admission_db;
USE admission_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'OFFICER', 'MANAGEMENT') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Institution Table
CREATE TABLE IF NOT EXISTS institutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) UNIQUE,
  address VARCHAR(255),
  city VARCHAR(50),
  state VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campus Table
CREATE TABLE IF NOT EXISTS campuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  institution_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(50),
  FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
  UNIQUE KEY (institution_id, name)
);

-- Department Table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campus_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  FOREIGN KEY (campus_id) REFERENCES campuses(id) ON DELETE CASCADE,
  UNIQUE KEY (campus_id, name)
);

-- Academic Year Table
CREATE TABLE IF NOT EXISTS academic_years (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year VARCHAR(9) NOT NULL UNIQUE,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Type Table (UG/PG)
CREATE TABLE IF NOT EXISTS course_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(20),
  description VARCHAR(255)
);

-- Entry Type Table (Regular/Lateral)
CREATE TABLE IF NOT EXISTS entry_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(20),
  description VARCHAR(255)
);

-- Admission Mode Table (Government/Management)
CREATE TABLE IF NOT EXISTS admission_modes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(20),
  description VARCHAR(255)
);

-- Program Table
CREATE TABLE IF NOT EXISTS programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  academic_year_id INT NOT NULL,
  course_type_id INT NOT NULL,
  entry_type_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  intake INT NOT NULL,
  duration INT,
  branch_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  FOREIGN KEY (course_type_id) REFERENCES course_types(id),
  FOREIGN KEY (entry_type_id) REFERENCES entry_types(id)
);

-- Quota Table
CREATE TABLE IF NOT EXISTS quotas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  program_id INT NOT NULL,
  admission_mode_id INT NOT NULL,
  quota_name VARCHAR(50) NOT NULL,
  total_seats INT NOT NULL,
  filled_seats INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
  FOREIGN KEY (admission_mode_id) REFERENCES admission_modes(id),
  UNIQUE KEY (program_id, quota_name)
);

-- Applicant Table (Max 15 fields as per BRS)
CREATE TABLE IF NOT EXISTS applicants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_number VARCHAR(50) UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone_number VARCHAR(15),
  category VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  qualifying_exam VARCHAR(50),
  qualifying_marks DECIMAL(5,2),
  entry_type_id INT,
  admission_mode_id INT,
  program_id INT,
  document_status ENUM('Pending', 'Submitted', 'Verified') DEFAULT 'Pending',
  fee_status ENUM('Pending', 'Paid') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entry_type_id) REFERENCES entry_types(id),
  FOREIGN KEY (admission_mode_id) REFERENCES admission_modes(id),
  FOREIGN KEY (program_id) REFERENCES programs(id)
);

-- Admission Table
CREATE TABLE IF NOT EXISTS admissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  applicant_id INT NOT NULL,
  program_id INT NOT NULL,
  quota_id INT NOT NULL,
  allotment_number VARCHAR(50),
  admission_number VARCHAR(50) UNIQUE,
  confirmed BOOLEAN DEFAULT FALSE,
  confirmation_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
  FOREIGN KEY (program_id) REFERENCES programs(id),
  FOREIGN KEY (quota_id) REFERENCES quotas(id)
);

-- Document Upload Table (Supporting documents for applicants)
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  applicant_id INT NOT NULL,
  document_type VARCHAR(50),
  file_path VARCHAR(255),
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
  verification_date TIMESTAMP NULL,
  rejection_reason VARCHAR(255),
  rejection_date TIMESTAMP NULL,
  verified_by INT NULL,
  rejected_by INT NULL,
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

-- Insert Default Data

-- Insert Course Types
INSERT INTO course_types (name, code) VALUES 
('Under Graduate', 'UG'),
('Post Graduate', 'PG')
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- Insert Entry Types
INSERT INTO entry_types (name, code) VALUES 
('Regular', 'REG'),
('Lateral', 'LAT')
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- Insert Admission Modes
INSERT INTO admission_modes (name, code) VALUES 
('KCET', 'KCET'),
('COMEDK', 'COMEDK'),
('Management', 'MGMT')
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- Insert Sample Users
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@example.com', 'hashed_password_admin', 'ADMIN'),
('Officer User', 'officer@example.com', 'hashed_password_officer', 'OFFICER')
ON DUPLICATE KEY UPDATE role=VALUES(role);

-- Insert Sample Institution
INSERT INTO institutions (name, code, address, city, state) VALUES 
('Sample Institution', 'SI001', '123 Main Street', 'Bangalore', 'Karnataka')
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- Insert Sample Campus
INSERT INTO campuses (institution_id, name, code, address, city) VALUES 
(1, 'Main Campus', 'MC001', '456 Central Ave', 'Bangalore')
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- Insert Sample Department
INSERT INTO departments (campus_id, name, code) VALUES 
(1, 'Computer Science', 'CS')
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- Insert Academic Year
INSERT INTO academic_years (year, start_date, end_date, is_active) VALUES 
('2026-2027', '2026-07-01', '2027-06-30', TRUE)
ON DUPLICATE KEY UPDATE is_active=VALUES(is_active);

-- Insert Sample Program
INSERT INTO programs (department_id, academic_year_id, course_type_id, entry_type_id, name, code, intake, duration, branch_name) VALUES 
(1, 1, 1, 1, 'B.Tech Computer Science', 'BTECH-CS', 60, 4, 'Computer Science')
ON DUPLICATE KEY UPDATE code=VALUES(code);

-- Insert Sample Quota
INSERT INTO quotas (program_id, admission_mode_id, quota_name, total_seats, filled_seats) VALUES 
(1, 1, 'KCET', 30, 5)
ON DUPLICATE KEY UPDATE total_seats=VALUES(total_seats);

-- Insert Sample Applicants
INSERT INTO applicants (application_number, first_name, last_name, email, phone_number, category, date_of_birth, gender, qualifying_exam, qualifying_marks, entry_type_id, admission_mode_id, program_id, document_status, fee_status) VALUES 
('APP001', 'John', 'Doe', 'john@example.com', '9876543210', 'General', '2004-05-15', 'M', 'PUC', 95.5, 1, 1, 1, 'Submitted', 'Pending'),
('APP002', 'Jane', 'Smith', 'jane@example.com', '9876543211', 'OBC', '2004-08-20', 'F', 'PUC', 90.0, 1, 1, 1, 'Submitted', 'Pending')
ON DUPLICATE KEY UPDATE entry_type_id=VALUES(entry_type_id);

-- Insert Sample Documents
INSERT INTO documents (applicant_id, document_type, file_path, verification_status, upload_date) VALUES 
(1, 'Birth Certificate', '/uploads/app001_birth.pdf', 'PENDING', NOW()),
(1, 'PUC Certificate', '/uploads/app001_puc.pdf', 'PENDING', NOW()),
(2, 'Birth Certificate', '/uploads/app002_birth.pdf', 'PENDING', NOW()),
(2, '10th Certificate', '/uploads/app002_10th.pdf', 'VERIFIED', DATE_ADD(NOW(), INTERVAL -5 DAY))
ON DUPLICATE KEY UPDATE verification_status=VALUES(verification_status);
