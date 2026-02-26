# Admission Management & CRM System

A web-based admission management system built with React (Frontend) and Node.js/Express (Backend) with MySQL database.

## Overview

This system allows colleges to:
- Configure programs, campuses, departments, and quotas
- Manage applicants and their documents
- Allocate seats with quota validation
- Generate unique admission numbers
- Track fee status and admissions
- View real-time dashboards

## Project Structure

```
Admission System_CRM/
├── Backend/
│   ├── db.js                  # Database connection
│   ├── server.js              # Express server
│   ├── database.sql           # Database schema
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js           # JWT authentication
│   └── routes/
│       ├── auth.js           # User authentication
│       ├── masters.js        # Master data (Institution, Program, Quota)
│       ├── applicants.js     # Applicant management
│       ├── admissions.js     # Admission allocation & confirmation
│       └── dashboard.js      # Dashboard data
│
└── Frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js            # Main app with routing
    │   ├── api.js            # Axios API instance
    │   ├── index.js
    │   ├── components/
    │   │   ├── Navbar.js     # Navigation
    │   │   └── ProtectedRoute.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── ProgramSetup.js
    │   │   ├── QuotaSetup.js
    │   │   ├── ApplicantForm.js
    │   │   ├── SeatAllocation.js
    │   │   ├── AdmissionConfirm.js
    │   │   └── FeeUpdate.js
    │   └── styles/
    │       ├── App.css
    │       ├── Login.css
    │       ├── Navbar.css
    │       ├── Forms.css
    │       ├── MasterSetup.css
    │       └── Dashboard.css
    └── package.json
```

## Features

### 1. Master Data Setup (Admin)
- Create Institution, Campus, Department
- Create Programs with intake
- Define Academic Years
- Set up quotas (KCET, COMEDK, Management)

### 2. Applicant Management (Officer)
- Register applicants with 15 essential fields:
  - First Name, Last Name
  - Email, Phone Number
  - Category (GM/OBC/SC/ST)
  - Date of Birth, Gender
  - Qualifying Exam, Marks
  - Entry Type, Admission Mode, Program
- Upload and verify documents
- Track document status (Pending/Submitted/Verified)

### 3. Seat Allocation
- Check real-time quota availability
- Allocate seats with automatic quota validation
- Prevent overbooking through database constraints
- Track allotment numbers

### 4. Admission Confirmation
- Confirm admissions only when fees are paid
- Auto-generate unique admission numbers
- Format: INST/2026/UG/CSE/KCET/0001

### 5. Fee Management
- Mark fee status (Pending/Paid)
- Track pending fees
- Confirmation dependent on fee payment

### 6. Dashboards
- Intake vs filled seats
- Quota-wise seat status
- Pending documents list
- Fee pending list
- Program-wise summary with progress

## User Roles

1. **ADMIN**
   - Master data setup
   - Quota configuration
   - View dashboard
   - Create applicants & allocate seats

2. **OFFICER** 
   - Create applicants
   - Allocate seats
   - Verify documents
   - Confirm admissions
   - Manage fees

3. **MANAGEMENT** (View Only)
   - View dashboard
   - Monitor progress

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

### Backend Setup

1. Create database:
```sql
CREATE DATABASE admission_db;
```

2. Import schema:
```bash
mysql -u root -p admission_db < Backend/database.sql
```

3. Install dependencies:
```bash
cd Backend
npm install
```

4. Start server:
```bash
npm start
# Server runs on http://localhost:5000
```

### Frontend Setup

1. Install dependencies:
```bash
cd Frontend
npm install
```

2. Start development server:
```bash
npm start
# App runs on http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Masters
- `GET/POST /api/masters/institution` - Institution management
- `GET/POST /api/masters/campus` - Campus management
- `GET/POST /api/masters/department` - Department management
- `GET/POST /api/masters/academic-year` - Academic year setup
- `GET/POST /api/masters/program` - Program configuration
- `GET/POST /api/masters/quota` - Quota setup

### Applicants
- `GET/POST /api/applicants` - Applicant management
- `PUT /api/applicants/:id/document` - Update document status
- `PUT /api/applicants/:id/fee` - Update fee status

### Admissions
- `POST /api/admissions/allocate` - Allocate seat
- `POST /api/admissions/confirm/:id` - Confirm admission
- `GET /api/admissions` - Get all admissions
- `GET /api/admissions/:id` - Get admission details

### Dashboard
- `GET /api/dashboard` - Main dashboard metrics
- `GET /api/dashboard/programs` - Program-wise summary
- `GET /api/dashboard/quotas/:program_id` - Quota status
- `GET /api/dashboard/pending-docs` - Pending documents
- `GET /api/dashboard/pending-fees` - Pending fees

## Demo Credentials

```
Email: admin@example.com
Password: password123
Role: ADMIN
```

## Key Business Rules

1. **Quota Validation**: Total base quota must equal program intake
2. **Seat Locking**: Seats locked in real-time per quota using transactions
3. **Seat Overbooking**: Prevented through database constraints
4. **Admission Number**: Unique, immutable, generated on confirmation
5. **Fee Requirement**: Seat confirmation only possible when fee is paid
6. **Document Verification**: Required before admission confirmation
7. **Quota Full**: System blocks allocation when quota is full

## Technology Stack

### Backend
- Node.js
- Express.js
- MySQL
- JWT (Authentication)
- Bcrypt (Password hashing)

### Frontend
- React 18
- React Router v6
- Axios
- Bootstrap 5
- CSS3

## Database Tables

- `users` - User accounts
- `institutions` - College information
- `campuses` - Campus details
- `departments` - Department info
- `academic_years` - Year configuration
- `programs` - Course programs
- `quotas` - Quota allocation
- `applicants` - Applicant records
- `admissions` - Admission records
- `documents` - Document uploads
- `course_types` - UG/PG types
- `entry_types` - Regular/Lateral
- `admission_modes` - KCET/COMEDK/Management

## Security Features

- JWT-based authentication
- Row-level access control by role
- Password hashing with bcrypt
- Transaction-based seat allocation
- Database constraints for data integrity

## Future Enhancements

- Document upload with file storage
- Payment gateway integration
- SMS/Email notifications
- Advanced analytics
- Multi-college support
- Supernumerary seat handling
- Waitlist management

## Troubleshooting

### Connection Issues
- Ensure MySQL is running
- Check database credentials in `Backend/db.js`
- Verify port 5000 is available

### Authentication Errors
- Clear browser localStorage
- Re-login with correct credentials
- Check token expiration

### Quota Issues
- Verify total quota ≤ program intake
- Check filled_seats counter
- Review transaction logs

## License

This project is for educational purposes.

## Support

For issues or questions, please contact the development team.
